'use client'

import * as React from "react"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  IconSearch, 
  IconActivity,
  IconLoader2,
  IconCheck
} from "@tabler/icons-react"
import { toast } from "sonner"
import ProgramTable from "@/components/seance/programTable"
import { getSessions, deleteSession, updateSessionRealisation } from "@/app/actions/sessions"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const ITEMS_PER_PAGE = 10;

export default function SuiviSeancesPage() {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  // States for Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [sessionToDelete, setSessionToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  React.useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Erreur fetch:", error)
      toast.error("Impossible de charger les séances")
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirm = (session) => {
    setSessionToDelete(session)
    setDeleteConfirmOpen(true)
  }

  const handleRealisationChange = async (sessionId, value) => {
    try {
      const result = await updateSessionRealisation(sessionId, value)
      if (!result.success) {
        toast.error(result.error || "Erreur lors de la mise à jour")
        return
      }
      toast.success("Réalisation mise à jour avec succès")
      // Rafraîchir les données pour avoir les dernières valeurs
      fetchSessions()
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la réalisation")
    }
  }

  const handleDelete = async () => {
    if (!sessionToDelete) return

    const loadingToast = toast.loading("Suppression en cours...")
    try {
      const result = await deleteSession(sessionToDelete.id)

      if (!result.success) throw new Error(result.error || 'Erreur lors de la suppression')

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
      toast.error(error.message || "Erreur lors de la suppression", { id: loadingToast })
    }
  }

  const programsForTable = React.useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return sessions
      .filter(session => session.is_template !== true)
      .map(session => {
        const athleteData = session.athletes || session.athlete; 
        const athleteName = athleteData 
          ? `${athleteData.first_name || ''} ${athleteData.last_name || ''}`.trim() 
          : '-';

        return {
          id: session.id,
          title: session.title,
          description: session.description,
          status: session.status,
          personName: athleteName,
          athleteId: session.athlete_id,
          programName: session.title,
          numberOfExercises: session.session_exercises?.length || 0,
          rawObjectif: session.objectif, 
          objectifName: session.objectif?.label || "Sans objectif",
          date: session.date,
          duration: session.duration,
          realisation: session.realisation || "",
          exercises: session.session_exercises?.map(se => ({
            name: se.exercise?.name || se.exercice_library?.name || "Exercice"
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
              <h1 className="text-2xl font-bold">Suivi des Séances</h1>
              <p className="text-muted-foreground text-sm">Suivez l'état de transmission de toutes les séances.</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <IconActivity size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Liste des Séances à Suivre</h2>
            </div>

            <div className="relative max-w-md mb-4">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Rechercher une séance..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <IconLoader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground">Chargement des séances...</p>
              </div>
            ) : (
              <ProgramTable 
                programs={programsForTable} 
                onDelete={openDeleteConfirm}
                onRealisationChange={handleRealisationChange}
                context="seances"
                searchTerm={searchTerm}
                showRealisation={true}
              />
            )}
          </div>
        </div>

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
      </SidebarInset>
    </SidebarProvider>
  )
}
