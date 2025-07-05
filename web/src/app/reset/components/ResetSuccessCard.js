"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ResetSuccessCard() {
  return (
    <Card className="min-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Password reset!</CardTitle>
      </CardHeader>

      <CardContent>
        <Link href="/login">
          <Button type="" className="w-full">
            Login
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
