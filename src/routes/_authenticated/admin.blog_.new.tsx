import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogPostForm } from "@/components/BlogPostForm";

export const Route = createFileRoute("/_authenticated/admin/blog_/new")({ component: NewBlogPost });

function NewBlogPost() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Bài viết mới</h1>
        <Link to="/admin/blog" className="text-sm text-primary underline">← Về danh sách</Link>
      </div>
      <BlogPostForm />
    </div>
  );
}