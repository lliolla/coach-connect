'use client'
import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  GripVertical,
  LayoutGrid,
  Clock,
  RotateCcw,
  MessageSquare,
  Zap
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialFormState = {
  title: "",
  description: "",
  athlete_id: null,
  date: new Date().toISOString().split('T')[0],
  duration: 0,
  exercises: []
}

export const CardSeance = ({ mode = "create", seanceId = null, duplicateId = null, isTracking = false }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Déterminer si on est dans un contexte de suivi via prop ou URL
  const context = searchParams.get('context')
  const effectiveIsTracking = isTracking || context === 'suivis'
  
  const isCreation = mode === "create" || mode === "duplicate"
  const isView = mode === "view"
  const isDuplicate = mode === "duplicate"
  
  const [openExercises, setOpenExercises] = React.useState(false)
  const [openTemplates, setOpenTemplates] = React.useState(false)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [formData, setFormData] = React.useState(initialFormState)
  const [isManualDuration, setIsManualDuration] = React.useState(false)
  const [availableExercises, setAvailableExercises] = React.useState([])
  const [availableAthletes, setAvailableAthletes] = React.useState([])
  const [availableTemplates, setAvailableTemplates] = React.useState([])
  const [loadingExercises, setLoadingExercises] = React.useState(false)
  const [loadingAthletes, setLoadingAthletes] = React.useState(false)
  const [loadingTemplates, setLoadingTemplates] = React.useState(false)

  React.useEffect(() => {
    fetchAvailableExercises()
    fetchAthletes()
    fetchTemplates()
    if ((!isCreation && seanceId) || (isDuplicate && duplicateId)) {
      fetchSeance(isDuplicate ? duplicateId : seanceId)
    }
  }, [isCreation, seanceId, isDuplicate, duplicateId])

  const fetchSeance = async (idToFetch) => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/sessions/${idToFetch}`)
      if (!response.ok) throw new Error("Erreur lors du chargement de la séance")
      const data = await response.json()
      
      // Mapper les session_exercises pour le format attendu par le composant
      const mappedExercises = (data.session_exercises || []).map(se => ({
        // On ne spread pas se pour éviter de garder l'ID de la ligne d'exercice originale
        exercise_id: se.exercise_id,
        template_id: se.exercise_id, 
        name: se.exercices_library?.name || "Exercice",
        description: se.exercices_library?.description || "",
        category: se.exercices_library?.category || "",
        unit: se.exercices_library?.unit || "reps",
        sets: se.sets || 3,
        reps: se.reps || 10,
        weight: se.weight || 0,
        rest_time_seconds: se.rest_time_seconds || 60,
        notes: se.notes || "",
        intensity: se.intensity || ""
      })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

      setFormData({
        title: isDuplicate ? `${data.title} (Copie)` : (data.title || ""),
        description: data.description || "",
        athlete_id: isDuplicate ? null : (data.athlete_id?.toString() || null),
        date: isDuplicate ? new Date().toISOString().split('T')[0] : (data.date || new Date().toISOString().split('T')[0]),
        status: isDuplicate ? "prévu" : (data.status || "prévu"),
        exercises: mappedExercises,
        duration: data.duration || 0,
        is_template: isDuplicate ? true : (data.is_template ?? false)
      })
      if (data.duration) setIsManualDuration(true)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger les détails de la séance")
    }
  }

  const calculateTotalDuration = React.useCallback(() => {
    if (formData.exercises.length === 0) return 0;
    
    const totalSeconds = formData.exercises.reduce((acc, ex) => {
      const sets = parseInt(ex.sets) || 0;
      const reps = parseInt(ex.reps) || 0;
      const rest = parseInt(ex.rest_time_seconds) || 0;
      
      // Estimation : 4 secondes par rep + repos entre les séries
      const exerciseTime = (sets * reps * 4) + ((sets - 1) * rest);
      return acc + exerciseTime;
    }, 300); // + 5 minutes d'échauffement/transition par défaut

    return Math.round(totalSeconds / 60);
  }, [formData.exercises])

  // Synchroniser la durée avec le calcul si non manuelle
  React.useEffect(() => {
    if (!isManualDuration) {
      setFormData(prev => ({ ...prev, duration: calculateTotalDuration() }))
    }
  }, [calculateTotalDuration, isManualDuration])

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

  const fetchAthletes = async () => {
    try {
      setLoadingAthletes(true)
      const response = await fetch('http://127.0.0.1:3001/api/athletes')
      if (!response.ok) throw new Error("Erreur lors du chargement des athlètes")
      const data = await response.json()
      setAvailableAthletes(data)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger la liste des athlètes")
    } finally {
      setLoadingAthletes(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await fetch('http://127.0.0.1:3001/api/sessions')
      if (!response.ok) throw new Error("Erreur lors du chargement des modèles")
      const data = await response.json()
      const templates = data.filter(s => s.is_template)
      setAvailableTemplates(templates)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDurationChange = (e) => {
    const value = e.target.value === "" ? 0 : parseInt(e.target.value)
    setFormData(prev => ({ ...prev, duration: value }))
    setIsManualDuration(true)
  }

  const resetDuration = () => {
    setIsManualDuration(false)
    setFormData(prev => ({ ...prev, duration: calculateTotalDuration() }))
    toast.info("Durée synchronisée avec le calcul automatique")
  }

  const handleAthleteSelect = (value) => {
    setFormData(prev => ({ ...prev, athlete_id: value }));
  }

  const handleTemplateSelect = (template) => {
    const mappedExercises = (template.exercises || template.session_exercises || []).map(ex => ({
      ...ex,
      exercise_id: ex.exercise_id || ex.template_id || ex.id,
      template_id: ex.exercise_id || ex.id_exercises || ex.template_id || ex.id,
      sets: ex.serie || ex.sets || 3,
      reps: ex.rep || ex.reps || 10,
      rest_time_seconds: ex.repos || ex.rest_time || ex.rest_time_seconds || 60,
      name: ex.name || (ex.exercices_library ? ex.exercices_library.name : "Exercice"),
      description: ex.description || (ex.exercices_library ? ex.exercices_library.description : ""),
      category: ex.category || (ex.exercices_library ? ex.exercices_library.category : ""),
      notes: ex.notes || "",
      intensity: ex.intensity || ""
    }))

    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description || "",
      exercises: mappedExercises
    }))
    setOpenTemplates(false)
    setIsManualDuration(false) // Reset manual flag when applying a template
    toast.success(`Modèle "${template.title}" appliqué`)
  }

  const addExerciseToSeance = (exerciseTemplate) => {
    const newExercise = {
      ...exerciseTemplate,
      exercise_id: exerciseTemplate.id,
      template_id: exerciseTemplate.id,
      sets: 3,
      reps: 10,
      weight: 0,
      notes: "",
      intensity: "",
      rest_time_seconds: 60
    }
    delete newExercise.id
    
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

  const handleSubmit = async () => {
    // LOGIQUE CRITIQUE : Étape 1
    // Si c'est une création/duplication : on force selon le contexte (Suivi => false, Modèle => true)
    // Si c'est une modification : on garde le type d'origine
    const isTemplateToSave = isCreation ? !effectiveIsTracking : formData.is_template;

    if (!formData.title) { toast.error("Le nom du programme est obligatoire"); return; }
    
    // Athlète obligatoire UNIQUEMENT en mode suivi
    if (effectiveIsTracking && !formData.athlete_id) { 
      toast.error("Veuillez sélectionner un athlète"); return; 
    }
    
    if (formData.exercises.length === 0) { toast.error("Ajoutez au moins un exercice"); return; }

    // Validation des exercices
    for (const [index, ex] of formData.exercises.entries()) {
        if (!ex.exercise_id && !ex.template_id) {
            toast.error(`Exercice ${index + 1} : ID manquant`); return;
        }
        if (!ex.sets || parseInt(ex.sets) <= 0) {
            toast.error(`Exercice ${index + 1} : Le nombre de séries est obligatoire`); return;
        }
    }

    const loadingToast = toast.loading(isTemplateToSave ? "Enregistrement du modèle..." : "Enregistrement de la séance...")
    
    try {
      const url = isCreation 
        ? 'http://127.0.0.1:3001/api/sessions' 
        : `http://127.0.0.1:3001/api/sessions/${seanceId}`
      
      const method = isCreation ? 'POST' : 'PUT'

      const mappedExercises = formData.exercises.map((ex, index) => ({
        exercise_id: ex.exercise_id || ex.template_id,
        sets: parseInt(ex.sets) || 0,
        reps: parseInt(ex.reps) || 0,
        weight: parseFloat(ex.weight) || 0,
        rest_time: parseInt(ex.rest_time_seconds) || 60,
        order_index: index,
        notes: ex.notes || "",
        intensity: ex.intensity || ""
      }))

      const payload = {
        title: formData.title,
        description: formData.description,
        athlete_id: isTemplateToSave ? null : formData.athlete_id,
        date: formData.date,
        duration: formData.duration,
        is_template: isTemplateToSave,
        exercises: mappedExercises
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');

      const result = await response.json()
      toast.dismiss(loadingToast)

      if (isDuplicate) {
        setShowSuccessModal(true)
        setTimeout(() => handleModalClose(), 2000)
      } else {
        setShowSuccessModal(true)
        setTimeout(() => handleModalClose(), 1500)
      }

    } catch (error) {
      console.error("Erreur:", error)
      toast.error(`Erreur : ${error.message}`, { id: loadingToast })
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    router.push(effectiveIsTracking ? '/suivis' : '/sessions')
  }

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto border shadow-none relative">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-6">
          <CardTitle className="text-xl font-bold">
            {isView ? "Détails" : (isCreation ? (isDuplicate ? "Dupliquer" : (effectiveIsTracking ? "Nouvelle séance de suivi" : "Nouveau Modèle")) : "Modifier")}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => router.push(effectiveIsTracking ? '/suivis' : '/sessions')}>
            <X size={20} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nom du programme / Modèle</Label>
              <Popover open={openTemplates} onOpenChange={isView ? () => {} : setOpenTemplates}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-11 w-full justify-between font-bold" disabled={isView}>
                    {formData.title || "Taper un nom ou choisir un modèle..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Rechercher..." 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, title: v }))}
                    />
                    <CommandList>
                      <CommandEmpty>Appuyez sur Entrée pour utiliser ce nom.</CommandEmpty>
                      <CommandGroup heading="Modèles existants">
                        {availableTemplates.map((template) => (
                          <CommandItem key={template.id} onSelect={() => handleTemplateSelect(template)}>
                            <span>{template.title}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Affectation : Uniquement si on est dans le contexte Suivi */}
            {effectiveIsTracking && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Affectation Athlète</Label>
                <Select value={formData.athlete_id || undefined} onValueChange={handleAthleteSelect} disabled={isView}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Sélectionner un athlète" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAthletes.map((athlete) => (
                      <SelectItem key={athlete.id} value={athlete.id.toString()}>
                        {athlete.first_name} {athlete.last_name || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Description globale</Label>
              <Input 
                placeholder="Notes générales sur la séance..." 
                value={formData.description}
                onChange={handleInputChange}
                name="description"
                disabled={isView}
              />
            </div>
          </div>

          {/* Exercises Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold">Exercices</h3>
              {!isView && (
                <Popover open={openExercises} onOpenChange={setOpenExercises}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/5">
                      <Plus size={16} /> Ajouter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="end">
                    <Command>
                      <CommandInput placeholder="Chercher un exercice..." />
                      <CommandList>
                        <CommandGroup>
                          {availableExercises.map((ex) => (
                            <CommandItem key={ex.id} onSelect={() => addExerciseToSeance(ex)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{ex.name}</span>
                                <span className="text-xs text-muted-foreground">{ex.category}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            <div className="space-y-3">
              {formData.exercises.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                  Aucun exercice sélectionné
                </div>
              ) : (
                formData.exercises.map((ex, index) => (
                  <Card key={index} className="p-4 bg-muted/5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Dumbbell size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{ex.name}</h4>
                          <div className="flex gap-2 items-center">
                            <Badge variant="secondary" className="text-[9px] uppercase px-1.5">{ex.category}</Badge>
                            {ex.description && <span className="text-[10px] text-muted-foreground italic truncate max-w-[250px]">{ex.description}</span>}
                          </div>
                        </div>
                      </div>
                      {!isView && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeExercise(index)}>
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Séries</Label>
                        <Input type="number" value={ex.sets} onChange={(e) => updateExerciseDetails(index, 'sets', e.target.value)} className="h-8 text-sm" disabled={isView} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Répétitions</Label>
                        <Input type="number" value={ex.reps} onChange={(e) => updateExerciseDetails(index, 'reps', e.target.value)} className="h-8 text-sm" disabled={isView} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Repos (s)</Label>
                        <Select value={ex.rest_time_seconds?.toString()} onValueChange={(v) => updateExerciseDetails(index, 'rest_time_seconds', v)} disabled={isView}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {[0, 15, 30, 45, 60, 90, 120, 180].map(s => <SelectItem key={s} value={s.toString()}>{s}s</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><MessageSquare size={10}/> Notes</Label>
                        <Input placeholder="..." value={ex.notes} onChange={(e) => updateExerciseDetails(index, 'notes', e.target.value)} className="h-8 text-xs" disabled={isView} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Zap size={10}/> Intensité (RPE)</Label>
                        <Input placeholder="0-10" value={ex.intensity} onChange={(e) => updateExerciseDetails(index, 'intensity', e.target.value)} className="h-8 text-xs" disabled={isView} />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t p-6 mt-6 bg-muted/5">
          <div className="flex gap-3">
            {isView ? (
              <Button className="px-8" onClick={() => router.push(effectiveIsTracking ? '/suivis' : '/sessions')}>Quitter</Button>
            ) : mode === "edit" ? (
              <Button className="px-8" onClick={handleSubmit}>Valider les modifications</Button>
            ) : effectiveIsTracking ? (
              <Button className="px-8" onClick={handleSubmit}>Enregistrer la séance</Button>
            ) : (
              <Button className="px-8" onClick={handleSubmit}>Enregistrer le modèle</Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center mb-4",
              isDuplicate ? "bg-blue-100" : "bg-green-100"
            )}>
              {isDuplicate ? (
                <LayoutGrid className="h-6 w-6 text-blue-600" />
              ) : (
                <CalendarCheck className="h-6 w-6 text-green-600" />
              )}
            </div>
            <DialogTitle className="text-xl">
              {isDuplicate ? "Modèle dupliqué !" : "Opération réussie !"}
            </DialogTitle>
            <DialogDescription className="text-base py-2">
              {isDuplicate 
                ? `Le programme "${formData.title}" a été dupliqué avec succès.`
                : `Le programme "${formData.title}" a été enregistré avec succès.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handleModalClose} className="w-full sm:w-auto px-8">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
