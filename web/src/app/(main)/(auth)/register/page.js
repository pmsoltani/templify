"use client";

import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import makeToast from "@/utils/makeToast";
import { useState } from "react";
import { toast } from "sonner";
import ConfirmEmailCard from "./components/ConfirmEmailCard";
import RegisterForm from "./components/RegisterForm";

const initialState = { email: "", password: "", passwordConfirm: "" };

export default function RegisterPage() {
  const [formState, setField] = useFormReducer(initialState);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);

    const { email, password, passwordConfirm } = formState;
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient("/api/register", { method: "POST", body: { email, password } });
      setIsSubmitted(true);
    } catch (err) {
      makeToast("Failed to register user.", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);

    const { email } = formState;

    try {
      await apiClient("/api/resend-confirmation", { method: "POST", body: { email } });
    } catch (err) {
      makeToast("Failed to resend confirmation email.", err);
    } finally {
      setIsLoading(false);
    }
  };

  return isSubmitted ? (
    <ConfirmEmailCard
      email={formState.email}
      onResend={handleResend}
      isLoading={isLoading}
    />
  ) : (
    <RegisterForm
      formState={formState}
      setField={setField}
      isLoading={isLoading}
      onSubmit={handleRegister}
    />
  );
}
