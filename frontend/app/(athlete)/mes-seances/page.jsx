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
      if (!user || !user.athlete_profile) {
        console.error("User profile not found.");
        toast.error("Profil utilisateur non trouvé.");
        throw new Error("Profil non trouvé");
      }

      const currentUserId = user.athlete_profile.id;
      setUserId(currentUserId); 

      console.log("Current logged-in user ID:", currentUserId); // Log user ID

      const result = await getSessions(); // Gets the response object

      console.log("Fetched all sessions from server:", result.data); // Log all fetched sessions

      if (result.success) {
        const allSessions = result.data || []; // Ensure it's an array, default to empty array if null/undefined
        // Filter sessions for the current athlete
        const userSessions = allSessions.filter(s => {
          // Log details for debugging the filter condition
          const sessionAthleteId = s.athlete_id;
          const trimmedSessionAthleteId = sessionAthleteId ? sessionAthleteId.trim() : null;
          const trimmedCurrentUserId = currentUserId ? currentUserId.trim() : null;

          console.log(`Checking session ID: ${s.id}`);
          console.log(`  - Session athlete_id: ${sessionAthleteId} (Type: ${typeof sessionAthleteId})`);
          console.log(`  - Trimmed session athlete_id: ${trimmedSessionAthleteId}`);
          console.log(`  - Current user ID: ${currentUserId} (Type: ${typeof currentUserId})`);
          console.log(`  - Trimmed current user ID: ${trimmedCurrentUserId}`);

          const areIdsMatching = trimmedSessionAthleteId === trimmedCurrentUserId;
          console.log(`  - Comparison result (trimmed IDs match): ${areIdsMatching}`);

          return areIdsMatching;
        });

      console.log("Filtered user sessions:", userSessions); // Log filtered sessions
      setSessions(userSessions);
    } else {
      console.error("Error fetching sessions from server action:", result.error);
      toast.error("Impossible de charger vos séances: " + result.error);
    }
  } catch (error) {
    console.error("Error in fetchSessions:", error);
    toast.error("Impossible de charger vos séances");
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
