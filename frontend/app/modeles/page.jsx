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
import { 
  IconSearch, 
  IconPlus, 
  IconCalendarEvent, 
  IconAlertTriangle, 
  IconCheck
} from "@tabler/icons-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ProgramTable from "@/components/seance/programTable"
import { getSessions, deleteSession } from "@/app/actions/sessions"

export default function ModelesPage() {
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
      setSessions(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger les séances")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirm = (e, session) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault()
      if (typeof e.stopPropagation === 'function') e.stopPropagation()
    }
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

  const filteredSessions = sessions.filter(session => {
    const title = (session.title || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase())
    const isTemplate = session.is_template === true || String(session.is_template) === "true"
    return matchesSearch && isTemplate
  })

  const programsForTable = React.useMemo(() => {
    return sessions
      .filter(session => session.is_template === true || String(session.is_template) === "true")
      .map(session => ({
        id: session.id,
        programName: session.title,
        description: session.description,
        numberOfExercises: session.session_exercises?.length || 0,
        exercises: session.session_exercises?.map(se => ({
            name: se.exercices_library?.name || "Exercice"
        })) || [],
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Modèles de Séances</h1>
              <p className="text-muted-foreground text-sm">Gérez vos modèles d'entraînement réutilisables.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/modeles/new">
                <IconPlus size={18} />
                Nouveau modèle
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Rechercher un modèle..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6"> 
            <h2 className="text-xl font-semibold mb-4">Liste des Modèles</h2>
            <ProgramTable 
              programs={programsForTable} 
              onDelete={(program) => openDeleteConfirm(null, program)} 
            />
          </div>

          {!loading && filteredSessions.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <IconCalendarEvent className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">Aucun modèle trouvé.</p>
            </div>
          )}
        </div>
      </SidebarInset>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <IconAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-base py-2">
              Êtes-vous sûr de vouloir supprimer le modèle <strong>{sessionToDelete?.programName || sessionToDelete?.title}</strong> ? Cette action est irréversible.
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
              Le modèle a été supprimé avec succès.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
