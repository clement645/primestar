import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const role = (session.user as { role?: string }).role;

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-md">
        <h1 className="font-heading text-3xl font-extrabold text-brand-dark">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-brand-dark/60">
          Signed in as {session.user.name} ({role?.toLowerCase()})
        </p>

        <div className="mt-8 rounded-2xl border border-brand-lighter bg-white p-6">
          <h2 className="font-heading text-lg font-bold text-brand-dark">
            Change Password
          </h2>
          <p className="mt-1 text-sm text-brand-dark/60">
            Enter your current password and choose a new one. If an
            administrator just gave you a temporary password, use it as your
            &quot;current password&quot; here to set one only you know.
          </p>
          <div className="mt-5">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
