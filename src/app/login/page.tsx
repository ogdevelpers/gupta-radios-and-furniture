import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getStaffSession } from "@/lib/auth/session";

export const runtime = "edge";

export default async function LoginPage() {
  const staff = await getStaffSession();
  if (staff) {
    redirect("/complaints/dashboard");
  }

  return (
    <main className="page-shell">
      <section className="login-shell" aria-labelledby="login-heading">
        <div className="brand-lockup">
          <p className="brand-mark">Gupta Radios & Furniture</p>
          <h1 id="login-heading">Staff sign in</h1>
          <p>Access the complaints desk to register and track service requests.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
