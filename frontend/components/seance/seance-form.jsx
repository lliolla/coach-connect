'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export function SeanceForm({ 
  seanceId,
  mode = 'create',
  onSubmit,
  onCancel,
  objectifs = [],
  athletes = [],
  initialData = null
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [date, setDate] = React.useState(initialData?.date ? new Date(initialData.date) : new Date())
  
  // Form state
  const [formData, setFormData] = React.useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    duration: initialData?.duration || 60,
    status: initialData?.status || 'en attente',
    objectif_id: initialData?.objectif_id || (objectifs.length > 0 ? objectifs[0]?.id : null),
    athlete_id: initialData?.athlete_id || (athletes.length > 0 ? athletes[0]?.id : null),
    is_template: initialData?.is_template || false,
  })
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const dataToSubmit = {
        ...formData,
        date: date.toISOString(),
        id: seanceId
      }
      
      const result = await onSubmit(dataToSubmit)
      
      console.log('[SeanceForm] Résultat de onSubmit:', result)
      
      // Vérifier que result est bien défini
      if (!result) {
        console.error('[SeanceForm] Erreur: onSubmit n\'a pas retourné de résultat')
        toast.error('Erreur: la sauvegarde a échoué (réponse vide)')
        return
      }
      
      if (result.success) {
        toast.success(mode === 'create' ? 'Séance créée avec succès' : 'Séance mise à jour avec succès')
        router.refresh()
        if (onCancel) onCancel()
      } else {
        console.error('[SeanceForm] Erreur lors de la sauvegarde:', result.error)
        toast.error(result.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error(error)
      toast.error('Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Créer une séance' : 'Modifier la séance'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ex: Séance de renforcement"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
                min="10"
                max="180"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez le contenu de la séance..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="objectif_id">Objectif</Label>
              <Select
                name="objectif_id"
                value={formData.objectif_id || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, objectif_id: value }))}
                required
              >
                <SelectTrigger className="w-full min-w-[250px]">
                  <SelectValue placeholder="Sélectionnez un objectif">
                    {formData.objectif_id ? (
                      objectifs.find(obj => String(obj.id) === String(formData.objectif_id))?.label || formData.objectif_id
                    ) : (
                      'Sélectionnez un objectif'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="min-w-[250px]">
                  {objectifs.map(obj => (
                    <SelectItem key={obj.id} value={obj.id}>
                      {obj.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en attente">En attente</SelectItem>
                  <SelectItem value="transmis">Transmis</SelectItem>
                  <SelectItem value="prévu">Prévu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPPP", { locale: fr }) : <span>Sélectionnez une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_template"
              name="is_template"
              checked={formData.is_template}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <Label htmlFor="is_template">Modèle (réutilisable)</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Annuler
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : (mode === 'create' ? 'Créer' : 'Enregistrer')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}