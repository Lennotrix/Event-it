import AppSidebar from "@/components/sidebar/app-sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
