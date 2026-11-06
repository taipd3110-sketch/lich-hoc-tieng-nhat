# Hành trình học tiếng Nhật của Tài 🌸

Lịch học tiếng Nhật: đánh dấu buổi học, ghi chú, tự tính học phí 250.000đ/buổi, phạt BTVN 50.000đ, ôn tập Hiragana.

- **Trang web:** https://taipd3110-sketch.github.io/lich-hoc-tieng-nhat/
- **Dữ liệu:** lưu trên Firebase Firestore, mỗi tài khoản Google chỉ đọc/ghi được dữ liệu của chính mình.
- **Tự động đăng (CI/CD):** mỗi lần đẩy code lên nhánh `main`, GitHub Actions chạy `scripts/check.mjs` để kiểm tra, rồi đăng lại trang lên GitHub Pages. Xem tiến trình ở tab **Actions**.

## Các file
| File | Vai trò |
|---|---|
| `index.html` | Toàn bộ trang (giao diện + logic) |
| `firebase-config.txt` | Cấu hình web của Firebase (không phải mật khẩu, được phép công khai) |
| `.github/workflows/deploy.yml` | Quy trình kiểm tra và đăng trang |
| `scripts/check.mjs` | Bước kiểm tra trước khi đăng |

Không đưa file sao lưu dữ liệu (`*.json`) lên repo này vì repo công khai.
