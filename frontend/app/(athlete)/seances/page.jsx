'use client'

import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CalendarView } from "@/components/seance/calendar-view"
import { 
  IconBarbell,
  IconLoader2,
  IconCalendarEvent
} from "@tabler/icons-react"
import { toast } from "sonner"
import ProgramTable from "@/components/seance/programTable"
import { getSessions } from "@/app/actions/sessions"
import { getUser } from "@/app/actions/auth"

export default function AthleteSeancesPage() {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [userId, setUserId] = React.useState(null)

  // Fetch sessions data filtered for the user
  const fetchSessions = async () => {
    try {
      setLoading(true)
      const user = await getUser()
      if (!user || !user.athlete_profile) throw new Error("Profil non trouvé")
      
      setUserId(user.athlete_profile.id)
      const allSessions = await getSessions()
      // Filter sessions for the current athlete
      const userSessions = allSessions.filter(s => s.athlete_id === user.athlete_profile.id)
      setSessions(userSessions)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger vos séances")
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchSessions()
  }, [])

  // Transform sessions data for ProgramTable
  const programsForTable = React.useMemo(() => {
    return sessions
      .filter(session => session.is_template !== true)
      .map(session => ({
        id: session.id,
        title: session.title,
        description: session.description,
        personName: "Moi", // Already filtered for user
        programName: session.title,
        numberOfExercises: session.session_exercises?.length || 0,
        exercises: session.session_exercises?.map(se => ({
          name: se.exercices_library?.name || "Exercice"
        })) || [],
        thumbnailUrl: null,
      }));
  }, [sessions]);

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
          <div>
            <h1 className="text-2xl font-bold">Mes Séances</h1>
            <p className="text-muted-foreground text-sm">Consultez votre historique et les séances à venir.</p>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <IconBarbell size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Historique de mes entraînements</h2>
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <IconLoader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground">Chargement de vos séances...</p>
              </div>
            ) : (
              <ProgramTable 
                programs={programsForTable} 
                context="athlete-seances"
              />
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <IconCalendarEvent size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Mon Calendrier</h2>
            </div>
            <CalendarView sessions={sessions} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
