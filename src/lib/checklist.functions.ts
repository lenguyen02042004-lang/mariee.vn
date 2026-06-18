import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const DEFAULT_CHECKLIST: { category: string; title: string }[] = [
  // 9-12 tháng trước
  { category: "9–12 tháng trước", title: "Chọn ngày cưới chính thức" },
  { category: "9–12 tháng trước", title: "Lập ngân sách tổng thể" },
  { category: "9–12 tháng trước", title: "Lên danh sách khách mời dự kiến" },
  { category: "9–12 tháng trước", title: "Đặt cọc địa điểm tổ chức tiệc" },
  { category: "9–12 tháng trước", title: "Chọn phong cách / concept cưới" },
  { category: "9–12 tháng trước", title: "Tìm và đặt wedding planner (nếu cần)" },

  // 6-9 tháng
  { category: "6–9 tháng trước", title: "Đặt nhiếp ảnh & quay phim cưới" },
  { category: "6–9 tháng trước", title: "Chọn váy cưới cô dâu" },
  { category: "6–9 tháng trước", title: "Chọn vest chú rể" },
  { category: "6–9 tháng trước", title: "Đặt nhẫn cưới" },
  { category: "6–9 tháng trước", title: "Chụp ảnh cưới (pre-wedding)" },
  { category: "6–9 tháng trước", title: "Đặt xe hoa & xe đưa đón" },

  // 3-6 tháng
  { category: "3–6 tháng trước", title: "Thiết kế & in thiệp cưới" },
  { category: "3–6 tháng trước", title: "Đặt bánh cưới" },
  { category: "3–6 tháng trước", title: "Chọn MC dẫn chương trình" },
  { category: "3–6 tháng trước", title: "Đặt ban nhạc / ca sĩ / DJ" },
  { category: "3–6 tháng trước", title: "Đặt hoa cưới & trang trí" },
  { category: "3–6 tháng trước", title: "Chốt thực đơn tiệc cưới" },

  // 1-3 tháng
  { category: "1–3 tháng trước", title: "Gửi thiệp mời cho khách" },
  { category: "1–3 tháng trước", title: "Thử váy cưới lần cuối" },
  { category: "1–3 tháng trước", title: "Đặt makeup & làm tóc cô dâu" },
  { category: "1–3 tháng trước", title: "Chuẩn bị tráp & lễ vật ăn hỏi" },
  { category: "1–3 tháng trước", title: "Đăng ký kết hôn" },
  { category: "1–3 tháng trước", title: "Lên kế hoạch tuần trăng mật" },

  // 2-4 tuần
  { category: "2–4 tuần trước", title: "Xác nhận số lượng khách với nhà hàng" },
  { category: "2–4 tuần trước", title: "Thanh toán cọc các dịch vụ còn lại" },
  { category: "2–4 tuần trước", title: "Tổng duyệt chương trình với MC & ekip" },
  { category: "2–4 tuần trước", title: "Chuẩn bị quà cảm ơn khách mời" },
  { category: "2–4 tuần trước", title: "Sắp xếp chỗ ngồi (sơ đồ bàn)" },

  // Tuần cưới
  { category: "Tuần cưới", title: "Nhận váy cưới & vest" },
  { category: "Tuần cưới", title: "Chăm sóc da, móng, tóc" },
  { category: "Tuần cưới", title: "Đóng gói đồ cho ngày cưới & trăng mật" },
  { category: "Tuần cưới", title: "Gặp ekip lần cuối — chốt lịch trình" },
  { category: "Tuần cưới", title: "Chuẩn bị phong bì / tiền lì xì cho ekip" },

  // Ngày cưới
  { category: "Ngày cưới", title: "Ăn sáng đầy đủ, giữ tinh thần thoải mái" },
  { category: "Ngày cưới", title: "Trang điểm & mặc trang phục cưới" },
  { category: "Ngày cưới", title: "Tận hưởng ngày trọng đại!" },
];

// ---- Mẫu checklist theo giai đoạn ----
export type ChecklistTemplate = {
  id: string;
  name: string;
  description: string;
  items: { category: string; title: string }[];
};

export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "full",
    name: "Lộ trình đầy đủ (9–12 tháng)",
    description: "Bộ chuẩn từ 9–12 tháng trước cho tới ngày cưới — phù hợp khi bạn còn nhiều thời gian.",
    items: DEFAULT_CHECKLIST,
  },
  {
    id: "6m",
    name: "Còn ~6 tháng",
    description: "Rút gọn từ giai đoạn 6–9 tháng trở đi.",
    items: DEFAULT_CHECKLIST.filter((i) =>
      ["6–9 tháng trước", "3–6 tháng trước", "1–3 tháng trước", "2–4 tuần trước", "Tuần cưới", "Ngày cưới"].includes(i.category),
    ),
  },
  {
    id: "3m",
    name: "Còn ~3 tháng",
    description: "Tập trung những việc cần làm trong 3 tháng cuối.",
    items: [
      ...DEFAULT_CHECKLIST.filter((i) =>
        ["3–6 tháng trước", "1–3 tháng trước", "2–4 tuần trước", "Tuần cưới", "Ngày cưới"].includes(i.category),
      ),
      { category: "3–6 tháng trước", title: "Rà soát lại ngân sách & các khoản đã đặt cọc" },
    ],
  },
  {
    id: "1m",
    name: "Còn ~1 tháng",
    description: "Việc gấp rút trong tháng cuối — chốt số khách, thanh toán, tổng duyệt.",
    items: [
      ...DEFAULT_CHECKLIST.filter((i) =>
        ["1–3 tháng trước", "2–4 tuần trước", "Tuần cưới", "Ngày cưới"].includes(i.category),
      ),
      { category: "1–3 tháng trước", title: "Liên hệ xác nhận từng nhà cung cấp" },
    ],
  },
  {
    id: "week",
    name: "Tuần lễ trước tiệc",
    description: "Việc cần hoàn tất trong 7 ngày cuối và ngày cưới.",
    items: [
      ...DEFAULT_CHECKLIST.filter((i) => ["Tuần cưới", "Ngày cưới"].includes(i.category)),
      { category: "Tuần cưới", title: "Xác nhận giờ đón dâu với ekip xe & quay phim" },
      { category: "Tuần cưới", title: "Kiểm tra sơ đồ bàn & danh sách khách VIP" },
      { category: "Tuần cưới", title: "Sạc pin điện thoại, máy ảnh, mic dự phòng" },
    ],
  },
  {
    id: "express",
    name: "Cưới nhanh (rút gọn)",
    description: "Danh sách rút gọn ~20 việc cốt lõi cho cặp đôi tổ chức gấp.",
    items: [
      { category: "Cần làm ngay", title: "Chốt ngày cưới & ngân sách tối đa" },
      { category: "Cần làm ngay", title: "Đặt địa điểm tổ chức tiệc" },
      { category: "Cần làm ngay", title: "Lên danh sách khách mời" },
      { category: "Cần làm ngay", title: "Đặt nhiếp ảnh & quay phim" },
      { category: "Cần làm ngay", title: "Đặt váy cưới & vest" },
      { category: "Cần làm ngay", title: "Mua / đặt nhẫn cưới" },
      { category: "Trước 2–4 tuần", title: "In & gửi thiệp (hoặc thiệp online)" },
      { category: "Trước 2–4 tuần", title: "Chốt thực đơn & số bàn" },
      { category: "Trước 2–4 tuần", title: "Đặt MC & nhạc / DJ" },
      { category: "Trước 2–4 tuần", title: "Đặt makeup & làm tóc cô dâu" },
      { category: "Trước 2–4 tuần", title: "Đặt xe hoa / xe đưa đón" },
      { category: "Trước 2–4 tuần", title: "Đăng ký kết hôn" },
      { category: "Tuần cưới", title: "Thanh toán phần còn lại các dịch vụ" },
      { category: "Tuần cưới", title: "Tổng duyệt chương trình với MC & ekip" },
      { category: "Tuần cưới", title: "Chuẩn bị phong bì lì xì cho ekip" },
      { category: "Ngày cưới", title: "Mang theo nhẫn, giấy tờ, điện thoại sạc đầy" },
      { category: "Ngày cưới", title: "Tận hưởng ngày trọng đại!" },
    ],
  },
];

export const listChecklistTemplates = createServerFn({ method: "GET" })
  .handler(async () =>
    CHECKLIST_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      count: t.items.length,
    })),
  );

export const applyChecklistTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { templateId: string; mode: "merge" | "replace" }) =>
    z.object({
      templateId: z.string().min(1),
      mode: z.enum(["merge", "replace"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const tpl = CHECKLIST_TEMPLATES.find((t) => t.id === data.templateId);
    if (!tpl) throw new Error("Không tìm thấy mẫu checklist");
    const { supabase, userId } = context;

    let startOrder = 0;
    let existingTitles = new Set<string>();
    if (data.mode === "replace") {
      await supabase.from("couple_checklist").delete().eq("user_id", userId);
    } else {
      const { data: existing } = await supabase
        .from("couple_checklist")
        .select("title, category, sort_order")
        .eq("user_id", userId);
      existingTitles = new Set((existing ?? []).map((r: any) => `${r.category}::${r.title}`));
      startOrder = (existing ?? []).reduce((m: number, r: any) => Math.max(m, r.sort_order ?? 0), -1) + 1;
    }

    const rows = tpl.items
      .filter((it) => !existingTitles.has(`${it.category}::${it.title}`))
      .map((it, idx) => ({
        user_id: userId,
        title: it.title,
        category: it.category,
        sort_order: startOrder + idx,
        is_custom: false,
      }));

    if (rows.length > 0) {
      const { error } = await supabase.from("couple_checklist").insert(rows);
      if (error) throw new Error(error.message);
    }
    return { ok: true, inserted: rows.length, template: tpl.name };
  });

export const listChecklist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("couple_checklist")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      const rows = DEFAULT_CHECKLIST.map((item, idx) => ({
        user_id: userId,
        title: item.title,
        category: item.category,
        sort_order: idx,
        is_custom: false,
      }));
      const { data: inserted, error: insErr } = await supabase
        .from("couple_checklist")
        .insert(rows)
        .select("*");
      if (insErr) throw new Error(insErr.message);
      return (inserted ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order);
    }
    return data;
  });

export const addChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { title: string; category?: string; due_date?: string | null; notes?: string | null }) =>
    z.object({
      title: z.string().trim().min(1).max(200),
      category: z.string().trim().max(80).optional(),
      due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
      notes: z.string().trim().max(2000).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: maxRow } = await supabase
      .from("couple_checklist")
      .select("sort_order")
      .eq("user_id", userId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = ((maxRow as any)?.sort_order ?? -1) + 1;
    const { data: row, error } = await supabase
      .from("couple_checklist")
      .insert({
        user_id: userId,
        title: data.title,
        category: data.category?.trim() || "Tự thêm",
        is_custom: true,
        sort_order: nextOrder,
        due_date: data.due_date || null,
        notes: data.notes || null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    title?: string;
    category?: string;
    due_date?: string | null;
    notes?: string | null;
  }) =>
    z.object({
      id: z.string().uuid(),
      title: z.string().trim().min(1).max(200).optional(),
      category: z.string().trim().max(80).optional(),
      due_date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal("")]).nullable().optional(),
      notes: z.string().trim().max(2000).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const patch: {
      title?: string;
      category?: string;
      due_date?: string | null;
      notes?: string | null;
    } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.category !== undefined) patch.category = data.category || "Tự thêm";
    if (data.due_date !== undefined) patch.due_date = data.due_date ? data.due_date : null;
    if (data.notes !== undefined) patch.notes = data.notes ? data.notes : null;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await context.supabase
      .from("couple_checklist")
      .update(patch)
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const toggleChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; is_completed: boolean }) =>
    z.object({ id: z.string().uuid(), is_completed: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("couple_checklist")
      .update({ is_completed: data.is_completed })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteChecklistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("couple_checklist")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("couple_checklist").delete().eq("user_id", userId);
    const rows = DEFAULT_CHECKLIST.map((item, idx) => ({
      user_id: userId,
      title: item.title,
      category: item.category,
      sort_order: idx,
      is_custom: false,
    }));
    const { error } = await supabase.from("couple_checklist").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });