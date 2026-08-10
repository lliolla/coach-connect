'use client'
import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createSession, updateSession, getSessionById } from "@/app/actions/sessions"
import { getAthletes } from "@/app/actions/athletes"
import { isObjectifFull } from "@/app/actions/sessions"
import { ExercisesList } from "@/components/seance/exercises-list"
import { IconPlus, IconTrash, IconLoader2 } from "@tabler/icons-react"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DeleteModal } from "@/components/modals/DeleteModal"

// État initial du formulaire
const initialFormState = {
  title: "",
  athlete_id: "",
  objectif_id: "",
  date: new Date().toISOString().split('T')[0],
  is_template: false,
  notes: "",
  exercises: []
}

export const CardSeance = ({
  mode = "create",
  duplicateId = null,
  isTracking = false,
  objectifs = [],
  seanceId = null,
  context = "seances"
}) => {
  const isCreation = mode === "create"
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [showMaxSessionsModal, setShowMaxSessionsModal] = React.useState(false)
  const [formData, setFormData] = React.useState(initialFormState)
  const [athletes, setAthletes] = React.useState([])
  const [loading, setLoading] = React.useState(false)

  // Récupération des athlètes
  React.useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const data = await getAthletes()
        setAthletes(data || [])
      } catch (error) {
        console.error("Erreur lors de la récupération des athlètes:", error)
      }
    }
    fetchAthletes()
  }, [])

  // Chargement des données si mode "edit" ou "duplicate"
  React.useEffect(() => {
    if (mode === "edit" && seanceId) {
      const fetchSession = async () => {
        try {
          const data = await getSessionById(seanceId)
          setFormData({
            title: data.title || "",
            athlete_id: data.athlete_id || "",
            objectif_id: data.objectif_id || "",
            date: data.date || new Date().toISOString().split('T')[0],
            is_template: data.is_template || false,
            notes: data.notes || "",
            exercises: data.exercices || []
          })
        } catch (error) {
          toast.error("Erreur lors du chargement de la séance")
        }
      }
      fetchSession()
    } else if (mode === "duplicate" && duplicateId) {
      const fetchSession = async () => {
        try {
          const data = await getSessionById(duplicateId)
          setFormData({
            title: `${data.title} (copie)`,
            athlete_id: "",
            objectif_id: data.objectif_id || "",
            date: new Date().toISOString().split('T')[0],
            is_template: false,
            notes: data.notes || "",
            exercises: data.exercices || []
          })
        } catch (error) {
          toast.error("Erreur lors de la duplication de la séance")
        }
      }
      fetchSession()
    }
  }, [mode, seanceId, duplicateId])

  // Gestion des changements dans le formulaire
  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const isTemplateToSave = formData.is_template

      // Validation des champs obligatoires
      if (!isTemplateToSave && !formData.athlete_id) {
        toast.error("Veuillez sélectionner un athlète")
        setLoading(false)
        return
      }

      if (formData.objectif_id && !isTemplateToSave) {
        try {
          const isFull = await isObjectifFull(formData.objectif_id)
          if (isFull) {
            setShowMaxSessionsModal(true)
            setLoading(false)
            return
          }
        } catch (error) {
          toast.error("Erreur lors de la vérification de l'objectif")
          setLoading(false)
          return
        }
      }

      // Préparation des données pour l'API
      const sessionData = {
        ...formData,
        is_template: isTemplateToSave,
        date: formData.date || new Date().toISOString().split('T')[0]
      }

      // Création ou mise à jour de la séance
      let result
      if (isCreation) {
        result = await createSession(sessionData)
      } else {
        result = await updateSession(seanceId, sessionData)
      }

      // Redirection après succès
      if (result) {
        setShowSuccessModal(true)
        if (isTemplateToSave) {
          router.push(`/admin/modeles/${result.id}?mode=view`)
        } else {
          router.push(`/admin/seances/${result.id}?mode=view`)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
      toast.error(error.message || "Erreur lors de la sauvegarde")
    } finally {
      setLoading(false)
    }
  }

  // Gestion de l'ajout d'un exercice
  const handleAddExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exercise_id: "",
          sets: 3,
          reps: 10,
          weight: 0,
          rest_time: 60,
          notes: "",
          intensity: 0,
          section: "main",
          rounds: 1
        }
      ]
    }))
  }

  // Gestion de la suppression d'un exercice
  const handleRemoveExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  // Gestion des changements dans un exercice
  const handleExerciseChange = (index, key, value) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) =>
        i === index ? { ...ex, [key]: value } : ex
      )
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreation ? "Nouvelle séance" : "Modifier la séance"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Nom du programme</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Programme de force"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="athlete_id">Athlète</Label>
                <Select
                  value={formData.athlete_id || ""}
                  onValueChange={(value) => handleChange("athlete_id", value)}
                  disabled={formData.is_template}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un athlète" />
                  </SelectTrigger>
                  <SelectContent>
                    {athletes.map((athlete) => (
                      <SelectItem key={athlete.id} value={athlete.id}>
                        {athlete.first_name} {athlete.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="objectif_id">Objectif</Label>
                <Select
                  value={formData.objectif_id || ""}
                  onValueChange={(value) => handleChange("objectif_id", value)}
                  disabled={formData.is_template}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    {objectifs.map((objectif) => (
                      <SelectItem key={objectif.id} value={objectif.id}>
                        {objectif.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_template"
                checked={formData.is_template}
                onCheckedChange={(checked) => handleChange("is_template", checked)}
              />
              <Label htmlFor="is_template">Enregistrer comme modèle</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Notes sur la séance..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Exercices</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExercise}
                >
                  <IconPlus className="h-4 w-4 mr-2" />
                  Ajouter un exercice
                </Button>
              </div>

              <ExercisesList
                exercises={formData.exercises}
                onChange={handleExerciseChange}
                onRemove={handleRemoveExercise}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modale de succès */}
      {showSuccessModal && (
        <DeleteModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Succès"
          description="La séance a été sauvegardée avec succès."
          hideDeleteButton
        />
      )}

      {/* Modale d'objectif plein */}
      {showMaxSessionsModal && (
        <DeleteModal
          isOpen={showMaxSessionsModal}
          onClose={() => setShowMaxSessionsModal(false)}
          title="Objectif plein"
          description="L'objectif sélectionné a déjà atteint son nombre maximal de séances."
          hideDeleteButton
        />
      )}
    </div>
  )
}
