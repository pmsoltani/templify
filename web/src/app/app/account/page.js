"use client";

import ApiKeyCard from "@/components/account/ApiKeyCard";
import EditableField from "@/components/EditableField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/apiClient";
import { removeAuthToken } from "@/lib/auth";
import { BadgeAlertIcon, BadgeCheckIcon, RefreshCwIcon, SaveIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function AccountPage() {
  // User data state
  const [user, setUser] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState(null);

  const [editingEmail, setEditingEmail] = useState(false);
  const [editValues, setEditValues] = useState({});

  // Form state
  const [emailForm, setEmailForm] = useState({
    email: "",
    isEditing: false,
    isSaving: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    isEditing: false,
    isSaving: false,
  });

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await apiClient("/api/me");
        setUser(data.data.user);
        setEmailForm({ ...emailForm, email: data.email });
      } catch (err) {
        console.error("Failed to load user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const emailFieldLabel = () => (
    <div
      title={user.isConfirmed ? "Email confirmed!" : "Email not confirmed!"}
      className="flex items-center space-x-2"
    >
      <span>Email</span>
      <span>
        {user.isConfirmed ? (
          <BadgeCheckIcon className="w-4 h-4 text-blue-500" />
        ) : (
          <BadgeAlertIcon className="w-4 h-4 text-orange-500" />
        )}
      </span>
    </div>
  );

  const startEditing = (field, currentValue) => {
    setEditingEmail(true);
    setEditValues((prev) => ({ ...prev, [field]: currentValue }));
  };

  const cancelEditing = (field) => {
    setEditingEmail(false);
    setEditValues((prev) => ({ ...prev, [field]: "" }));
  };

  const saveField = async (field) => {
    try {
      const updateData = { [field]: editValues[field] };
      await apiClient("/api/me", { method: "PATCH", body: updateData });
      removeAuthToken();
      window.location.href = "/";
    } catch (err) {
      console.error(`Failed to update ${field}:`, err);
    } finally {
      setEditingEmail(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) setError("Passwords do not match.");
    setPasswordForm({ ...passwordForm, isSaving: true });
    setError(null);
    try {
      await apiClient("/api/me/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        isEditing: false,
        isSaving: false,
      });
      alert("Password updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setPasswordForm({ ...passwordForm, isSaving: false });
    }
  };

  const handleRegenerateApiKey = async () => {
    setIsRegenerating(true);
    try {
      const data = await apiClient("/api/me/regenerate-key", { method: "POST" });
      setUser(data.data.user);
    } catch (err) {
      console.error("Failed to regenerate API key:", err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Account Settings</h1>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details and usage statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">User ID</Label>
              <p className="text-sm font-mono">{user.id}</p>
            </div>

            <EditableField
              fieldName="email"
              fieldLabel={emailFieldLabel()}
              fieldValue={user.email}
              editingField={editingEmail}
              editValues={editValues}
              onChange={setEditValues}
              onSave={saveField}
              onCancel={cancelEditing}
              onEdit={startEditing}
            />

            <div>
              <Label className="text-sm font-medium text-gray-700">Created At</Label>
              <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
              <p className="text-sm">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ApiKeyCard
        user={user}
        isRegenerating={isRegenerating}
        handleRegenerateApiKey={handleRegenerateApiKey}
      />

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Change your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!passwordForm.isEditing ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">••••••••••••</p>
              <Button
                onClick={() => setPasswordForm({ ...passwordForm, isEditing: true })}
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="mb-2" htmlFor="currentPassword">
                  Current Password
                </Label>
                <Input
                  type="password"
                  id="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="newPassword">
                  New Password
                </Label>
                <Input
                  type="password"
                  id="newPassword"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                      isEditing: false,
                      isSaving: false,
                    })
                  }
                  disabled={passwordForm.isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePassword}
                  disabled={passwordForm.isSaving}
                  className="px-3"
                >
                  {passwordForm.isSaving ? (
                    <RefreshCwIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {error && (
                <div className="flex flex-col gap-3">
                  <p className="text-center text-sm text-red-500">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
