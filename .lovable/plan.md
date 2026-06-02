# Kế hoạch hoàn thiện 100% vận hành — chia 6 phase

Trạng thái: Phase 1–5 (roadmap cũ) đã hoàn tất. Roadmap mới này tập trung
vào việc đưa app từ ~85% sẵn sàng → 100% production. Mỗi phase độc lập,
có thể review giữa phiên. Khi mở phiên mới, đọc file này và tiếp tục từ
phase chưa hoàn thành (đánh dấu ✅ khi xong).

---

## Phase 6 — Auth Production Hardening (P0) ⏳

Mục tiêu: luồng đăng ký/đăng nhập sẵn sàng cho người dùng thật.

- [ ] **Trigger `on_auth_user_created`** gọi `handle_new_user()` trên
      `auth.users` (hiện hàm có, trigger thiếu → user OAuth có thể không
      có profile/role).
- [ ] **Sửa `handle_new_user`**: bỏ logic "auto-admin nếu chưa có admin"
      (rủi ro privilege escalation khi xoá hết admin).
- [ ] **Bật Google OAuth** qua `configure_social_auth` (`providers:["google"]`,
      KHÔNG disable email).
- [ ] Thêm nút **"Đăng nhập với Google"** vào `/login` và `/register`
      dùng `lovable.auth.signInWithOAuth("google", ...)`.
- [ ] Sau khi Google OAuth callback về, gọi `assignSignupRole` với role
      đã chọn (lưu role tạm trong `sessionStorage` trước khi redirect).
- [ ] Kiểm tra `auto_confirm_email` = false (yêu cầu verify email).
- [ ] Kiểm tra `password_hibp_enabled` = true (chặn password rò rỉ).

## Phase 7 — Email Domain + Auth Templates (P0)

Mục tiêu: email xác minh/reset password gửi từ `mariee.vn`, không vào spam.

- [ ] Cấu hình email domain `notify.mariee.vn` qua dialog email setup.
- [ ] Sau khi DNS verify → `scaffold_auth_email_templates`.
- [ ] Apply brand Mariée (font script primary, palette hiện tại) cho 6
      template: signup, magic-link, recovery, invite, email-change,
      reauthentication. Background body = #ffffff.
- [ ] Test gửi email verify + reset password thật.

## Phase 8 — Transactional Notifications (P1)

Mục tiêu: admin/vendor/couple nhận thông báo khi có hoạt động mới.

- [ ] `scaffold_transactional_email` (tái dùng email domain Phase 7).
- [ ] Template + trigger gửi email cho các sự kiện:
  - Vendor nhận **lead mới** (`vendor_leads` insert).
  - Couple nhận **RSVP mới** và **lời chúc mới**.
  - Admin nhận **payment mới chờ duyệt** (`vendor_payments`).
  - Vendor/Couple nhận thông báo khi **payment được duyệt/từ chối**.
- [ ] Trigger DB → enqueue qua server function (không gọi inline trong
      RLS-public insert để tránh blocking).

## Phase 9 — Anti-Spam & Rate Limiting (P1)

Mục tiêu: bảo vệ form public khỏi spam/abuse.

- [ ] Rate limit IP-based cho server functions xử lý RSVP, wishes, leads
      (table `rate_limits` + check trong server fn, window 1 phút).
- [ ] Honeypot field + min-time-to-submit cho form public.
- [ ] Captcha (Cloudflare Turnstile) cho RSVP + lời chúc nếu lượng spam
      vượt ngưỡng — chuẩn bị sẵn nhưng chỉ bật khi cần.
- [ ] Validate Zod chặt chẽ độ dài/regex tất cả input public.

## Phase 10 — SEO + Discoverability (P1)

Mục tiêu: index tốt trên Google, share đẹp trên social.

- [ ] Chạy `seo_chat--trigger_scan`, fix toàn bộ failing findings.
- [ ] Verify `head()` riêng cho mỗi route: `/`, `/vendors`,
      `/vendors/$slug`, `/couples/$slug`, `/blog`, `/blog/$slug`,
      `/for-couples`, `/for-vendors`, `/about`.
- [ ] og:image động từ loader cho route dynamic (cover_image vendor/couple,
      cover_image blog post).
- [ ] JSON-LD: `LocalBusiness` cho vendor, `Event` cho couple, `Article`
      cho blog post.
- [ ] Verify `sitemap.xml` sinh URL công khai đúng (couples/vendors/blog
      published), `robots.txt` allow.
- [ ] Canonical URL leaf-only (không ở `__root.tsx`).

## Phase 11 — Vendor Approval Workflow Hoàn Thiện (P1)

Mục tiêu: tách rõ "admin duyệt lần đầu" vs "vendor tự ẩn/hiện".

- [ ] Migration: thêm cột `is_hidden_by_owner` (boolean default false)
      vào `vendors`.
- [ ] Sửa policy `vendors_public_read`: chỉ hiển thị khi
      `is_approved AND NOT is_hidden_by_owner`.
- [ ] UI vendor portal:
  - Chưa duyệt → badge "Chờ admin duyệt", không cho toggle.
  - Đã duyệt → toggle "Công khai / Tạm ẩn" đổi `is_hidden_by_owner`.
- [ ] Vendor KHÔNG được tự sửa `is_approved` (giữ RLS update field-level
      qua trigger nếu cần).

## Phase 12 — Quality of Life & Observability (P2)

- [ ] Analytics: Google Analytics 4 + Meta Pixel (tracking id qua
      `site_settings`).
- [ ] Image CDN transform cho upload `wedding-media` (resize/webp on the
      fly qua `cdn-image.ts`).
- [ ] Admin export CSV (couples, vendors, leads, payments).
- [ ] Backup script tự động (pg_dump qua cron job public route).
- [ ] Error monitoring: log lỗi server fn vào bảng `error_logs` + page
      `/admin/logs`.
- [ ] Skeleton/loading state đồng bộ cho mọi page chính.

---

## Quy ước cho phiên sau

1. Đọc file này đầu phiên, xác định phase đang dở (item chưa `[x]`).
2. Hoàn thành lần lượt từng item; tick `[x]` ngay khi xong.
3. Mỗi phase 1 migration tối đa (gộp các thay đổi DB cùng phase).
4. Không đổi design token/palette/font hiện tại.
5. Sau khi xong 1 phase, tóm tắt ngắn + đề xuất phase kế tiếp.

## Thứ tự ưu tiên đề xuất

Phase 6 → 7 (mở khoá email) → 8 → 11 → 9 → 10 → 12.