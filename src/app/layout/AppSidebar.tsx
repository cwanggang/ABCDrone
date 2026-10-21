import { NavLink, useLocation } from 'react-router'
import {
  ClipboardList,
  LayoutDashboard,
  Plane,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

interface NavItem {
  label: string
  icon: LucideIcon
  /** Omit for "coming soon" items. */
  to?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Drones', icon: Plane, to: '/drones' },
  { label: 'Missions', icon: ClipboardList },
  { label: 'Patients', icon: Users },
  { label: 'Settings', icon: Settings },
]

/** Collapses to icons on desktop (toggle in the top bar); slides in as a sheet on mobile. */
export function AppSidebar() {
  const { pathname } = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <img src="/favicon.svg" alt="" className="size-6 shrink-0" />
          <span className="truncate font-semibold group-data-[collapsible=icon]:hidden">
            ABCDrone Clinic
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.label}>
                  {item.to ? (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={pathname.startsWith(item.to)}
                    >
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  ) : (
                    <>
                      <SidebarMenuButton disabled tooltip={`${item.label} (coming soon)`}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge className="text-[10px] text-muted-foreground">
                        Soon
                      </SidebarMenuBadge>
                    </>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
