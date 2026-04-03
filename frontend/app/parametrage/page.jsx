'use client'

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
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
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconLoader2 } from "@tabler/icons-react"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"

const tables = {
  groupes: { label: "Groupes", endpoint: "groupes", field: "name" },
  abonnements: { label: "Abonnements", endpoint: "abonnements", field: "label" },
  objectifs: { label: "Objectifs", endpoint: "objectifs", field: "label" },
  paiements: { label: "Modes de Paiement", endpoint: "modes_paiement", field: "label" }
}

export default function ParametragePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get("tab") || "groupes"
  
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [editingId, setEditingId] = React.useState(null)
  const [editValue, setEditingValue] = React.useState("")
  const [newValue, setNewValue] = React.useState("")

  React.useEffect(() => {
    fetchData()
  }, [currentTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const table = tables[currentTab]
      const response = await fetch(`http://127.0.0.1:3001/api/lookups/${table.endpoint}`)
      if (!response.ok) throw new Error("Erreur de chargement")
      const result = await response.json()
      setData(result)
    } catch (error) {
      toast.error("Impossible de charger les données")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newValue.trim()) return
    const table = tables[currentTab]
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/lookups/${table.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [table.field]: newValue })
      })
      if (!response.ok) throw new Error("Erreur de création")
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
      const response = await fetch(`http://127.0.0.1:3001/api/lookups/${table.endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [table.field]: editValue })
      })
      if (!response.ok) throw new Error("Erreur de mise à jour")
      setEditingId(null)
      fetchData()
      toast.success("Élément mis à jour")
    } catch (error) {
      toast.error("Erreur lors de la modification")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet élément ?")) return
    const table = tables[currentTab]
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/lookups/${table.endpoint}/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Erreur de suppression")
      fetchData()
      toast.success("Élément supprimé")
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const setTab = (tab) => {
    router.push(`/parametrage?tab=${tab}`)
  }

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
            <h1 className="text-2xl font-bold">Administration</h1>
          </div>

          <Tabs value={currentTab} onValueChange={setTab} className="w-full">
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="inline-flex w-full md:w-auto justify-start">
                <TabsTrigger value="groupes">Groupes</TabsTrigger>
                <TabsTrigger value="abonnements">Abonnements</TabsTrigger>
                <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
                <TabsTrigger value="paiements">Paiements</TabsTrigger>
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
                    {/* Add New Item */}
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

                    {/* List Items */}
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
                                    onClick={() => handleDelete(item.id)}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
