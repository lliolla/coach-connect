'use client'

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CalendarView } from "@/components/seance/calendar-view"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconZzz, IconBatteryCharging, IconMoodSmile } from "@tabler/icons-react"

export default function SuivisPage() {
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
            <h1 className="text-2xl font-bold">Suivis et Séances</h1>
          </div>

          {/* Wellness Stats - Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <CalendarView />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
