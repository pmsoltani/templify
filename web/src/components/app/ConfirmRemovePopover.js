"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import makeToast from "@/utils/makeToast";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "../ui/input";

export default function ConfirmRemovePopover({
  title = "Remove Item",
  message = "This action cannot be undone.",
  onConfirm,
  isLoading = false,
  triggerVariant = "destructive",
  triggerSize = "sm",
  triggerText = "Remove",
  confirmText = "Remove",
  input = false,
  placeholder = "Type 'remove' to confirm.",
  inputType = "text",
  children,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = async () => {
    try {
      if (input && inputValue.trim() === "") return toast.error(placeholder);
      await onConfirm(inputValue);
      setShowConfirm(false);
    } catch (err) {
      makeToast("Error during confirmation", err);
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
          {input && (
            <Input
              type={inputType}
              placeholder={placeholder}
              className="w-full p-2 border border-gray-300 rounded"
              required
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          )}
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
