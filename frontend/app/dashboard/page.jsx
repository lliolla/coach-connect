'use client'

import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconActivity } from "@tabler/icons-react"
import Link from "next/link"
import { getAthletes } from "@/app/actions/athletes"

export default function DashboardPage() {
  const [recentAthletes, setRecentAthletes] = React.useState([])

  React.useEffect(() => {
    fetchRecentAthletes()
  }, [])

  const fetchRecentAthletes = async () => {
    try {
      const athletes = await getAthletes()
      setRecentAthletes(athletes.slice(0, 5))
    } catch (error) {
      console.error(error)
    }
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
          <h1 className="text-2xl font-bold px-2">Tableau de bord</h1>
          
          {/* Stats Cards Row */}
          <SectionCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Activity Chart */}
            <div className="lg:col-span-2">
              <ChartAreaInteractive />
            </div>

            {/* Recent Athletes List */}
            <Card className="border-dashed border-2 shadow-none flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Dernières Activités</CardTitle>
                  <CardDescription>Athlètes récemment actifs</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/athletes">Voir tout</Link>
                </Button>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-6">
                  {recentAthletes.length > 0 ? (
                    recentAthletes.map((athlete) => (
                      <div key={athlete.id} className="flex items-center gap-4 group">
                        <Avatar className="h-10 w-10 border border-primary/10">
                          <AvatarImage src={athlete.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.first_name}`} />
                          <AvatarFallback>{athlete.first_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {athlete.first_name} {athlete.last_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">{athlete.abonnement}</Badge>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <IconActivity size={10} /> Dernière séance hier
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                          <Link href={`/athletes/${athlete.id}`}><IconArrowRight size={16} /></Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-8">Aucune activité récente.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
