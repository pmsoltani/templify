"use client";

import useFormReducer from "@/hooks/useFormReducer";
import apiClient from "@/lib/apiClient";
import { useState } from "react";
import ConfirmEmailCard from "./components/ConfirmEmailCard";
import RegisterForm from "./components/RegisterForm";

const initialState = { email: "", password: "", passwordConfirm: "" };

export default function RegisterPage() {
  const [formState, setField] = useFormReducer(initialState);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setIsLoading(true);

    const { email, password, passwordConfirm } = formState;
    if (password !== passwordConfirm) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await apiClient("/api/register", { method: "POST", body: { email, password } });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setIsLoading(true);

    const { email } = formState;

    try {
      await apiClient("/api/resend-confirmation", { method: "POST", body: { email } });
    } catch (err) {
      setError(err.message);
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
      error={error}
      onSubmit={handleRegister}
    />
  );
}
