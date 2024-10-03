import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { InputName } from "@/statInputHelpers";
import { InputHTMLAttributes } from "react";

export default function StatStyledInput({
  name,
  inputProps,
}: {
  name: InputName;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <TooltipProvider delayDuration={300} disableHoverableContent>
      <Tooltip>
        <TooltipTrigger asChild>
          <Input
            {...inputProps}
            name={name}
            className={cn(
              "h-[32px]",
              "w-[60px]",
              {
                "bg-stat-light-health/10 dark:bg-stat-dark-health/5":
                  name === "health" || name === "maxHealth",
                "bg-stat-light-temp/10 dark:bg-stat-dark-temp/5":
                  name === "tempHealth",
                "bg-stat-light-armor/10 dark:bg-stat-dark-armor/5":
                  name === "armorClass",
              },
              inputProps?.className,
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{nameToLabel(name)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const nameToLabel = (name: InputName) => {
  switch (name) {
    case "health":
      return "Current Hit Points";
    case "maxHealth":
      return "Hit Points Maximum";
    case "tempHealth":
      return "Temporary Hit Points";
    case "armorClass":
      return "Armor Class";
  }
};