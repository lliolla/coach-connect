'use client'
import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Target, X, Check
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createObjectif, updateObjectif, getObjectifById } from "@/app/actions/objectifs"
import { getAthletes } from "@/app/actions/athletes"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"

export const CardObjectif = ({ id, mode = "create", presetAthleteId }) => {
  const router = useRouter()
  const isView = mode === "view"
  
  const [formData, setFormData] = React.useState({
    label: "",
    description: "",
    total_sessions: 20,
    athlete_id: presetAthleteId || null
  })
  
  const [availableAthletes, setAvailableAthletes] = React.useState([])
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchAthletes()
    if (id) fetchObjectif()
  }, [id])

  const fetchObjectif = async () => {
    try {
      const data = await getObjectifById(id)
      if (data) {
        setFormData({
          label: data.label || "",
          description: data.description || "",
          total_sessions: data.total_sessions || 20,
          athlete_id: data.athlete_id?.toString() || null
        })
      }
    } catch (error) {
      toast.error("Erreur chargement objectif")
    }
  }

  const fetchAthletes = async () => {
    try {
      const data = await getAthletes()
      setAvailableAthletes(data)
    } catch (error) {
      toast.error("Erreur chargement athlètes")
    }
  }
  const handleSubmit = async () => {
    if (!formData.label.trim()) { toast.error("Nom obligatoire"); return; }
    if (!formData.athlete_id) { toast.error("Athlète obligatoire"); return; }
    if (!formData.total_sessions || formData.total_sessions < 1) { toast.error("Nombre de séances invalide"); return; }
    
    setSaving(true)
    try {
      const result = id ? await updateObjectif(id, formData) : await createObjectif(formData)
      if (!result.success) throw new Error(result.error)
      toast.success("Objectif enregistré")
      // Si on vient de la page d'un athlète, revenir à cette page
      if (formData.athlete_id) {
        router.push(`/admin/users/${formData.athlete_id}`)
      } else {
        router.push("/objectifs")
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto border shadow-none relative bg-background/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/5 pb-6">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Target size={20} />
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1">
              {mode === "create" ? "Nouveau" : "Édition"}
            </span>
            {id ? "Modifier l'objectif" : "Nouvel Objectif"}
          </div>
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => router.push("/objectifs")}>
          <X size={20} />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-6">
        {/* INFO SECTION */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-tight mb-4">Informations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Nom de l'objectif</Label>
                <Input 
                  value={formData.label} 
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="h-12 border-2 font-bold"
                  disabled={isView}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Athlète assigné</Label>
                <Select value={formData.athlete_id || undefined} onValueChange={(v) => setFormData({...formData, athlete_id: v})} disabled={isView}>
                  <SelectTrigger className="h-12 border-2 font-bold">
                    <SelectValue placeholder="Sélectionner un athlète" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAthletes.map((a) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.first_name} {a.last_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Total de séances prévues</Label>
                <Input 
                  type="number"
                  value={formData.total_sessions} 
                  onChange={(e) => setFormData({...formData, total_sessions: parseInt(e.target.value)})}
                  className="h-12 border-2 font-bold"
                  placeholder="Ex: 20"
                  disabled={isView}
                />
              </div>
            </div>
            <div className="flex justify-end border-t p-6 mt-10 bg-muted/5">
              <Button className="h-12 px-10 font-bold uppercase tracking-widest text-xs" onClick={handleSubmit} disabled={saving}>
                <Check size={16} className="mr-2" />
                {id ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </div>
      </CardContent>
    </Card>
  )
}
