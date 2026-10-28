import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCoupleIntake } from "@/lib/intake.functions";
import { VN_BANKS } from "@/lib/form-presets";
import {
  Heart,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Camera,
  Calendar,
  CreditCard,
  Link2,
  FileText,
  Phone,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { canonical } from "@/lib/seo";

export const Route = createFileRoute("/gui-thong-tin")({
  component: GuiThongTinPage,
  head: () => ({
    meta: [
      { title: "Gửi Thông Tin Thiết Kế Thiệp Cưới — Mariée.vn" },
      {
        name: "description",
        content: "Gửi ảnh thiệp cưới và link album ảnh cưới để Mariée thiết kế trọn gói website cưới sang trọng và bảng Google Sheets theo dõi khách mời riêng cho bạn.",
      },
      { property: "og:title", content: "Gửi Thông Tin Thiết Kế Thiệp Cưới — Mariée.vn" },
      {
        property: "og:description",
        content: "Không cần tạo tài khoản. Chỉ cần gửi ảnh thiệp cưới và link album cưới, Mariée sẽ lo trọn gói cho hai bạn.",
      },
      { property: "og:url", content: canonical("/gui-thong-tin") },
    ],
    links: [{ rel: "canonical", href: canonical("/gui-thong-tin") }],
  }),
});

function GuiThongTinPage() {
  const submitIntake = useServerFn(submitCoupleIntake);

  const [form, setForm] = useState({
    bride_name: "",
    groom_name: "",
    contact_phone: "",
    wedding_date: "",
    venue_name: "",
    venue_address: "",
    album_url: "",
    gift_bank: "",
    gift_account: "",
    gift_holder: "",
    notes: "",
  });

  const [invitationPreview, setInvitationPreview] = useState<string | null>(null);
  const [heroPreview, setHeroPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    slug: string;
    couple_name: string;
    preview_url: string;
    sheet_url: string;
  } | null>(null);

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (b64: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 12MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.bride_name.trim() || !form.groom_name.trim()) {
      toast.error("Vui lòng điền tên cô dâu và chú rể.");
      return;
    }

    if (!form.contact_phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại hoặc Zalo liên hệ để nhận thiệp.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitIntake({
        data: {
          bride_name: form.bride_name,
          groom_name: form.groom_name,
          contact_phone: form.contact_phone,
          wedding_date: form.wedding_date || undefined,
          venue_name: form.venue_name || undefined,
          venue_address: form.venue_address || undefined,
          album_url: form.album_url || undefined,
          invitation_image_base64: invitationPreview || undefined,
          hero_image_base64: heroPreview || undefined,
          gift_bank: form.gift_bank || undefined,
          gift_account: form.gift_account || undefined,
          gift_holder: form.gift_holder || undefined,
          notes: form.notes || undefined,
        },
      });

      if (res && res.ok) {
        setSuccessResult({
          slug: res.slug,
          couple_name: res.couple_name,
          preview_url: res.preview_url,
          sheet_url: res.sheet_url,
        });
        toast.success("Gửi thông tin thành công! Mariée đang khởi tạo trang cưới cho hai bạn.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-12 shadow-sm text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <p className="text-xs uppercase tracking-[0.25em] text-amber-800 font-semibold mb-2">
            Đã gửi thành công
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-normal mb-3">
            Cảm Ơn {successResult.couple_name}!
          </h1>
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base max-w-lg mx-auto mb-8">
            Mariée đã nhận được thông tin thiệp cưới của hai bạn. Đội ngũ thiết kế đang tiến hành hoàn thiện
            giao diện và sẽ gửi link bản thảo chính thức qua Zalo <b>{form.contact_phone}</b> trong ít phút.
          </p>

          <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-5 mb-8 text-left space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Mã thiệp cưới:</span>
              <span className="font-mono text-stone-800 font-medium">/couples/{successResult.slug}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Bảng theo dõi khách:</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã tạo Google Sheet riêng
              </span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Trạng thái:</span>
              <span className="text-amber-800 font-medium">Bản nháp (Đang thiết kế)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={successResult.preview_url as any}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition"
            >
              <Eye className="w-4 h-4" />
              Xem bản thảo trước
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-100 transition"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/40 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-900 text-xs font-medium tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Không cần tạo tài khoản • Thiết kế trọn gói
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 font-normal tracking-tight">
            Gửi Thông Tin Thiết Kế Thiệp Cưới
          </h1>
          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            Hai bạn chỉ cần gửi <b>ảnh thiệp cưới</b> và <b>link album cưới</b>. Đội ngũ Mariée sẽ hoàn thiện
            website cưới sang trọng cùng bảng Google Sheets theo dõi khách mời riêng cho hai bạn.
          </p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Thông tin cơ bản */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Heart className="w-5 h-5 text-amber-800" />
              <h2 className="font-display text-lg text-stone-900 font-medium">1. Thông tin hai bạn</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Tên Cô Dâu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thảo My"
                  value={form.bride_name}
                  onChange={(e) => setForm({ ...form, bride_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Tên Chú Rể <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Hoàng Nam"
                  value={form.groom_name}
                  onChange={(e) => setForm({ ...form, groom_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Số điện thoại / Zalo nhận link <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="VD: 0909 888 999"
                    value={form.contact_phone}
                    onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Ngày cưới <span className="text-stone-400 font-normal">(Nếu có sẵn)</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={form.wedding_date}
                    onChange={(e) => setForm({ ...form, wedding_date: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Ảnh thiệp cưới & Album ảnh */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <Camera className="w-5 h-5 text-amber-800" />
              <div>
                <h2 className="font-display text-lg text-stone-900 font-medium">
                  2. Ảnh thiệp cưới &amp; Album cưới
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Quan trọng: Mariée sẽ đọc giờ giấc, sảnh tiệc, họ tên hai bên từ ảnh thiệp của bạn
                </p>
              </div>
            </div>

            {/* Upload Ảnh Thiệp */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-2">
                Ảnh thiệp cưới giấy (mặt trước / mặt trong / file thiết kế)
              </label>

              {invitationPreview ? (
                <div className="relative border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-2">
                  <img
                    src={invitationPreview}
                    alt="Ảnh thiệp cưới"
                    className="w-full max-h-64 object-contain rounded-lg mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setInvitationPreview(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium block mx-auto py-1"
                  >
                    ✕ Xóa ảnh này &amp; chọn lại ảnh khác
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-amber-800/60 rounded-xl p-6 cursor-pointer bg-stone-50/50 hover:bg-amber-50/30 transition text-center group">
                  <div className="w-12 h-12 bg-white rounded-full border border-stone-200 shadow-xs flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <UploadCloud className="w-6 h-6 text-stone-600 group-hover:text-amber-800" />
                  </div>
                  <span className="text-xs font-semibold text-stone-800 mb-0.5">
                    Bấm để tải lên ảnh thiệp cưới
                  </span>
                  <span className="text-xs text-stone-500">
                    Hỗ trợ chụp từ điện thoại, JPG, PNG, WEBP (tối đa 12MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, setInvitationPreview)}
                  />
                </label>
              )}
            </div>

            {/* Link Album cưới */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Link Album ảnh cưới (Google Drive, Google Photos, Canva, Zalo...)
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="VD: https://drive.google.com/drive/folders/..."
                  value={form.album_url}
                  onChange={(e) => setForm({ ...form, album_url: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Hai bạn chỉ cần paste link thư mục ảnh, đội ngũ thiết kế sẽ chọn lọc những bức ảnh đẹp nhất để đưa vào thiệp.
              </p>
            </div>

            {/* Chọn ảnh bìa đẹp nhất (Hero banner) */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Tải lên 1 ảnh cưới bạn thích nhất làm ảnh bìa chính (Tùy chọn)
              </label>

              {heroPreview ? (
                <div className="relative border border-stone-200 rounded-xl overflow-hidden bg-stone-50 p-2">
                  <img
                    src={heroPreview}
                    alt="Ảnh bìa cưới"
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setHeroPreview(null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium block mx-auto py-1"
                  >
                    ✕ Xóa &amp; chọn lại ảnh khác
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-3 border border-stone-200 hover:border-amber-800/60 rounded-xl p-3 cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition">
                  <div className="w-10 h-10 bg-white rounded-lg border border-stone-200 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5 text-stone-500" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-medium text-stone-800 block">
                      Chọn 1 bức ảnh cưới đẹp nhất làm banner
                    </span>
                    <span className="text-[11px] text-stone-500">
                      (Nếu chưa có, Mariée sẽ lấy từ link album của bạn)
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageChange(e, setHeroPreview)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Card 3: Mừng cưới online & Lời nhắn */}
          <div className="bg-white border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-stone-100">
              <CreditCard className="w-5 h-5 text-amber-800" />
              <h2 className="font-display text-lg text-stone-900 font-medium">
                3. Nhận mừng cưới online &amp; Lời nhắn (Tùy chọn)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Ngân hàng</label>
                <select
                  value={form.gift_bank}
                  onChange={(e) => setForm({ ...form, gift_bank: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                >
                  <option value="">Chọn ngân hàng</option>
                  {VN_BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  placeholder="VD: 1903888666"
                  value={form.gift_account}
                  onChange={(e) => setForm({ ...form, gift_account: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Tên chủ tài khoản</label>
                <input
                  type="text"
                  placeholder="VD: HOANG NAM"
                  value={form.gift_holder}
                  onChange={(e) => setForm({ ...form, gift_holder: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Lời nhắn gửi cho Mariée (Bài hát muốn phát, phong cách tone màu, yêu cầu riêng...)
              </label>
              <textarea
                rows={3}
                placeholder="VD: Tone màu yêu thích là hồng pastel, muốn chèn bài hát 'Until I Found You', mong muốn phong cách lãng mạn nhẹ nhàng..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20 focus:border-amber-800 transition bg-white"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-xl text-sm uppercase tracking-[0.2em] font-medium transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang khởi tạo thiệp cưới của hai bạn...
                </>
              ) : (
                <>
                  Gửi Thông Tin &amp; Khởi Tạo Thiệp Cưới
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Thông tin được bảo mật
              </span>
              <span>•</span>
              <span>Xem trước bản nháp miễn phí</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
