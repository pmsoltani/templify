"use client";

import { CheckIcon, CopyIcon, Loader2Icon, RotateCcwKeyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "../context/DashboardContext";
import { ApiHelp } from "./ApiHelp";

export default function ApiKeyCard() {
  const { user, isLoading, copied, handleCopyApiKey, handleGenApiKey } = useDashboard();

  const apiKey = user?.apiKey;
  const isKeyValid = apiKey ? apiKey.length === 64 : false;
  const maskedKey = isKeyValid ? `${apiKey.slice(0, 6)} ... ${apiKey.slice(-6)}` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your API Key</CardTitle>
        <CardDescription>
          Use this key in your API requests. <ApiHelp />
        </CardDescription>
      </CardHeader>

      <CardContent className="flex gap-1 items-center justify-end mx-6 p-3 bg-gray-200 dark:bg-gray-800 rounded-md">
        {isLoading.apiKey ? (
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
          {copied ? <CheckIcon /> : <CopyIcon />}
        </Button>
        <Button
          onClick={handleGenApiKey}
          variant="outline"
          size="sm"
          title="Generate a new key"
          disabled={isLoading.apiKey}
        >
          {isLoading.apiKey ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <RotateCcwKeyIcon />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
