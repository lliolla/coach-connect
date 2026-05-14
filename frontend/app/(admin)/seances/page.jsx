'use client'

import * as React from "react"
import Link from "next/link"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" 
import { 
  IconPlus, 
  IconSearch, 
  IconCheck, 
  IconBarbell, 
  IconActivity, 
  IconLoader2, 
  IconFilter,
  IconX
} from "@tabler/icons-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getAthletes } from "@/app/actions/athletes"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { toast } from "sonner"
import ProgramTable from "@/components/seance/programTable"
import { getSessions, deleteSession } from "@/app/actions/sessions"

export default function SeancesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [athleteFilter, setAthleteFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [availableAthletes, setAvailableAthletes] = React.useState([])
  const [sessions, setSessions] = React.useState([]) 
  const [loading, setLoading] = React.useState(true)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [sessionToDelete, setSessionToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      const result = await deleteSession(sessionToDelete.id);
      if (result.success) {
        setDeleteConfirmOpen(false);
        setShowSuccessModal(true);
        fetchInitialData();
        setTimeout(() => setShowSuccessModal(false), 2000);
      } else {
        toast.error("Erreur: " + result.error);
      }
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };
  
  const openDeleteConfirm = (session) => {
    setSessionToDelete(session);
    setDeleteConfirmOpen(true);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [sessionData, athletesData] = await Promise.all([
        getSessions(),
        getAthletes()
      ])
      setSessions(Array.isArray(sessionData) ? sessionData : [])
      setAvailableAthletes(athletesData || [])
    } catch (error) {
      console.error("Erreur fetch:", error)
      toast.error("Impossible de charger les données")
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchInitialData()
  }, [])

  const programsForTable = React.useMemo(() => {
    if (!sessions || !Array.isArray(sessions)) return [];

    return sessions
      .filter(session => {
        const matchesTemplate = session.is_template !== true && String(session.is_template) !== "true";
        const matchesAthlete = athleteFilter === "all" || session.athlete_id?.toString() === athleteFilter;
        const matchesStatus = statusFilter === "all" || session.status === statusFilter;
        return matchesTemplate && matchesAthlete && matchesStatus;
      })
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
          exercises: session.session_exercises?.map(se => ({
            name: se.exercise?.name || se.exercice_library?.name || "Exercice"
          })) || [],
          thumbnailUrl: null,
        };
      });
  }, [sessions, athleteFilter, statusFilter]);

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
          <div className="flex items-center justify-end">
            <Button className="gap-2" asChild>
              <Link href="/seances/new">
                <IconPlus size={18} />
                Nouvelle séance
              </Link>
            </Button>
          </div>

          <div className="mt-4">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex items-center gap-2">
                <IconBarbell size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">Liste des Séances</h2>
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input 
                    placeholder="Rechercher une séance..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <IconFilter size={18} />
                      Filtres
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Athlète</Label>
                      <Select value={athleteFilter} onValueChange={setAthleteFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les athlètes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les athlètes</SelectItem>
                          {availableAthletes.map(a => (
                            <SelectItem key={a.id} value={a.id.toString()}>{a.first_name} {a.last_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Statut</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les statuts" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="en attente">En attente</SelectItem>
                          <SelectItem value="transmis">Transmis</SelectItem>
                          <SelectItem value="prévu">Prévu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {(athleteFilter !== "all" || statusFilter !== "all") && (
                      <Button variant="ghost" className="w-full gap-2" onClick={() => { setAthleteFilter("all"); setStatusFilter("all"); }}>
                        <IconX size={16} /> Réinitialiser
                      </Button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
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
                searchTerm={searchTerm}
              />
            )}
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
            <Button variant="destructive" onClick={handleDeleteSession} className="flex-1 sm:flex-none">
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