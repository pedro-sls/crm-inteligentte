import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/app");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Suspense>
        <AuthForm />
      </Suspense>
    </main>
  );
}
