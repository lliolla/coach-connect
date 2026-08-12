'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { IconPlus, IconTrash, IconGripVertical, IconLoader2 } from '@tabler/icons-react'
import { toast } from 'sonner'
import { createSession, updateSession } from '@/app/actions/sessions'
import { cn } from '@/lib/utils'

// ✅ Imports @dnd-kit restaurés depuis Git
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useSortable } from '@dnd-kit/sortable'

function ExerciseRow({ exercise, index, removeExercise, updateExercise, isDisabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id || index })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDisabled ? 'not-allowed' : 'grab',
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(isDisabled ? 'pointer-events-none opacity-60' : '')}
    >
      <td className="w-8" {...attributes} {...listeners}>
        <IconGripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
      </td>
      <td>
        <div className="font-medium">{exercise.name}</div>
        <div className="text-sm text-muted-foreground">{exercise.description}</div>
      </td>
      <td>
        <Input
          type="number"
          value={exercise.sets}
          onChange={(e) => updateExercise(index, 'sets', e.target.value)}
          className="w-16"
          disabled={isDisabled}
        />
      </td>
      <td>
        <Input
          type="number"
          value={exercise.reps}
          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
          className="w-16"
          disabled={isDisabled}
        />
      </td>
      <td>
        <Input
          type="number"
          value={exercise.weight}
          onChange={(e) => updateExercise(index, 'weight', e.target.value)}
          className="w-16"
          disabled={isDisabled}
        />
      </td>
      <td>
        <Input
          type="number"
          value={exercise.rest_time}
          onChange={(e) => updateExercise(index, 'rest_time', e.target.value)}
          className="w-20"
          placeholder="sec"
          disabled={isDisabled}
        />
      </td>
      <td>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeExercise(index)}
          disabled={isDisabled}
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}

export default function CardSeance({
  sessionData,
  setSessionData,
  objectifs = [],
  athletes = [],
  isDisabled = false,
  isTemplate = false,
  mode = 'create'
}) {
  const router = useRouter()
  const [exercices, setExercices] = React.useState([])
  const [availableExercices, setAvailableExercices] = React.useState([])
  const [selectedExercise, setSelectedExercise] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // ✅ Capteurs @dnd-kit (restaurés depuis Git)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  React.useEffect(() => {
    if (sessionData?.exercises) {
      setExercices(sessionData.exercises)
    }
  }, [sessionData?.exercises])

  const handleSessionChange = (field, value) => {
    setSessionData({ ...sessionData, [field]: value })
  }

  const handleDragEnd = (event) => {
    if (isDisabled) return
    const { active, over } = event
    if (active.id !== over.id) {
      setExercices((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        const newExercices = arrayMove(items, oldIndex, newIndex)
        setSessionData({ ...sessionData, exercises: newExercices })
        return newExercices
      })
    }
  }

  const removeExercise = (index) => {
    if (isDisabled) return
    const newExercices = [...exercices]
    newExercices.splice(index, 1)
    setExercices(newExercices)
    setSessionData({ ...sessionData, exercises: newExercices })
  }

  const updateExercise = (index, field, value) => {
    if (isDisabled) return
    const newExercices = [...exercices]
    newExercices[index] = { ...newExercices[index], [field]: value }
    setExercices(newExercices)
    setSessionData({ ...sessionData, exercises: newExercices })
  }

  const addExercise = () => {
    if (isDisabled || !selectedExercise) return
    const exerciseToAdd = availableExercices.find(ex => ex.id === selectedExercise)
    if (!exerciseToAdd) return

    const newExercise = {
      id: exerciseToAdd.id,
      name: exerciseToAdd.name,
      description: exerciseToAdd.description,
      sets: 3,
      reps: 10,
      weight: '',
      rest_time: 60,
      order_index: exercices.length,
    }

    const newExercices = [...exercices, newExercise]
    setExercices(newExercices)
    setSessionData({ ...sessionData, exercises: newExercices })
    setSelectedExercise('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isDisabled || isSubmitting) return

    setIsSubmitting(true)
    const toastId = toast.loading(mode === 'edit' ? "Mise à jour en cours..." : "Création en cours...")

    try {
      if (mode === 'edit') {
        await updateSession(sessionData.id, sessionData)
        toast.success('Séance mise à jour avec succès', { id: toastId })
      } else {
        const newSession = await createSession(sessionData)
        toast.success('Séance créée avec succès', { id: toastId })
        router.push(`/admin/seances/${newSession.id}?mode=view`)
      }
    } catch (error) {
      toast.error(error.message, { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={exercices.map(ex => ex.id)}
        strategy={verticalListSortingStrategy}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={sessionData.title || ''}
                  onChange={(e) => handleSessionChange('title', e.target.value)}
                  disabled={isDisabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={sessionData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleSessionChange('date', e.target.value)}
                  disabled={isDisabled}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="athlete">Athlète</Label>
                <Select
                  value={sessionData.athlete_id || ""}
                  onValueChange={(value) => handleSessionChange('athlete_id', value)}
                  disabled={isDisabled}
                >
                  <SelectTrigger id="athlete">
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

              <div className="space-y-2">
                <Label htmlFor="objectif">Objectif</Label>
                <Select
                  value={sessionData.objectif_id || ""}
                  onValueChange={(value) => handleSessionChange('objectif_id', value)}
                  disabled={isDisabled || isTemplate || (mode === 'view')}  // ✅ Correction conservée
                >
                  <SelectTrigger id="objectif">
                    <SelectValue placeholder="Sélectionner un objectif" />
                  </SelectTrigger>
                  <SelectContent>
                    {objectifs.map((objectif) => (
                      <SelectItem key={objectif.id} value={objectif.id}>
                        {objectif.label}  // ✅ Utilisation de label
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={sessionData.notes || ''}
                  onChange={(e) => handleSessionChange('notes', e.target.value)}
                  disabled={isDisabled}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Exercices</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select
                    value={selectedExercise}
                    onValueChange={setSelectedExercise}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-full sm:w-2/3">
                      <SelectValue placeholder="Ajouter un exercice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercices.map((exercice) => (
                        <SelectItem key={exercice.id} value={exercice.id}>
                          {exercice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={addExercise}
                    disabled={isDisabled || !selectedExercise}
                    className="w-full sm:w-auto"
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>

                <div className="rounded-md border mt-4">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="w-8 px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Exercice</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Séries</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Répétitions</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Poids (kg)</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Repos (sec)</th>
                        <th className="w-8 px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exercices.length > 0 ? (
                        exercices.map((exercise, index) => (
                          <ExerciseRow
                            key={exercise.id || index}
                            exercise={exercise}
                            index={index}
                            removeExercise={removeExercise}
                            updateExercise={updateExercise}
                            isDisabled={isDisabled}
                          />
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            Aucun exercice ajouté
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {!isDisabled && (
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <IconLoader2 className="animate-spin mr-2" size={16} />
                    {mode === 'edit' ? 'Mise à jour...' : 'Création...'}
                  </>
                ) : (
                  mode === 'edit' ? 'Mettre à jour' : 'Créer la séance'
                )}
              </Button>
            </div>
          )}
        </form>
      </SortableContext>
    </DndContext>
  )
}
