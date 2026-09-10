import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BlogPostForm from "@/components/admin/BlogPostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Edit Blog Post</h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-lighter bg-white p-6">
        <BlogPostForm post={post} />
      </div>
    </div>
  );
}
