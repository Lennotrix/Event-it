import TopNav from "@/components/navigationMenu/app-navigationMenu";
import { PopupProvider } from "@/components/provider/popupProvider";
import AppSidebar from "@/components/sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PopupProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="w-full">
            <TopNav />
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      </PopupProvider>
    </>
  );
}
