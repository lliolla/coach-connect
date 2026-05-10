'use client'
import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CardAthlete } from "@/components/athlete/card_athlete"
import { getUser } from "@/app/actions/auth"
import { IconLoader2 } from "@tabler/icons-react"

export default function ProfilPage() {
  const [athleteId, setAthleteId] = React.useState(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser()
        if (user && user.athlete_profile) {
          setAthleteId(user.athlete_profile.id)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

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
            {loading ? (
              <div className="flex justify-center py-20">
                <IconLoader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : athleteId ? (
              <CardAthlete athleteId={athleteId} mode="edit" />
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground">Impossible de charger votre profil athlète.</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
