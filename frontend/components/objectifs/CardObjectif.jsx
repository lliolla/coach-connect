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
import { updateObjectif, createObjectif } from "@/app/actions/objectifs"

// Options de statut
const statusOptions = [
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "en_attente", label: "En attente" }
]

const CardObjectif = ({ objectif = {}, mode = "edit", athleteId }) => {
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  // Initialisation des données du formulaire
  const [formData, setFormData] = React.useState({
    label: objectif.label || "",
    description: objectif.description || "",
    duree: objectif.duree || 4, // Utilisation de duree pour le nombre de semaines
    total_sessions: objectif.total_sessions || 20, // Utilisation de total_sessions pour le nombre de séances
    status: objectif.completed ? "termine" : "en_cours"
  })
// Effet pour mettre à jour les données du formulaire lorsque l'objectif change
  React.useEffect(() => {
    setFormData({
      label: objectif.label || "",
      description: objectif.description || "",
      duree: objectif.duree || 4,
      total_sessions: objectif.total_sessions || 20,
      status: objectif.completed ? "termine" : "en_cours"
    })
  }, [objectif])

  const isEditMode = mode === "edit"

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const loadingToast = toast.loading(isEditMode ? "Mise à jour en cours..." : "Création en cours...")
    try {
      // Préparation des données à envoyer
      const dataToSend = {
        label: formData.label,
        description: formData.description,
        duree: parseInt(formData.duree) || 4, // Utilisation de duree
        total_sessions: parseInt(formData.total_sessions) || 20, // Utilisation de total_sessions
        completed: formData.status === "termine"
      }

      let result
      if (isEditMode) {
        result = await updateObjectif({
          id: objectif.id,
          ...dataToSend
        })
      } else {
        result = await createObjectif({
          ...dataToSend,
          athlete_id: athleteId // Ajout de l'ID de l'athlète
        })
      }


      if (!result.success) throw new Error(result.error || "Erreur lors de l'opération")

      toast.dismiss(loadingToast)
      setShowSuccessModal(true)
      setTimeout(() => {
        setShowSuccessModal(false)
        // Redirection vers la page de l'athlète après modification
        if (athleteId) {
          router.push(`/admin/athletes/${athleteId}`)
        } else {
          router.push('/admin/athletes')
        }
      }, 2000)
    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur: " + error.message, { id: loadingToast })
    }
  }
// Fonction pour vérifier si le nombre de séances est atteint
  const checkSessionLimit = async () => {
    if (objectif.total_sessions && objectif.sessions_count >= objectif.total_sessions) {
      // Afficher une modale pour demander si l'utilisateur veut modifier le nombre de séances
      const shouldModify = confirm(
        `Vous avez atteint le nombre maximum de séances (${objectif.total_sessions}). Voulez-vous modifier le nombre de séances ?`
      )

      if (shouldModify) {
        // Rediriger vers la page de l'athlète
        if (athleteId) {
          router.push(`/admin/athletes/${athleteId}`)
        } else {
          router.push('/admin/athletes')
        }
      }
      return false
    }
    return true
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-dashed border-2 border-primary/20 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            {isEditMode ? (
              <>
                <IconEdit className="h-5 w-5" />
                Modifier l'objectif
              </>
            ) : (
              <>
                <IconTarget className="h-5 w-5" />
                Créer un nouvel objectif
              </>
            )}
          </CardTitle>
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin/objectifs')}>
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
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              {isEditMode ? "Détails modifiables" : "Nouvel objectif"}
            </p>
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

          {isEditMode && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Dernière mise à jour</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {objectif.updated_at
                  ? format(new Date(objectif.updated_at), "PPP", { locale: fr })
                  : "Jamais"}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6 mt-6">
          <Button variant="outline" onClick={() => router.push('/admin/objectifs')}>Annuler</Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Sauvegarder les modifications" : "Créer l'objectif"}
          </Button>
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
              {isEditMode
                ? "L'objectif a été mis à jour avec succès."
                : "Le nouvel objectif a été créé avec succès."}
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

// TEST CONTINUE EDIT