"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

export default function ConfirmRemovePopover({
  title = "Remove Item",
  message = "This action cannot be undone.",
  onConfirm,
  isLoading = false,
  triggerVariant = "destructive",
  triggerSize = "sm",
  triggerText = "Remove",
  confirmText = "Remove",
  children,
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setShowConfirm(false);
    } catch (err) {
      console.error("Error during confirmation:", err);
    }
  };

  return (
    <Popover open={showConfirm} onOpenChange={setShowConfirm}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant={triggerVariant} size={triggerSize}>
            <Trash2Icon className="h-4 w-4" />
            {triggerText}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Removing..." : confirmText}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
