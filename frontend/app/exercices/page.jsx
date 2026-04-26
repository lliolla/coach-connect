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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Dumbbell, Trash2, Edit2, Video, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const units = [
  { value: "reps", label: "Répétitions" },
  { value: "secs", label: "Secondes" },
  { value: "mins", label: "Minutes" },
  { value: "m", label: "Mètres" },
  { value: "km", label: "Kilomètres" },
]

export default function ExercicesPage() {
  const [exercices, setExercices] = React.useState([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [exerciceToDelete, setExerciceToDelete] = React.useState(null)

  React.useEffect(() => {
    fetchExercices()
  }, [])

  // Extraire les catégories uniques dynamiquement
  const categories = React.useMemo(() => {
    const cats = exercices.map(ex => ex.category).filter(Boolean)
    return ["all", ...new Set(cats)]
  }, [exercices])

  const fetchExercices = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/exercices')
      if (!response.ok) throw new Error("Erreur lors du chargement")
      const data = await response.json()
      setExercices(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger la bibliothèque d'exercices")
    }
  }

  const confirmDelete = (exercice) => {
    setExerciceToDelete(exercice)
    setIsDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/exercices/${exerciceToDelete.id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error("Erreur lors de la suppression")
      
      toast.success("Exercice supprimé")
      setIsDeleteDialogOpen(false)
      fetchExercices()
    } catch (error) {
      toast.error("Erreur : " + error.message)
    }
  }

  const filteredExercices = exercices.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ex.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Bibliothèque d'exercices</h1>
              <p className="text-muted-foreground text-sm">Gérez vos modèles d'exercices réutilisables.</p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/exercices/new">
                <Plus size={18} /> Ajouter un exercice
              </Link>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {filteredExercices.map((exercice) => (
              <Card key={exercice.id} className="group hover:border-primary/50 transition-colors shadow-none border-dashed border-2 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {exercice.image_data ? (
                        <div className="h-10 w-10 rounded-lg border overflow-hidden">
                          <img src={exercice.image_data} alt={exercice.name} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Dumbbell size={20} />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">{exercice.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider mt-1">
                          {exercice.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/exercices/${exercice.id}`}>
                          <Edit2 size={14} />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => confirmDelete(exercice)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {exercice.description || "Aucune description."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Unité : {units.find(u => u.value === exercice.unit)?.label || exercice.unit}
                    </span>
                    <div className="flex items-center gap-2 ml-auto">
                      {exercice.image_data && <ImageIcon size={14} className="text-primary" />}
                      {exercice.video_url && <Video size={14} className="text-primary" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredExercices.length === 0 && (
              <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium">Aucun exercice trouvé</h3>
                <p className="text-muted-foreground">Commencez par ajouter votre premier exercice à la bibliothèque.</p>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Modal Confirmation Suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Supprimer l'exercice ?</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{exerciceToDelete?.name}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">Annuler</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} className="flex-1">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
