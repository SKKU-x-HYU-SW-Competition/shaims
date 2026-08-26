import { GuideSidebar } from "./GuideSidebar";

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start">
      <aside className="w-56 shrink-0 sticky top-0 self-start max-h-screen overflow-y-auto border-r bg-white px-4 py-8">
        <GuideSidebar />
      </aside>
      <div className="flex-1 min-w-0 px-8 py-8">
        <div className="max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
