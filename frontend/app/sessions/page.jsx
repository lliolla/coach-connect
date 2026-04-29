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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  IconSearch, 
  IconPlus, 
  IconLoader2, 
  IconCalendarEvent, 
  IconTrash, 
  IconAlertTriangle, 
  IconCheck, 
  IconClock,
  IconUser,
  IconBarbell
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
// Import ProgramTable here
import ProgramTable from "@/components/seance/programTable"

export default function SessionsPage() {
  const [sessions, setSessions] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeTab, setActiveTab] = React.useState("all")
  
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
      const response = await fetch('http://127.0.0.1:3001/api/sessions')
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setSessions(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger les séances")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirm = (e, session) => {
    e.preventDefault()
    e.stopPropagation()
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

  const filteredSessions = sessions.filter(session => {
    const title = (session.title || '').toLowerCase()
    const matchesSearch = title.includes(searchTerm.toLowerCase())
    
    // Check for both boolean true and string "true"
    const isTemplate = session.is_template === true || session.is_template === "true"
    
    return matchesSearch && isTemplate
  })

  // New memo hook for programs to be displayed in the table
  // Filtered to only show templates
  const programsForTable = React.useMemo(() => {
    return sessions
      .filter(session => session.is_template === true || session.is_template === "true")
      .map(session => ({
        id: session.id,
        // Display athlete ID or a placeholder if not available
        personName: session.athlete_id ? `Athlète ID: ${session.athlete_id.substring(0, 8)}...` : 'Modèle global',
        programName: session.title,
        numberOfExercises: session.session_exercises?.length || 0,
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Modèles de Séances</h1>
              <p className="text-muted-foreground text-sm">Gérez vos modèles d'entraînement réutilisables.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/sessions/new">
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

          {/* New Table Section */}
          <div className="mb-6"> 
            <h2 className="text-xl font-semibold mb-4">Liste des Modèles</h2> {/* Heading for the table */}
            <ProgramTable programs={programsForTable} /> {/* Render the ProgramTable component */}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <IconLoader2 className="animate-spin text-primary" size={40} />
              <p className="text-muted-foreground">Chargement des séances...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.map((session) => (
                <Link key={session.id} href={`/sessions/${session.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full relative group overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => openDeleteConfirm(e, session)}
                    >
                      <IconTrash size={16} />
                    </Button>
                    
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {session.is_template ? <IconBarbell size={24} /> : <IconCalendarEvent size={24} />}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <CardTitle className="text-lg truncate">
                          {session.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          {session.is_template ? (
                            <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200">
                              Modèle
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] uppercase px-1.5 py-0 bg-green-50 text-green-600 border-green-200">
                              Séance
                            </Badge>
                          )}
                          {session.status && (
                             <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0">
                                {session.status}
                             </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IconClock size={16} />
                        <span>{session.date ? new Date(session.date).toLocaleDateString() : 'Date non définie'}</span>
                      </div>

                      {session.athlete_id && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IconUser size={16} />
                          <span>Athlète ID: {session.athlete_id.substring(0, 8)}...</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="font-medium">
                          {session.session_exercises?.length || 0} exercices
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredSessions.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <IconCalendarEvent className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">Aucune séance trouvée.</p>
              <p className="text-sm text-muted-foreground/60">Commencez par créer votre première séance.</p>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <IconAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-base py-2">
              Êtes-vous sûr de vouloir supprimer la séance <strong>{sessionToDelete?.title}</strong> ? Cette action est irréversible.
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
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Suppression réussie</DialogTitle>
            <DialogDescription className="text-base py-2">
              La séance a été supprimée avec succès.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={() => setShowSuccessModal(false)} className="w-full sm:w-auto px-8">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
