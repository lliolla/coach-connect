"use client"

import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconUsers,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconLayoutGrid,
  IconBarbell,
  IconAdjustments
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav/nav-documents"
import { NavMain } from "@/components/nav/nav-main"
import { NavSecondary } from "@/components/nav/nav-secondary"
import { NavUser } from "@/components/nav/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { getUser } from "@/app/actions/auth"

const menuData = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Séances",
      url: "/seances",
      icon: IconListDetails,
    },
    {
      title: "Athlètes",
      url: "/users",
      icon: IconUsers,
    },
  ],
  configuration: [
    {
      name: "Gestion des listes",
      url: "/parametrage",
      icon: IconAdjustments,
    },
    {
      name: "Bibliothèque d'exercices",
      url: "/exercices",
      icon: IconBarbell,
    },
    {
      name: "Bibliothèque de séances",
      url: "/modeles",
      icon: IconLayoutGrid,
    },
  ],
  navSecondary: [
    {
      title: "Paramètres",
      url: "/parametrage?tab=settings",
      icon: IconSettings,
    },
    {
      title: "Aide",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const [user, setUser] = React.useState({
    name: "Chargement...",
    email: "",
    avatar: "",
    isAdmin: false
  })

  React.useEffect(() => {
    const fetchUser = async () => {
      const data = await getUser()
      if (data) {
        const fullName = data.user_metadata?.full_name || 
                        (data.athlete_profile?.first_name ? `${data.athlete_profile.first_name} ${data.athlete_profile.last_name || ''}` : null) || 
                        data.email
        setUser({
          name: fullName,
          email: data.email,
          avatar: data.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
          isAdmin: data.isAdmin
        })
      }
    }
    fetchUser()
  }, [])

  return (
    (<Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Prep Athlète</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={menuData.navMain} />
        {user.isAdmin && (
          <NavDocuments items={menuData.configuration} label="Configuration" />
        )}
        <NavSecondary items={menuData.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
