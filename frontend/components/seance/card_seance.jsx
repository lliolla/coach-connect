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
  GripVertical,
  LayoutGrid,
  Clock,
  RotateCcw
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

export const CardSeance = ({ mode = "create", seanceId = null, duplicateId = null }) => {
  const isCreation = mode === "create" || mode === "duplicate"
  const isView = mode === "view"
  const isDuplicate = mode === "duplicate"
  const router = useRouter()
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

  // States for Duplication Modal
  const [showDuplicateModal, setShowDuplicateModal] = React.useState(false)
  const [duplicatedId, setDuplicatedId] = React.useState(null)

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
        ...se,
        exercise_id: se.exercise_id,
        name: se.exercices_library?.name,
        category: se.exercices_library?.category,
        unit: se.exercices_library?.unit
      })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

      setFormData({
        title: isDuplicate ? `${data.title} (Copie)` : (data.title || ""),
        description: data.description || "",
        athlete_id: data.athlete_id?.toString() || null,
        date: isDuplicate ? new Date().toISOString().split('T')[0] : (data.date || new Date().toISOString().split('T')[0]),
        status: isDuplicate ? "prévu" : (data.status || "prévu"),
        exercises: mappedExercises,
        duration: data.duration || 0,
        is_template: data.is_template ?? false
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
    const mappedExercises = (template.exercises || []).map(ex => ({
      ...ex,
      template_id: ex.id_exercises || ex.template_id || ex.id,
      sets: ex.serie || ex.sets || 3,
      reps: ex.rep || ex.reps || 10,
      rest_time_seconds: ex.repos || ex.rest_time_seconds || 60,
      name: ex.name || (ex.exercices_library ? ex.exercices_library.name : "Exercice"),
      category: ex.category || (ex.exercices_library ? ex.exercices_library.category : "")
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
      template_id: exerciseTemplate.id,
      sets: 3,
      reps: 10,
      weight: 0,
      notes: "",
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

  const handleSubmit = async (asModel) => {
    // Si asModel est passé, on l'utilise, sinon on garde la valeur actuelle de is_template
    const isTemplateToSave = typeof asModel === 'boolean' ? asModel : formData.is_template;

    if (!formData.title) {
      toast.error("Veuillez donner un nom au programme")
      return
    }
    if (!formData.athlete_id) {
      toast.error("Veuillez sélectionner un athlète")
      return
    }

    if (formData.exercises.length === 0) {
      toast.error("Veuillez ajouter au moins un exercice")
      return
    }

    const loadingToast = toast.loading(isTemplateToSave ? "Enregistrement du modèle..." : (isCreation ? "Création du programme..." : "Mise à jour..."))
    
    try {
      const url = isCreation 
        ? 'http://127.0.0.1:3001/api/sessions' 
        : `http://127.0.0.1:3001/api/sessions/${seanceId}`
      
      const method = isCreation ? 'POST' : 'PUT'

      const payload = {
        ...formData,
        is_template: isTemplateToSave
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || errorData.error?.message || errorData.error || 'Erreur lors de la sauvegarde';
        throw new Error(errorMessage);
      }

      const result = await response.json()
      toast.dismiss(loadingToast)

      if (isDuplicate) {
        setDuplicatedId(result.id)
        setShowDuplicateModal(true)
      } else {
        setShowSuccessModal(true)
        setTimeout(() => handleModalClose(), 2000)
      }

    } catch (error) {
      console.error("Erreur:", error)
      toast.error(`Erreur : ${error.message}`, { id: loadingToast })
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    router.push('/sessions')
  }

  const handleDuplicateConfirm = (modify) => {
    setShowDuplicateModal(false)
    if (modify && duplicatedId) {
      router.push(`/sessions/${duplicatedId}?mode=edit`)
    } else {
      router.push('/sessions')
    }
  }

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto border-dashed border-2 border-primary/20 shadow-none relative">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-2xl font-bold">
            {isView ? "Voir la séance" : (isCreation ? (isDuplicate ? "Dupliquer la séance" : "Nouveau Programme") : "Modifier la séance")}
          </CardTitle>
          <div className="flex items-center gap-4">
             {formData.duration > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Clock size={16} />
                    <span>~{formData.duration} min</span>
                </div>
            )}
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                onClick={() => router.push('/sessions')}
            >
                <X size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Header Info */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <CalendarCheck size={32} />
            </div>
            
            <div className="w-full space-y-2">
              <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block text-center">Nom du programme</Label>
              <Popover open={openTemplates} onOpenChange={isView ? () => {} : setOpenTemplates}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 w-full justify-between font-bold text-lg" disabled={isView}>
                    {formData.title || "Choisir un modèle ou taper un nom..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Rechercher un modèle ou créer un nom..." 
                      onValueChange={(v) => setFormData(prev => ({ ...prev, title: v }))}
                      disabled={isView}
                    />
                    <CommandList>
                      <CommandEmpty>Appuyez sur Entrée pour utiliser ce nom.</CommandEmpty>
                      <CommandGroup heading="Modèles existants">
                        {availableTemplates.map((template) => (
                          <CommandItem
                            key={template.id}
                            value={template.title}
                            onSelect={() => handleTemplateSelect(template)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.title === template.title ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{template.title}</span>
                              {template.description && <span className="text-xs text-muted-foreground">{template.description}</span>}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="athlete_id" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block text-center">Affectation</Label>
              <Select 
                name="athlete_id" 
                value={formData.athlete_id || undefined} 
                onValueChange={handleAthleteSelect}
                disabled={isView}
              >
                <SelectTrigger className="w-full text-center h-12">
                  <SelectValue placeholder="Sélectionner un athlète" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Athlètes</SelectLabel>
                    {loadingAthletes ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">Chargement...</div>
                    ) : availableAthletes.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">Aucun athlète trouvé</div>
                    ) : (
                      availableAthletes.map((athlete) => (
                        <SelectItem key={athlete.id} value={athlete.id.toString()}>
                          {athlete.first_name} {athlete.last_name || ''}
                        </SelectItem>
                      ))
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block text-center">Description</Label>
              <Input 
                id="description"
                name="description"
                placeholder="Ajoutez une description pour le programme" 
                className="text-center h-12"
                value={formData.description}
                onChange={handleInputChange}
                disabled={isView}
              />
            </div>
          </div>

          {/* Add Exercise Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Exercices du programme</Label>
              {!isView && (
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
              )}
            </div>

            {/* Selected Exercises List */}
            <div className="space-y-3">
              {formData.exercises.length === 0 ? (
                <div className="py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
                  <Dumbbell size={40} className="opacity-10 mb-2" />
                  <p className="text-sm">Aucun exercice sélectionné</p>
                  {!isView && <p className="text-xs">Utilisez le bouton ci-dessus pour construire votre programme</p>}
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
                          {!isView && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeExercise(index)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Séries</Label>
                            <Input 
                              type="number" 
                              value={ex.sets} 
                              onChange={(e) => updateExerciseDetails(index, 'sets', parseInt(e.target.value))}
                              className="h-8"
                              disabled={isView}
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
                              disabled={isView}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Repos (sec)</Label>
                            <Select 
                              value={ex.rest_time_seconds?.toString()} 
                              onValueChange={(value) => updateExerciseDetails(index, 'rest_time_seconds', parseInt(value))}
                              disabled={isView}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Sec" />
                              </SelectTrigger>
                              <SelectContent>
                                {[...Array(31)].map((_, i) => (
                                  <SelectItem key={i*10} value={(i*10).toString()}>
                                    {i*10}s
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
          {/* Total Duration Display */}
          {formData.exercises.length > 0 && (
            <div className="pt-4 border-t">
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Durée totale de la séance (minutes)</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        type="number"
                        value={formData.duration}
                        onChange={handleDurationChange}
                        className={cn(
                          "w-24 h-9 text-lg font-bold text-primary bg-background border-primary/20 focus:border-primary",
                          isManualDuration && "border-orange-400 focus:border-orange-500"
                        )}
                        disabled={isView}
                      />
                      {isManualDuration && !isView && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={resetDuration}
                          title="Réinitialiser au calcul automatique"
                        >
                          <RotateCcw size={16} />
                        </Button>
                      )}
                    </div>
                    {isManualDuration && (
                      <p className="text-[10px] text-orange-500 font-medium mt-1">Modification manuelle activée</p>
                    )}
           </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="bg-background">
                    {formData.exercises.length} exercices
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6 mt-6 bg-muted/5">
          <div className="flex gap-2">
            {isView ? (
              <Button className="px-8" onClick={() => router.push('/sessions')}>Quitter</Button>
            ) : mode === "edit" ? (
              <Button className="px-8" onClick={() => handleSubmit(formData.is_template)}>Valider & Quitter</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => handleSubmit(true)}>Enregistrer comme modèle</Button>
                <Button className="px-8" onClick={() => handleSubmit(false)}>Valider le programme</Button>
              </>
            )}
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
              Votre programme d'entraînement "<strong>{formData.title}</strong>" a été enregistré avec succès.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handleModalClose} className="w-full sm:w-auto px-8">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Options Modal */}
      <Dialog open={showDuplicateModal} onOpenChange={setShowDuplicateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <LayoutGrid className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Modèle dupliqué !</DialogTitle>
            <DialogDescription className="text-base py-2">
              Le programme a été dupliqué avec succès. Souhaitez-vous le modifier maintenant ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-center gap-2">
            <Button variant="outline" onClick={() => handleDuplicateConfirm(false)} className="flex-1 sm:flex-none">
              Seulement dupliquer
            </Button>
            <Button onClick={() => handleDuplicateConfirm(true)} className="flex-1 sm:flex-none">
              Modifier le programme
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
