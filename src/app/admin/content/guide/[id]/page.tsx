import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import GuideArticleForm from "@/components/admin/GuideArticleForm";

export default async function EditGuideArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.guideArticle.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-dark">Edit Guide Article</h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-lighter bg-white p-6">
        <GuideArticleForm article={article} />
      </div>
    </div>
  );
}
