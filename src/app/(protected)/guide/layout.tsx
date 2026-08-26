import { GuideSidebar } from "./GuideSidebar";

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 lg:gap-8">
      <GuideSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
