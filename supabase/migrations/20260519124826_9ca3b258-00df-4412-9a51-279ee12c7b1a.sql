UPDATE payment_settings SET bank_name='Vietcombank', bank_account_name='CONG TY MARIEE WEDDING', bank_account_number='0123456789', instructions='Nội dung CK: <slug-vendor> <gói>. Sau khi chuyển, tải ảnh bill lên để admin duyệt nhanh trong 24h.' WHERE id=1;

UPDATE couples SET 
  ceremony_time='10:00 — Sáng Chủ nhật',
  reception_time='18:00 — Tối Chủ nhật',
  venue_name='Trung tâm tiệc cưới White Palace',
  venue_address='194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
  story=E'Chúng mình quen nhau từ những ngày tháng đại học, cùng nhau đi qua bao mùa Sài Gòn nắng mưa. Sau 7 năm yêu thương, chúng mình quyết định viết tiếp câu chuyện cuộc đời cùng nhau — và muốn bạn có mặt trong khoảnh khắc đặc biệt ấy.',
  quote='Forever begins today.',
  hero_image_1='hero-wedding-1.jpg',
  hero_image_2='hero-wedding-2.jpg',
  hero_image_3='hero-wedding-3.jpg',
  cover_image='hero-wedding-1.jpg',
  youtube_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
  gift_bride_bank='Vietcombank', gift_bride_holder='NGUYEN MINH ANH', gift_bride_account='0011002233445',
  gift_groom_bank='Techcombank', gift_groom_holder='TRAN QUOC BAO', gift_groom_account='1903 8888 7777',
  schedule='[
    {"time":"08:30","title":"Đón khách","description":"Welcome champagne tại tiền sảnh"},
    {"time":"10:00","title":"Lễ thành hôn","description":"Nghi lễ trao nhẫn và lời thề"},
    {"time":"11:30","title":"Tiệc trà & chụp ảnh","description":"Lưu giữ khoảnh khắc cùng cô dâu chú rể"},
    {"time":"18:00","title":"Tiệc tối","description":"Dạ tiệc 7 món, live band & vũ hội"}
  ]'::jsonb
WHERE slug='minh-anh-quoc-bao';

UPDATE couples SET
  ceremony_time='09:30',
  reception_time='18:30',
  venue_name='Riverside Palace',
  venue_address='360D Bến Vân Đồn, Quận 4, TP.HCM',
  story='Một cuộc gặp gỡ tình cờ tại Đà Lạt mùa hoa anh đào, một lời hứa được giữ trọn vẹn. Hôm nay chúng mình chính thức về chung một nhà.',
  quote='Two hearts, one journey.',
  hero_image_1='hero-wedding-2.jpg', hero_image_2='hero-wedding-3.jpg', hero_image_3='hero-wedding-1.jpg',
  cover_image='hero-wedding-2.jpg',
  gift_bride_bank='ACB', gift_bride_holder='LE THUY LINH', gift_bride_account='2222 3333 4444',
  gift_groom_bank='BIDV', gift_groom_holder='PHAM HOANG NAM', gift_groom_account='5555 6666 7777',
  schedule='[
    {"time":"09:00","title":"Đón khách","description":""},
    {"time":"09:30","title":"Lễ thành hôn","description":""},
    {"time":"18:30","title":"Tiệc tối","description":"Dress code: Pastel"}
  ]'::jsonb
WHERE slug='thuy-linh-hoang-nam';

UPDATE vendors SET 
  description='White Palace là chuỗi trung tâm tiệc cưới sang trọng hàng đầu với sảnh tiệc rộng 1.000 chỗ ngồi, sân khấu Led panorama và đội ngũ phục vụ chuyên nghiệp 5 sao. Hơn 5.000 cặp đôi đã chọn White Palace cho ngày trọng đại.',
  gallery='["gallery-1.jpg","gallery-2.jpg","gallery-3.jpg","gallery-4.jpg","gallery-5.jpg"]'::jsonb,
  youtube_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
  phone='1900 6789', email='booking@whitepalace.vn', address='194 Hoàng Văn Thụ', city='TP.HCM', website='https://whitepalace.vn',
  price_range='Từ 8.000.000đ / bàn'
WHERE slug='white-palace-venue';

UPDATE vendors SET 
  description='Lumière Photography — studio chụp ảnh cưới với phong cách điện ảnh, ánh sáng tự nhiên. Đội ngũ photographer được đào tạo tại Pháp, làm việc khắp Việt Nam và châu Á.',
  gallery='["gallery-2.jpg","gallery-3.jpg","gallery-4.jpg","gallery-5.jpg"]'::jsonb,
  youtube_url='https://www.youtube.com/embed/dQw4w9WgXcQ',
  phone='0908 123 456', email='hello@lumiere.vn', city='TP.HCM',
  price_range='Từ 15.000.000đ / album'
WHERE slug='lumiere-photography';

UPDATE vendors SET 
  description='Mia Beauty Studio chuyên trang điểm cô dâu phong cách Hàn — Nhật — Tây Âu. Sử dụng mỹ phẩm cao cấp, đảm bảo lớp trang điểm bền màu suốt cả ngày dài.',
  gallery='["gallery-3.jpg","gallery-1.jpg","gallery-5.jpg"]'::jsonb,
  phone='0909 888 777', email='mia@beauty.vn', city='Hà Nội',
  price_range='Từ 3.000.000đ'
WHERE slug='mia-beauty';

UPDATE vendors SET 
  description='Rosé Flowers — concept hoa cưới sang trọng, thiết kế theo từng câu chuyện riêng của cô dâu. Nguyên liệu nhập khẩu Hà Lan và Đà Lạt.',
  gallery='["gallery-4.jpg","gallery-2.jpg","gallery-5.jpg"]'::jsonb,
  phone='0938 111 222', email='hello@rose.vn', city='Đà Nẵng',
  price_range='Từ 5.000.000đ'
WHERE slug='rosé-flowers';