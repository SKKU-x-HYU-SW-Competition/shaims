import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex flex-1 min-h-screen bg-zinc-50">
      <Sidebar role={user.role} teamName={user.teamName} />
      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-5xl px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
