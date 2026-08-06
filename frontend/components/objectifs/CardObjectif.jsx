// frontend/components/objectif/card_objectif.jsx
'use client'
import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconEdit, IconCalendar, IconTarget, IconCheck } from "@tabler/icons-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusOptions = [
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "en_attente", label: "En attente" }
]

const CardObjectif = ({ objectif, onSave, onCancel }) => {
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [formData, setFormData] = React.useState({
    label: objectif.label || "",
    description: objectif.description || "",
    weeksCount: objectif.weeksCount || 0,
    total_sessions: objectif.total_sessions || 0,
    status: objectif.completed ? "termine" : "en_cours"
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const loadingToast = toast.loading("Mise à jour en cours...")
    try {
      await onSave({
        ...formData,
        completed: formData.status === "termine"
      })
      toast.dismiss(loadingToast)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        router.push('/admin/objectifs')
      }, 2000)
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur lors de la mise à jour", { id: loadingToast })
    }
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-dashed border-2 border-primary/20 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <IconEdit className="h-5 w-5" />
            Modifier l'objectif
          </CardTitle>
          <CardAction>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Retour à la liste
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Icône d'objectif */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <IconTarget size={40} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Détails modifiables</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Nom de l'objectif</Label>
            <Input
              id="label"
              name="label"
              placeholder="ex: Préparation compétition, Renforcement musculaire..."
              value={formData.label}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weeksCount">Durée (semaines)</Label>
              <Input
                id="weeksCount"
                name="weeksCount"
                type="number"
                min="1"
                placeholder="ex: 8"
                value={formData.weeksCount}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_sessions">Nombre de séances</Label>
              <Input
                id="total_sessions"
                name="total_sessions"
                type="number"
                min="1"
                placeholder="ex: 20"
                value={formData.total_sessions}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Décrivez l'objectif et ses objectifs..."
              className="min-h-[100px] resize-none"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Dernière mise à jour</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {objectif.updated_at
                ? format(new Date(objectif.updated_at), "PPP", { locale: fr })
                : "Jamais"}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6 mt-6">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button onClick={handleSubmit}>Sauvegarder les modifications</Button>
        </CardFooter>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Opération réussie</DialogTitle>
            <DialogDescription className="text-base py-2">
              L'objectif a été mis à jour avec succès.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              onClick={() => {
                setShowSuccessModal(false)
                router.push('/admin/objectifs')
              }}
              className="w-full sm:w-auto px-8"
            >
              Fermer et retourner à la liste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CardObjectif