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
  IconBarbell, // Import barbell icon for exercise count
  IconActivity
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

  // States for Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [sessionToDelete, setSessionToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  // Fetch sessions data
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

  React.useEffect(() => {
    fetchSessions()
  }, [])

  const openDeleteConfirm = (session) => {
    setSessionToDelete(session)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!sessionToDelete) return

    const loadingToast = toast.loading("Suppression en cours...")
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/sessions/${sessionToDelete.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id))
      toast.dismiss(loadingToast)
      
      setDeleteConfirmOpen(false)
      setShowSuccessModal(true)
      
      setTimeout(() => {
        setShowSuccessModal(false)
        setSessionToDelete(null)
      }, 2500)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression", { id: loadingToast })
    }
  }

  // Transform sessions data for ProgramTable
  // Filtered to only show actual sessions (is_template: false)
  const programsForTable = React.useMemo(() => {
    return sessions
      .filter(session => {
        // Exclude if it's explicitly a template (boolean or string)
        return session.is_template !== true && session.is_template !== "true";
      })
      .map(session => {
        // Attempt to extract athlete name if available from joined data
        // Assuming session.athletes join might exist or need to be fetched, 
        // but for now, we rely on athlete info if the backend provides it,
        // or just format the athlete_id if it's a profile.
        // Let's assume for now we might need to add a join in the backend,
        // but here we can try to look at the session object.
        const athleteName = session.athletes 
          ? `${session.athletes.first_name || ''} ${session.athletes.last_name || ''}`.trim() 
          : (session.athlete_id ? `Athlète ID: ${session.athlete_id.substring(0, 8)}...` : 'Athlète inconnu');

        return {
          id: session.id,
          title: session.title,
          personName: athleteName || 'Athlète inconnu',
          programName: session.title,
          numberOfExercises: session.session_exercises?.length || 0,
          thumbnailUrl: null,
        };
      });
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
              <Link href="/suivis/new">
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
              <ProgramTable 
                programs={programsForTable} 
                onDelete={openDeleteConfirm}
                context="suivis"
              />
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

      {/* Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <IconActivity className="h-6 w-6 text-red-600" /> {/* Reusing IconActivity for alert */}
            </div>
            <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-base py-2">
              Êtes-vous sûr de vouloir supprimer la séance <strong>{sessionToDelete?.programName || sessionToDelete?.title}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-center gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="flex-1 sm:flex-none">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1 sm:flex-none">
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <IconPlus className="h-6 w-6 text-green-600 rotate-45" />
            </div>
            <DialogTitle className="text-xl">Suppression réussie</DialogTitle>
            <DialogDescription className="text-base py-2">
              La séance a été supprimée avec succès.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
