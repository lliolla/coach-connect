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
import { Check, ChevronsUpDown, Plus, X, UserCheck } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

const sportsList = [
  { value: "running", label: "Running" },
  { value: "cycling", label: "Cyclisme" },
  { value: "swimming", label: "Natation" },
  { value: "triathlon", label: "Triathlon" },
  { value: "trail", label: "Trail" },
  { value: "fitness", label: "Fitness / Musculation" },
]

const predefinedObjectives = [
  "Perte de poids",
  "Prise de masse",
  "Préparation Marathon",
  "Finir un Ironman",
  "Amélioration de la VMA",
  "Remise en forme",
  "Récupération après blessure",
]

const initialFormState = {
  email: "",
  first_name: "",
  last_name: "",
  avatar_url: "",
  sports: [],
  objectives: [],
  groupes: ["Groupe A"],
  abonnement: "Essentiel",
  mode_paiement: "Carte Bancaire",
}

export const CardAthlete = ({ mode = "edit", athleteId = null }) => {
  const isCreation = mode === "create"
  const router = useRouter()
  const [openSports, setOpenSports] = React.useState(false)
  const [openObjectives, setOpenObjectives] = React.useState(false)
  const [openGroupes, setOpenGroupes] = React.useState(false)
  const [objectiveSearch, setObjectiveSearch] = React.useState("")
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [formData, setFormData] = React.useState(initialFormState)

  // Fetch athlete data if in edit mode
  React.useEffect(() => {
    if (!isCreation && athleteId) {
      fetchAthleteData()
    }
  }, [athleteId, isCreation])

  const fetchAthleteData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:3001/api/athletes/${athleteId}`)
      if (!response.ok) throw new Error("Impossible de charger les données de l'athlète")
      const data = await response.json()
      setFormData({
        ...data,
        sports: data.sports || [],
        objectives: data.objectives || [],
        groupes: data.groupes || [],
        abonnement: data.abonnement || "Essentiel",
        mode_paiement: data.mode_paiement || "Carte Bancaire",
      })
    } catch (error) {
      console.error(error)
      toast.error("Erreur lors du chargement du profil")
    }
  }

  // Generate a default avatar if none provided
  const displayAvatar = formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.first_name || 'default'}`

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleSport = (sportValue) => {
    setFormData(prev => {
      const isSelected = prev.sports.includes(sportValue)
      if (isSelected) {
        return { ...prev, sports: prev.sports.filter(s => s !== sportValue) }
      } else {
        return { ...prev, sports: [...prev.sports, sportValue] }
      }
    })
  }

  const removeSport = (sportValue) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.filter(s => s !== sportValue)
    }))
  }

  const toggleObjective = (objective) => {
    setFormData(prev => {
      const objectives = Array.isArray(prev.objectives) ? prev.objectives : []
      const isSelected = objectives.includes(objective)
      if (isSelected) {
        return { ...prev, objectives: objectives.filter(o => o !== objective) }
      } else {
        return { ...prev, objectives: [...objectives, objective] }
      }
    })
  }

  const toggleGroup = (groupName) => {
    setFormData(prev => {
      const currentGroups = Array.isArray(prev.groupes) ? prev.groupes : []
      if (currentGroups.includes(groupName)) {
        return { ...prev, groupes: currentGroups.filter(g => g !== groupName) }
      } else {
        return { ...prev, groupes: [...currentGroups, groupName] }
      }
    })
  }

  const removeGroup = (groupName) => {
    setFormData(prev => ({
      ...prev,
      groupes: (Array.isArray(prev.groupes) ? prev.groupes : []).filter(g => g !== groupName)
    }))
  }

  const addNewObjective = () => {
    if (objectiveSearch && !formData.objectives.includes(objectiveSearch)) {
      toggleObjective(objectiveSearch)
      setObjectiveSearch("")
    }
  }

  const handleSubmit = async () => {
    const loadingToast = toast.loading(isCreation ? "Création de l'athlète..." : "Mise à jour du profil...")
    
    try {
      const url = isCreation 
        ? 'http://127.0.0.1:3001/api/athletes' 
        : `http://127.0.0.1:3001/api/athletes/${athleteId}`
      
      const method = isCreation ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erreur lors de l\'enregistrement')
      }

      toast.dismiss(loadingToast)
      setShowSuccessModal(true)

      // Automatic redirect after success
      setTimeout(() => {
        handleModalClose()
      }, 2000)

    } catch (error) {
      console.error("Erreur:", error)
      toast.error("Erreur : " + error.message, {
        id: loadingToast
      })
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    router.push('/athletes')
  }

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-dashed border-2 border-primary/20 shadow-none">
        <CardHeader>
          <CardTitle>{isCreation ? "Nouvel Athlète" : "Profil de l'athlète"}</CardTitle>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2 md:flex-row">
              <Button variant="ghost" size="sm" onClick={() => router.push('/athletes')}>
                Retour à la liste
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b">
            <Avatar className="h-24 w-24 border-2 border-primary/10">
              <AvatarImage src={displayAvatar} />
              <AvatarFallback>{formData.first_name?.[0]}{formData.last_name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="avatar_url" className="text-center block text-muted-foreground text-xs uppercase tracking-wider">URL de la photo de profil</Label>
              <Input 
                id="avatar_url" 
                name="avatar_url" 
                placeholder="https://..." 
                value={formData.avatar_url || ""}
                onChange={handleInputChange}
                className="text-center h-8 text-sm"
              />
            </div>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input 
                id="first_name" 
                name="first_name" 
                placeholder="Prénom de l'athlète" 
                value={formData.first_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input 
                id="last_name" 
                name="last_name" 
                placeholder="Nom de l'athlète" 
                value={formData.last_name || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="email@exemple.com" 
              value={formData.email || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Abonnement et Mode de Paiement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="abonnement">Abonnement</Label>
              <Select 
                value={formData.abonnement} 
                onValueChange={(value) => handleSelectChange('abonnement', value)}
              >
                <SelectTrigger id="abonnement">
                  <SelectValue placeholder="Choisir un abonnement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Essentiel">Essentiel</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Performance">Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode_paiement">Mode de Paiement</Label>
              <Select 
                value={formData.mode_paiement} 
                onValueChange={(value) => handleSelectChange('mode_paiement', value)}
              >
                <SelectTrigger id="mode_paiement">
                  <SelectValue placeholder="Choisir un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carte Bancaire">Carte Bancaire</SelectItem>
                  <SelectItem value="Virement">Virement</SelectItem>
                  <SelectItem value="Prélèvement">Prélèvement</SelectItem>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Groupes - Multi-select */}
          <div className="space-y-2">
            <Label>Groupes</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(Array.isArray(formData.groupes) ? formData.groupes : []).map(groupName => (
                <Badge key={groupName} variant="secondary" className="flex items-center gap-1">
                  {groupName}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeGroup(groupName)}
                  />
                </Badge>
              ))}
            </div>
            <Popover open={openGroupes} onOpenChange={setOpenGroupes}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openGroupes}
                  className="w-full justify-between"
                >
                  Choisir des groupes...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un groupe..." />
                  <CommandList>
                    <CommandEmpty>Aucun groupe trouvé.</CommandEmpty>
                    <CommandGroup>
                      {["Groupe A", "Groupe B", "Groupe C"].map((groupName) => (
                        <CommandItem
                          key={groupName}
                          value={groupName}
                          onSelect={() => toggleGroup(groupName)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              (Array.isArray(formData.groupes) ? formData.groupes : []).includes(groupName) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {groupName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sports - Multi-select */}
          <div className="space-y-2">
            <Label>Sports pratiqués</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.sports || []).map(sportValue => {
                const sport = sportsList.find(s => s.value === sportValue)
                return (
                  <Badge key={sportValue} variant="secondary" className="flex items-center gap-1">
                    {sport?.label || sportValue}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeSport(sportValue)}
                    />
                  </Badge>
                )
              })}
            </div>
            <Popover open={openSports} onOpenChange={setOpenSports}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSports}
                  className="w-full justify-between"
                >
                  Choisir des sports...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Rechercher un sport..." />
                  <CommandList>
                    <CommandEmpty>Aucun sport trouvé.</CommandEmpty>
                    <CommandGroup>
                      {sportsList.map((sport) => (
                        <CommandItem
                          key={sport.value}
                          value={sport.value}
                          onSelect={() => toggleSport(sport.value)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              (formData.sports || []).includes(sport.value) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {sport.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Objectifs - Multi-select with custom addition */}
          <div className="space-y-2">
            <Label>Objectifs principaux</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(Array.isArray(formData.objectives) ? formData.objectives : []).map(obj => (
                <Badge key={obj} variant="outline" className="flex items-center gap-1 bg-primary/5">
                  {obj}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => toggleObjective(obj)}
                  />
                </Badge>
              ))}
            </div>
            <Popover open={openObjectives} onOpenChange={setOpenObjectives}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openObjectives}
                  className="w-full justify-between"
                >
                  Ajouter des objectifs...
                  <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput 
                    placeholder="Rechercher ou créer un objectif..." 
                    value={objectiveSearch}
                    onValueChange={setObjectiveSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 h-8 text-xs"
                        onClick={addNewObjective}
                      >
                        <Plus size={14} />
                        Créer "{objectiveSearch}"
                      </Button>
                    </CommandEmpty>
                    <CommandGroup heading="Objectifs suggérés">
                      {predefinedObjectives.map((obj) => (
                        <CommandItem
                          key={obj}
                          value={obj}
                          onSelect={() => toggleObjective(obj)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              (formData.objectives || []).includes(obj) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {obj}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6 mt-6">
          <Button variant="outline" onClick={() => router.push('/athletes')}>Annuler</Button>
          <Button onClick={handleSubmit}>{isCreation ? "Créer l'athlète" : "Sauvegarder les modifications"}</Button>
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
                ? "L'athlète a été enregistré avec succès." 
                : "Le profil a été mis à jour avec succès."}
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
