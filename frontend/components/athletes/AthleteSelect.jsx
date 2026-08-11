"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

/**
 * Composant Client pour sélectionner un athlète.
 * Gère l'état de l'athlète sélectionné et transmet l'ID à un composant parent.
 *
 * @param {Object} props - Props du composant.
 * @param {Array} props.athletes - Liste des athlètes à afficher.
 * @param {Function} props.onAthleteSelect - Callback appelé avec l'ID de l'athlète sélectionné.
 * @param {string|null} props.selectedAthleteId - ID de l'athlète actuellement sélectionné.
 */
export default function AthleteSelect({ athletes, onAthleteSelect, selectedAthleteId }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="athlete">Athlète</Label>
      <Select
        onValueChange={onAthleteSelect}
        value={selectedAthleteId || ""}
      >
        <SelectTrigger id="athlete">
          <SelectValue placeholder="Sélectionner un athlète" />
        </SelectTrigger>
        <SelectContent>
          {athletes.map((athlete) => (
            <SelectItem key={athlete.id} value={athlete.id}>
              {athlete.first_name} {athlete.last_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}