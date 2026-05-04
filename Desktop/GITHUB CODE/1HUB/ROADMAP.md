# 1HUB - IMPLEMENTATION ROADMAP
**Status:** ✅ ALL PHASES COMPLETE — CINEMATIC & RITUAL POLISHED
**Tech Stack:** Next.js 15+, Tailwind v4, Supabase (PostgreSQL)

---

## PROGRESS TRACKING

- [x] **PHASE 1: THE CORE (Foundation)**
    - Task: Setup Database Schema on Supabase.
    - Focus: Profiles, Projects, Project_Members, Case_Studies, Votes.
    - *Prompt: See Step 1 below.*

- [x] **PHASE 2: THE BRAIN (Logic)**
    - Task: Implement Level-up logic and Reputation Algorithm.
    - Focus: Server Actions, Weight calculation, Time decay.
    - *Prompt: See Step 2 below.*

- [x] **PHASE 3: THE VISUAL PROOF (Frontend)**
    - Task: Build Project Page and Contribution Timeline.
    - Focus: UI visualization of impact score and roles.
    - *Prompt: See Step 3 below.*

- [x] **PHASE 4: THE VALUE (Content)**
    - Task: Build Case Study system and Voting interface.
    - Focus: Minimalist Typography, Verification gate, Word count check.
    - *Prompt: See Step 4 below.*

- [x] **PHASE 5: THE SYNERGY (Intelligence)**
    - Task: AI Matchmaking and Vector Search.
    - Focus: Semantic search for partners based on execution history.
    - *Prompt: See Step 5 below.*

- [x] **PHASE 6: THE ADMINISTRATION (Governance)**
    - Task: Admin Dashboard with Audit Log, Transparency Monitor, Branding & Email.
    - Focus: Super Admin oversight, dispute visibility, Resend integration.
    - *Prompt: See Step 6 below.*

---

## EXECUTION PROMPTS (A-Z)

### BƯỚC 1: THIẾT LẬP NỀN TẢNG (THE CORE) [x]
**Prompt 1:** "Tôi muốn xây dựng 1Hub - The Synergy Network bằng Next.js, Tailwind và Supabase. Hãy đọc kỹ triết lý của dự án: 'Hệ thống 7 Level phân cấp ngược (L1 là Master), uy tín dựa trên xác thực chéo (Cross-verification) và Case Study tri thức'.
Nhiệm vụ đầu tiên: Hãy thiết lập Schema Database trên Supabase/PostgreSQL gồm các bảng: Profiles (có current_level, reputation_score), Projects (có status In-progress/Completed), Project_Members (có role: Founder, Core, Rescuer và is_verified), Case_Studies, và Votes. Hãy viết mã SQL để tạo các bảng này với các ràng buộc quan hệ chặt chẽ."

### BƯỚC 2: LOGIC THĂNG HẠNG (THE BRAIN) [x]
**Prompt 2:** "Dựa trên Schema đã tạo, hãy viết một Server Action/API để xử lý việc thăng hạng (Level Up). Logic như sau:
- Trọng số Vote: L1 = 10, L2 = 8, ..., L7 = 1.
- Hàm tính Reputation Score: Tổng điểm Vote nhân với hệ số thời gian (Time Decay).
- Điều kiện thăng hạng: L7 lên L4 là tự động dựa trên điểm. L3 lên L1 cần thêm điều kiện 'is_endorsed_by_master' từ bảng Votes. Hãy đảm bảo logic này không thể bị bypass từ phía Client."

### BƯỚC 3: PORTFOLIO DỰ ÁN & TIMELINE (THE VISUAL PROOF) [x]
**Prompt 3:** "Hãy xây dựng giao diện Project Page. Thành phần quan trọng nhất là 'Contribution Timeline'. Hãy dùng thư viện Recharts hoặc CSS Grid để vẽ một biểu đồ nằm ngang hiển thị thời gian tham gia của từng thành viên. Màu sắc và kích thước của đường chạy phải tương ứng với Impact Score và Role (Founder, Rescuer, Core). Mỗi đoạn trên timeline phải cho phép click để xem Case Study tương ứng của người đó."

### BƯỚC 4: CASE STUDY & VOTE (THE VALUE) [x]
**Prompt 4:** "Thiết kế trang Case Study. Yêu cầu:
- Giao diện tối giản, tập trung vào Typography.
- Chỉ cho phép thành viên đã được 'is_verified' trong dự án đó mới được đăng bài.
- Nút 'Vote' phải hiển thị rõ: 'Bạn đang vote với trọng số [X] dựa trên Level của bạn'.
- Nếu Case Study dưới 300 chữ, hiển thị cảnh báo và không cho phép Public."

### BƯỚC 5: AI MATCHMAKING (THE SYNERGY) [x]
**Prompt 5:** "Hãy viết một hàm gợi ý cộng sự sử dụng Vector Search (Supabase Vector) hoặc đơn giản là lọc theo Tag. Khi chủ dự án chọn 'Mentor-Mentee mode', hãy ưu tiên hiển thị các L2, L3 có kỹ năng phù hợp. Nếu chọn 'Peer-to-Peer', hãy hiển thị những người cùng Level. Kết quả gợi ý phải dựa trên lịch sử Case Study, không phải dựa trên Bio."

### BƯỚC 6: QUẢN TRỊ HỆ THỐNG (ADMIN DASHBOARD)
**Prompt 6:** "Thiết kế hệ thống Admin Dashboard cho 1Hub. Yêu cầu: 
1. Dashboard theo dõi các chỉ số: Tổng User, Dự án Active, Tỷ lệ thăng hạng. 
2. Công cụ quản lý User: Cho phép Super Admin xem chi tiết 'Audit Log' (Lịch sử Vote, lịch sử thăng Level). 
3. Theo dõi Minh bạch: Hiển thị danh sách các dự án có 'Parallel Data Streams' hoặc 'Dispute Notes' để Super Admin có cái nhìn tổng quan về tính trung thực của cộng đồng. 
4. Cấu hình Branding: Cho phép thay đổi Logo, Slogan và màu sắc chủ đạo của Web App từ Dashboard quản trị. 
5. Tích hợp hệ thống Email Service (ví dụ Resend) để tự động gửi thông báo xác thực tài khoản và báo cáo tuần cho thành viên."
