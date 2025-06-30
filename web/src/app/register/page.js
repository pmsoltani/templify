"use client";

import { useReducer, useState } from "react";
import ConfirmEmailCard from "./components/ConfirmEmailCard";
import RegisterForm from "./components/RegisterForm";

const initialState = { email: "", password: "", passwordConfirm: "" };

function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state, // Keep the old state values
        [action.field]: action.payload, // Overwrite the specific field that changed
      };
    default:
      return state;
  }
}

export default function RegisterPage() {
  const [formState, dispatch] = useReducer(formReducer, initialState);

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong!");
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

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/resend-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formState.email }),
    });
    setIsLoading(false);
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
      dispatch={dispatch}
      isLoading={isLoading}
      error={error}
      onSubmit={handleRegister}
    />
  );
}
