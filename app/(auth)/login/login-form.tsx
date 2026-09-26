"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Rocket, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function LoginForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginInput>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginInput) => {
    setApiError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setApiError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.error ?? "Invalid email or password");
        setIsSubmitting(false);
        return;
      }

      reset();
      router.push("/dashboard");
    } catch {
      setApiError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Rocket aria-hidden="true" className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign in to JobPilot</h1>
          <p className="text-sm text-muted-foreground">Track your job search, all in one place.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div>
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <FieldError><span id="email-error">{errors.email.message}</span></FieldError>}
            </div>

            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="pr-11"
                  {...register("password", { required: "Password is required" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex h-10 w-11 items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-inset rounded-r-md"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && <FieldError><span id="password-error">{errors.password.message}</span></FieldError>}
            </div>

            {apiError && <Alert variant="danger">{apiError}</Alert>}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
