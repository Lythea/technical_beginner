import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Modal from "./auth";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import supabase from "@/lib/supabaseClient";

// Mock supabase
jest.mock("@/lib/supabaseClient", () => ({
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
  },
}));

const mockSetIsLoggedIn = jest.fn();
const mockSetUserId = jest.fn();

const setup = (visible = true) => {
  return render(
    <Modal
      visible={visible}
      onClose={jest.fn()}
      setIsLoggedIn={mockSetIsLoggedIn}
      setUserId={mockSetUserId}
    />
  );
};

describe("Modal Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders sign in form by default", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Sign In" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  it("has password input of type password", () => {
    setup();
    expect(screen.getByLabelText(/password/i)).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("toggles to sign up form", () => {
    setup();
    const toggleBtn = screen.getByText(/don't have an account/i);
    fireEvent.click(toggleBtn);
    expect(
      screen.getByRole("heading", { name: "Sign Up" })
    ).toBeInTheDocument();
  });

  it("calls signInWithPassword on sign in", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: { id: "user123", email_confirmed_at: "2023-01-01" },
        session: { access_token: "token123" },
      },
      error: null,
    });

    setup();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      })
    );

    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
    expect(mockSetUserId).toHaveBeenCalledWith("user123");
  });

  it("shows error if email not confirmed", async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: {
        user: { id: "user123", email_confirmed_at: null },
        session: null,
      },
      error: null,
    });

    setup();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/please confirm your email/i)
      ).toBeInTheDocument();
    });
  });

  it("calls signUp on sign up form", async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: {
        user: { id: "newUser123" },
      },
      error: null,
    });

    setup();

    fireEvent.click(screen.getByText(/don't have an account/i));

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "newpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: "newuser@example.com",
        password: "newpassword",
      })
    );

    expect(mockSetUserId).toHaveBeenCalledWith("newUser123");
    expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
  });

  it("does not render modal when visible is false", () => {
    setup(false);
    expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
  });
});
