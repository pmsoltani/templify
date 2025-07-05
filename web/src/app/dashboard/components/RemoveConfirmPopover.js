import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { useDashboard } from "../context/DashboardContext";

export function RemoveConfirmPopover({ templateId }) {
  const [isOpen, setIsOpen] = useState(false);
  const { itemIds, handleRemoveTemplate } = useDashboard();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="text-red-600 hover:text-red-600 hover:bg-red-200"
          size="sm"
          title="Remove template"
          variant="outline"
        >
          <Trash2Icon />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="flex flex-col gap-2 w-80">
        <h4 className="leading-none font-medium">Are you sure?</h4>
        <p className="text-muted-foreground text-sm">
          This will permanently delete the template and all PDF files created using it.
        </p>
        <Button
          className="w-fit"
          variant="destructive"
          onClick={() => handleRemoveTemplate(templateId)}
          disabled={itemIds.templates.has(templateId)}
        >
          {itemIds.templates.has(templateId) ? "Removing..." : "Remove"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
