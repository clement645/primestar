import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/auth";

const NAV = [
  { href: "/admin/dashboard", label: "Overview & Analytics" },
  { href: "/admin/workers", label: "Workers" },
  { href: "/admin/farmers", label: "Farmers" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  return (
    <div className="container-page grid gap-6 py-10 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-brand-dark/50">
          Admin
        </p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-brand-dark/80 hover:bg-brand-lighter/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="mt-4 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </form>
      </aside>
      <div>{children}</div>
    </div>
  );
}
