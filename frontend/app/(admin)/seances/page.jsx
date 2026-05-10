'use client'

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/nav/app-sidebar"
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
  IconCheck, 
  IconBarbell,
  IconActivity,
  IconLoader2,
  IconCalendarEvent
} from "@tabler/icons-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ProgramTable from "@/components/seance/programTable"
import { getSessions, deleteSession } from "@/app/actions/sessions"

export default function SeancesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  // States for Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [sessionToDelete, setSessionToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  // Fetch sessions data using server actions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger les séances")
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
      const result = await deleteSession(sessionToDelete.id)
      
      if (!result.success) throw new Error(result.error || "Erreur lors de la suppression")
      
      setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id))
      toast.dismiss(loadingToast)
      
      setDeleteConfirmOpen(false)
      setShowSuccessModal(true)
      
      setTimeout(() => {
        setShowSuccessModal(false)
        setSessionToDelete(null)
      }, 2000)
    } catch (error) {
      console.error(error)
      toast.error(error.message, { id: loadingToast })
    }
  }

  // Transform sessions data for ProgramTable
  // Filtered to only show actual sessions (is_template: false)
  const programsForTable = React.useMemo(() => {
    return sessions
      .filter(session => {
        return session.is_template !== true && String(session.is_template) !== "true";
      })
      .map(session => {
        const athleteName = session.athletes 
          ? `${session.athletes.first_name || ''} ${session.athletes.last_name || ''}`.trim() 
          : '-';

        return {
          id: session.id,
          title: session.title,
          description: session.description,
          personName: athleteName,
          programName: session.title,
          numberOfExercises: session.session_exercises?.length || 0,
          exercises: session.session_exercises?.map(se => ({
            name: se.exercices_library?.name || "Exercice"
          })) || [],
          thumbnailUrl: null,
        };
      });
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Séances</h1>
              <p className="text-muted-foreground text-sm">Visualisez et gérez l'historique de vos séances d'entraînement.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/seances/new">
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

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <IconBarbell size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Liste des Séances</h2>
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
                context="seances"
              />
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <IconCalendarEvent size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Calendrier des séances</h2>
            </div>
            <CalendarView sessions={sessions} searchTerm={searchTerm} />
          </div>
        </div>
      </SidebarInset>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <IconActivity className="h-6 w-6 text-red-600" />
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

      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
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
