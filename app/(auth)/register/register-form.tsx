"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Rocket, Eye, EyeOff } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function RegisterForm() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterInput>({
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterInput) => {
    setApiError(null);

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setApiError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setApiError(json.error ?? "Registration failed");
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start tracking your job search today.</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div>
              <Label htmlFor="name" required>
                Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                invalid={!!errors.name}
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </div>

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
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </div>

            <div>
              <Label htmlFor="password" required>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  invalid={!!errors.password}
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
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </div>

            <div>
              <Label htmlFor="confirmPassword" required>
                Confirm password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  invalid={!!errors.confirmPassword}
                  className="pr-11"
                  {...register("confirmPassword", { required: "Please confirm your password" })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex h-10 w-11 items-center justify-center text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:ring-inset rounded-r-md"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
            </div>

            {apiError && <Alert variant="danger">{apiError}</Alert>}

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
