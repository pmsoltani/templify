import CodeInline from "@/components/common/CodeInline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleQuestionMarkIcon } from "lucide-react";
import { useState } from "react";

export function ApiHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <CircleQuestionMarkIcon
          size={18}
          className="inline text-blue-400 hover:text-blue-600 transition-colors duration-200 align-text-bottom"
        />
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-2 w-140">
        <DialogHeader>
          <DialogTitle>How to use our API</DialogTitle>
          Send a POST request to:
          <br />
          <CodeInline>{`${process.env.NEXT_PUBLIC_API_URL}/api/templates/:templateId/generate`}</CodeInline>
          with this API key in the headers and the template data in the body as JSON.
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
