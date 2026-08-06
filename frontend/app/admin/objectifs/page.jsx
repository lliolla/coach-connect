// frontend/app/admin/objectifs/page.jsx
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
import GenericTable from "@/components/common/GenericTable"
import { getObjectifs, deleteObjectif } from "@/app/actions/objectifs"
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

  const openDeleteConfirm = (objectif) => {
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

  const filteredObjectifs = React.useMemo(() => {
    if (!objectifs || !Array.isArray(objectifs)) return [];

    return objectifs.filter(obj => {
      const label = (obj.label || '').toLowerCase()
      const description = (obj.description || '').toLowerCase()
      return label.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase())
    })
  }, [objectifs, searchTerm])

  const columns = React.useMemo(() => [
    {
      accessorKey: "label",
      header: "Nom",
      cell: (item) => (
        <span className="text-sm font-medium text-foreground">
          {item.label}
        </span>
      )
    },
    {
      accessorKey: "description",
      header: "Description"
    },
    {
      accessorKey: "athleteName",
      header: "Athlète",
      cell: (item) => (
        <span>
          {item.athletes_objectifs?.[0]?.athlete?.first_name} {item.athletes_objectifs?.[0]?.athlete?.last_name}
        </span>
      )
    },
    {
      accessorKey: "sessionsCount",
      header: "Séances",
      cell: (item) => item.sessions?.length || 0
    }
  ], [])

  const objectifsForTable = React.useMemo(() => {
    return filteredObjectifs.map(obj => ({
      ...obj,
      athleteName: obj.athletes_objectifs?.[0]?.athlete?.first_name + ' ' + obj.athletes_objectifs?.[0]?.athlete?.last_name,
      sessionsCount: obj.sessions?.length || 0
    }))
  }, [filteredObjectifs])

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
              <Link href="/admin/objectifs/new">
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
              <GenericTable
                data={objectifsForTable}
                columns={columns}
                onDelete={openDeleteConfirm}
              />
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