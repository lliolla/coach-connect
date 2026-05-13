import * as React from "react"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Target, CheckCircle2 } from "lucide-react"

const mockObjectives = [
  { id: 1, title: "Marathon de Paris", status: "in-progress", progress: 65, description: "Préparation spécifique marathon" },
  { id: 2, title: "Amélioration VMA", status: "completed", progress: 100, description: "Atteindre 18km/h" },
  { id: 3, title: "Ironman 70.3", status: "not-started", progress: 0, description: "Projet fin de saison" },
]

export default function MesObjectifsPage() {
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
          <h1 className="text-3xl font-bold">Mes Objectifs</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockObjectives.map((obj) => (
              <Card key={obj.id} className={obj.status === 'completed' ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {obj.status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <Target className="h-6 w-6 text-muted-foreground" />
                    )}
                    <CardTitle>{obj.title}</CardTitle>
                  </div>
                  <CardDescription>{obj.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progression</span>
                      <span>{obj.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${obj.progress}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
