// frontend/app/admin/objectifs/[id]/page.jsx
import { getObjectifById } from '@/app/actions/objectifs'
import { notFound } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import CardObjectif from "@/components/objectifs/CardObjectif"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

export default async function ObjectifPage({ params }) {
    // Déballage correct de params
  const { id } = params

  // Récupération de l'objectif avec les informations supplémentaires
  const objectif = await getObjectifById(id)

  // Gestion des erreurs
  if (!objectif) {
    notFound()
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
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/admin/users/${objectif.athlete_id}`}>
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Modifier l'objectif</h1>
          </div>

          <CardObjectif
            objectif={objectif}
            mode="edit"
            athleteId={objectif.athlete_id} // Passage de l'ID de l'athlète
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}