'use client'
import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  IconSearch, 
  IconUserPlus, 
  IconLoader2, 
  IconTrophy, 
  IconUsers, 
  IconTrash, 
  IconAlertTriangle, 
  IconCheck, 
  IconLayoutGrid, 
  IconList, 
  IconPencil,
  IconEye,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"
import { getAthletes, deleteAthlete } from "@/app/actions/athletes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ITEMS_PER_PAGE = 10;

export default function AthletesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [athletes, setAthletes] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [viewMode, setViewMode] = React.useState("grid")
  const [currentPage, setCurrentPage] = React.useState(1)
  
  // States for Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [athleteToDelete, setAthleteToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  React.useEffect(() => {
    fetchAthletes()
  }, [])

  const fetchAthletes = async () => {
    try {
      setLoading(true)
      const data = await getAthletes()
      setAthletes(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger la liste des athlètes")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirm = (e, athlete) => {
    if (e && e.preventDefault) e.preventDefault()
    if (e && e.stopPropagation) e.stopPropagation()
    setAthleteToDelete(athlete)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!athleteToDelete) return

    const loadingToast = toast.loading("Suppression en cours...")
    try {
      const result = await deleteAthlete(athleteToDelete.id)

      if (!result.success) throw new Error(result.error || 'Erreur lors de la suppression')

      setAthletes(prev => prev.filter(a => a.id !== athleteToDelete.id))
      toast.dismiss(loadingToast)
      
      setDeleteConfirmOpen(false)
      setShowSuccessModal(true)
      
      // Auto-fermeture après 2 secondes (règle du projet)
      setTimeout(() => {
        setShowSuccessModal(false)
        setAthleteToDelete(null)
      }, 2000)
    } catch (error) {
      console.error(error)
      toast.error(error.message || "Erreur lors de la suppression", { id: loadingToast })
    }
  }

  const filteredAthletes = athletes.filter(athlete => {
    const fullName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.toLowerCase()
    const email = (athlete.email || '').toLowerCase()
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination logic
  const totalItems = filteredAthletes.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  const paginatedAthletes = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAthletes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAthletes, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

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
              <h1 className="text-2xl font-bold">Tous les Athlètes</h1>
              <p className="text-muted-foreground text-sm">Gérez les profils et les abonnements de vos athlètes.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/admin/users/new">
                <IconUserPlus size={18} />
                Nouvel Athlète
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Rechercher un athlète par nom ou email..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)} variant="outline">
              <ToggleGroupItem value="grid" aria-label="Vue grille">
                <IconLayoutGrid size={20} />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Vue tableau">
                <IconList size={20} />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <IconLoader2 className="animate-spin text-primary" size={40} />
              <p className="text-muted-foreground">Chargement des athlètes...</p>
            </div>
          ) : filteredAthletes.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <IconUsers className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">Aucun athlète trouvé.</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedAthletes.map((athlete) => (
                <div key={athlete.id} className="relative h-full group">
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                      asChild
                      title="Voir les objectifs"
                    >
                      <Link href={`/admin/users/${athlete.id}`}>
                        <IconEye size={16} />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                      onClick={(e) => openDeleteConfirm(e, athlete)}
                      title="Supprimer"
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                  <Link href={`/admin/users/${athlete.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer h-full border shadow-sm">
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar className="h-12 w-12 border border-primary/10 shadow-sm">
                          <AvatarImage src={athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.first_name || 'default'}`} />
                          <AvatarFallback>{athlete.first_name?.[0]}{athlete.last_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <CardTitle className="text-lg font-bold">
                            {athlete.first_name} {athlete.last_name}
                          </CardTitle>
                          <CardDescription className="text-xs truncate max-w-[150px]">{athlete.email}</CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/50 font-bold text-foreground">
                            <IconTrophy size={14} className="text-primary" />
                            {athlete.abonnement || "Aucun"}
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/50 font-bold text-foreground">
                            <IconUsers size={14} className="text-primary" />
                            {Array.isArray(athlete.groupes) && athlete.groupes.length > 0 
                              ? athlete.groupes.join(", ") 
                              : athlete.groupe || "Sans groupe"}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {athlete.sports && athlete.sports.length > 0 ? (
                            athlete.sports.map(sport => (
                              <span key={sport} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-[10px] font-medium capitalize">
                                {sport}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">Aucun sport</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/30">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Nom</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Mail</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Groupe</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Sports</th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Objectifs</th>
                      <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-border">
                    {paginatedAthletes.map((athlete) => (
                      <tr key={athlete.id} className="hover:bg-muted/5 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/admin/users/${athlete.id}`} className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-primary/10 shadow-sm">
                              <AvatarImage src={athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.first_name || 'default'}`} />
                              <AvatarFallback>{athlete.first_name?.[0]}{athlete.last_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-bold text-foreground">{athlete.first_name} {athlete.last_name}</span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {athlete.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-muted text-muted-foreground text-xs font-bold">
                            {Array.isArray(athlete.groupes) && athlete.groupes.length > 0 
                              ? athlete.groupes.join(", ") 
                              : athlete.groupe || "Sans groupe"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {athlete.sports?.map(sport => (
                              <span key={sport} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-[10px] font-medium capitalize">
                                {sport}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {athlete.objectives?.map(obj => (
                              <span key={obj} className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground text-[10px] font-medium capitalize">
                                {obj}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                              asChild
                              title="Voir les objectifs"
                            >
                              <Link href={`/admin/users/${athlete.id}`}>
                                <IconEye size={14} />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                              onClick={(e) => openDeleteConfirm(e, athlete)}
                              title="Supprimer"
                            >
                              <IconTrash size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer / Pagination */}
          {!loading && totalPages > 0 && (
            <div className="px-6 py-4 bg-muted/20 border rounded-xl flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Page <span className="text-foreground">{currentPage}</span> sur <span className="text-foreground">{totalPages || 1}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[9px] px-2 font-bold uppercase tracking-widest bg-background hover:bg-muted transition-colors disabled:opacity-40" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  <IconChevronLeft size={12} className="mr-1" /> Précédent
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[9px] px-2 font-bold uppercase tracking-widest bg-background hover:bg-muted transition-colors disabled:opacity-40" 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Suivant <IconChevronRight size={12} className="ml-1" />
                </Button>
              </div>
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
              Êtes-vous sûr de vouloir supprimer l'athlète <strong>{athleteToDelete?.first_name} {athleteToDelete?.last_name}</strong> ? Cette action est irréversible.
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
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Suppression réussie</DialogTitle>
            <DialogDescription className="text-base py-2">
              L'athlète a été supprimé de la base de données avec succès.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
