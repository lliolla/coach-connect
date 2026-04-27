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
import { Dumbbell, UserCheck, Video, Tag, FileText, Trash2 } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"

const categories = ["Musculation", "Cardio", "Trail", "Natation", "Gainage", "Souplesse", "Autre"]
const units = [
  { value: "reps", label: "Répétitions" },
  { value: "secs", label: "Secondes" },
  { value: "mins", label: "Minutes" },
  { value: "m", label: "Mètres" },
  { value: "km", label: "Kilomètres" },
]

const initialFormState = {
  name: "",
  description: "",
  category: "Musculation",
  unit: "reps",
  intensity: "", // Added intensity field
  video_url: "",
  image_data: ""
}

export const CardExercice = ({ mode = "edit", exerciceId = null }) => {
  const isCreation = mode === "create"
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [formData, setFormData] = React.useState(initialFormState)

  // Fetch exercice data if in edit mode
  React.useEffect(() => {
    if (!isCreation && exerciceId) {
      fetchExerciceData()
    }
  }, [exerciceId, isCreation])

  const fetchExerciceData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/exercices/${exerciceId}`)
      if (!response.ok) throw new Error("Impossible de charger les données")
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement de l'exercice")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    const loadingToast = toast.loading(isCreation ? "Création de l'exercice..." : "Mise à jour...")
    
    try {
      const url = isCreation 
        ? 'http://127.0.0.1:3001/api/exercices' 
        : `http://127.0.0.1:3001/api/exercices/${exerciceId}`
      
      const method = isCreation ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    router.push('/exercices')
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-dashed border-2 border-primary/20 shadow-none">
        <CardHeader>
          <CardTitle>{isCreation ? "Nouvel Exercice" : "Modifier l'exercice"}</CardTitle>
          <CardAction>
            <Button variant="ghost" size="sm" onClick={() => router.push('/exercices')}>
              Retour à la bibliothèque
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Icône d'exercice */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Dumbbell size={40} />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Détails du modèle</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'exercice</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="ex: Squat, Développé couché..." 
              value={formData.name || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Changed to grid-cols-3 */}
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unité par défaut</Label>
              <Select 
                value={formData.unit} 
                onValueChange={(value) => handleSelectChange('unit', value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Choisir l'unité" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(u => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Intensity Input */}
            <div className="space-y-2">
              <Label htmlFor="intensity">Intensité (1-10)</Label>
              <Input 
                id="intensity" 
                name="intensity" 
                type="number"
                min="1"
                max="10"
                placeholder="ex: 8" 
                value={formData.intensity || ""}
                onChange={handleInputChange}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description / Consignes</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Expliquez comment réaliser l'exercice..." 
              className="min-h-[100px] resize-none"
              value={formData.description || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Image d'illustration (Stockée en BD)</Label>
              <div className="flex items-center gap-4">
                {formData.image_data ? (
                  <div className="relative h-10 w-10 rounded-lg border overflow-hidden group">
                    <img 
                      src={formData.image_data} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                    <button 
                      onClick={() => setFormData({...formData, image_data: null})}
                      className="absolute inset-0 bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <FileText size={18} />
                  </div>
                )}
                <div className="flex-1">
                  <Input 
                    type="file" 
                    accept="image/*"
                    className="cursor-pointer h-9 text-xs"
                    onChange={(e) => {
                      const file = e.target.files[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({ ...formData, image_data: reader.result })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">Lien Vidéo (YouTube / Vimeo)</Label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  id="video_url" 
                  name="video_url" 
                  placeholder="https://..." 
                  className="pl-10 h-9"
                  value={formData.video_url || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 mt-6">
          <Button variant="outline" onClick={() => router.push('/exercices')}>Annuler</Button>
          <Button onClick={handleSubmit}>{isCreation ? "Créer l'exercice" : "Sauvegarder"}</Button>
        </CardFooter>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Opération réussie</DialogTitle>
            <DialogDescription className="text-base py-2">
              {isCreation 
                ? "L'exercice a été ajouté à la bibliothèque." 
                : "Le modèle d'exercice a été mis à jour."}

                ger les
                 a 10
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={handleModalClose} className="w-full sm:w-auto px-8">
              Fermer et retourner à la liste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
