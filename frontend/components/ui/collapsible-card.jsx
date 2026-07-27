import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "./accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react"

// Custom AccordionTrigger without chevron icon
const CustomAccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
CustomAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName

export const CollapsibleCard = ({
  items,
  renderHeader,
  renderContent,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <Accordion type="multiple" className="w-full">
        {items.map((item, index) => (
          <AccordionItem 
            key={item.id || index}
            value={item.id || `item-${index}`}
            className={cn("rounded-xl border shadow-sm bg-card overflow-hidden mb-4", itemClassName)}
          >
            <CustomAccordionTrigger className={cn("px-6 py-4 text-left text-xs text-black hover:bg-muted/50 transition-colors capitalize", triggerClassName)}>
              {renderHeader ? renderHeader(item) : (
                <div className="flex items-center gap-4 w-full">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate text-black">{item.label || item.title || `Item ${index + 1}`}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                    )}
                  </div>
                </div>
              )}
            </CustomAccordionTrigger>
            <AccordionContent className={cn("bg-transparent divide-y divide-border px-6 py-4", contentClassName)}>
              {renderContent ? renderContent(item) : (
                <div className="p-4 bg-gray-50 rounded">
                  <p>Contenu par défaut pour {item.label || item.title || `Item ${index + 1}`}</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default CollapsibleCard;