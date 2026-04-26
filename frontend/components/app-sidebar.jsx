"use client"

import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconUsers,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,
  IconLogout,
  IconLayoutGrid,
  IconBarbell,
  IconAdjustments
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin",
    email: "admin@prepathlete.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  },
  navMain: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Plan",
      url: "/suivis",
      icon: IconListDetails,
    },
    {
      title: "Athlètes",
      url: "/athletes",
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
    {
      title: "Déconnexion",
      url: "#",
      icon: IconLogout,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
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
        <NavMain items={data.navMain} />
        <NavDocuments items={data.configuration} label="Configuration" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
