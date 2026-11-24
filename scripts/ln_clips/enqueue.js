// Xếp hàng tạo khung hình clip luyện nghe vào ComfyUI (chạy trong trang ComfyUI, vd. http://127.0.0.1:8000).
// Mỗi câu = 1 job: khung 1 vẽ từ chữ (Z-Image Turbo), khung 2–3 vẽ lại từ khung 1 để giữ nhân vật.
// Cách dùng: dán vào Console của trang ComfyUI rồi gọi lnEnqueue({from:1,to:25}).
async function lnEnqueue(opt = {}) {
  const src = opt.src || "https://raw.githubusercontent.com/taipd3110-sketch/lich-hoc-tieng-nhat/main/scripts/ln_clips/jobs.json";
  const J = await (await fetch(src, { cache: "no-store" })).json();
  const pad = n => String(n).padStart(2, "0");
  const build = (j) => {
    const W = {
      "1": { class_type: "UNETLoader", inputs: { unet_name: "z_image_turbo_bf16.safetensors", weight_dtype: "default" } },
      "2": { class_type: "CLIPLoader", inputs: { clip_name: "qwen_3_4b.safetensors", type: "lumina2", device: "default" } },
      "3": { class_type: "VAELoader", inputs: { vae_name: "z-image-ae.safetensors" } },
      "4": { class_type: "ModelSamplingAuraFlow", inputs: { model: ["1", 0], shift: 3 } },
      "5": { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: "" } },
      "6": { class_type: "EmptySD3LatentImage", inputs: { width: J.w, height: J.h, batch_size: 1 } },
    };
    j.kf.forEach((k, i) => {
      const n = i + 1;
      W["2" + n] = { class_type: "CLIPTextEncode", inputs: { clip: ["2", 0], text: J.style + j.base + " " + k.a } };
      W["3" + n] = { class_type: "KSampler", inputs: { model: ["4", 0], positive: ["2" + n, 0], negative: ["5", 0],
        latent_image: n === 1 ? ["6", 0] : ["60", 0], seed: j.seed, steps: J.steps, cfg: 1, sampler_name: "res_multistep",
        scheduler: "simple", denoise: n === 1 ? 1 : J.denoise } };
      W["4" + n] = { class_type: "VAEDecode", inputs: { samples: ["3" + n, 0], vae: ["3", 0] } };
      W["5" + n] = { class_type: "SaveImage", inputs: { images: ["4" + n, 0], filename_prefix: `ln/b${pad(j.L)}/${j.id}-k${n}` } };
    });
    if (j.kf.length > 1) W["60"] = { class_type: "VAEEncode", inputs: { pixels: ["41", 0], vae: ["3", 0] } };
    return W;
  };
  const list = J.jobs.filter(j => j.L >= (opt.from || 1) && j.L <= (opt.to || 99) && (!opt.only || opt.only.includes(j.L + "/" + j.id)));
  let ok = 0, bad = [];
  for (const j of list) {
    const r = await fetch("/prompt", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: build(j), client_id: "ln-clips" }) });
    if (r.ok) ok++; else bad.push(j.L + "/" + j.id + ": " + (await r.text()).slice(0, 200));
  }
  return { queued: ok, failed: bad.length, errors: bad.slice(0, 5), total: list.length };
}
