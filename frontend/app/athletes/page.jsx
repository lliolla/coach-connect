'use client'
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { IconSearch, IconUserPlus, IconLoader2, IconTrophy, IconUsers } from "@tabler/icons-react"
import Link from "next/link"
import { toast } from "sonner"

export default function AthletesPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [athletes, setAthletes] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    fetchAthletes()
  }, [])

  const fetchAthletes = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:3001/api/athletes')
      if (!response.ok) throw new Error('Erreur lors de la récupération des athlètes')
      const data = await response.json()
      
      // Generate mock data for subscription and group if they don't exist
      const enrichedData = data.map(athlete => ({
        ...athlete,
        abonnement: athlete.abonnement || ["Essentiel", "Premium", "Performance"][Math.floor(Math.random() * 3)],
        groupe: athlete.groupe || ["Groupe A", "Groupe B", "Groupe C"][Math.floor(Math.random() * 3)]
      }))
      
      setAthletes(enrichedData)
    } catch (error) {
      console.error(error)
      toast.error("Impossible de charger la liste des athlètes")
    } finally {
      setLoading(false)
    }
  }

  const filteredAthletes = athletes.filter(athlete => {
    const fullName = `${athlete.first_name || ''} ${athlete.last_name || ''}`.toLowerCase()
    const email = (athlete.email || '').toLowerCase()
    return fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase())
  })

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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Tous les Athlètes</h1>
            <Button className="gap-2" asChild>
              <Link href="/athletes/new">
                <IconUserPlus size={18} />
                Nouvel Athlète
              </Link>
            </Button>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Rechercher un athlète par nom ou email..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <IconLoader2 className="animate-spin text-primary" size={40} />
              <p className="text-muted-foreground">Chargement des athlètes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAthletes.map((athlete) => (
                <Link key={athlete.id} href={`/athletes/${athlete.id}`}>
                  <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <Avatar className="h-12 w-12 border border-primary/10">
                        <AvatarImage src={athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.first_name || 'default'}`} />
                        <AvatarFallback>{athlete.first_name?.[0]}{athlete.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <CardTitle className="text-lg">
                          {athlete.first_name} {athlete.last_name}
                        </CardTitle>
                        <CardDescription>{athlete.email}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconTrophy size={14} className="text-primary" />
                          <span className="font-medium text-foreground">{athlete.abonnement}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconUsers size={14} className="text-primary" />
                          <span className="font-medium text-foreground">{athlete.groupe}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {athlete.sports && athlete.sports.length > 0 ? (
                          athlete.sports.map(sport => (
                            <Badge key={sport} variant="secondary" className="capitalize text-[10px] px-1.5 py-0">
                              {sport}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Aucun sport renseigné</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredAthletes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun athlète trouvé.</p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
