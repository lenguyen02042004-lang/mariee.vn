// Standardized presets for Vietnamese wedding marketplace forms.
// Used by VendorForm & CoupleForm to replace free-text fields with selects.

export const VN_PROVINCES = [
  "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
  "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
  "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
  "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
  "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
  "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
  "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
  "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
  "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
  "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
] as const;

export const VENDOR_PRICE_RANGES = [
  "Dưới 10 triệu",
  "10 — 25 triệu",
  "25 — 50 triệu",
  "50 — 100 triệu",
  "100 — 200 triệu",
  "Trên 200 triệu",
  "Liên hệ để báo giá",
] as const;

export const VN_BANKS = [
  "Vietcombank", "Techcombank", "BIDV", "VietinBank", "Agribank",
  "MB Bank", "ACB", "VPBank", "TPBank", "Sacombank",
  "HDBank", "VIB", "SHB", "SeABank", "OCB",
  "MSB", "Eximbank", "LienVietPostBank", "Nam A Bank", "PVcomBank",
  "Bac A Bank", "ABBank", "Saigonbank", "Standard Chartered", "Shinhan Bank",
  "HSBC", "UOB", "Woori Bank", "Cake by VPBank", "Timo",
] as const;

export const CEREMONY_TIME_EXAMPLES = "VD: 09:00 — 11:00 sáng";
export const RECEPTION_TIME_EXAMPLES = "VD: 18:00 tối Thứ Bảy 12/10/2026";