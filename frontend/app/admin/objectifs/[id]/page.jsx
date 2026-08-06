'use client'

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
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
import { getObjectifById, updateObjectif } from "@/app/actions/objectifs"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ObjectifPage() {
  const router = useRouter()
  const { id } = useParams()

  const [objectif, setObjectif] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [newTotalSessions, setNewTotalSessions] = React.useState("")

  React.useEffect(() => {
    if (!id) return

    const fetchObjectif = async () => {
      try {
        setLoading(true)

        const data = await getObjectifById(id)

        if (!data) {
          throw new Error("Objectif introuvable")
        }

        setObjectif(data)
        setNewTotalSessions(String(data.total_sessions ?? ""))
      } catch (error) {
        console.error(error)
        toast.error(error.message || "Impossible de charger l'objectif")
        router.push("/admin/objectifs")
      } finally {
        setLoading(false)
      }
    }

    fetchObjectif()
  }, [id, router])

  const handleEditTotalSessions = async () => {
    if (!objectif) return

    const total = parseInt(newTotalSessions)

    if (isNaN(total) || total < 1) {
      toast.error("Veuillez entrer un nombre valide de séances")
      return
    }

    const loadingToast = toast.loading("Mise à jour en cours...")

    try {
      const result = await updateObjectif({
        id: objectif.id,
        total_sessions: total,
      })

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour")
      }

      setObjectif((prev) => ({
        ...prev,
        total_sessions: total,
      }))

      toast.dismiss(loadingToast)
      toast.success("Nombre de séances mis à jour avec succès")
      setEditModalOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(error.message, { id: loadingToast })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!objectif) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Objectif non trouvé</p>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/objectifs">
                <IconArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <h1 className="text-2xl font-bold">
              Détails de l'objectif
            </h1>
          </div>

          <CardObjectif
            objectif={objectif}
            onEdit={() => setEditModalOpen(true)}
          />
        </div>
      </SidebarInset>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Modifier le nombre de séances
            </DialogTitle>

            <DialogDescription>
              Modifiez le nombre total de séances pour cet objectif.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor="totalSessions"
                className="text-right"
              >
                Total séances
              </Label>

              <Input
                id="totalSessions"
                type="number"
                min="1"
                value={newTotalSessions}
                onChange={(e) =>
                  setNewTotalSessions(e.target.value)
                }
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditModalOpen(false)}
            >
              Annuler
            </Button>

            <Button onClick={handleEditTotalSessions}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}