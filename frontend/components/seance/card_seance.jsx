
 'use client'
 import * as React from "react"
import {
  Card,
  CardAction,
  CardContent,

  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const types = [
  {
    value: "course",
    label: "Course",
  },
  {
    value: "vélo",
    label: "Vélo",
  },

]

export const CardSeance = () => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
   <Card>
  <CardHeader>
    <CardTitle>Créer une seance</CardTitle>
  
    <CardAction>
       <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button>quitter</Button>
    </div>
    </CardAction>
  </CardHeader>
  <CardContent>
    <div className="group-block p-2">
      <h2>periode</h2>
git remote -v
    </div>
    <div className="group-date p-2">
   <h2 m-1>date</h2>
      <input type="date" /> 
       </div> 
     
 <div className="group-type p-2">
 <h2 m-1 >Type de seance</h2>
  <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? types.find((type) => type.value === value)?.label
            : "Choisir un type..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search type..." className="h-9" />
          <CommandList>
            <CommandEmpty>cette séance n'existe pas </CommandEmpty>
            <CommandGroup>
              {types.map((type) => (
                <CommandItem
                  key={type.value}
                  value={type.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                >
                  {type.label}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === type.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
   </div>
 <div className="group-km p-2">
  <h2>nb de km</h2>
 </div>
  <div className="group-repetition p-2">
      <h2>nb de repetition</h2>
  </div>
 <div className="group-difficult p-2">
    <h2>difficulté</h2>
 </div>
 <div className="group-duree p-2">
    <h2>durée exercice </h2>
 </div>
 <div className="group-description p-2">
    <h2>Commentaire du coach</h2>
 </div>
 
 
  </CardContent>
  <CardFooter>
    
<Button>Valider</Button>
  </CardFooter>
</Card>
  );
};
