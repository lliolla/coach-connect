"use client";

import { useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function SessionFilters({ onFilterChange }) {
  const [search, setSearch] = useState("");
  const [athlete, setAthlete] = useState("");
  const [status, setStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const hasFilters = athlete || status;

  const clearFilters = () => {
    setAthlete("");
    setStatus("");
    setShowFilters(false);
    onFilterChange({ search, athlete: "", status: "" });
  };

  const handleChange = (key, value) => {
    const filters = { search, athlete: key === "athlete" ? value : athlete, status: key === "status" ? value : status };
    if (key === "search") {
      setSearch(value);
      filters.search = value;
    } else if (key === "athlete") {
      setAthlete(value);
    } else {
      setStatus(value);
    }
    onFilterChange(filters);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background border rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une séance..."
            className="pl-8"
            value={search}
            onChange={(e) => handleChange("search", e.target.value)}
          />
        </div>
        
        <Button 
          variant={showFilters ? "secondary" : "outline"} 
          size="icon" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-2 border-t pt-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Select value={athlete} onValueChange={(v) => handleChange("athlete", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Athlète" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="athlete1">Athlète 1</SelectItem>
                <SelectItem value="athlete2">Athlète 2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={(v) => handleChange("status", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="sent">Transmis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="text-muted-foreground shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
