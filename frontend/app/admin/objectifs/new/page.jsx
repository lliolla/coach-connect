'use client'
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { CardObjectif } from "@/components/objectifs/CardObjectif"
import { getAthletes } from "@/app/actions/athletes"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

function NewObjectifContent() {
  const searchParams = useSearchParams()
  const athleteId = searchParams.get('athlete_id')
  const [selectedAthleteId, setSelectedAthleteId] = React.useState(athleteId || "all")
  const [availableAthletes, setAvailableAthletes] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  const fetchAthletes = async () => {
    try {
      setLoading(true)
      const athletesData = await getAthletes()
      setAvailableAthletes(athletesData || [])
    } catch (error) {
      console.error("Erreur fetch athletes:", error)
      toast.error("Impossible de charger les athlètes")
      setAvailableAthletes([])
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchAthletes()
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/objectifs">
            <IconArrowLeft size={18} />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nouvel objectif</h1>
      </div>

      <div className="max-w-4xl mx-auto w-full py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">Athlète</Label>
          </div>
          <Select
            value={selectedAthleteId}
            onValueChange={setSelectedAthleteId}
            disabled={loading}
          >
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder={loading ? "Chargement..." : "Sélectionner un athlète"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les athlètes</SelectItem>
              {availableAthletes.map(a => (
                <SelectItem key={a.id} value={a.id.toString()}>
                  {a.first_name} {a.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CardObjectif
          mode="create"
          athleteId={selectedAthleteId !== "all" ? selectedAthleteId : null}
        />
      </div>
    </div>
  )
}

export default function NewObjectifPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <React.Suspense fallback={<div className="flex justify-center p-8">Chargement...</div>}>
          <NewObjectifContent />
        </React.Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
