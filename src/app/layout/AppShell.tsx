import { Outlet } from 'react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { DroneListSourceBanner } from '@/features/drones/DroneListSourceBanner'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'

/** Layout for all signed-in clinic pages: sidebar + top bar + page content. */
export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <DroneListSourceBanner />
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
