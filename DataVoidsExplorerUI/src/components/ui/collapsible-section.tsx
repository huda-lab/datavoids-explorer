import React, { FC, ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card } from "./card";

interface CollapsibleSectionProps {
  title: string | ReactNode;
  description?: string;
  children: ReactNode;
  wrapToCard: boolean;
}

export const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  description,
  wrapToCard,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col p-4"
    >
      <CollapsibleTrigger asChild>
        <div className="flex w-full flex-row items-center gap-2">
          <div className="w-4 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </div>
          <h2 className="cursor-pointer text-xl">{title}</h2>
        </div>
      </CollapsibleTrigger>
      <div className="mt-2 flex w-full flex-col">
        {wrapToCard ? (
          <Card className="p-4">
            <CollapsibleContent className="space-y-2">
              {description && <div className="mb-4">{description}</div>}
              {children}
            </CollapsibleContent>
          </Card>
        ) : (
          <CollapsibleContent className="mt-2 space-y-2">
            {description && <div className="mb-4">{description}</div>}
            {children}
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};
