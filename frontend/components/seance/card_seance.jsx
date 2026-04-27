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
import { 
  Check, 
  ChevronsUpDown, 
  Plus, 
  X, 
  CalendarCheck, 
  Dumbbell, 
  Trash2, 
  Search,
  GripVertical
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const initialFormState = {
  title: "",
  description: "",
  athlete_id: null,
  date: new Date().toISOString().split('T')[0],
  exercises: []
}

export const CardSeance = ({ mode = "create", seanceId = null }) => {
  const isCreation = mode === "create"
  const router = useRouter()
  const [openExercises, setOpenExercises] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [formData, setFormData] = React.useState(initialFormState)
  const [availableExercises, setAvailableExercises] = React.useState([])
  const [loadingExercises, setLoadingExercises] = React.useState(false)

  React.useEffect(() => {
    fetchAvailableExercises()
  }, [])

  const fetchAvailableExercises = async () => {
    try {
      setLoadingExercises(true)
      const response = await fetch('http://127.0.0.1:3001/api/exercices')
      if (!response.ok) throw new Error("Erreur lors du chargement des exercices")
      const data = await response.json()
      setAvailableExercises(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger la bibliothèque d'exercices")
    } finally {
      setLoadingExercises(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addExerciseToSeance = (exerciseTemplate) => {
    const newExercise = {
      ...exerciseTemplate,
      template_id: exerciseTemplate.id,
      sets: 3,
      reps: 10,
      weight: 0,
      notes: "",
      rest_time_seconds: 60 // Added default rest time
    }
    delete newExercise.id // We use template_id for the reference
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }))
    setOpenExercises(false)
    toast.success(`${exerciseTemplate.name} ajouté au programme`)
  }

  const removeExercise = (index) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }))
  }

  const updateExerciseDetails = (index, field, value) => {
    setFormData(prev => {
      const newExercises = [...prev.exercises]
      newExercises[index] = { ...newExercises[index], [field]: value }
      return { ...prev, exercises: newExercises }
    })
  }

  const handleSubmit = async (asModel = false) => {
    if (!formData.title) {
      toast.error("Veuillez donner un nom au programme")
      return
    }

    if (formData.exercises.length === 0) {
      toast.error("Veuillez ajouter au moins un exercice")
      return
    }

    const loadingToast = toast.loading(asModel ? "Enregistrement du modèle..." : (isCreation ? "Création du programme..." : "Mise à jour..."))
    
    try {
      const url = isCreation 
        ? 'http://127.0.0.1:3001/api/sessions' 
        : `http://127.0.0.1:3001/api/sessions/${seanceId}`
      
      const method = isCreation ? 'POST' : 'PUT'

      const payload = {
        ...formData,
        is_template: asModel
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Erreur lors de l'enregistrement')

      toast.dismiss(loadingToast)
      setShowSuccessModal(true)

      setTimeout(() => {
        handleModalClose()
      }, 2000)

    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur : " + error.message, { id: loadingToast })
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    router.push('/suivis')
  }

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto border-dashed border-2 border-primary/20 shadow-none relative">
        <CardHeader>
          <CardTitle>{isCreation ? "Nouveau Programme" : "Modifier la séance"}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 h-8 w-8 text-muted-foreground hover:text-foreground" 
            onClick={() => router.push('/suivis')}
          >
            <X size={20} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck size={32} />
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block text-center">Nom du programme</Label>
              <Input 
                id="title" 
                name="title" 
                placeholder="ex: Séance Pecs/Triceps, Routine Mobilité..." 
                className="text-center text-lg font-bold h-12"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Add Exercise Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Exercices du programme</Label>
              <Popover open={openExercises} onOpenChange={setOpenExercises}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/50 text-primary hover:bg-primary/5">
                    <Plus size={18} /> Ajouter un exercice
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="end">
                  <Command>
                    <CommandInput placeholder="Rechercher un exercice dans la bibliothèque..." />
                    <CommandList>
                      <CommandEmpty>
                        {loadingExercises ? "Chargement..." : "Aucun exercice trouvé."}
                      </CommandEmpty>
                      <CommandGroup>
                        {availableExercises.map((ex) => (
                          <CommandItem
                            key={ex.id}
                            value={ex.name}
                            onSelect={() => addExerciseToSeance(ex)}
                            className="flex items-center justify-between py-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <Dumbbell size={16} className="text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{ex.name}</span>
                                <span className="text-xs text-muted-foreground">{ex.category}</span>
                              </div>
                            </div>
                            <Plus size={16} className="text-muted-foreground" />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selected Exercises List */}
            <div className="space-y-3">
              {formData.exercises.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                  <Dumbbell size={40} className="opacity-10 mb-2" />
                  <p className="text-sm">Aucun exercice sélectionné</p>
                  <p className="text-xs">Utilisez le bouton ci-dessus pour construire votre programme</p>
                </div>
              ) : (
                formData.exercises.map((ex, index) => (
                  <Card key={index} className="overflow-hidden border shadow-sm group">
                    <div className="flex">
                      <div className="w-10 bg-muted/30 flex items-center justify-center border-r">
                        <GripVertical size={16} className="text-muted-foreground/50" />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                              <Dumbbell size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold">{ex.name}</h4>
                              <Badge variant="secondary" className="text-[10px] uppercase h-5">{ex.category}</Badge>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeExercise(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Séries</Label>
                            <Input 
                              type="number" 
                              value={ex.sets} 
                              onChange={(e) => updateExerciseDetails(index, 'sets', parseInt(e.target.value))}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">
                              {ex.unit === 'reps' ? 'Répétitions' : ex.unit === 'secs' ? 'Secondes' : 'Volume'}
                            </Label>
                            <Input 
                              type="number" 
                              value={ex.reps} 
                              onChange={(e) => updateExerciseDetails(index, 'reps', parseInt(e.target.value))}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Poids (kg)</Label>
                            <Input 
                              type="number" 
                              value={ex.weight} 
                              onChange={(e) => updateExerciseDetails(index, 'weight', parseFloat(e.target.value))}
                              className="h-8"
                            />
                          </div>
                          {/* Rest Time Input */}
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Repos (sec)</Label>
                            <Input 
                              type="number" 
                              value={ex.rest_time_seconds} 
                              onChange={(e) => updateExerciseDetails(index, 'rest_time_seconds', parseInt(e.target.value))}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6 mt-6 bg-muted/5">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => handleSubmit(true)}>Enregistrer comme modèle</Button>
            <Button className="px-8" onClick={() => handleSubmit(false)}>Valider le programme</Button>
          </div>
        </CardFooter>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CalendarCheck className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Programme validé !</DialogTitle>
            <DialogDescription className="text-base py-2">
              Votre programme d'entraînement "<strong>{formData.title}</strong>" a été enregistré avec succès dans votre calendrier.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handleModalClose} className="w-full sm:w-auto px-8">
              Voir mon planning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
