'use client'

import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, CheckCircle2 } from "lucide-react"
import { IconLoader2 } from "@tabler/icons-react"
import { getObjectifs } from "@/app/actions/objectifs"
import { getUser } from "@/app/actions/auth"
import { toast } from "sonner"

export default function MesObjectifsPage() {
  const [objectives, setObjectives] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchObjectives = async () => {
    try {
      setLoading(true)
      const user = await getUser()
      if (!user || !user.athlete_profile) {
        throw new Error("Profil non trouvé")
      }
      const athleteId = user.athlete_profile.id
      const allObjectives = await getObjectifs()
      
      const userObjectives = (allObjectives || []).filter(o => o.athlete_id === athleteId)
      setObjectives(userObjectives)
    } catch (err) {
      console.error("Error fetching objectives:", err)
      toast.error("Impossible de charger vos objectifs")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchObjectives()
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
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          <div>
            <h1 className="text-3xl font-bold">Mes Objectifs</h1>
            <p className="text-muted-foreground text-sm">Suivez vos objectifs de préparation et votre progression.</p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <IconLoader2 className="animate-spin text-primary" size={40} />
              <p className="text-muted-foreground">Chargement de vos objectifs...</p>
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground">
              <Target className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium">Vous n'avez pas encore d'objectifs attribués.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {objectives.map((obj) => {
                const sessionsCount = obj.sessions?.length || 0
                const total = obj.total_sessions || 20
                const progress = Math.min(Math.round((sessionsCount / total) * 100), 100)
                const isCompleted = progress >= 100

                return (
                  <Card key={obj.id} className={isCompleted ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-primary" />
                        ) : (
                          <Target className="h-6 w-6 text-muted-foreground" />
                        )}
                        <CardTitle className="text-lg">{obj.label}</CardTitle>
                      </div>
                      <CardDescription>{obj.description || "Aucune description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Progression</span>
                            <span>{progress}% ({sessionsCount} / {total} séances)</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex justify-between">
                          <span>Durée : {obj.duree || 4} semaines</span>
                          <span>Prévu : {total} séances</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
