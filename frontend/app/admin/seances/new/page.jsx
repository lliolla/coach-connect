'use client'
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import CardSeance from "@/components/seance/card_seance"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { getObjectifs } from "@/app/actions/objectifs"

function NewSeanceContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'create'
  const duplicateId = searchParams.get('duplicateId')
  const [objectifs, setObjectifs] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchObjectifs = async () => {
      try {
        setLoading(true)
        const data = await getObjectifs()
        setObjectifs(data || [])
      } catch (error) {
        console.error("Erreur lors de la récupération des objectifs:", error)
        setObjectifs([])
      } finally {
        setLoading(false)
      }
    }
    fetchObjectifs()
  }, [])

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/seances">
            <IconArrowLeft size={18} />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nouvelle séance</h1>
      </div>

      <div className="max-w-4xl mx-auto w-full py-8">
        {loading ? (
          <div className="flex justify-center p-8">Chargement des objectifs...</div>
        ) : (
          <CardSeance
            mode={mode}
            duplicateId={duplicateId}
            isTracking={true}
            objectifs={objectifs}
          />
        )}
      </div>
    </div>
  )
}

export default function NewSeancePage() {
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
          <NewSeanceContent />
        </React.Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
