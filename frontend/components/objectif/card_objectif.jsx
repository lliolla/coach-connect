'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  IconTarget, 
  IconCheck, 
  IconPlus, 
  IconTrash, 
  IconCalendar,
  IconBarbell
} from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  createObjectif, 
  updateObjectif, 
  getObjectifById 
} from "@/app/actions/objectifs"
import { getSessions } from "@/app/actions/sessions"
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
import { ScrollArea } from "@/components/ui/scroll-area"

export function CardObjectif({ id, mode = "create" }) {
  const router = useRouter()
  const isView = mode === "view"
  
  const [loading, setLoading] = React.useState(mode === "edit" || mode === "view")
  const [saving, setSaving] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  
  const [formData, setFormData] = React.useState({
    label: "",
    description: ""
  })
  
  const [selectedSessions, setSelectedSessions] = React.useState([])
  const [availableSessions, setAvailableSessions] = React.useState([])
  const [isSelectModalOpen, setIsSelectSelectModalOpen] = React.useState(false)

  React.useEffect(() => {
    if (id) {
      fetchObjectif()
    }
    fetchAvailableSessions()
  }, [id])

  const fetchObjectif = async () => {
    try {
      setLoading(true)
      const data = await getObjectifById(id)
      setFormData({
        label: data.label || "",
        description: data.description || ""
      })
      setSelectedSessions(data.sessions || [])
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger l'objectif")
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableSessions = async () => {
    try {
      const data = await getSessions()
      setAvailableSessions(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.label.trim()) {
      toast.error("Le libellé est obligatoire")
      return
    }

    setSaving(true)
    try {
      const dataToSave = {
        ...formData,
        sessionIds: selectedSessions.map(s => s.id)
      }

      const result = id 
        ? await updateObjectif(id, dataToSave)
        : await createObjectif(dataToSave)

      if (!result.success) throw new Error(result.error)

      setShowSuccessModal(true)
      setTimeout(() => {
        router.push("/objectifs")
      }, 2000)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const toggleSessionSelection = (session) => {
    setSelectedSessions(prev => {
      const isSelected = prev.find(s => s.id === session.id)
      if (isSelected) {
        return prev.filter(s => s.id !== session.id)
      } else {
        return [...prev, session]
      }
    })
  }

  const removeSession = (sessionId) => {
    setSelectedSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <IconTarget className="animate-bounce h-12 w-12 text-primary/20" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave}>
        <Card className="shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <IconTarget size={28} />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {id ? (isView ? "Détails de l'objectif" : "Modifier l'objectif") : "Nouvel Objectif"}
                </CardTitle>
                <CardDescription>
                  Définissez un objectif global et liez-y des séances d'entraînement.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6 -mt-4 bg-background rounded-t-3xl">
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Libellé de l'objectif</label>
                <Input
                  placeholder="Ex: Préparation Marathon, Renforcement Dos..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  disabled={isView}
                  className="bg-muted/30 border-none h-12 text-lg font-medium focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Description (Optionnel)</label>
                <Textarea
                  placeholder="Détaillez les buts de cet objectif..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isView}
                  className="bg-muted/30 border-none min-h-[100px] focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold ml-1">Séances associées ({selectedSessions.length})</label>
                {!isView && (
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setIsSelectSelectModalOpen(true)}
                    >
                      <IconPlus size={16} />
                      Ajouter une séance
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      asChild
                    >
                      <Link href="/seances/new">
                        <IconBarbell size={16} />
                        Créer une séance
                      </Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {selectedSessions.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-xl bg-muted/5">
                    <IconCalendar className="mx-auto h-8 w-8 text-muted-foreground/20 mb-2" />
                    <p className="text-sm text-muted-foreground italic">Aucune séance liée à cet objectif.</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {selectedSessions.map((session) => (
                      <div 
                        key={session.id} 
                        className="flex items-center justify-between p-3 border rounded-lg bg-card group hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconBarbell size={18} className="text-primary" />
                          <div>
                            <p className="font-bold text-sm leading-none">{session.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {session.session_exercises?.length || 0} exercices
                            </p>
                          </div>
                        </div>
                        {!isView && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeSession(session.id)}
                          >
                            <IconTrash size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {!isView && (
              <div className="pt-4 flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12"
                  onClick={() => router.push("/objectifs")}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12 font-bold gap-2 shadow-lg"
                  disabled={saving}
                >
                  {saving ? "Enregistrement..." : (
                    <>
                      <IconCheck size={20} />
                      {id ? "Mettre à jour" : "Créer l'objectif"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>

      {/* MODAL DE SÉLECTION DE SÉANCES */}
      <Dialog open={isSelectModalOpen} onOpenChange={setIsSelectSelectModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl">Sélectionner des séances</DialogTitle>
            <DialogDescription>
              Choisissez les séances à intégrer dans ce programme d'objectif.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="grid gap-3">
              {availableSessions
                .filter(s => s.is_template) // Prioriser les modèles ? Ou toutes ?
                .map((session) => {
                const isSelected = selectedSessions.find(s => s.id === session.id)
                return (
                  <div 
                    key={session.id}
                    onClick={() => toggleSessionSelection(session)}
                    className={cn(
                      "flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <IconBarbell size={20} />
                      </div>
                      <div>
                        <p className="font-bold">{session.title}</p>
                        <p className="text-xs text-muted-foreground">{session.description || "Aucune description"}</p>
                      </div>
                    </div>
                    <Badge variant={isSelected ? "default" : "outline"}>
                      {isSelected ? "Sélectionnée" : "Ajouter"}
                    </Badge>
                  </div>
                )
              })}
              {availableSessions.length === 0 && (
                <p className="text-center py-10 text-muted-foreground">Aucune séance disponible.</p>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 bg-muted/20 border-t">
            <Button className="w-full h-12 font-bold" onClick={() => setIsSelectSelectModalOpen(false)}>
              Terminer la sélection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE SUCCÈS */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Enregistrement réussi</DialogTitle>
            <DialogDescription className="text-base py-2">
              L'objectif a été enregistré avec succès.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Utilitaire pour éviter les erreurs d'import si Link n'est pas utilisé
import Link from "next/link"
import { cn } from "@/lib/utils"
