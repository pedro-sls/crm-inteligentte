import { redirect } from "next/navigation";
import { OrganizationSetupForm } from "@/components/auth/organization-setup-form";
import { getOrganizationMembership } from "@/lib/organization-context";
import { requireSession } from "@/lib/session";

export default async function SetupPage() {
  const session = await requireSession();
  const membership = await getOrganizationMembership(
    session.user.id,
    session.session.activeOrganizationId,
  );

  if (membership) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <OrganizationSetupForm />
    </main>
  );
}
