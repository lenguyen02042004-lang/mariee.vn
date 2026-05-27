
# Kế hoạch nâng cấp — chia 5 phase

Mục tiêu: hoàn thành 10 yêu cầu mà không phá vỡ hệ màu/font hiện tại. Mỗi phase độc lập, có thể review sau khi xong.

---

## Phase 1 — Nền tảng: hover UX + Back-to-top + gỡ Pricing khỏi header
Phạm vi nhỏ, cải thiện cảm nhận ngay.

- (#5) Chuẩn hoá tương tác hover cho **tất cả nút upload ảnh** (`ImagePicker`, `ImageUploadButton`) và các nút admin: thêm `cursor-pointer`, `hover:bg-*`, `hover:border-primary`, focus ring, transition. Tạo class util chung trong `styles.css` (`.btn-soft`, `.btn-upload`) để các form khác kế thừa.
- (#9) Component `BackToTop` (fixed bottom-right, hiện sau khi scroll > 400px, smooth scroll), gắn trong `SiteLayout`.
- (#6 — bước 1) Gỡ link **"Bảng giá"** khỏi header chính. Giữ route `/pricing` tạm thời nhưng redirect → `/for-couples#pricing` (xử lý đầy đủ ở Phase 4).

## Phase 2 — Đăng ký tách vai trò + Admin auth UI
- (#7) Trang `/register` thêm bước chọn vai trò: **Cặp đôi** hoặc **Nhà cung cấp** (radio card lớn). Sau khi đăng ký:
  - Cặp đôi → tự tạo bản nháp `couples` (is_published=false) và redirect `/couple`.
  - Vendor → tự tạo bản nháp `vendors` (is_approved=false) và redirect `/vendor`.
  - Lưu role tương ứng vào `user_roles` (`couple` / `vendor`) — cần migration mở rộng enum `app_role`.
- (#10) Cập nhật `AdminShell` (sidebar + topbar) đồng bộ token màu/font hiện tại — không đổi palette.

## Phase 3 — Admin quản lý dữ liệu (danh mục, search, duyệt nội dung)
- (#1) **Quản lý danh mục vendor**: hiện `vendor.category` là enum cứng. Migration: tạo bảng `vendor_categories (id, slug, label, sort_order, is_active)` + seed từ enum hiện tại; đổi cột `vendors.category` sang `text` tham chiếu `slug` (giữ data cũ). Trang `/admin/categories` CRUD đầy đủ. Cập nhật `VendorForm` & filter dùng bảng mới.
- (#2) Thêm **search + filter** ở `/admin/vendors` (theo tên/slug/email/danh mục/trạng thái) và `/admin/couples` (theo tên cô dâu/chú rể/slug/ngày cưới). Debounced input, hoạt động client-side trên list hiện có; nếu dữ liệu lớn → thêm pagination server.
- (#3) Cột/nút **Publish / Ẩn (draft)** ngay trong bảng admin cho cả couples và vendors (toggle `is_published` / `is_approved`).
- (#4) Trang **`/admin/wishes`** đã có — bổ sung nút **duyệt/ẩn từng lời chúc** (toggle `is_approved`) + filter "chưa duyệt".

## Phase 4 — Vai trò Couple & Vendor: tự quản lý publish + gói thành viên
- (#3) Trong `/couple` và `/vendor`: thêm card trạng thái với toggle **"Công khai / Lưu nháp"** rõ ràng (badge màu + mô tả hệ quả). Couple đổi `is_published`; Vendor đổi `is_approved` chỉ khi đã được admin duyệt lần đầu — nếu chưa, hiển thị trạng thái "Chờ duyệt".
- (#4) Couple có tab **"Lời chúc"** liệt kê wishes của mình và toggle duyệt/ẩn (RLS mới: couple owner có quyền update `is_approved` cho wishes thuộc couple của mình — cần policy mới).
- (#6) **Gói thành viên tách 2 nhóm**:
  - Migration: thêm cột `audience` ('couple' | 'vendor') vào `vendor_plans`, đổi tên hiển thị thành `membership_plans` (giữ table cũ, chỉ thêm cột). Seed lại plan cho cả 2 nhóm.
  - Section "Bảng giá" ngay trong `/for-couples` và `/for-vendors` — hiển thị plan theo `audience`.
  - Luồng thanh toán QR thủ công: tái sử dụng `vendor_payments` → mở rộng thành `membership_payments` (thêm `user_id`, `audience`). Hiển thị QR + thông tin chuyển khoản từ `payment_settings`, upload ảnh proof, admin duyệt ở `/admin/payments`.

## Phase 5 — Refactor form Vendor & Couple theo chuẩn hiện đại
- (#8) Layout 2 cột: **trái = field, phải = hướng dẫn/ví dụ** (sticky helper panel với mô tả, ví dụ tốt/xấu, gợi ý độ dài).
- Chuẩn hoá các field free-text quan trọng thành **select có sẵn**: thành phố (danh sách tỉnh VN), khoảng giá (ranges), danh mục (từ bảng mới Phase 3), bank name (preset VN).
- Validate inline (zod + react-hook-form) thay cho raw input hiện tại.
- Áp dụng cho cả `VendorForm` và `CoupleForm`.

---

## Ghi chú kỹ thuật

- Migrations cần ở Phase 2 (enum role), 3 (vendor_categories), 4 (audience plans, wish update policy, membership_payments cols). Mỗi phase 1 migration riêng.
- Không đổi token màu/font; chỉ thêm utility class mới trong `src/styles.css`.
- Mọi form thanh toán QR dùng `payment_settings` hiện có.
- RLS bổ sung: couple owner update `couple_wishes.is_approved`; vendor owner toggle `is_approved` (nếu cho phép tự ẩn sau khi đã duyệt) — sẽ thêm cột `is_hidden_by_owner` để không phá luồng duyệt admin.

## Đề xuất triển khai

Bắt đầu **Phase 1** ngay sau khi bạn duyệt (nhanh, ít rủi ro). Sau mỗi phase tôi dừng để bạn review trước khi vào phase kế tiếp. Bạn có muốn gộp/đổi thứ tự phase nào không?
