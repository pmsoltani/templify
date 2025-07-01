import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2 } from "lucide-react";

export function RemoveConfirmPopover({ templateId, removingTemplateId, handleRemove }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="text-red-600 hover:text-red-600 hover:bg-red-200"
          size="sm"
          title="Remove template"
          variant="outline"
        >
          <Trash2 className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Are you sure?</h4>
            <p className="text-muted-foreground text-sm">
              This will permanently delete the template and all PDF files created using
              it.
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Button onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => handleRemove(templateId)}
                disabled={removingTemplateId === templateId}
              >
                {removingTemplateId === templateId ? "Removing..." : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
