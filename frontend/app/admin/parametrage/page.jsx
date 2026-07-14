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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconLoader2, IconAlertTriangle } from "@tabler/icons-react"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  getLookupTable, 
  createLookupItem, 
  updateLookupItem, 
  deleteLookupItem 
} from "@/app/actions/lookups"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const tables = {
  groupes: { label: "Groupes", endpoint: "groupes", field: "name" },
  abonnements: { label: "Abonnements", endpoint: "abonnements", field: "label" },
  objectifs: { label: "Programmes", endpoint: "objectifs", field: "label" },
  paiements: { label: "Modes de Paiement", endpoint: "modes_paiement", field: "label" },
  categories_exercices: { label: "Catégories d'Exercices", endpoint: "categories_exercices", field: "label" }
}

function ParametrageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get("tab") || "groupes"

  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [editingId, setEditingId] = React.useState(null)
  const [editValue, setEditingValue] = React.useState("")
  const [newValue, setNewValue] = React.useState("")

  // Deletion modal state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [itemToDelete, setItemToDelete] = React.useState(null)

  React.useEffect(() => {
    fetchData()
  }, [currentTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const table = tables[currentTab]
      if (!table) return
      const result = await getLookupTable(table.endpoint)
      setData(result)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newValue.trim()) return
    const table = tables[currentTab]
    try {
      const result = await createLookupItem(table.endpoint, { [table.field]: newValue })
      if (!result.success) throw new Error(result.error)
      setNewValue("")
      fetchData()
      toast.success("Élément ajouté")
    } catch (error) {
      toast.error("Erreur lors de l'ajout")
    }
  }

  const handleUpdate = async (id) => {
    if (!editValue.trim()) return
    const table = tables[currentTab]
    try {
      const result = await updateLookupItem(table.endpoint, id, { [table.field]: editValue })
      if (!result.success) throw new Error(result.error)
      setEditingId(null)
      fetchData()
      toast.success("Élément mis à jour")
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  const confirmDelete = (item) => {
    setItemToDelete(item)
    setDeleteConfirmOpen(true)
  }

  const handleDelete = async () => {
    if (!itemToDelete) return
    const table = tables[currentTab]
    try {
      const result = await deleteLookupItem(table.endpoint, itemToDelete.id)
      if (!result.success) throw new Error(result.error)
      fetchData()
      toast.success("Élément supprimé")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    } finally {
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  const setTab = (tab) => {
    router.push(`/parametrage?tab=${tab}`)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Administration</h1>
      </div>

      <Tabs value={currentTab} onValueChange={setTab} className="w-full">
        <div className="overflow-x-auto pb-2 scrollbar-hide">
          <TabsList className="inline-flex w-full md:w-auto justify-start">
            <TabsTrigger value="groupes">Groupes</TabsTrigger>
            <TabsTrigger value="abonnements">Abonnements</TabsTrigger>
            <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
            <TabsTrigger value="paiements">Paiements</TabsTrigger>
            <TabsTrigger value="categories_exercices">Catégories Exercices</TabsTrigger>
          </TabsList>
        </div>

        {Object.keys(tables).map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey} className="mt-4">
            <Card className="border-dashed border-2 shadow-none">
              <CardHeader>
                <CardTitle>Gestion des {tables[tabKey].label}</CardTitle>
                <CardDescription>
                  Ajoutez, modifiez ou supprimez les options disponibles dans les formulaires.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Nouveau ${tables[tabKey].label.slice(0, -1)}...`}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  />
                  <Button onClick={handleCreate} size="icon">
                    <IconPlus size={18} />
                  </Button>
                </div>

                <div className="space-y-2">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <IconLoader2 className="animate-spin text-primary" size={32} />
                    </div>
                  ) : (
                    data.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                        {editingId === item.id ? (
                          <div className="flex flex-1 gap-2 mr-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="icon" className="h-8 w-8" onClick={() => handleUpdate(item.id)}>
                              <IconCheck size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                              <IconX size={14} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">{item[tables[tabKey].field]}</span>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setEditingId(item.id)
                                  setEditingValue(item[tables[tabKey].field])
                                }}
                              >
                                <IconEdit size={16} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => confirmDelete(item)}
                              >
                                <IconTrash size={16} />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                  {!loading && data.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground italic">Aucun élément trouvé.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <IconAlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-base py-2">
              Voulez-vous vraiment supprimer cet élément ? Cette action est irréversible.
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
    </div>
  )
}

export default function ParametragePage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <React.Suspense fallback={<div className="flex justify-center p-8">Chargement...</div>}>
          <ParametrageContent />
        </React.Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
