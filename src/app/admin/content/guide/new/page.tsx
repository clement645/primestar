import GuideArticleForm from "@/components/admin/GuideArticleForm";

export default function NewGuideArticlePage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-dark">New Guide Article</h1>
      <div className="mt-6 max-w-2xl rounded-2xl border border-brand-lighter bg-white p-6">
        <GuideArticleForm />
      </div>
    </div>
  );
}
