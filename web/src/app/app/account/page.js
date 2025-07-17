"use client";

import ApiKeyCard from "@/components/account/ApiKeyCard";
import EditableField from "@/components/common/EditableField";
import Spinner from "@/components/common/Spinner";
import Status from "@/components/common/Status";
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
import { useAppContext } from "@/contexts/AppContext";
import { removeAuthToken } from "@/lib/auth";
import { BadgeAlertIcon, BadgeCheckIcon, SaveIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const initialPasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  isEditing: false,
  isSaving: false,
};

export default function AccountPage() {
  const {
    user,
    isUserLoading,
    isLoading,
    updateUser,
    updateUserPassword,
    regenerateApiKey,
  } = useAppContext();

  // UI state
  const [editingEmail, setEditingEmail] = useState(false);
  const [editValues, setEditValues] = useState({});

  // Form state
  const [passwordForm, setPasswordForm] = useState(initialPasswordFormState);

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
      await updateUser(updateData);
      removeAuthToken();
      window.location.href = "/";
    } catch (err) {
    } finally {
      setEditingEmail(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");
    setPasswordForm({ ...passwordForm, isSaving: true });
    try {
      await updateUserPassword({ currentPassword, newPassword });
      toast.success("Password updated successfully.");
      setPasswordForm(initialPasswordFormState);
    } catch (err) {
      setPasswordForm({ ...passwordForm, isSaving: false });
    }
  };

  const handleRegenerateApiKey = async () => {
    try {
      await regenerateApiKey();
    } catch (err) {}
  };

  if (isUserLoading) {
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

  if (!user && !isUserLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Status
          variant="error"
          title="Failed to load user data."
          message="Please refresh the page."
        />
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
        isRegenerating={isLoading}
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
                  onClick={() => setPasswordForm(initialPasswordFormState)}
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
                    <Spinner />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
