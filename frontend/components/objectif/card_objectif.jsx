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
  Target, X, Check, ChevronDown, ChevronRight, Info
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createObjectif, updateObjectif, getObjectifById } from "@/app/actions/objectifs"
import { getAthletes } from "@/app/actions/athletes"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"

export const CardObjectif = ({ id, mode = "create" }) => {
  const router = useRouter()
  const isView = mode === "view"
  
  const [formData, setFormData] = React.useState({
    label: "",
    description: "",
    weeksCount: 4,
    athlete_id: null
  })
  
  const [availableAthletes, setAvailableAthletes] = React.useState([])
  const [expandedSections, setExpandedSections] = React.useState({ info: true })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    fetchAthletes()
  }, [])

  const fetchAthletes = async () => {
    try {
      const data = await getAthletes()
      setAvailableAthletes(data)
    } catch (error) {
      toast.error("Erreur chargement athlètes")
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSubmit = async () => {
    if (!formData.label.trim()) { toast.error("Nom obligatoire"); return; }
    if (!formData.athlete_id) { toast.error("Athlète obligatoire"); return; }
    
    setSaving(true)
    try {
      const result = id ? await updateObjectif(id, formData) : await createObjectif(formData)
      if (!result.success) throw new Error(result.error)
      toast.success("Objectif enregistré")
      router.push("/objectifs")
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
          <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => toggleSection('info')}>
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
              {expandedSections.info ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
            <div className="p-1.5 rounded-lg bg-muted">
              <Info size={16} />
            </div>
            <h3 className="font-bold text-sm uppercase tracking-tight">Informations</h3>
          </div>

          {expandedSections.info && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
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
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Nombre de semaines</Label>
                <Input 
                  type="number"
                  value={formData.weeksCount} 
                  onChange={(e) => setFormData({...formData, weeksCount: parseInt(e.target.value)})}
                  className="h-12 border-2 font-bold"
                  disabled={isView}
                />
              </div>
            </div>
          )}
        </div>

        {/* PLANNING SECTIONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-black uppercase text-sm text-muted-foreground tracking-tight">Planning hebdomadaire</h3>
          </div>
          
          <div className="space-y-3">
            {Array.from({ length: formData.weeksCount }).map((_, i) => {
              const isOpen = expandedSections[`w${i}`];
              return (
                <div key={i} className="border rounded-xl bg-background overflow-hidden">
                   <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors" 
                    onClick={() => toggleSection(`w${i}`)}
                   >
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground transition-colors">
                          {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs">{i+1}</div>
                        <h4 className="font-bold text-sm uppercase tracking-tight">Semaine {i+1}</h4>
                      </div>
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-bold">0 SÉANCES</Badge>
                   </div>
                   {isOpen && (
                     <div className="p-6 pt-0 border-t border-border/50 bg-muted/5 animate-in slide-in-from-top-2">
                       <p className="text-sm text-muted-foreground mt-6 italic">Configuration des séances de la semaine {i+1}...</p>
                     </div>
                   )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>

      <div className="flex justify-end border-t p-6 mt-10 bg-muted/5">
        <Button className="h-12 px-10 font-bold uppercase tracking-widest text-xs" onClick={handleSubmit} disabled={saving}>
          <Check size={16} className="mr-2" />
          {id ? "Mettre à jour" : "Créer"}
        </Button>
      </div>
    </Card>
  )
}
