import TopNav from "@/components/navigationMenu/app-navigationMenu";
import {PopupProvider} from "@/components/provider/popupProvider";
import AppSidebar from "@/components/sidebar/app-sidebar";
import {SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";

export default function AppLayout({children}: { children: React.ReactNode }) {
    return (
        <>
            <PopupProvider>
                <SidebarProvider>
                    <AppSidebar/>
                    <main className="flex flex-col h-screen w-full">
                        {/* Fixed height or auto-sized content at top */}
                        <TopNav/>
                        <SidebarTrigger/>

                        {/* Grow only to fill remaining space */}
                        <div className="flex-1 overflow-auto">
                            {children}
                        </div>
                    </main>
                </SidebarProvider>
            </PopupProvider>
        </>
    );
}
