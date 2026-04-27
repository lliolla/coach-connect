'use client'

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarView } from "@/components/seance/calendar-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  IconZzz, 
  IconBatteryCharging, 
  IconMoodSmile, 
  IconPlus, 
  IconSearch,
  IconCalendarEvent
} from "@tabler/icons-react"

export default function PlanPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

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
          {/* Header Section like Athletes Page */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Plan d'Entraînement</h1>
              <p className="text-muted-foreground text-sm">Gérez les séances et suivez l'état de forme.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/sessions/new">
                <IconPlus size={18} />
                Nouvelle Séance
              </Link>
            </Button>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Rechercher une séance ou un athlète..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Wellness Stats - Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <Card className="border-dashed border-2 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconZzz size={16} className="text-blue-500" /> Sommeil Moyen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7h 45min</div>
                <p className="text-xs text-muted-foreground">+15min par rapport à la semaine dernière</p>
              </CardContent>
            </Card>
            <Card className="border-dashed border-2 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconBatteryCharging size={16} className="text-orange-500" /> Niveau d'Énergie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">Récupération optimale</p>
              </CardContent>
            </Card>
            <Card className="border-dashed border-2 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IconMoodSmile size={16} className="text-green-500" /> État de Forme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Excellent</div>
                <p className="text-xs text-muted-foreground">Basé sur les 5 derniers suivis</p>
              </CardContent>
            </Card>
          </div>

          {/* Calendar and Sessions Section */}
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-4">
              <IconCalendarEvent size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Calendrier des séances</h2>
            </div>
            <CalendarView searchTerm={searchTerm} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
