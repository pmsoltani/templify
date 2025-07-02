"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterForm({
  formState,
  setField,
  isLoading,
  error,
  onSubmit,
}) {
  const handleSubmit = async (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={setField}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="passwordConfirm">Confirm password</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              value={formState.passwordConfirm}
              onChange={setField}
            />
          </div>
          <div className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              Reset password
            </Button>
          </div>
          {error && (
            <div className="flex flex-col gap-3">
              <p className="text-center text-sm text-red-500">{error}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
