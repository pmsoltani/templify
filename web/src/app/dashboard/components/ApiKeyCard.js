"use client";

import { Check, Copy, RotateCcwKey } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDashboard } from "../context/DashboardContext";

export default function ApiKeyCard() {
  const { user, isLoading, copied, handleCopyApiKey, handleGenApiKey } = useDashboard();

  const apiKey = user?.apiKey;
  const isKeyValid = apiKey ? apiKey.length === 64 : false;
  const maskedKey = isKeyValid ? `${apiKey.slice(0, 6)} ... ${apiKey.slice(-6)}` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your API Key</CardTitle>
        <CardDescription>Use this key in your API requests.</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex gap-1 items-center justify-end p-3 bg-gray-200 dark:bg-gray-800 rounded-md">
          {isLoading.apiKey ? (
            <Skeleton className="h-[30px] w-[200px] rounded" />
          ) : (
            <code className="grow text-sm break-all">{maskedKey}</code>
          )}
          <Button
            onClick={handleCopyApiKey}
            variant="outline"
            size="sm"
            disabled={!isKeyValid}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </Button>
          <Button
            onClick={handleGenApiKey}
            variant="outline"
            size="sm"
            title="Generate a new key"
            disabled={isLoading.apiKey}
          >
            {isLoading.apiKey ? (
              <Spinner className="size-4" />
            ) : (
              <RotateCcwKey className="size-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
