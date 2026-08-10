// frontend/components/seance/calendar-view.jsx
'use client'

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconActivity, IconClock, IconUser } from "@tabler/icons-react"
import Link from "next/link"

export function CalendarView({ sessions = [], searchTerm = "", basePath = "" }) {
  const [date, setDate] = React.useState(new Date())

  // Filtrer les sessions réelles (pas les modèles) et trier par session_number
  const realSessions = React.useMemo(() => {
    return sessions
      .filter(s => s.is_template !== true && s.is_template !== "true")
      .sort((a, b) => (a.session_number || 0) - (b.session_number || 0));
  }, [sessions])

  const filteredSessions = React.useMemo(() => {
    if (!searchTerm) return realSessions;
    const lowerSearch = searchTerm.toLowerCase();
    return realSessions.filter(s => {
      const athleteName = s.athletes ? `${s.athletes.first_name} ${s.athletes.last_name}`.toLowerCase() : "";
      return s.title.toLowerCase().includes(lowerSearch) || athleteName.includes(lowerSearch);
    });
  }, [realSessions, searchTerm])

  const sessionsForSelectedDate = filteredSessions.filter(
    (s) => {
        if (!s.date) return false;
        const sessionDate = new Date(s.date);
        return sessionDate.toDateString() === date?.toDateString();
    }
  )

  const formatDuration = (minutes) => {
    if (!minutes) return "0min"
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h${remainingMinutes}` : `${hours}h`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border-dashed border-2 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg">Calendrier</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center p-0 pb-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border-none"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-dashed border-2 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Séances du {date?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            <Badge variant="secondary">{sessionsForSelectedDate.length} séance(s)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessionsForSelectedDate.length > 0 ? (
            sessionsForSelectedDate.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <IconActivity size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="font-semibold">{session.title}</p>
                        {session.objectif && session.session_number && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1">
                            Séance {session.session_number} / {session.objectif.total_sessions}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] h-4 px-1 flex items-center gap-1 border-primary/20 text-primary bg-primary/5">
                            <IconUser size={10} />
                            {session.athletes ? `${session.athletes.first_name} ${session.athletes.last_name?.charAt(0)}.` : 'Inconnu'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><IconClock size={12} /> {formatDuration(session.duration)}</span>
                      <span className="text-[10px] opacity-30">•</span>
                      <span className="text-[10px]">{session.session_exercises?.length || 0} exercices</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`${basePath}/modeles/${session.id}?mode=view&context=seances`}>Détails</Link>
                </Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <IconActivity size={40} className="opacity-20 mb-2" />
              <p className="italic">Aucune séance planifiée pour ce jour.</p>
              <Button variant="link" size="sm" className="mt-2" asChild>
                <Link href={`${basePath}/seances/new`}>+ Ajouter une séance</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
