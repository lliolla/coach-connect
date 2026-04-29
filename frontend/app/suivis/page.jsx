'use client'

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarView } from "@/components/seance/calendar-view"
import { 
  IconPlus, 
  IconSearch,
  IconCalendarEvent,
  IconLoader2, // Import loader icon
  IconUser, // Import user icon for person name
  IconBarbell // Import barbell icon for exercise count
} from "@tabler/icons-react"
import { toast } from "sonner" // Assuming sonner is available for notifications
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card" // In case we need cards for data display, or to match structure
import { Badge } from "@/components/ui/badge" // For status badges
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog" // For modals

// Import the ProgramTable component
import ProgramTable from "@/components/seance/programTable"

export default function SuivisPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sessions, setSessions] = React.useState([]) // State to hold fetched sessions
  const [loading, setLoading] = React.useState(true) // Loading state for data fetching

  // Fetch sessions data
  React.useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        // Assuming a similar API endpoint as sessions/page.jsx
        const response = await fetch('http://127.0.0.1:3001/api/sessions')
        if (!response.ok) throw new Error("Erreur lors du chargement des séances")
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error(error)
        toast.error("Impossible de charger les séances pour le suivi")
      } finally {
        setLoading(false)
      }
    }
    fetchSessions()
  }, [])

  // Transform sessions data for ProgramTable
  // Filtered to only show actual sessions (is_template: false)
  const programsForTable = React.useMemo(() => {
    return sessions
      .filter(session => {
        // Exclude if it's explicitly a template (boolean or string)
        return session.is_template !== true && session.is_template !== "true";
      })
      .map(session => ({
        id: session.id,
        // Use athlete_id as personName, or a placeholder if not available
        personName: session.athlete_id ? `Athlète ID: ${session.athlete_id.substring(0, 8)}...` : 'Athlète inconnu',
        programName: session.title, // Map session title to program name
        numberOfExercises: session.session_exercises?.length || 0, // Count exercises
        thumbnailUrl: null, // No thumbnail URL available in the current session data structure
      }));
  }, [sessions]);

  // Filter sessions for the calendar view based on search term
  // For simplicity, let's assume CalendarView handles its own filtering or receives a subset
  // If CalendarView needs filtering, we might need to pass a filtered list.
  // For now, we pass the raw searchTerm.

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
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Suivi des Séances</h1>
              <p className="text-muted-foreground text-sm">Visualisez et gérez l'historique de vos séances d'entraînement.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/sessions/new">
                <IconPlus size={18} />
                Nouvelle séance
              </Link>
            </Button>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Rechercher une séance ou un athlète..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Program Table Section */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <IconBarbell size={20} className="text-primary" /> {/* Using barbell icon for programs */}
              <h2 className="text-lg font-semibold">Liste des Séances</h2> {/* Title for the table */}
            </div>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <IconLoader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground">Chargement des séances...</p>
              </div>
            ) : (
              <ProgramTable programs={programsForTable} />
            )}
          </div>

          {/* Calendar Section (remains as is) */}
          <div className="mt-8"> {/* Add some margin above calendar */}
            <div className="flex items-center gap-2 mb-4">
              <IconCalendarEvent size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Calendrier des séances</h2>
            </div>
            <CalendarView searchTerm={searchTerm} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
