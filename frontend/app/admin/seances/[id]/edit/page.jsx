'use client'

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconLoader2 } from "@tabler/icons-react";
import Link from "next/link";
import { CardSeance } from "@/components/seance/card_seance";
import { getSessionById, updateSession } from "@/app/actions/sessions";
import { getObjectifs } from "@/app/actions/objectifs";
import { toast } from "sonner";

export default function EditSeancePage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [seanceData, setSeanceData] = React.useState(null);
  const [objectifs, setObjectifs] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sessionResult = await getSessionById(id);
        const objectifsResult = await getObjectifs();
        
        if (!sessionResult || !sessionResult.id) {
          throw new Error('Séance non trouvée');
        }
        
        const adaptedSeanceData = {
          ...sessionResult,
          date: sessionResult.date ? new Date(sessionResult.date) : new Date(),
          title: sessionResult.title || '',
          description: sessionResult.description || '',
          duration: sessionResult.duration || 60,
          status: sessionResult.status || 'en attente',
          objectif_id: sessionResult.objectif_id || null,
          is_template: sessionResult.is_template || false,
        };
        
        setSeanceData(adaptedSeanceData);
        setObjectifs(objectifsResult || []);
      } catch (error) {
        console.error('Erreur dans fetchData:', error);
        toast.error(error.message);
        router.push('/admin/seances');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleSubmit = async (formData) => {
    const adaptedData = {
      ...formData,
      id: id,
      duration: parseInt(formData.duration) || 60,
      main_rounds: parseInt(formData.main_rounds) || 1,
      is_template: formData.is_template || false,
      objectif_id: formData.objectif_id || null
    };

    try {
      const result = await updateSession(id, adaptedData);
      if (result && result.success) {
        toast.success('Séance mise à jour avec succès', {
          duration: 2000,
          onAutoClose: () => {
            router.refresh();
            router.push('/admin/seances');
          }
        });
      } else {
        toast.error(result?.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur dans handleSubmit:', error);
      toast.error('Une erreur est survenue');
    }
  };

  if (loading) {
    return (
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)"
        }}>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center py-20 gap-4">
            <IconLoader2 className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground">Chargement des données...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!seanceData) {
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
                <Link href="/admin/seances">
                  <IconArrowLeft size={18} />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Séance non trouvée</h1>
            </div>
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <p className="text-muted-foreground">La séance avec l'ID {id} n'existe pas ou n'est pas accessible.</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/seances">Retour à la liste</Link>
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
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
              <Link href="/admin/seances">
                <IconArrowLeft size={18} />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Modifier la séance</h1>
          </div>
          <div className="max-w-4xl mx-auto w-full py-8">
            <CardSeance
  mode="edit"
  seanceId={id}
/>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}