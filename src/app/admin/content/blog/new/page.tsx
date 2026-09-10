import BlogPostForm from "@/components/admin/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-dark">New Blog Post</h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-lighter bg-white p-6">
        <BlogPostForm />
      </div>
    </div>
  );
}
