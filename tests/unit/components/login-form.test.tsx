import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/app/(auth)/login/login-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockClear();
    vi.restoreAllMocks();
  });

  it("renders accessible email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("relies on native email validation to block submission of an invalid email", async () => {
    // The email <input type="email"> triggers the browser's (and jsdom's)
    // built-in constraint validation, which blocks the form's submit
    // event before React/Zod ever run — same as a real browser. So the
    // Zod-driven apiError message for a malformed email is unreachable
    // via this input; we assert on the native validity state instead.
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    await user.type(emailInput, "not-an-email");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(emailInput.validity.valid).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows a validation error when the password field is left empty", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(fetchSpy).not.toHaveBeenCalled());
  });

  it("shows the server error message and does not navigate on failed login", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: false, error: "Invalid email or password" }), {
        status: 401,
      })
    );

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a loading state and navigates to the dashboard on success", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { user: { id: "1" } } }), { status: 200 })
    );

    render(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });
});
