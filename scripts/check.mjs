// Kiểm tra trước khi đăng: trang có đủ phần chính và JavaScript không lỗi cú pháp.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const html = readFileSync("index.html", "utf8");
let failed = false;
const fail = (m) => { console.error("✗ " + m); failed = true; };
const ok = (m) => console.log("✓ " + m);

for (const id of ["days", "payForm", "quiz", "sync", "btnExport", "btnImport"]) {
  html.includes(`id="${id}"`) ? ok(`có phần #${id}`) : fail(`thiếu phần #${id}`);
}

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!scripts.length) fail("không tìm thấy JavaScript của trang");
scripts.forEach((code, i) => {
  const f = `/tmp/page-script-${i}.mjs`;
  writeFileSync(f, code);
  try { execFileSync("node", ["--check", f], { stdio: "pipe" }); ok(`JavaScript #${i + 1} đúng cú pháp`); }
  catch (e) { fail(`JavaScript #${i + 1} lỗi cú pháp:\n${e.stderr}`); }
});

if (existsSync("firebase-config.txt")) {
  const t = readFileSync("firebase-config.txt", "utf8");
  /apiKey\s*:/.test(t) && /projectId\s*:/.test(t) ? ok("có cấu hình Firebase") : fail("firebase-config.txt thiếu apiKey hoặc projectId");
} else {
  console.warn("! chưa có firebase-config.txt, trang sẽ chỉ lưu dữ liệu trên trình duyệt");
}

if (failed) { console.error("\nKiểm tra thất bại, trang KHÔNG được đăng."); process.exit(1); }
console.log("\nMọi thứ ổn, tiếp tục đăng trang.");
