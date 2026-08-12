'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconLoader2,
} from '@tabler/icons-react'

import { toast } from 'sonner'

import {
  createSession,
  getSessionById,
  updateSession,
} from '@/app/actions/sessions'

import { getExercices } from '@/app/actions/exercices'

import { cn } from '@/lib/utils'

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
  useSortable,
} from '@dnd-kit/sortable'

import { restrictToVerticalAxis } from '@dnd-kit/modifiers'


/**
 * Etat initial d'une séance
 *
 * Les noms des champs correspondent à la table sessions
 * et aux attentes de createSession().
 */
const EMPTY_SESSION = {
  title: '',
  date: new Date().toISOString().split('T')[0],
  athlete_id: '',
  objectif_id: '',
  notes: '',
  is_template: false,
  exercises: [],
}


/**
 * Ligne d'un exercice
 */
function ExerciseRow({
  exercise,
  index,
  removeExercise,
  updateExercise,
  isDisabled,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise._dndId || `${exercise.exercise_id}-${index}`,
  })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-b last:border-b-0',
        isDragging && 'bg-muted/50'
      )}
    >
      <td className="w-10 px-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          disabled={isDisabled}
          className={cn(
            'p-1 rounded',
            isDisabled
              ? 'cursor-not-allowed opacity-40'
              : 'cursor-grab hover:bg-muted'
          )}
          aria-label="Déplacer l'exercice"
        >
          <IconGripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </td>

      <td className="px-3 py-3">
        <div className="font-medium">
          {exercise.name || 'Exercice'}
        </div>

        {exercise.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {exercise.description}
          </div>
        )}
      </td>

      <td className="px-2 py-3">
        <Input
          type="number"
          min="1"
          value={exercise.sets ?? 1}
          onChange={(e) =>
            updateExercise(index, 'sets', e.target.value)
          }
          className="w-16"
          disabled={isDisabled}
        />
      </td>

      <td className="px-2 py-3">
        <Input
          type="number"
          min="0"
          value={exercise.reps ?? 0}
          onChange={(e) =>
            updateExercise(index, 'reps', e.target.value)
          }
          className="w-16"
          disabled={isDisabled}
        />
      </td>

      <td className="px-2 py-3">
        <Input
          type="number"
          min="0"
          step="0.5"
          value={exercise.weight ?? 0}
          onChange={(e) =>
            updateExercise(index, 'weight', e.target.value)
          }
          className="w-20"
          disabled={isDisabled}
        />
      </td>

      <td className="px-2 py-3">
        <Input
          type="number"
          min="0"
          value={exercise.rest_time ?? 60}
          onChange={(e) =>
            updateExercise(index, 'rest_time', e.target.value)
          }
          className="w-20"
          disabled={isDisabled}
        />
      </td>

      <td className="w-12 px-2 py-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => removeExercise(index)}
          disabled={isDisabled}
          aria-label="Supprimer l'exercice"
        >
          <IconTrash className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}


/**
 * CardSeance
 */
export default function CardSeance({
  objectifs = [],
  athletes = [],
  isDisabled = false,
  isTemplate = false,
  mode = 'create',
  seanceId = null,
  duplicateId = null,
}) {
  const router = useRouter()

  const [sessionData, setSessionData] = React.useState(() => ({
    ...EMPTY_SESSION,
    is_template: isTemplate,
  }))

  const [exercices, setExercices] = React.useState([])
  const [availableExercices, setAvailableExercices] = React.useState([])

  const [selectedExercise, setSelectedExercise] = React.useState('')

  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )


  /**
   * Charge la bibliothèque d'exercices.
   */
  React.useEffect(() => {
    let cancelled = false

    async function loadExercises() {
      try {
        const data = await getExercices()

        if (!cancelled) {
          setAvailableExercices(data || [])
        }
      } catch (error) {
        console.error(
          'Erreur lors du chargement des exercices :',
          error
        )

        if (!cancelled) {
          toast.error(
            'Impossible de charger la bibliothèque des exercices'
          )
        }
      }
    }

    loadExercises()

    return () => {
      cancelled = true
    }
  }, [])


  /**
   * Charge une séance existante lorsqu'on est en édition
   * ou lorsqu'on demande une duplication.
   */
  React.useEffect(() => {
    let cancelled = false

    async function loadSession() {
      const idToLoad = seanceId || duplicateId

      if (!idToLoad) {
        setSessionData({
          ...EMPTY_SESSION,
          is_template: isTemplate,
        })

        setExercices([])
        setIsLoading(false)

        return
      }

      try {
        setIsLoading(true)

        const data = await getSessionById(idToLoad)

        if (cancelled || !data) {
          return
        }

        const loadedExercises = (data.exercices || []).map(
          (item, index) => {
            const exerciseLibrary = item.exercice || {}

            return {
              _dndId:
                item.id ||
                `${item.exercise_id || exerciseLibrary.id}-${index}`,

              exercise_id:
                item.exercise_id ||
                exerciseLibrary.id,

              name:
                exerciseLibrary.name ||
                item.name ||
                'Exercice',

              description:
                exerciseLibrary.description || '',

              sets: item.sets ?? 1,
              reps: item.reps ?? 0,
              weight: item.weight ?? 0,
              rest_time: item.rest_time ?? 60,

              notes: item.notes || '',
              intensity: item.intensity ?? 0,
              section: item.section || 'main',
              rounds: item.rounds ?? 1,

              order_index:
                item.order_index ?? index,
            }
          }
        )

        const loadedSession = {
          ...EMPTY_SESSION,

          ...data,

          /**
           * Pour une duplication, on ne conserve pas
           * l'identifiant de la séance originale.
           */
          ...(duplicateId
            ? {
                id: undefined,
                title: data.title
                  ? `${data.title} - Copie`
                  : '',
              }
            : {}),

          is_template:
            isTemplate || data.is_template || false,

          exercises: loadedExercises,
        }

        setSessionData(loadedSession)
        setExercices(loadedExercises)
      } catch (error) {
        console.error(
          'Erreur lors du chargement de la séance :',
          error
        )

        toast.error(
          'Impossible de charger la séance'
        )
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [seanceId, duplicateId, isTemplate])


  /**
   * Met à jour sessionData.
   */
  const handleSessionChange = React.useCallback(
    (field, value) => {
      setSessionData((previous) => ({
        ...previous,
        [field]: value,
      }))
    },
    []
  )


  /**
   * Met à jour les exercices dans sessionData.
   */
  const syncExercises = React.useCallback(
    (newExercises) => {
      setExercices(newExercises)

      setSessionData((previous) => ({
        ...previous,
        exercises: newExercises,
      }))
    },
    []
  )


  /**
   * Drag & drop.
   */
  const handleDragEnd = React.useCallback(
    (event) => {
      if (isDisabled) return

      const { active, over } = event

      if (!over || active.id === over.id) {
        return
      }

      setExercices((currentExercises) => {
        const oldIndex = currentExercises.findIndex(
          (exercise) => exercise._dndId === active.id
        )

        const newIndex = currentExercises.findIndex(
          (exercise) => exercise._dndId === over.id
        )

        if (
          oldIndex === -1 ||
          newIndex === -1
        ) {
          return currentExercises
        }

        const reordered = arrayMove(
          currentExercises,
          oldIndex,
          newIndex
        ).map((exercise, index) => ({
          ...exercise,
          order_index: index,
        }))

        setSessionData((previous) => ({
          ...previous,
          exercises: reordered,
        }))

        return reordered
      })
    },
    [isDisabled]
  )


  /**
   * Supprime un exercice.
   */
  const removeExercise = React.useCallback(
    (index) => {
      if (isDisabled) return

      const newExercises = exercices
        .filter((_, exerciseIndex) => exerciseIndex !== index)
        .map((exercise, newIndex) => ({
          ...exercise,
          order_index: newIndex,
        }))

      syncExercises(newExercises)
    },
    [exercices, isDisabled, syncExercises]
  )


  /**
   * Modifie un exercice.
   */
  const updateExercise = React.useCallback(
    (index, field, value) => {
      if (isDisabled) return

      const newExercises = exercices.map(
        (exercise, exerciseIndex) =>
          exerciseIndex === index
            ? {
                ...exercise,
                [field]: value,
              }
            : exercise
      )

      syncExercises(newExercises)
    },
    [exercices, isDisabled, syncExercises]
  )


  /**
   * Ajoute un exercice.
   */
  const addExercise = React.useCallback(() => {
    if (
      isDisabled ||
      !selectedExercise
    ) {
      return
    }

    const exerciseToAdd =
      availableExercices.find(
        (exercise) =>
          String(exercise.id) ===
          String(selectedExercise)
      )

    if (!exerciseToAdd) {
      return
    }

    const index = exercices.length

    const newExercise = {
      _dndId: `new-${exerciseToAdd.id}-${Date.now()}`,

      /**
       * IMPORTANT :
       * createSession() attend exercise_id,
       * pas id.
       */
      exercise_id: exerciseToAdd.id,

      name: exerciseToAdd.name || '',
      description: exerciseToAdd.description || '',

      sets: 3,
      reps: 10,
      weight: 0,
      rest_time: 60,

      notes: '',
      intensity: 0,
      section: 'main',
      rounds: 1,

      order_index: index,
    }

    syncExercises([
      ...exercices,
      newExercise,
    ])

    setSelectedExercise('')
  }, [
    isDisabled,
    selectedExercise,
    availableExercices,
    exercices,
    syncExercises,
  ])


  /**
   * Prépare les données avant envoi au Server Action.
   *
   * On retire les propriétés purement UI comme _dndId,
   * name et description.
   */
  const buildPayload = React.useCallback(() => {
    return {
      ...sessionData,

      exercises: exercices.map(
        (exercise, index) => ({
          exercise_id:
            exercise.exercise_id,

          sets:
            Number(exercise.sets) || 1,

          reps:
            Number(exercise.reps) || 0,

          weight:
            Number(exercise.weight) || 0,

          rest_time:
            Number(exercise.rest_time) || 60,

          order_index:
            index,

          notes:
            exercise.notes || '',

          intensity:
            Number(exercise.intensity) || 0,

          section:
            exercise.section || 'main',

          rounds:
            Number(exercise.rounds) || 1,
        })
      ),
    }
  }, [sessionData, exercices])


  /**
   * Création / modification.
   */
  const handleSubmit = async (event) => {
    event.preventDefault()

    if (
      isDisabled ||
      isSubmitting
    ) {
      return
    }

    if (!sessionData.title?.trim()) {
      toast.error(
        'Veuillez renseigner le titre de la séance'
      )
      return
    }

    if (
      !isTemplate &&
      !sessionData.athlete_id
    ) {
      toast.error(
        'Veuillez sélectionner un athlète'
      )
      return
    }

    if (
      !isTemplate &&
      !sessionData.objectif_id
    ) {
      toast.error(
        'Veuillez sélectionner un objectif'
      )
      return
    }

    setIsSubmitting(true)

    const toastId = toast.loading(
      mode === 'edit'
        ? 'Mise à jour en cours...'
        : 'Création en cours...'
    )

    try {
      const payload = buildPayload()

      let result

      if (
        mode === 'edit' &&
        sessionData.id
      ) {
        result = await updateSession(
          sessionData.id,
          payload
        )

        toast.success(
          'Séance mise à jour avec succès',
          { id: toastId }
        )
      } else {
        result = await createSession(
          payload
        )

        toast.success(
          'Séance créée avec succès',
          { id: toastId }
        )
      }

      if (result?.id) {
        router.push(
          `/admin/seances/${result.id}?mode=view`
        )
      }
    } catch (error) {
      console.error(
        'Erreur sauvegarde séance :',
        error
      )

      toast.error(
        error?.message ||
          'Une erreur est survenue',
        { id: toastId }
      )
    } finally {
      setIsSubmitting(false)
    }
  }


  /**
   * Chargement.
   */
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconLoader2
            className="animate-spin"
            size={18}
          />
          Chargement de la séance...
        </div>
      </div>
    )
  }


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={exercices.map(
          (exercise) => exercise._dndId
        )}
        strategy={verticalListSortingStrategy}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ========================= */}
            {/* INFORMATIONS SEANCE */}
            {/* ========================= */}

            <div className="space-y-4">

              <div className="space-y-2">
                <Label htmlFor="title">
                  Titre
                </Label>

                <Input
                  id="title"
                  value={sessionData.title || ''}
                  onChange={(event) =>
                    handleSessionChange(
                      'title',
                      event.target.value
                    )
                  }
                  disabled={isDisabled}
                  placeholder="Ex : Séance force bas du corps"
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="date">
                  Date
                </Label>

                <Input
                  id="date"
                  type="date"
                  value={
                    sessionData.date ||
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  }
                  onChange={(event) =>
                    handleSessionChange(
                      'date',
                      event.target.value
                    )
                  }
                  disabled={isDisabled}
                />
              </div>


              {!isTemplate && (
                <div className="space-y-2">
                  <Label htmlFor="athlete">
                    Athlète
                  </Label>

                  <Select
                    value={
                      sessionData.athlete_id || ''
                    }
                    onValueChange={(value) =>
                      handleSessionChange(
                        'athlete_id',
                        value
                      )
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger id="athlete">
                      <SelectValue placeholder="Sélectionner un athlète" />
                    </SelectTrigger>

                    <SelectContent>
                      {athletes.map((athlete) => (
                        <SelectItem
                          key={athlete.id}
                          value={String(athlete.id)}
                        >
                          {athlete.first_name}{' '}
                          {athlete.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}


              {!isTemplate && (
                <div className="space-y-2">
                  <Label htmlFor="objectif">
                    Objectif
                  </Label>

                  <Select
                    value={
                      sessionData.objectif_id || ''
                    }
                    onValueChange={(value) =>
                      handleSessionChange(
                        'objectif_id',
                        value
                      )
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger id="objectif">
                      <SelectValue placeholder="Sélectionner un objectif" />
                    </SelectTrigger>

                    <SelectContent>
                      {objectifs.map((objectif) => (
                        <SelectItem
                          key={objectif.id}
                          value={String(objectif.id)}
                        >
                          {objectif.label ||
                            objectif.name ||
                            `Objectif ${objectif.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}


              <div className="space-y-2">
                <Label htmlFor="notes">
                  Notes
                </Label>

                <Textarea
                  id="notes"
                  value={sessionData.notes || ''}
                  onChange={(event) =>
                    handleSessionChange(
                      'notes',
                      event.target.value
                    )
                  }
                  disabled={isDisabled}
                  rows={4}
                  placeholder="Notes concernant la séance..."
                />
              </div>

            </div>


            {/* ========================= */}
            {/* EXERCICES */}
            {/* ========================= */}

            <div className="space-y-4">

              <div className="space-y-2">
                <Label>
                  Exercices
                </Label>

                <div className="flex flex-col sm:flex-row gap-2">

                  <Select
                    value={selectedExercise}
                    onValueChange={
                      setSelectedExercise
                    }
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ajouter un exercice" />
                    </SelectTrigger>

                    <SelectContent>
                      {availableExercices.map(
                        (exercise) => (
                          <SelectItem
                            key={exercise.id}
                            value={String(exercise.id)}
                          >
                            {exercise.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    onClick={addExercise}
                    disabled={
                      isDisabled ||
                      !selectedExercise
                    }
                    className="w-full sm:w-auto"
                  >
                    <IconPlus
                      className="h-4 w-4 mr-2"
                    />
                    Ajouter
                  </Button>

                </div>
              </div>


              <div className="rounded-md border overflow-x-auto">

                <table className="min-w-full divide-y divide-border">

                  <thead className="bg-muted/30">
                    <tr>

                      <th className="w-10 px-2 py-2" />

                      <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Exercice
                      </th>

                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Séries
                      </th>

                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Rép.
                      </th>

                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Poids
                      </th>

                      <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                        Repos
                      </th>

                      <th className="w-12 px-2 py-2" />

                    </tr>
                  </thead>


                  <tbody>

                    {exercices.length > 0 ? (

                      exercices.map(
                        (exercise, index) => (
                          <ExerciseRow
                            key={
                              exercise._dndId ||
                              `${exercise.exercise_id}-${index}`
                            }
                            exercise={exercise}
                            index={index}
                            removeExercise={
                              removeExercise
                            }
                            updateExercise={
                              updateExercise
                            }
                            isDisabled={
                              isDisabled
                            }
                          />
                        )
                      )

                    ) : (

                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          Aucun exercice ajouté
                        </td>
                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>


          {/* ========================= */}
          {/* ACTIONS */}
          {/* ========================= */}

          {!isDisabled && (
            <div className="flex justify-end gap-4">

              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Annuler
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2
                      className="animate-spin mr-2"
                      size={16}
                    />

                    {mode === 'edit'
                      ? 'Mise à jour...'
                      : 'Création...'}
                  </>
                ) : (
                  mode === 'edit'
                    ? 'Mettre à jour'
                    : 'Créer la séance'
                )}
              </Button>

            </div>
          )}

        </form>
      </SortableContext>
    </DndContext>
  )
}