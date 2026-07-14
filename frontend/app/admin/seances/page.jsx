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
  IconFilterCheck,
  IconX,
  IconSelector
} from "@tabler/icons-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getAthletes } from "@/app/actions/athletes"
import { getObjectifs } from "@/app/actions/objectifs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import ProgramTable from "@/components/seance/programTable"
import { getSessions, deleteSession } from "@/app/actions/sessions"

export default function SeancesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [athleteFilter, setAthleteFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [objectifFilter, setObjectifFilter] = React.useState("all")
  const [objectifOpen, setObjectifOpen] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)
  const [availableAthletes, setAvailableAthletes] = React.useState([])
  const [allObjectifs, setAllObjectifs] = React.useState([])
  const [sessions, setSessions] = React.useState([]) 
  const [loading, setLoading] = React.useState(true)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [sessionToDelete, setSessionToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  const isFilterActive = athleteFilter !== "all" || statusFilter !== "all" || objectifFilter !== "all";

  // Calcul dynamique des objectifs disponibles
  const filteredObjectifs = React.useMemo(() => {
    if (athleteFilter === "all") return allObjectifs;
    return allObjectifs.filter(o => o.athlete_id?.toString() === athleteFilter);
  }, [athleteFilter, allObjectifs]);

  // Reset objectifFilter si l'objectif sélectionné n'est plus dans la liste filtrée
  React.useEffect(() => {
    if (objectifFilter !== "all" && !filteredObjectifs.find(o => o.id.toString() === objectifFilter)) {
      setObjectifFilter("all");
    }
  }, [filteredObjectifs, objectifFilter]);

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
      const [sessionData, athletesData, objectifsData] = await Promise.all([
        getSessions(),
        getAthletes(),
        getObjectifs()
      ])
      console.log("Données objectifs reçues:", objectifsData);
      setSessions(Array.isArray(sessionData) ? sessionData : [])
      setAvailableAthletes(athletesData || [])
      setAllObjectifs(objectifsData || [])
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
        const matchesObjectif = objectifFilter === "all" || session.objectif_id?.toString() === objectifFilter;
        return matchesTemplate && matchesAthlete && matchesStatus && matchesObjectif;
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
          objectifName: session.objectif?.label || "Sans objectif",
          exercises: session.session_exercises?.map(se => ({
            name: se.exercise?.name || se.exercice_library?.name || "Exercice"
          })) || [],
          thumbnailUrl: null,
        };
      });
  }, [sessions, athleteFilter, statusFilter, objectifFilter]);

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
              <Link href="/admin/seances/new">
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
              
              <div className="flex flex-col gap-2">
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
                  <Button 
                    variant={showFilters ? "secondary" : "outline"} 
                    className="gap-2"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {isFilterActive ? (
                      <IconFilterCheck size={18} />
                    ) : (
                      <IconFilter size={18} />
                    )}
                    Filtres
                  </Button>
                </div>

                {showFilters && (
                  <div className="flex flex-col gap-4 p-4 border rounded-lg bg-muted/20 animate-in fade-in slide-in-from-top-2 relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 h-6 w-6" 
                      onClick={() => setShowFilters(false)}
                    >
                      <IconX size={14} />
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-4 justify-start items-start">
                      <div className="flex gap-4">
                        <div className="space-y-2 w-48">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Athlète</Label>
                          <Select value={athleteFilter} onValueChange={setAthleteFilter}>
                            <SelectTrigger className="h-10">
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
                        <div className="space-y-2 w-48">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Statut</Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-10">
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
                        <div className="space-y-2 w-48">
                          <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Objectif</Label>
                          <Popover open={objectifOpen} onOpenChange={setObjectifOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={objectifOpen}
                                className="w-full h-10 justify-between font-normal"
                              >
                                <span className="truncate">
                                  {objectifFilter === "all" 
                                    ? "Tous les objectifs" 
                                    : filteredObjectifs.find((o) => o.id.toString() === objectifFilter)?.label || "Sélectionner..."
                                  }
                                </span>
                                <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Rechercher..." className="h-9" />
                                <CommandList>
                                  <CommandEmpty>Aucun objectif trouvé.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      value="all"
                                      onSelect={() => {
                                        setObjectifFilter("all")
                                        setObjectifOpen(false)
                                      }}
                                    >
                                      <IconCheck
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          objectifFilter === "all" ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      Tous les objectifs
                                    </CommandItem>
                                    {filteredObjectifs.map((o) => (
                                      <CommandItem
                                        key={o.id}
                                        value={o.id.toString()}
                                        onSelect={(currentValue) => {
                                          setObjectifFilter(currentValue === objectifFilter ? "all" : currentValue)
                                          setObjectifOpen(false)
                                        }}
                                      >
                                        <IconCheck
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            objectifFilter === o.id.toString() ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {o.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      {isFilterActive && (
                        <div className="flex items-end h-full mt-auto">
                          <Button variant="ghost" className="h-10 gap-2 px-3 text-destructive hover:text-destructive/90 hover:bg-destructive/5" onClick={() => { setAthleteFilter("all"); setStatusFilter("all"); setObjectifFilter("all"); }}>
                            <IconX size={16} /> Effacer
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
