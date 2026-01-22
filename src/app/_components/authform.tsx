"use client";

import { useAuth } from "~/contexts/auth-context";
import { CreatePostWizard } from "./create_post_wizard";
import { LoadingPage } from "./loading";
import { LoginForm } from "./login_form";

export function AuthForm() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (isAuthenticated) {
    return (
      <div className="border-b border-slate-800">
        <CreatePostWizard />
      </div>
    );
  }

  return (
    <div className="border-b border-slate-800/50 py-16 px-4">
      <LoginForm />
    </div>
  );
}
