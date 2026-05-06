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
  Zap,
  Flame,
  Target,
  Wind,
  ChevronDown,
  ChevronRight,
  Info
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

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

const initialFormState = {
  title: "",
  description: "",
  athlete_id: null,
  date: new Date().toISOString().split('T')[0],
  duration: 0,
  main_rounds: 1,
  exercises: []
}

/**
 * Composant d'exercice triable (Sortable)
 */
const SortableExerciseCard = ({ 
  ex, 
  index, 
  isView, 
  updateExerciseDetails, 
  removeExercise 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ex.sortId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "p-4 bg-muted/5 border shadow-none relative overflow-hidden group mb-3 touch-none",
        !isView && "cursor-grab active:cursor-grabbing",
        isDragging && "border-primary ring-2 ring-primary/20 shadow-xl"
      )}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Dumbbell size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight">{ex.name}</h4>
            <div className="flex gap-2 items-center mt-1">
              <Badge variant="secondary" className="text-[9px] uppercase px-1.5 py-0 h-4">{ex.category}</Badge>
              {ex.description && <span className="text-[10px] text-muted-foreground italic truncate max-w-[180px] sm:max-w-[300px]">{ex.description}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
            {!isView && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-destructive active:scale-95 z-10" 
                  onClick={(e) => {
                    e.stopPropagation(); 
                    removeExercise(index);
                  }}
                >
                    <Trash2 size={16} />
                </Button>
            )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3 relative z-10" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Répétitions</Label>
          <Input 
            type="number" 
            min="1"
            value={ex.reps} 
            onChange={(e) => updateExerciseDetails(index, 'reps', e.target.value)} 
            className="h-9 text-sm font-bold bg-background border-primary/10 focus:border-primary transition-all" 
            disabled={isView} 
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground">Repos (s)</Label>
          <Select 
            value={ex.rest_time_seconds?.toString()} 
            onValueChange={(v) => updateExerciseDetails(index, 'rest_time_seconds', v)} 
            disabled={isView}
          >
            <SelectTrigger className="h-9 text-sm font-bold bg-background border-primary/10 focus:border-primary">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[0, 15, 30, 45, 60, 90, 120, 180, 240, 300].map(s => <SelectItem key={s} value={s.toString()}>{s}s</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3 relative z-10" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><Zap size={10} className="text-amber-500"/> Intensité (RPE)</Label>
          <Input 
            placeholder="0-10" 
            value={ex.intensity} 
            onChange={(e) => updateExerciseDetails(index, 'intensity', e.target.value)} 
            className="h-9 text-xs bg-background/50 border-primary/5 font-bold" 
            disabled={isView} 
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1"><MessageSquare size={10} className="text-primary"/> Notes</Label>
          <Input 
            placeholder="..." 
            value={ex.notes} 
            onChange={(e) => updateExerciseDetails(index, 'notes', e.target.value)} 
            className="h-9 text-xs bg-background/50 border-primary/5 italic" 
            disabled={isView} 
          />
        </div>
      </div>
    </Card>
  );
};

export const CardSeance = ({ mode = "create", seanceId = null, duplicateId = null, isTracking = false }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const context = searchParams.get('context')
  const effectiveIsTracking = isTracking || context === 'suivis'
  
  const isCreation = mode === "create" || mode === "duplicate"
  const isView = mode === "view"
  const isDuplicate = mode === "duplicate"
  
  const [openExercises, setOpenExercises] = React.useState({ open: false, section: 'main' })
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
  const [activeId, setActiveId] = React.useState(null);

  // État des accordéons (Info ouvert par défaut, les autres fermés)
  const [expandedSections, setExpandedSections] = React.useState({
    info: true,
    warmup: false,
    main: false,
    cooldown: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Configuration des capteurs DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 5, 
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      
      const mappedExercises = (data.session_exercises || []).map((se, idx) => ({
        sortId: `ex-${Date.now()}-${idx}`, 
        exercise_id: se.exercise_id,
        template_id: se.exercise_id, 
        name: se.exercices_library?.name || "Exercice",
        description: se.exercices_library?.description || "",
        category: se.exercices_library?.category || "",
        unit: se.exercices_library?.unit || "reps",
        reps: se.reps || 10,
        weight: se.weight || 0,
        rest_time_seconds: se.rest_time || se.rest_time_seconds || 60,
        notes: se.notes || "",
        intensity: se.intensity || "",
        section: se.section || 'main'
      })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

      setFormData({
        title: isDuplicate ? `${data.title} (Copie)` : (data.title || ""),
        description: data.description || "",
        athlete_id: isDuplicate ? null : (data.athlete_id?.toString() || null),
        date: isDuplicate ? new Date().toISOString().split('T')[0] : (data.date || new Date().toISOString().split('T')[0]),
        status: isDuplicate ? "prévu" : (data.status || "prévu"),
        exercises: mappedExercises,
        duration: data.duration || 0,
        main_rounds: data.main_rounds || 1,
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
      const reps = parseInt(ex.reps) || 0;
      const rest = parseInt(ex.rest_time_seconds) || 0;
      const multiplier = ex.section === 'main' ? (formData.main_rounds || 1) : 1;
      
      const exerciseTime = ((reps * 4) + rest) * multiplier;
      return acc + exerciseTime;
    }, 300);

    return Math.round(totalSeconds / 60);
  }, [formData.exercises, formData.main_rounds])

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

  const handleAthleteSelect = (value) => {
    setFormData(prev => ({ ...prev, athlete_id: value }));
  }

  const handleTemplateSelect = (template) => {
    const mappedExercises = (template.exercises || template.session_exercises || []).map((ex, idx) => ({
      sortId: `ex-${Date.now()}-${idx}`,
      exercise_id: ex.exercise_id || ex.template_id || ex.id,
      template_id: ex.exercise_id || ex.id_exercises || ex.template_id || ex.id,
      reps: ex.reps || 10,
      rest_time_seconds: ex.repos || ex.rest_time || ex.rest_time_seconds || 60,
      name: ex.name || (ex.exercices_library ? ex.exercices_library.name : "Exercice"),
      description: ex.description || (ex.exercices_library ? ex.exercices_library.description : ""),
      category: ex.category || (ex.exercices_library ? ex.exercices_library.category : ""),
      notes: ex.notes || "",
      intensity: ex.intensity || "",
      section: ex.section || 'main'
    }))

    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description || "",
      main_rounds: template.main_rounds || 1,
      exercises: mappedExercises
    }))
    setOpenTemplates(false)
    setIsManualDuration(false)
    toast.success(`Modèle "${template.title}" appliqué`)
  }

  const addExerciseToSeance = (exerciseTemplate, section = 'main') => {
    const newExercise = {
      sortId: `ex-${Date.now()}`,
      ...exerciseTemplate,
      exercise_id: exerciseTemplate.id,
      template_id: exerciseTemplate.id,
      reps: 10,
      weight: 0,
      notes: "",
      intensity: "",
      rest_time_seconds: 60,
      section: section
    }
    delete newExercise.id
    
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }))
    setOpenExercises({ open: false, section: 'main' })
    toast.success(`${exerciseTemplate.name} ajouté`)
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
      let validatedValue = value;
      if (['reps', 'weight', 'rest_time_seconds'].includes(field)) {
        validatedValue = Math.max(0, parseFloat(value) || 0);
      }
      newExercises[index] = { ...newExercises[index], [field]: validatedValue }
      return { ...prev, exercises: newExercises }
    })
  }

  // DND Handlers
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.exercises.findIndex((ex) => ex.sortId === active.id);
        const newIndex = prev.exercises.findIndex((ex) => ex.sortId === over.id);

        const updatedExercises = [...prev.exercises];
        const activeEx = updatedExercises[oldIndex];
        const overEx = updatedExercises[newIndex];
        
        if (activeEx.section !== overEx.section) {
            activeEx.section = overEx.section;
        }

        return {
          ...prev,
          exercises: arrayMove(updatedExercises, oldIndex, newIndex),
        };
      });
    }

    setActiveId(null);
  };

  const handleSubmit = async () => {
    const isTemplateToSave = isCreation ? !effectiveIsTracking : formData.is_template;

    if (!formData.title) { toast.error("Le nom du programme est obligatoire"); return; }
    if (effectiveIsTracking && !formData.athlete_id) { toast.error("Veuillez sélectionner un athlète"); return; }
    if (formData.exercises.length === 0) { toast.error("Ajoutez au moins un exercice"); return; }

    for (const [index, ex] of formData.exercises.entries()) {
        if (!ex.exercise_id && !ex.template_id) { toast.error(`Exercice ${index + 1} : ID manquant`); return; }
    }

    const loadingToast = toast.loading(isTemplateToSave ? "Enregistrement du modèle..." : "Enregistrement de la séance...")
    
    try {
      const url = isCreation 
        ? 'http://127.0.0.1:3001/api/sessions' 
        : `http://127.0.0.1:3001/api/sessions/${seanceId}`
      
      const method = isCreation ? 'POST' : 'PUT'

      const mappedExercises = formData.exercises.map((ex, index) => ({
        exercise_id: ex.exercise_id || ex.template_id,
        sets: 1,
        reps: parseInt(ex.reps) || 0,
        weight: parseFloat(ex.weight) || 0,
        rest_time: parseInt(ex.rest_time_seconds) || 60,
        order_index: index,
        notes: ex.notes || "",
        intensity: ex.intensity || "",
        section: ex.section || 'main'
      }))

      const payload = {
        title: formData.title,
        description: formData.description,
        athlete_id: isTemplateToSave ? null : formData.athlete_id,
        date: formData.date,
        duration: formData.duration,
        main_rounds: parseInt(formData.main_rounds) || 1,
        is_template: isTemplateToSave,
        exercises: mappedExercises
      }

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        const detailedError = result.error ? ` : ${result.error}` : '';
        throw new Error((result.message || 'Erreur lors de la sauvegarde') + detailedError);
      }

      toast.dismiss(loadingToast)

      setShowSuccessModal(true)
      setTimeout(() => {
        handleModalClose()
      }, 2000)

    } catch (error) {
      console.error("Erreur:", error)
      toast.error(`Erreur : ${error.message}`, { id: loadingToast })
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    router.push(effectiveIsTracking ? '/suivis' : '/sessions')
  }

  const renderExerciseSection = (sectionId, title, icon, colorClass) => {
    const sectionExercises = formData.exercises.filter(ex => ex.section === sectionId);
    const isExpanded = expandedSections[sectionId];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div className="flex items-center gap-2 flex-1 cursor-pointer select-none group" onClick={() => toggleSection(sectionId)}>
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            <div className={cn("p-1.5 rounded-lg", colorClass)}>
              {icon}
            </div>
            <h3 className="font-bold text-sm uppercase tracking-tight">{title}</h3>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-1">{sectionExercises.length}</Badge>
          </div>
          
          {isExpanded && (
            <div className="flex items-center gap-3 animate-in fade-in duration-300">
              {sectionId === 'main' && (
                <div className="flex items-center gap-2 bg-muted/20 px-3 py-1 rounded-full border border-primary/10">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">Répéter le bloc</Label>
                  <div className="flex items-center gap-1.5">
                    <RotateCcw size={12} className="text-primary" />
                    <Input 
                      type="number" 
                      min="1"
                      value={formData.main_rounds} 
                      onChange={(e) => setFormData(prev => ({ ...prev, main_rounds: Math.max(1, parseInt(e.target.value) || 1) }))} 
                      className="h-6 w-12 text-xs text-center p-0 bg-transparent border-none font-bold text-violet-600"
                      disabled={isView}
                    />
                    <span className="text-[10px] font-bold text-muted-foreground">Tours</span>
                  </div>
                </div>
              )}
              
              {!isView && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 gap-1 border-primary/30 text-[10px] font-bold uppercase hover:bg-primary/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenExercises({ open: true, section: sectionId });
                  }}
                >
                  <Plus size={12} /> Ajouter
                </Button>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <SortableContext 
            items={sectionExercises.map(ex => ex.sortId)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="min-h-[50px] animate-in slide-in-from-top-2 duration-300">
              {sectionExercises.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-xl text-muted-foreground text-[10px] uppercase font-semibold opacity-40">
                  Aucun exercice dans cette section
                </div>
              ) : (
                formData.exercises.map((ex, originalIndex) => {
                  if (ex.section !== sectionId) return null;
                  return (
                    <SortableExerciseCard 
                      key={ex.sortId}
                      ex={ex}
                      index={originalIndex}
                      isView={isView}
                      updateExerciseDetails={updateExerciseDetails}
                      removeExercise={removeExercise}
                    />
                  )
                })
              )}
            </div>
          </SortableContext>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="w-full max-w-3xl mx-auto border shadow-none relative bg-background/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-6">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            {isView ? (
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Target size={20} />
                </div>
            ) : null}
            <div>
                <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1">
                    {isView ? "Visualisation" : (isCreation ? (isDuplicate ? "Duplication" : "Édition") : "Modification")}
                </span>
                {isView ? "Détails de la séance" : (isCreation ? (isDuplicate ? "Dupliquer le programme" : (effectiveIsTracking ? "Nouvelle séance de suivi" : "Nouveau Modèle")) : "Modifier le programme")}
            </div>
          </CardTitle>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => router.push(effectiveIsTracking ? '/suivis' : '/sessions')}>
            <X size={20} />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6">
          {/* Section Accordéon : INFOS SÉANCE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 cursor-pointer group select-none" onClick={() => toggleSection('info')}>
                <div className="flex items-center gap-2">
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                        {expandedSections.info ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </div>
                    <div className="p-1.5 rounded-lg bg-muted">
                        <Info size={16} className="text-foreground" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-tight">Informations & Statistiques</h3>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tight bg-background/50 px-2 py-1 rounded-full border border-border/50">
                        <span className="flex items-center gap-1"><Clock size={10} className="text-primary"/> {formData.duration} durée estimée</span>
                        <span className="opacity-20">|</span>
                        <span className="flex items-center gap-1"><Dumbbell size={10} className="text-primary"/> {formData.exercises.length} ex.</span>
                    </div>
                </div>
            </div>

            {expandedSections.info && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Nom du programme / Modèle</Label>
                        <Input 
                            value={formData.title} 
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Nom du programme"
                            className="h-12 border-2 font-bold"
                            disabled={isView}
                        />
                    </div>

                    {effectiveIsTracking && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Athlète assigné</Label>
                            <Select value={formData.athlete_id || undefined} onValueChange={handleAthleteSelect} disabled={isView}>
                            <SelectTrigger className="h-12 border-2 font-bold">
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
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Description globale</Label>
                  <Input 
                    placeholder="Objectifs de la séance, focus particulier..." 
                    value={formData.description}
                    onChange={handleInputChange}
                    name="description"
                    className="h-12 border-primary/10 bg-muted/5 italic"
                    disabled={isView}
                  />
                </div>
              </div>
            )}
          </div>

          {/* DND Context avec sections accordéons */}
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <div className="space-y-10">
              {/* WARMUP */}
              {renderExerciseSection('warmup', 'Échauffement', <Flame size={16} className="text-orange-500" />, 'bg-orange-100 dark:bg-orange-950')}
              
              {/* MAIN BODY */}
              {renderExerciseSection('main', 'Corps de séance', <Target size={16} className="text-violet-500" />, 'bg-violet-100 dark:bg-violet-950')}
              
              {/* COOLDOWN */}
              {renderExerciseSection('cooldown', 'Retour au calme', <Wind size={16} className="text-blue-500" />, 'bg-blue-100 dark:bg-blue-950')}
            </div>

            {/* Drag Overlay for smooth visual feedback */}
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: {
                    opacity: '0.4',
                  },
                },
              }),
            }}>
              {activeId ? (
                <div className="opacity-80">
                  <SortableExerciseCard 
                    ex={formData.exercises.find(ex => ex.sortId === activeId)}
                    isView={true}
                    index={-1}
                    updateExerciseDetails={() => {}}
                    removeExercise={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </CardContent>

        <CardFooter className="flex justify-end border-t p-6 mt-10 bg-muted/5 sticky bottom-0 z-10 backdrop-blur-md">
          <div className="flex gap-3 w-full sm:w-auto">
            {isView ? (
              <Button className="flex-1 sm:px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-xs" onClick={() => router.push(effectiveIsTracking ? '/suivis' : '/sessions')}>Quitter</Button>
            ) : (
              <Button className="flex-1 sm:px-10 h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" onClick={handleSubmit}>
                {mode === "edit" ? "Mettre à jour" : (effectiveIsTracking ? "Enregistrer la séance" : "Créer le modèle")}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Exercise Selection Modal (Unchanged) */}
      <Dialog open={openExercises.open} onOpenChange={(val) => setOpenExercises(prev => ({ ...prev, open: val }))}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
            <div className="p-6 border-b bg-muted/5">
                <DialogTitle className="text-xl font-bold">Ajouter un exercice</DialogTitle>
                <DialogDescription>
                    Sélectionnez un exercice pour la section <span className="text-primary font-bold">{openExercises.section === 'warmup' ? 'Échauffement' : openExercises.section === 'cooldown' ? 'Retour au calme' : 'Corps de séance'}</span>
                </DialogDescription>
            </div>
            <Command className="rounded-none border-none">
                <CommandInput placeholder="Rechercher un exercice (ex: squat, squat sauté...)" className="h-14" />
                <CommandList className="max-h-[400px]">
                <CommandEmpty>Aucun exercice trouvé.</CommandEmpty>
                <CommandGroup>
                    {availableExercises.map((ex) => (
                    <CommandItem 
                        key={ex.id} 
                        onSelect={() => addExerciseToSeance(ex, openExercises.section)}
                        className="py-3 px-6 cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">{ex.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">{ex.category}</span>
                            </div>
                            <Plus size={16} className="text-primary opacity-20 group-hover:opacity-100" />
                        </div>
                    </CommandItem>
                    ))}
                </CommandGroup>
                </CommandList>
            </Command>
        </DialogContent>
      </Dialog>

      {/* Success Modal (Unchanged) */}
      <Dialog open={showSuccessModal} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md [&>button]:hidden border-none shadow-2xl">
          <DialogHeader className="flex flex-col items-center justify-center text-center py-6">
            <div className={cn(
              "h-20 w-20 rounded-2xl flex items-center justify-center mb-6 animate-in zoom-in duration-300",
              isDuplicate ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
            )}>
              {isDuplicate ? (
                <LayoutGrid className="h-6 w-6 text-blue-600" />
              ) : (
                <Check className="h-10 w-10 stroke-primary" />
              )}
            </div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {isDuplicate ? "Copié !" : "Succès !"}
            </DialogTitle>
            <DialogDescription className="text-base font-medium text-muted-foreground mt-2">
              {isDuplicate 
                ? `Le programme a été dupliqué.`
                : `L'opération a été effectuée avec succès.`
              }
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
