# Kế hoạch hoàn thiện 100% vận hành — chia 6 phase

Trạng thái: Phase 1–5 (roadmap cũ) đã hoàn tất. Roadmap mới này tập trung
vào việc đưa app từ ~85% sẵn sàng → 100% production. Mỗi phase độc lập,
có thể review giữa phiên. Khi mở phiên mới, đọc file này và tiếp tục từ
phase chưa hoàn thành (đánh dấu ✅ khi xong).

---

## Phase 6 — Auth Production Hardening (P0) ✅

- [x] Trigger `on_auth_user_created` → `handle_new_user()`.
- [x] `handle_new_user`: bỏ auto-admin, honor `signup_role` metadata, chặn self-assign admin.
- [x] Bật Google OAuth qua `configure_social_auth`.
- [x] Nút Google ở `/login` và `/register`.
- [x] `assignSignupRole` chạy lại sau OAuth callback (đã có trong `__root.tsx`).
- [x] `auto_confirm_email=false`, `password_hibp_enabled=true`.

## Phase 7 — Email Domain + Auth Templates (P0) ✅

- [x] Cấu hình email domain `notify.mariee.vn` (đang verify DNS).
- [x] Scaffold 6 auth email templates + webhook + preview route.
- [x] Brand Mariée: BrandLayout dùng chung (rose primary `#b8345a`, gold,
      cream `#fdf8f6`, font Great Vibes + Georgia serif, Body `#ffffff`).
- [x] Vite config: alias `entities` v4.5.0 + load serverEnv vào `process.env`.
- [x] Cài `@lovable.dev/email-js`, `@lovable.dev/webhooks-js`,
      `@react-email/components`, `react-email`.
- [ ] Test gửi thật khi DNS verify xong (theo dõi ở Cloud → Emails).

## Phase 8 — Transactional Notifications (P1)

Mục tiêu: admin/vendor/couple nhận thông báo khi có hoạt động mới.

- [x] `scaffold_transactional_email` (tái dùng email domain Phase 7).
- [x] Template + trigger gửi email cho các sự kiện:
  - [x] Vendor nhận **lead mới** (`vendor-new-lead`).
  - [x] Couple nhận **RSVP mới** (`couple-new-rsvp`) và **lời chúc mới** (`couple-new-wish`).
  - [x] Admin nhận **payment mới chờ duyệt** (`admin-new-payment`).
  - [x] Vendor nhận thông báo khi **payment được duyệt/từ chối** (`vendor-payment-reviewed`).
- [x] Helper `src/lib/email/send.server.ts` enqueue qua pgmq (suppression
      + unsubscribe token), fire-and-forget trong server functions.
- [x] Trang `/unsubscribe` cho footer email.

## Phase 9 — Anti-Spam & Rate Limiting (P1) ✅

Mục tiêu: bảo vệ form public khỏi spam/abuse.

- [x] Rate limit IP-based (5 req / 60s / IP / scope) cho RSVP, wishes,
      vendor leads — table `rate_limits` + RPC `rate_limit_check`
      (SECURITY DEFINER, chỉ service_role gọi).
- [x] Honeypot field `website` + min-time-to-submit 1.5s cho 3 form public.
- [x] Helper `src/lib/anti-spam.server.ts` (`guardPublicSubmit`,
      `getClientIp` từ `cf-connecting-ip` / `x-forwarded-for`).
- [x] Validate Zod đã chặt chẽ độ dài cho tất cả input public.
- [ ] (Tuỳ chọn) Cloudflare Turnstile — chuẩn bị sẵn nhưng chỉ bật khi
      lượng spam vượt ngưỡng.

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

## Phase 11 — Vendor Approval Workflow Hoàn Thiện (P1) ✅

Mục tiêu: tách rõ "admin duyệt lần đầu" vs "vendor tự ẩn/hiện".

- [x] Migration: cột `is_hidden_by_owner` (boolean default false) vào `vendors`.
- [x] Policy `vendors_public_read`: hiển thị khi
      `is_approved AND NOT is_hidden_by_owner` (owner + admin vẫn xem được).
- [x] `listVendors` / `getVendorBySlug` cũng filter `is_hidden_by_owner = false`
      (do dùng `supabaseAdmin` bypass RLS).
- [x] Server fn `setMyVendorHidden(hidden)` — chặn bật công khai khi
      `is_approved = false`.
- [x] UI vendor portal: badge trạng thái (Chờ duyệt / Tạm ẩn / Công khai)
      + toggle "Công khai / Tạm ẩn" (chỉ active khi đã duyệt).
- [x] Trigger `vendors_guard_update` vẫn chặn vendor sửa `is_approved`,
      `is_featured`, `plan_id`, `plan_expires_at`, `owner_id`.

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