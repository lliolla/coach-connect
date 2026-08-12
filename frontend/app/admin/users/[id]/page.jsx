'use client'

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconLoader2, IconArrowLeft, IconTarget, IconCalendar, IconClock, IconCheck, IconX, IconAlertCircle, IconPlus, IconPencil, IconChevronDown, IconChevronUp, IconPaperPlane, IconSend } from "@tabler/icons-react"
import { toast } from "sonner"
import { getAthleteWithObjectifsAndSessions } from "@/app/actions/admin-athletes"
import { deleteSession } from "@/app/actions/sessions"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ProgramTable from "@/components/seance/programTable"
import CollapsibleCard from "@/components/ui/collapsible-card"
import { transmitSession } from "@/app/actions/sessions"



export default function AthleteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = params.id

  const [athleteData, setAthleteData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedObjectifs, setExpandedObjectifs] = React.useState({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false)
  const [sessionToDelete, setSessionToDelete] = React.useState(null)
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)
  const [showMaxSessionsModal, setShowMaxSessionsModal] = React.useState(false)
  const [objectifWithMaxSessions, setObjectifWithMaxSessions] = React.useState(null)

  React.useEffect(() => {
    if (athleteId) {
      fetchAthleteData()
    }
  }, [athleteId])

  const fetchAthleteData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getAthleteWithObjectifsAndSessions(athleteId)

      if (!result.success) {
        throw new Error(result.error || 'Impossible de charger les données')
      }

      setAthleteData(result.data)
    } catch (err) {
      console.error(err)
      setError(err.message)
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'transmis':
        return <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">Transmis</Badge>
      case 'en attente':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-0">En attente</Badge>
      case 'prévu':
        return <Badge variant="outline" className="text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">Prévu</Badge>
      default:
        return <Badge variant="secondary">{status || 'Inconnu'}</Badge>
    }
  }

  const openDeleteConfirm = (session) => {
    setSessionToDelete(session)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return
    const loadingToast = toast.loading("Suppression en cours...")
    try {
      const result = await deleteSession(sessionToDelete.id)
      if (result.success) {
        toast.dismiss(loadingToast)
        setDeleteConfirmOpen(false)
        setShowSuccessModal(true)
        fetchAthleteData() // Rafraîchir les données
        setTimeout(() => {
          setShowSuccessModal(false)
          setSessionToDelete(null)
        }, 2000)
      } else {
        toast.error(result.error || "Erreur lors de la suppression", { id: loadingToast })
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression", { id: loadingToast })
    }
  }

  const getProgressionColor = (percentage) => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getRealisationIcon = (realisation) => {
    switch (realisation) {
      case 'complet':
        return <IconCheck className="text-green-500" size={18} />
      case 'non réalisé':
        return <IconX className="text-red-500" size={18} />
      case 'en cours':
        return <IconClock className="text-yellow-500" size={18} />
      default:
        return <IconClock className="text-muted-foreground" size={18} />
    }
  }

  const toggleObjectif = (objectifId) => {
    setExpandedObjectifs(prev => ({
      ...prev,
      [objectifId]: !prev[objectifId]
    }))
  }

  // Debug: afficher les données brutes
  React.useEffect(() => {
    if (athleteData) {
      console.log("Données de l'athlète:", athleteData)
      console.log("Nombre d'objectifs:", athleteData.objectifs.length)
      athleteData.objectifs.forEach((obj, index) => {
        console.log(`Objectif ${index + 1}: ID=${obj.id}, ${obj.label}, sessions:`, obj.sessions?.length || 0)
      })
    }
  }, [athleteData])

  // Filtrer les objectifs par terme de recherche
  const filteredObjectifs = React.useMemo(() => {
    if (!athleteData?.objectifs) return []

    return athleteData.objectifs.filter(obj => {
      const label = (obj.label || '').toLowerCase()
      const description = (obj.description || '').toLowerCase()
      const sessionsMatch = obj.sessions?.some(s =>
        (s.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      )

      return label.includes(searchTerm.toLowerCase()) ||
             description.includes(searchTerm.toLowerCase()) ||
             sessionsMatch
    })
  }, [athleteData?.objectifs, searchTerm])

  // Calculer les stats globales
  const globalStats = React.useMemo(() => {
    if (!athleteData) return { total: 0, transmis: 0, en_attente: 0, prevu: 0 }

    let total = 0
    let transmis = 0
    let en_attente = 0
    let prevu = 0

    athleteData.objectifs.forEach(obj => {
      obj.sessions?.forEach(s => {
        total++
        switch (s.status) {
          case 'transmis': transmis++; break
          case 'en attente': en_attente++; break
          case 'prévu': prevu++; break
        }
      })
    })

    return { total, transmis, en_attente, prevu }
  }, [athleteData])

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center py-20 gap-4">
            <IconLoader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (error || !athleteData) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="page-content flex flex-1 flex-col gap-6 p-8 bg-white">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild className="h-8 w-8">
                <Link href="/admin/users">
                  <IconArrowLeft size={18} />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Athlète introuvable</h1>
                <p className="text-muted-foreground text-sm">L'athlète demandé n'existe pas.</p>
              </div>
            </div>
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground font-medium">{error || 'Athlète introuvable'}</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/users">Retour à la liste</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header Athlète */}
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild className="h-8 w-8 flex-shrink-0">
              <Link href="/admin/users">
                <IconArrowLeft size={18} />
              </Link>
            </Button>
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-sm">
                <AvatarImage
                  src={athleteData.athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athleteData.athlete.first_name || 'default'}`}
                />
                <AvatarFallback className="text-lg font-bold">
                  {athleteData.athlete.first_name?.[0]}{athleteData.athlete.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {athleteData.athlete.first_name} {athleteData.athlete.last_name}
                  </h1>
                  {athleteData.athlete.groupes?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {athleteData.athlete.groupes.map(g => (
                        <Badge key={g} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                          {g}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <IconCalendar size={14} className="text-muted-foreground" />
                    {athleteData.totalObjectifs} objectif{athleteData.totalObjectifs > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {athleteData.athlete.abonnement && (
                      <>
                        <span className="text-primary">●</span>
                        {athleteData.athlete.abonnement}
                      </>
                    )}
                  </span>
                  <span className="truncate max-w-xs">{athleteData.athlete.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Séances Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{globalStats.total}</div>
                <CardDescription>toutes séances confondues</CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Transmises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{globalStats.transmis}</div>
                <CardDescription>séances envoyées</CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">En attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{globalStats.en_attente}</div>
                <CardDescription>en attente de transmission</CardDescription>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">Objectifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{athleteData.totalObjectifs}</div>
                <CardDescription>objectifs actifs</CardDescription>
              </CardContent>
            </Card>
          </div>

          <Separator className="my-4" />

          {/* Recherche */}
          <div className="relative max-w-md">
            <IconLoader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher dans les objectifs et séances..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Section Objectifs */}
          <div className="mt-4">
            <div className="section-header flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <IconTarget size={20} className="text-primary" />
                <h2 className="section-title text-xl font-bold text-gray-900">
                  Objectifs ({filteredObjectifs.length} / {athleteData.objectifs.length})
                </h2>
              </div>
              <Button className="btn-add-objective bg-black text-white rounded-md px-4 py-2 hover:bg-gray-800 transition-colors" asChild>
                <Link href={`/admin/objectifs/new?athlete_id=${athleteId}`}>
                  + Ajouter un objectif
                </Link>
              </Button>
            </div>

            {filteredObjectifs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl bg-gray-50">
                <p className="text-muted-foreground font-medium">Aucun objectif trouvé.</p>
                <p className="text-sm text-muted-foreground/60">
                  {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Cet athlète n\'a pas encore d\'objectifs.'}
                </p>
              </div>
            ) : (
              <CollapsibleCard
                items={filteredObjectifs}
                renderHeader={(objectif) => (
                  <div className="flex items-center gap-4 w-full">
                    <IconTarget size={20} className="text-primary flex-shrink-0" />
                    <div className="objective-info flex-1 min-w-0">
                      <h3 className="objective-title text-lg truncate text-black capitalize">{objectif.label}</h3>
                      {objectif.description && (
                        <p className="text-sm text-muted-foreground truncate">{objectif.description}</p>
                      )}
                    </div>
                    <div className="objective-progress flex items-center gap-4">
                      <Badge className="seance-badge text-gray-700 bg-gray-200 px-3 py-1 font-bold">
                        {objectif.progression.display}
                      </Badge>
                      {objectif.duree && (
                        <span className="text-sm text-muted-foreground">
                          ({objectif.duree} semaines)
                        </span>
                      )}
                    </div>
                  </div>
                )}
                renderContent={(objectif) => {
                  // Vérifier que les sessions existent et sont un tableau
                  const sessions = objectif.sessions || []
                  
                  // Debug: afficher le nombre de sessions
                  console.log(`Objectif "${objectif.label}" a ${sessions.length} sessions`)
                  
                  // Mapper les sessions au format attendu par ProgramTable
                  const programsForTable = sessions.map(session => ({
                    id: session.id,
                    programName: session.title,
                    description: session.description,
                    status: session.status,
                    personName: `${athleteData.athlete.first_name} ${athleteData.athlete.last_name}`,
                    athleteId: athleteData.athlete.id,
                    numberOfExercises: session.session_exercises?.length || 0,
                    rawObjectif: objectif,
                    objectifName: objectif.label,
                    date: session.date,
                    duration: session.duration,
                    realisation: session.realisation || "",
                    exercises: session.session_exercises?.map(se => ({
                      name: se.exercise?.name || se.exercices_library?.name || "Exercice"
                    })) || [],
                  }))

                  // Debug: afficher le nombre de programmes mappés
                  console.log(`Objectif "${objectif.label}" a ${programsForTable.length} programmes mappés`)

                  return (
                    <div className="sessions-table-container p-4">
                      <div className="flex justify-end mb-4">
                        <Button className="gap-2" 
                          onClick={(e) => {
                            const existingSessionsCount = objectif.sessions?.length || 0
                            const totalSessions = objectif.total_sessions || 0
                            console.log(`[Bouton Nouvelle séance] objectif.id=${objectif.id}, label=${objectif.label}, sessions=${existingSessionsCount}/${totalSessions}`)
                            if (totalSessions > 0 && existingSessionsCount >= totalSessions) {
                              e.preventDefault()
                              setObjectifWithMaxSessions(objectif)
                              setShowMaxSessionsModal(true)
                            } else {
                              router.push(`/admin/seances/new?objectif_id=${objectif.id}&athlete_id=${athleteId}`)
                            }
                          }}
                        >
                          <IconPlus size={18} />
                          Nouvelle séance
                        </Button>
                      </div>
                      
                      {programsForTable.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>Aucune séance pour cet objectif</p>
                        </div>
                      ) : (
                        <ProgramTable
                          programs={programsForTable}
                          onDelete={openDeleteConfirm}
                          context="athlete-seances"
                          showRealisation={true}
                        />
                      )}
                    </div>
                  )
                }}
                itemClassName="objective-card"
                triggerClassName="objective-header hover:bg-gray-50 transition-colors py-4"
                contentClassName="border-t border-gray-200"
              />
            )}
          </div>
          
          {/* Modal de confirmation de suppression */}
          <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <IconAlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
                <DialogDescription className="text-base py-2">
                  Êtes-vous sûr de vouloir supprimer la séance <strong>{sessionToDelete?.title}</strong> ? Cette action est irréversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} className="flex-1 sm:flex-none">
                  Annuler
                </Button>
                <Button variant="destructive" onClick={handleDeleteSession} className="flex-1 sm:flex-none">
                  Supprimer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de limite de séances atteinte */}
          <Dialog open={showMaxSessionsModal} onOpenChange={setShowMaxSessionsModal}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
              <DialogHeader className="flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <IconAlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <DialogTitle className="text-xl">Limite de séances atteinte</DialogTitle>
                <DialogDescription className="text-base py-2">
                  {objectifWithMaxSessions && (
                    `Vous avez atteint le nombre maximal de séances (${objectifWithMaxSessions.total_sessions || 0}) pour l'objectif "${objectifWithMaxSessions.label}".`
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex sm:justify-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowMaxSessionsModal(false)
                    setObjectifWithMaxSessions(null)
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => {
                    setShowMaxSessionsModal(false)
                    if (objectifWithMaxSessions) {
                      router.push(`/admin/objectifs/${objectifWithMaxSessions.id}?mode=edit`)
                    }
                    setObjectifWithMaxSessions(null)
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Modifier l'objectif
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal de succès */}
          <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
              <DialogHeader className="flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <IconCheck className="h-6 w-6 text-green-600" />
                </div>
                <DialogTitle className="text-xl">Suppression réussie</DialogTitle>
                <DialogDescription className="text-base py-2">
                  La séance a été supprimée avec succès.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
