import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/app/(auth)/register/register-form";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    push.mockClear();
    vi.restoreAllMocks();
  });

  it("renders all required accessible fields", () => {
    render(<RegisterForm />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("blocks submission and shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(global, "fetch");

    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Jane Doe");
    await user.type(screen.getByLabelText(/^email$/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "different-password");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows a duplicate-email server error and does not navigate", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ success: false, error: "An account with this email already exists" }),
        { status: 409 }
      )
    );

    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Jane Doe");
    await user.type(screen.getByLabelText(/^email$/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("navigates to the dashboard on successful registration", async () => {
    const user = userEvent.setup();
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { user: { id: "1" } } }), { status: 201 })
    );

    render(<RegisterForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Jane Doe");
    await user.type(screen.getByLabelText(/^email$/i), "jane@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });
});
