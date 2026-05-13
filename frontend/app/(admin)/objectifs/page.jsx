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
  IconTarget, 
  IconAlertTriangle, 
  IconCheck,
  IconLoader2
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
import { getObjectifs, deleteObjectif } from "@/app/actions/objectifs"
import { MoreHorizontal, Eye, Edit2, Trash2, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  // States for Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [objectifToDelete, setObjectifToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  React.useEffect(() => {
    fetchObjectifs()
  }, [])

  const fetchObjectifs = async () => {
    try {
      setLoading(true)
      const data = await getObjectifs()
      setObjectifs(data || [])
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger les objectifs")
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirm = (e, objectif) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setObjectifToDelete(objectif)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!objectifToDelete) return

    const loadingToast = toast.loading("Suppression en cours...")
    try {
      const result = await deleteObjectif(objectifToDelete.id)

      if (!result.success) throw new Error(result.error || "Erreur lors de la suppression")

      setObjectifs(prev => prev.filter(o => o.id !== objectifToDelete.id))
      toast.dismiss(loadingToast)

      setDeleteConfirmOpen(false)
      setShowSuccessModal(true)

      setTimeout(() => {
        setShowSuccessModal(false)
        setObjectifToDelete(null)
      }, 2000)
    } catch (error) {
      console.error(error)
      toast.error(error.message, { id: loadingToast })
    }
  }

  const filteredObjectifs = objectifs.filter(obj => {
    const label = (obj.label || '').toLowerCase()
    const description = (obj.description || '').toLowerCase()
    return label.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())
  })

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
              <h1 className="text-2xl font-bold">Objectifs Globaux</h1>
              <p className="text-muted-foreground text-sm">Gérez les programmes d'objectifs et les séances associées.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/objectifs/new">
                <IconPlus size={18} />
                Nouvel objectif
              </Link>
            </Button>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Rechercher un objectif..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <IconTarget size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Liste des Objectifs</h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <IconLoader2 className="animate-spin text-primary" size={40} />
                <p className="text-muted-foreground">Chargement des objectifs...</p>
              </div>
            ) : (
              <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/30">
                      <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Libellé</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Séances</th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-border">
                      {filteredObjectifs.map((obj) => (
                        <tr key={obj.id} className="hover:bg-muted/5 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                            {obj.label}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground max-w-md truncate">
                            {obj.description || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {obj.sessions?.length || 0} séances
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="hidden md:flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" asChild title="Voir">
                                <Link href={`/objectifs/${obj.id}?mode=view`}><Eye size={14}/></Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" asChild title="Modifier">
                                <Link href={`/objectifs/${obj.id}?mode=edit`}><Edit2 size={14}/></Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={(e) => openDeleteConfirm(e, obj)} title="Supprimer">
                                <Trash2 size={14}/></Button>
                            </div>
                            <div className="md:hidden">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild><Link href={`/objectifs/${obj.id}?mode=view`}><Eye size={14} className="mr-2"/> Voir</Link></DropdownMenuItem>
                                  <DropdownMenuItem asChild><Link href={`/objectifs/${obj.id}?mode=edit`}><Edit2 size={14} className="mr-2"/> Modifier</Link></DropdownMenuItem>
                                  <DropdownMenuItem onSelect={(e) => openDeleteConfirm(null, obj)} className="text-red-600 font-medium">
                                    <Trash2 size={14} className="mr-2"/> Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredObjectifs.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground italic border-t">
                      Aucun objectif trouvé.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
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
              Êtes-vous sûr de vouloir supprimer l'objectif <strong>{objectifToDelete?.label}</strong> ? Cette action est irréversible.
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
              L'objectif a été supprimé avec succès.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
