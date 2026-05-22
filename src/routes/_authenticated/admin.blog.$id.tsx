import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminGetBlogPost } from "@/lib/blog.functions";
import { BlogPostForm } from "@/components/BlogPostForm";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({ component: EditBlogPost });

function EditBlogPost() {
  const { id } = Route.useParams();
  const get = useServerFn(adminGetBlogPost);
  const { data, isLoading } = useQuery({ queryKey: ["a-blog", id], queryFn: () => get({ data: { id } }) });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Chỉnh sửa bài viết</h1>
        <Link to="/admin/blog" className="text-sm text-primary underline">← Về danh sách</Link>
      </div>
      {isLoading && <p className="text-muted-foreground">Đang tải…</p>}
      {!isLoading && !data && <p className="text-muted-foreground">Không tìm thấy bài viết.</p>}
      {data && <BlogPostForm initial={data} />}
    </div>
  );
}