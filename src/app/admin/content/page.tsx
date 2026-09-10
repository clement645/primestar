import Link from "next/link";
import { prisma } from "@/lib/db";
import ContentRowActions from "@/components/admin/ContentRowActions";
import {
  deleteBlogPost,
  togglePublishBlogPost,
  deleteGuideArticle,
  togglePublishGuideArticle,
} from "@/app/admin/content/actions";

export default async function AdminContentPage() {
  const [posts, articles] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.guideArticle.findMany({ orderBy: [{ section: "asc" }, { orderIndex: "asc" }] }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-extrabold text-brand-dark">Content</h1>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-brand-dark">Blog Posts</h2>
          <Link
            href="/admin/content/blog/new"
            className="rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-medium"
          >
            + New Post
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-lighter bg-white p-4">
              <div>
                <p className="font-semibold text-brand-dark">{post.title}</p>
                <p className="text-xs text-brand-dark/50">
                  {post.category} · {post.status}
                </p>
              </div>
              <ContentRowActions
                editHref={`/admin/content/blog/${post.id}`}
                status={post.status}
                onToggle={togglePublishBlogPost.bind(null, post.id)}
                onDelete={deleteBlogPost.bind(null, post.id)}
              />
            </div>
          ))}
          {posts.length === 0 && <p className="text-sm text-brand-dark/50">No blog posts yet.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-brand-dark">Farming Guide Articles</h2>
          <Link
            href="/admin/content/guide/new"
            className="rounded-full bg-brand-dark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-medium"
          >
            + New Article
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {articles.map((article) => (
            <div key={article.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-lighter bg-white p-4">
              <div>
                <p className="font-semibold text-brand-dark">{article.title}</p>
                <p className="text-xs text-brand-dark/50">
                  {article.section} · {article.status}
                </p>
              </div>
              <ContentRowActions
                editHref={`/admin/content/guide/${article.id}`}
                status={article.status}
                onToggle={togglePublishGuideArticle.bind(null, article.id)}
                onDelete={deleteGuideArticle.bind(null, article.id)}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
