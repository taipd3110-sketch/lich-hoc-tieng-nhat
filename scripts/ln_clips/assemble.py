"""Ghép khung hình ComfyUI thành clip cho từng câu luyện nghe.
python3 assemble.py <jobs.json> <thư_mục_ảnh ln/> <thư_mục_ra media/ln> <bài...>
Ảnh: <ln>/bXX/<id>-k<n>_<số>_.png (lấy bản mới nhất). Ra: media/ln/bXX/<id>.mp4 + .jpg, cập nhật media/ln/clips.json"""
import json, sys, os, re, glob, subprocess, tempfile, shutil
from PIL import Image
FPS, OW, OH, XF = 20, 768, 432, .2
def ease(u): return u * u * (3 - 2 * u)
def focus(a):
    if "on the left" in a: return .34
    if "on the right" in a: return .66
    return .5
def frames_for(j, imgs, tmp):
    a, b = map(float, j["t"].split(",")); D = max(1.0, b - a)
    K = [Image.open(p).convert("RGB").resize((OW, OH), Image.LANCZOS) for p in imgs]
    st = [0.0] + [max(0.0, k["t"] - a - .1) for k in j["kf"][1:]]
    S = [(st[i], st[i + 1] if i + 1 < len(st) else D, i, focus(j["kf"][i]["a"])) for i in range(len(K))]
    def render(si, t):
        s0, s1, i, fx = S[si]; u = min(1, max(0, (t - s0) / max(.01, s1 - s0))); z = 1.0 + .08 * ease(u)
        cw, ch = OW / z, OH / z; cx = min(max(fx * OW, cw / 2), OW - cw / 2); cy = OH * .45
        cy = min(max(cy, ch / 2), OH - ch / 2)
        return K[i].transform((OW, OH), Image.EXTENT, (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2), Image.BICUBIC)
    n = int(round(D * FPS))
    for f in range(n):
        t = f / FPS; si = max(k for k, s in enumerate(S) if t >= s[0] - 1e-9)
        im = render(si, t)
        if si + 1 < len(S) and t > S[si + 1][0] - XF:
            im = Image.blend(im, render(si + 1, t), ease(min(1, (t - (S[si + 1][0] - XF)) / XF)))
        im.save(f"{tmp}/f{f:04d}.png")
    return D
def main():
    jobs, src, out = sys.argv[1:4]; lessons = set(map(int, sys.argv[4:]))
    J = json.load(open(jobs)); man_p = f"{out}/clips.json"
    man = json.load(open(man_p)) if os.path.exists(man_p) else {}
    done = 0
    for j in J["jobs"]:
        if lessons and j["L"] not in lessons: continue
        d = f"b{j['L']:02d}"; imgs = []
        for k in range(1, len(j["kf"]) + 1):
            c = sorted(glob.glob(f"{src}/{d}/{j['id']}-k{k}_*_.png"))
            if not c: break
            imgs.append(c[-1])
        if len(imgs) != len(j["kf"]): continue
        os.makedirs(f"{out}/{d}", exist_ok=True); tmp = tempfile.mkdtemp()
        D = frames_for(j, imgs, tmp)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", str(FPS), "-i", f"{tmp}/f%04d.png", "-c:v", "libx264", "-preset", "slow",
                        "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", f"{out}/{d}/{j['id']}.mp4"], check=True)
        Image.open(imgs[0]).convert("RGB").resize((640, 360), Image.LANCZOS).save(f"{out}/{d}/{j['id']}.jpg", quality=72)
        shutil.rmtree(tmp)
        man.setdefault(str(j["L"]), {})[j["id"]] = man.get(str(j["L"]), {}).get(j["id"], 0) + 1; done += 1
    json.dump(man, open(man_p, "w"), separators=(",", ":"), sort_keys=True)
    print("clips:", done)
if __name__ == "__main__": main()
