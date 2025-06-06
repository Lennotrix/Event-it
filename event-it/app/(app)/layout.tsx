import TopNav from "@/components/navigationMenu/app-navigationMenu";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <TopNav />
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
