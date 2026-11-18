"""Tạo file nghe thử các giọng đọc (chạy trên GitHub Actions).
Tiếng Nhật: VOICEVOX engine (chạy bằng Docker ở cổng 50021).
Tiếng Việt: Piper (mã nguồn mở)."""
import json, os, subprocess, sys, time, urllib.parse, urllib.request

OUT = "audio/samples"
os.makedirs(OUT, exist_ok=True)
log = open(f"{OUT}/log.txt", "w")
def L(*a):
    print(*a); print(*a, file=log); log.flush()

JA_TEXT = "こんにちは、タイさん。いっしょに 日本語を がんばりましょう！"
VI_TEXT = "Xin chào Tài. Hôm nay mình cùng học tiếng Nhật nhé!"
WANT = ["四国めたん","ずんだもん","春日部つむぎ","雨晴はう","冥鳴ひまり","九州そら","もち子さん","WhiteCUL","小夜","櫻歌ミコ","春歌ナナ","猫使ビィ","中国うさぎ","東北ずん子","東北きりたん","No.7","後鬼","青山龍星"]

def mp3(wav, out):
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-ac","1","-b:a","64k",out], check=True)

items = []
# ---------- VOICEVOX ----------
base = "http://127.0.0.1:50021"
for _ in range(120):
    try:
        urllib.request.urlopen(base + "/version", timeout=3).read(); break
    except Exception:
        time.sleep(2)
else:
    L("VOICEVOX không khởi động được")
try:
    speakers = json.load(urllib.request.urlopen(base + "/speakers", timeout=30))
    json.dump(speakers, open(f"{OUT}/speakers.json","w"), ensure_ascii=False, indent=1)
    L("số nhân vật VOICEVOX:", len(speakers))
    for sp in speakers:
        if not any(w in sp["name"] for w in WANT):
            continue
        style = next((s for s in sp["styles"] if s["name"] in ("ノーマル","ふつう","人間ver.")), sp["styles"][0])
        sid = style["id"]
        try:
            q = urllib.request.urlopen(urllib.request.Request(f"{base}/audio_query?text={urllib.parse.quote(JA_TEXT)}&speaker={sid}", method="POST"), timeout=60).read()
            req = urllib.request.Request(f"{base}/synthesis?speaker={sid}", data=q, headers={"Content-Type":"application/json"}, method="POST")
            wav = urllib.request.urlopen(req, timeout=120).read()
            open("/tmp/s.wav","wb").write(wav)
            fn = f"ja_{sid}.mp3"; mp3("/tmp/s.wav", f"{OUT}/{fn}")
            items.append({"lang":"ja","file":fn,"name":sp["name"],"style":style["name"],"id":sid,"credit":f"VOICEVOX:{sp['name']}"})
            L("ok", sp["name"], style["name"], sid)
        except Exception as e:
            L("lỗi", sp["name"], e)
except Exception as e:
    L("lỗi VOICEVOX", e)

# ---------- Piper (tiếng Việt) ----------
HF = "https://huggingface.co/rhasspy/piper-voices/resolve/main/vi/vi_VN"
for key in ["vais1000/medium","25hours_single/low","vivos/x_low"]:
    name = "vi_VN-" + key.replace("/","-")
    try:
        for ext in [".onnx",".onnx.json"]:
            if not os.path.exists(f"/tmp/{name}{ext}"):
                urllib.request.urlretrieve(f"{HF}/{key}/{name}{ext}", f"/tmp/{name}{ext}")
        subprocess.run(["piper","--model",f"/tmp/{name}.onnx","--output_file","/tmp/v.wav"], input=VI_TEXT.encode(), check=True, capture_output=True)
        fn = f"{name}.mp3"; mp3("/tmp/v.wav", f"{OUT}/{fn}")
        items.append({"lang":"vi","file":fn,"name":name,"credit":"Piper"})
        L("ok", name)
    except Exception as e:
        L("lỗi", name, getattr(e,"stderr",b"")[:400] if hasattr(e,"stderr") else e)

json.dump(items, open(f"{OUT}/index.json","w"), ensure_ascii=False, indent=1)
L("xong", len(items), "mẫu")
