import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { Activity, Clock, TrendingUp, Calendar } from "lucide-react"

export default function StatsPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          <h1 className="text-3xl font-bold">Mes Statistiques</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Séance" value="48" icon={Activity} />
            <StatsCard title="Temps Total" value="124h" icon={Clock} />
            <StatsCard title="Progression VMA" value="+1.2 km/h" icon={TrendingUp} />
            <StatsCard title="Fréquence/sem" value="4.2" icon={Calendar} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Volume d'entraînement</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartAreaInteractive />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Répartition par sport</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Running</span><span className="font-bold">60%</span></div>
                  <div className="h-2 bg-secondary rounded-full"><div className="h-full bg-primary w-[60%] rounded-full" /></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Cyclisme</span><span className="font-bold">30%</span></div>
                  <div className="h-2 bg-secondary rounded-full"><div className="h-full bg-primary w-[30%] rounded-full" /></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span>Natation</span><span className="font-bold">10%</span></div>
                  <div className="h-2 bg-secondary rounded-full"><div className="h-full bg-primary w-[10%] rounded-full" /></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function StatsCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
