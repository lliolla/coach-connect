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
  IconBarbell, 
  IconTrash, 
  IconAlertTriangle, 
  IconCheck, 
  IconPencil, 
  IconVideo, 
  IconPhoto 
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

const units = [
  { value: "reps", label: "Répétitions" },
  { value: "secs", label: "Secondes" },
  { value: "mins", label: "Minutes" },
  { value: "m", label: "Mètres" },
  { value: "km", label: "Kilomètres" },
]

export default function ExercicesPage() {
  const [exercices, setExercices] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  
  // States for Modals
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [exerciceToDelete, setExerciceToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  React.useEffect(() => {
    fetchExercices()
  }, [])

  const fetchExercices = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:3001/api/exercices')
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setExercices(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger la bibliothèque d'exercices")
    } finally {
      setLoading(false)
    }
  }

  // Extraire les catégories uniques dynamiquement
  const categories = React.useMemo(() => {
    const cats = exercices.map(ex => ex.category).filter(Boolean)
    return ["all", ...new Set(cats)]
  }, [exercices])

  const openDeleteConfirm = (e, exercice) => {
    e.preventDefault()
    e.stopPropagation()
    setExerciceToDelete(exercice)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!exerciceToDelete) return

    const loadingToast = toast.loading("Suppression en cours...")
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/exercices/${exerciceToDelete.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      setExercices(prev => prev.filter(ex => ex.id !== exerciceToDelete.id))
      toast.dismiss(loadingToast)
      
      setDeleteConfirmOpen(false)
      setShowSuccessModal(true)
      
      setTimeout(() => {
        setShowSuccessModal(false)
        setExerciceToDelete(null)
      }, 2500)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de la suppression", { id: loadingToast })
    }
  }

  const filteredExercices = exercices.filter(ex => {
    const name = (ex.name || '').toLowerCase()
    const category = (ex.category || '').toLowerCase()
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || category.includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "all" || ex.category === activeCategory
    return matchesSearch && matchesCategory
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
              <h1 className="text-2xl font-bold">Bibliothèque d'Exercices</h1>
              <p className="text-muted-foreground text-sm">Gérez vos modèles d'exercices réutilisables.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/exercices/new">
                <IconPlus size={18} />
                Nouvel Exercice
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full max-w-md">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Rechercher un exercice..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
              <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
                {categories.map(cat => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className="px-4 py-1.5 text-xs capitalize data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {cat === "all" ? "Tout" : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <IconLoader2 className="animate-spin text-primary" size={40} />
              <p className="text-muted-foreground">Chargement des exercices...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExercices.map((exercice) => (
                <Link key={exercice.id} href={`/exercices/${exercice.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full relative group overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => openDeleteConfirm(e, exercice)}
                    >
                      <IconTrash size={16} />
                    </Button>
                    
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      {exercice.image_data ? (
                        <div className="h-12 w-12 rounded-lg border overflow-hidden flex-shrink-0">
                          <img src={exercice.image_data} alt={exercice.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <IconBarbell size={24} />
                        </div>
                      )}
                      <div className="flex flex-col overflow-hidden">
                        <CardTitle className="text-lg truncate">
                          {exercice.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0">
                            {exercice.category}
                          </Badge>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {exercice.description || "Aucune description renseignée."}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span className="font-medium">
                          Unité : {units.find(u => u.value === exercice.unit)?.label || exercice.unit}
                        </span>
                        <div className="flex items-center gap-2">
                          {exercice.video_url && <IconVideo size={14} className="text-primary" title="Vidéo disponible" />}
                          {exercice.image_data && <IconPhoto size={14} className="text-primary" title="Image disponible" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredExercices.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <IconBarbell className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">Aucun exercice trouvé.</p>
              <p className="text-sm text-muted-foreground/60">Commencez par ajouter votre premier exercice.</p>
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
              Êtes-vous sûr de vouloir supprimer l'exercice <strong>{exerciceToDelete?.name}</strong> ? Cette action est irréversible.
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
              L'exercice a été supprimé de la bibliothèque avec succès.
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
