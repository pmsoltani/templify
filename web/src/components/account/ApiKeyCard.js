"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckIcon, CopyIcon, Loader2Icon, RotateCcwKeyIcon } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { ApiHelp } from "./ApiHelp";

export default function ApiKeyCard({ user, isRegenerating, handleRegenerateApiKey }) {
  const [isCopied, setIsCopied] = useState(false);

  const apiKey = user?.apiKey;
  const isKeyValid = apiKey ? apiKey.length === 64 : false;
  const maskedKey = isKeyValid ? `${apiKey.slice(0, 6)} ... ${apiKey.slice(-6)}` : "";

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(user.apiKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy API key:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your API Key</CardTitle>
        <CardDescription>
          Use this key in your API requests. <ApiHelp />
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-1 items-center justify-end mx-6 p-3 bg-gray-200 dark:bg-gray-800 rounded-md">
        {isRegenerating ? (
          <Skeleton className="grow h-[30px] rounded" />
        ) : (
          <code className="grow text-sm break-all">
            {maskedKey ? maskedKey : "Generate a new key"}
          </code>
        )}
        <Button
          onClick={handleCopyApiKey}
          variant="outline"
          size="sm"
          disabled={!isKeyValid}
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </Button>
        <Button
          onClick={handleRegenerateApiKey}
          variant="outline"
          size="sm"
          title="Generate a new key"
          disabled={isRegenerating}
        >
          {isRegenerating ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <RotateCcwKeyIcon />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
