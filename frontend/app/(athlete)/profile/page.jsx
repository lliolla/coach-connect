import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CardAthlete } from "@/components/athlete/card_athlete"
import { getUser } from "@/app/actions/auth"

export default async function ProfilPage() {
  const user = await getUser()
  const athleteId = user?.athlete_profile?.id

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mon Profil</h1>
          </div>

          <div className="max-w-3xl mx-auto w-full">
            <CardAthlete 
              athleteId={athleteId || user?.id} 
              mode={athleteId ? "edit" : "create"}
              initialData={{ 
                id: user?.id,
                email: user?.email || "", 
                first_name: user?.user_metadata?.full_name?.split(' ')[0] || "",
                last_name: user?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || ""
              }} 
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
