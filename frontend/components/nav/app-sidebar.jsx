"use client"

import * as React from "react"
import { 
  User, 
  History, 
  TrendingUp, 
  Target, 
  LayoutGrid, 
  Calendar, 
  Users, 
  Settings,
  HelpCircle,
  List,
  Layers,
  LifeBuoy,
  LogOut
} from "lucide-react"
import { useRouter } from "next/navigation"
import { logout } from "@/app/actions/auth"

import { NavDocuments } from "@/components/nav/nav-documents"
import { NavMain } from "@/components/nav/nav-main"
import { NavSecondary } from "@/components/nav/nav-secondary"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { getUser } from "@/app/actions/auth"

const menuData = {
  // ESPACE 1: MON ESPACE (Athlètes uniquement)
  monEspace: [
    {
      title: "Profil",
      url: "/profile",
      icon: User,
    },
    {
      title: "Mes Séances",
      url: "/mes-seances",
      icon: History,
    },
    {
      title: "Statistiques",
      url: "/stats",
      icon: TrendingUp,
    },
    {
      title: "Mes Objectifs",
      url: "/mes-objectifs",
      icon: Target,
    },
  ],
  // ESPACE 2: ADMINISTRATION (Admins uniquement)
  administration: [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: LayoutGrid,
    },
    {
      title: "Gestion Séances",
      url: "/seances",
      icon: Calendar,
    },
    {
      title: "Objectifs",
      url: "/objectifs",
      icon: Target,
    },
    {
      title: "Athlètes",
      url: "/users",
      icon: Users,
    },
  ],
  parametrage: [
    {
      name: "Gestion des listes",
      url: "/parametrage",
      icon: List,
    },
    {
      name: "Modèles de séance",
      url: "/modeles",
      icon: Layers,
    },
    {
      name: "Bibliothèque d'exercices",
      url: "/exercices",
      icon: History,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const router = useRouter()
  const [user, setUser] = React.useState({
    name: "Chargement...",
    email: "",
    avatar: "",
    isAdmin: null
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

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    (<Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="pt-10 pb-6 border-b border-sidebar-border/50">
        {/* CARTOUCHE UTILISATEUR CENTRÉE - STYLE MINIMALISTE */}
        <div className="flex flex-col items-center gap-4 px-2 text-center">
          <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-2xl font-bold bg-muted">
              {user.name?.substring(0, 2).toUpperCase() || 'PA'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              {user.name}
            </h2>
            <p className="text-sm font-light text-sky-500 underline decoration-sky-300 underline-offset-4 hover:text-sky-600 transition-colors truncate max-w-[200px]">
              {user.email}
            </p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        {/* ESPACE 1: MON ESPACE (Affiché seulement si isAdmin est FALSE) */}
        {user.isAdmin === false && (
          <NavMain items={menuData.monEspace} label="Mon Espace" />
        )}
        
        {/* ESPACE 2: ADMINISTRATION (Affiché seulement si isAdmin est TRUE) */}
        {user.isAdmin === true && (
          <div className="space-y-4">
            <NavMain items={menuData.administration} label="Administration" />
            <NavDocuments items={menuData.parametrage} label="Paramétrage" />
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/50 bg-sidebar/50">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10 hover:bg-sidebar-accent transition-all duration-200 group">
                  <a href="/help" className="flex items-center justify-center gap-2 font-medium">
                    <LifeBuoy className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Support</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2 font-medium w-full">
                    <LogOut className="size-4" />
                    <span>Déconnexion</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>)
  );
}
