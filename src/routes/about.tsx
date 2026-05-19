import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({ meta: [
    { title: "Giới thiệu — Mariée" },
    { name: "description", content: "Mariée là nền tảng landing page cưới sang trọng kết nối cặp đôi với những vendor cưới hàng đầu Việt Nam." },
  ]}),
});

function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <p className="font-script text-3xl text-primary text-center">about</p>
      <h1 className="font-display text-5xl text-center mt-2">Câu chuyện của Mariée</h1>
      <div className="prose prose-neutral mt-12 mx-auto">
        <p>Mariée ra đời từ một niềm tin đơn giản: mỗi đám cưới là một câu chuyện độc nhất xứng đáng được kể bằng cách riêng. Chúng tôi tạo ra nền tảng giúp các cặp đôi có một trang cưới đẹp, sang trọng và dễ chia sẻ — đồng thời kết nối họ với những vendor cưới uy tín nhất.</p>
        <p>Với đội ngũ đam mê thiết kế và công nghệ, Mariée mang đến trải nghiệm liền mạch từ lúc bạn lên ý tưởng cho đến ngày trọng đại.</p>
        <h2>Sứ mệnh</h2>
        <p>Lưu giữ những khoảnh khắc đẹp nhất của bạn — mãi mãi.</p>
        <h2>Liên hệ</h2>
        <p>Email: hello@mariee.vn — Hotline: 1900 0000</p>
      </div>
    </div>
  );
}