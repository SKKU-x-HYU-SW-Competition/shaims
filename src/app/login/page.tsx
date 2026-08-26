import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session.userId) {
    redirect(session.role === "ADMIN" ? "/admin/submissions" : "/submissions");
  }
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
