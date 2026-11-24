"""Lập kịch bản khung hình cho clip luyện nghe (chạy trên máy có dữ liệu + âm thanh đã nạp).
Đầu vào: dữ liệu luyện nghe (json) + thư mục audio/baiXX/tN_*.mp3 (KHÔNG đăng lên web).
Đầu ra: plan.json (chỉ mô tả cảnh/nhân vật/động tác + mốc thời gian; không chứa lời thoại gốc).
Cách dùng: python3 plan.py <data.json> <thư_mục_audio> <plan.json> [bài_đầu] [bài_cuối]"""
import json, sys, glob, subprocess, hashlib, re
import numpy as np

STYLE = ("Japanese anime illustration, cel shading, clean line art, soft pastel colors, slice-of-life anime style, "
         "wide shot, full body, characters facing each other in side view, warm natural light, no text, no letters, no numbers. ")
# Bối cảnh theo từng mục (chung chung, không vẽ đáp án)
SCN = {
 1: ["a bright modern Japanese office with big windows and a potted plant", "a university international lounge with sofas", "a company reception lobby", "a cozy Japanese living room"],
 2: ["a Japanese apartment living room with a low table", "an office with desks, exchanging business cards", "a quiet bookshop aisle", "a Japanese school classroom with desks"],
 3: ["a hallway inside a university building", "a department store floor", "a campus cafe", "a department store counter"],
 4: ["a street corner in a Japanese town", "a person talking on the phone at home", "a Japanese family home in the morning", "a Japanese classroom with a teacher and students", "an office desk with a telephone"],
 5: ["a school hallway", "a classroom after school", "a travel agency counter", "a small apartment kitchen in the morning", "a cafe table"],
 6: ["a university cafeteria", "a park on a sunny weekend", "a Japanese living room looking at a photo album", "a share house living room in the morning"],
 7: ["a museum exhibition hall", "a traditional Japanese house with a tatami room", "a classroom after class", "a dormitory room in the evening"],
 8: ["a dormitory common room", "a Japanese family living room with tea on the table", "a shopping street with shop windows", "a school hallway after the holidays"],
 9: ["a school club room", "a campus courtyard with trees", "a university hallway", "the entrance of a concert hall"],
 10: ["a public library with bookshelves", "a cozy living room with a garden view", "a street near a train station", "a supermarket aisle"],
 11: ["a family restaurant table", "a busy restaurant", "a cafe with large windows", "an office break room"],
 12: ["a university lounge", "a home kitchen with shopping bags", "a classroom", "an office meeting corner"],
 13: ["a stylish cafe", "a tourist information center", "a shopping street in a Japanese town", "an airport arrival hall"],
 14: ["the back seat of a taxi", "a modern office", "an office desk with a telephone", "a Japanese inn lobby"],
 15: ["a quiet residential street with a small park", "an exam classroom", "a party hall with buffet tables", "an office"],
 16: ["a hotel lobby in Kyoto", "a train station concourse with ticket machines", "a party room", "an old street in Kyoto"],
 17: ["a classroom with a teacher explaining", "the entrance hall of a Japanese home", "a university hallway", "a hospital reception desk"],
 18: ["a dog park with grass", "a sports ground", "a gift shop", "a Japanese home in the morning"],
 19: ["a cafe", "a university lounge in summer", "a Japanese family living room with a photo album"],
 20: ["a friend's apartment room", "a home kitchen", "a Japanese family dining room", "an office"],
 21: ["a lecture hall", "a student lounge", "a cafe", "a university club fair on campus"],
 22: ["a Japanese apartment living room", "a party room", "a home entrance", "a lecture hall"],
 23: ["a business hotel room", "a home kitchen", "an electronics store", "a city street"],
 24: ["a living room decorated for a birthday", "a community center classroom", "a care home lounge", "a quiet neighborhood street"],
 25: ["a cafe", "an office desk", "a university office"],
}
MEN = ["a young Japanese man with short black hair in a navy suit and red tie",
       "a young man with wavy brown hair and glasses in a beige cardigan",
       "a tall Western man with short blond hair in a light grey suit",
       "a young Southeast Asian man with short black hair in a white shirt",
       "a middle-aged Japanese man with grey hair in a dark brown jacket",
       "a young man with spiky dark hair in a green hoodie"]
WOMEN = ["a young Japanese woman with a black bob, white blouse and grey skirt",
         "a young woman with a long brown ponytail in a green sweater",
         "a Western woman with long blonde hair in a light blue dress",
         "a middle-aged Japanese woman with short hair in a beige cardigan",
         "a young woman with short reddish hair in a yellow blouse",
         "a young Asian woman with long black hair in a white knit top"]
POS = {2: ["On the left", "On the right"], 3: ["On the left", "In the center", "On the right"]}

def act(ja):
    j = ja or ""
    if re.search(r"初めまして|はじめまして|よろしく", j): return "bows politely while introducing"
    if re.search(r"いらっしゃいませ", j): return "welcomes the customer with a polite bow"
    if re.search(r"^いいえ|違います|ちがいます", j): return "gently waves one open hand in front of the chest to say no"
    if re.search(r"すみません|失礼", j): return "raises one hand to get attention with an apologetic smile"
    if re.search(r"ありがとう", j): return "smiles and bows slightly in thanks"
    if re.search(r"か[。？?]?$|ですか|ますか|ね[。？?]$", j): return "asks a question with the head tilted slightly"
    if re.search(r"^(はい|ええ|うん|そうです)", j): return "nods with a smile"
    if re.search(r"[！!]$|すごい|いいですね", j): return "reacts cheerfully with a big smile"
    return "talks with a friendly hand gesture"

def f0(sig, sr=16000):
    hop, win = 160, 640; out = []
    for i in range(0, len(sig) - win, hop):
        x = sig[i:i + win]; x = x - x.mean()
        e = float((x * x).sum())
        if e < 1e-4 * win: continue
        ac = np.correlate(x, x, "full")[win - 1:]
        lo, hi = sr // 400, sr // 70
        k = lo + int(np.argmax(ac[lo:hi]))
        if ac[k] / ac[0] > 0.45: out.append(sr / k)
    return out

def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)

def main():
    data, adir, outp = sys.argv[1:4]; a = int(sys.argv[4]) if len(sys.argv) > 4 else 1; b = int(sys.argv[5]) if len(sys.argv) > 5 else 25
    D = json.load(open(data)); plan = {}
    for L in range(a, b + 1):
        les = D[str(L)]; cache = {}; P = plan[str(L)] = {}
        for si, s in enumerate(les["sections"]):
            scene = (SCN.get(L) or ["a bright Japanese room"])[min(si, len(SCN.get(L, [""])) - 1)]
            for it in s["items"]:
                sc = it.get("script") or []
                if not sc or not it.get("t"): continue
                tk = it.get("track") or s["track"]
                fs = glob.glob(f"{adir}/bai{L:02d}/{tk}_*.mp3")
                if not fs: continue
                if tk not in cache: cache[tk] = load(fs[0])
                sig = cache[tk]
                spk = []
                for l in sc:
                    sp = str(l.get("speaker") or "A").upper()[:1]
                    if sp not in spk: spk.append(sp)
                spk = spk[:3]
                gender = {}
                for sp in spk:
                    vals = []
                    for l in sc:
                        if str(l.get("speaker") or "A").upper()[:1] != sp: continue
                        x, y = map(float, str(l["t"]).split(","))
                        vals += f0(sig[int(x * 16000):int(y * 16000)])
                    m = float(np.median(vals)) if vals else 150
                    gender[sp] = ("f" if m > 165 else "m", round(m))
                h = int(hashlib.md5(f"{L}-{it['id']}".encode()).hexdigest(), 16)
                usedm, usedw, cast = set(), set(), {}
                for n, sp in enumerate(spk):
                    pool = WOMEN if gender[sp][0] == "f" else MEN; used = usedw if pool is WOMEN else usedm
                    k = (h >> (4 * n)) % len(pool)
                    while k in used: k = (k + 1) % len(pool)
                    used.add(k); cast[sp] = pool[k]
                if len(spk) == 1: castt = f"{cast[spk[0]].capitalize()} stands talking to a friend who listens"
                else: castt = ". ".join(f"{POS[len(spk)][n]}, {cast[sp]}" for n, sp in enumerate(spk))
                base = f"{STYLE}Setting: {scene}. {castt}."
                # lượt thoại (gộp câu liền nhau cùng người nói)
                turns = []
                for l in sc:
                    sp = str(l.get("speaker") or "A").upper()[:1]
                    if sp not in spk: sp = spk[-1]
                    x = float(str(l["t"]).split(",")[0])
                    if turns and turns[-1]["sp"] == sp: continue
                    turns.append({"sp": sp, "t": x, "ja": l.get("ja", "")})
                pick = list(range(len(turns))) if len(turns) <= 3 else [0, len(turns) // 2, len(turns) - 1]
                who = lambda sp: (POS[len(spk)][spk.index(sp)].replace("On the ", "the person on the ").replace("In the ", "the person in the ")) if len(spk) > 1 else "the person"
                kf = []
                for i in pick:
                    tu = turns[i]
                    others = [o for o in spk if o != tu["sp"]]
                    txt = f"Now {who(tu['sp'])} {act(tu['ja'])}, mouth open as they speak." + (f" {who(others[0]).capitalize()} listens attentively." if others else "")
                    kf.append({"t": tu["t"], "a": txt})
                P[it["id"]] = {"t": it["t"], "base": base, "kf": kf, "seed": h % 2**31, "voices": gender}
        print(L, len(P), "items", flush=True)
    json.dump(plan, open(outp, "w"), ensure_ascii=False, indent=0)

if __name__ == "__main__":
    main()
