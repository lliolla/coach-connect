'use client'

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconActivity, IconClock } from "@tabler/icons-react"

const mockSessions = [
  { id: 1, date: new Date(), title: "Sortie Endurance", type: "Running", duration: "1h30" },
  { id: 2, date: new Date(new Date().setDate(new Date().getDate() + 1)), title: "Fractionné", type: "Running", duration: "45min" },
  { id: 3, date: new Date(new Date().setDate(new Date().getDate() - 2)), title: "Sortie Longue", type: "VTT", duration: "3h00" },
]

export function CalendarView() {
  const [date, setDate] = React.useState(new Date())

  const sessionsForSelectedDate = mockSessions.filter(
    (s) => s.date.toDateString() === date?.toDateString()
  )

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
                    <p className="font-semibold">{session.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] h-5">{session.type}</Badge>
                      <span className="flex items-center gap-1"><IconClock size={12} /> {session.duration}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Détails</Button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <IconActivity size={40} className="opacity-20 mb-2" />
              <p className="italic">Aucune séance planifiée pour ce jour.</p>
              <Button variant="link" size="sm" className="mt-2">+ Ajouter une séance</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
