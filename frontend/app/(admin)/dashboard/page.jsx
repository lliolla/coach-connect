'use client'

import * as React from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconArrowRight, IconActivity } from "@tabler/icons-react"
import Link from "next/link"
import { getAthletes } from "@/app/actions/athletes"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"

export default function DashboardPage() {
  const [athletes, setAthletes] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAthletes()
        setAthletes(data || [])
      } catch (error) {
        console.error("Erreur stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

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
          {/* 1. Les cartes de statistiques rapides */}
          <SectionCards />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* 2. Le graphique (prend 4 colonnes) */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Activité des entraînements</CardTitle>
                <CardDescription>Volume de travail cumulé sur les 30 derniers jours.</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartAreaInteractive />
              </CardContent>
            </Card>

            {/* 3. Derniers Athlètes inscrits (prend 3 colonnes) */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Nouveaux Athlètes</CardTitle>
                    <CardDescription>{athletes.length} athlètes au total.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/users">
                      <IconArrowRight size={20} />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {athletes.slice(0, 5).map((athlete) => (
                  <div key={athlete.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${athlete.email}`} />
                        <AvatarFallback>{athlete.first_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5">
                        <p className="text-sm font-medium leading-none">
                          {athlete.first_name} {athlete.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{athlete.email}</p>
                      </div>
                    </div>
                    {athlete.admin && <Badge variant="secondary">Admin</Badge>}
                  </div>
                ))}
                {loading && <p className="text-sm text-center text-muted-foreground italic">Chargement...</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}