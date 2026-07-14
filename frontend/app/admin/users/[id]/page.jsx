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
import { IconLoader2, IconArrowLeft, IconTarget, IconCalendar, IconClock, IconCheck, IconX, IconAlertCircle, IconPlus, IconPencil, IconChevronDown, IconChevronUp, IconPaperPlane, IconSend } from "@tabler/icons-react"
import { toast } from "sonner"
import { getAthleteWithObjectifsAndSessions } from "@/app/actions/admin-athletes"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function AthleteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const athleteId = params.id

  const [athleteData, setAthleteData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [expandedObjectifs, setExpandedObjectifs] = React.useState({})

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
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconTarget size={20} className="text-primary" />
                <h2 className="text-lg font-semibold">
                  Objectifs ({filteredObjectifs.length} / {athleteData.objectifs.length})
                </h2>
              </div>
              <Button className="gap-2" asChild>
                <Link href={`/admin/objectifs/new?athlete_id=${athleteId}`}>
                  <IconPlus size={18} />
                  Ajouter un objectif
                </Link>
              </Button>
            </div>

            {filteredObjectifs.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <IconTarget className="mx-auto h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground font-medium">Aucun objectif trouvé.</p>
                <p className="text-sm text-muted-foreground/60">
                  {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Cet athlète n\'a pas encore d\'objectifs.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Accordion type="multiple" value={Object.keys(expandedObjectifs).filter(id => expandedObjectifs[id])} onValueChange={(value) => {
                  const newExpanded = {}
                  value.forEach(id => newExpanded[id] = true)
                  setExpandedObjectifs(newExpanded)
                }}>
                  {filteredObjectifs.map((objectif) => (
                    <AccordionItem key={objectif.id} value={objectif.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-4 w-full">
                          <IconTarget size={20} className="text-primary flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-lg truncate">{objectif.label}</div>
                            {objectif.description && (
                              <div className="text-sm text-muted-foreground truncate">{objectif.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                              <Badge
                                className={`text-white font-bold px-3 py-1 ${getProgressionColor(objectif.progression.percentage)}`}
                              >
                                {objectif.progression.display}
                              </Badge>
                              {objectif.weeksCount && (
                                <span className="text-sm text-muted-foreground mt-1">
                                  ({objectif.weeksCount} semaines)
                                </span>
                              )}
                            </div>
                            <div className="text-2xl font-bold text-muted-foreground">
                              {objectif.progression.current}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              sur {objectif.progression.total} séances
                            </div>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${getProgressionColor(objectif.progression.percentage)} transition-all duration-300`}
                                style={{ width: `${objectif.progression.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="rounded-xl border shadow-sm bg-card overflow-hidden mt-2">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[200px]">Titre</TableHead>
                                  <TableHead>Description</TableHead>
                                  <TableHead className="w-[150px]">Progression</TableHead>
                                  <TableHead className="w-[120px]">Transmission</TableHead>
                                  <TableHead className="w-[150px]">Réalisé</TableHead>
                                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {objectif.sessions.map((session) => (
                                  <TableRow key={session.id}>
                                    <TableCell className="font-medium">{session.title}</TableCell>
                                    <TableCell>{session.description || '-'}</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <div className="text-sm text-muted-foreground">
                                          {session.rank}
                                        </div>
                                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${getProgressionColor(session.progression.percentage)} transition-all duration-300`}
                                            style={{ width: `${session.progression.percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {getStatusBadge(session.status)}
                                    </TableCell>
                                    <TableCell>
                                      <Select defaultValue={session.realisation || 'en cours'}>
                                        <SelectTrigger className="w-[120px]">
                                          <SelectValue placeholder="Réalisé" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="complet">
                                            <div className="flex items-center gap-2">
                                              <IconCheck className="text-green-500" size={18} />
                                              <span>Complet</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="non réalisé">
                                            <div className="flex items-center gap-2">
                                              <IconX className="text-red-500" size={18} />
                                              <span>Non réalisé</span>
                                            </div>
                                          </SelectItem>
                                          <SelectItem value="en cours">
                                            <div className="flex items-center gap-2">
                                              <IconClock className="text-yellow-500" size={18} />
                                              <span>En cours</span>
                                            </div>
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                          asChild
                                          title="Voir la séance"
                                        >
                                          <Link href={`/admin/seances/${session.id}`}>
                                            <IconArrowLeft size={14} className="transform rotate-180" />
                                          </Link>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                          title="Transmettre la séance"
                                        >
                                          <IconSend size={14} />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
