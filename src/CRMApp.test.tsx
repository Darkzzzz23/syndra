import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import CRMApp from "./CRMApp";
import { AuthProvider } from "./context/AuthContext";

vi.mock("./firebase/config", () => ({ auth: null, db: null, firebaseConfigured: false }));

function renderApp() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <CRMApp />
      </AuthProvider>
    </BrowserRouter>,
  );
}

afterEach(() => {
  cleanup();
  window.history.replaceState({}, "", "/");
});

describe("Syndra CRM foundation", () => {
  it("renders CRM positioning and routes to sign-in", () => {
    renderApp();

    expect(screen.getByRole("heading", { name: "Never lose a client because you forgot to follow up." })).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Sign in" }));
    expect(screen.getByRole("heading", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByText(/Firebase is not configured/)).toBeTruthy();
  });

  it("routes account recovery and workspace creation", () => {
    window.history.replaceState({}, "", "/signup");
    renderApp();
    expect(screen.getByRole("heading", { name: "Create your workspace" })).toBeTruthy();
    expect(screen.getByLabelText("Business or workspace")).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: "Sign in" }));
    fireEvent.click(screen.getByRole("link", { name: "Forgot password?" }));
    expect(screen.getByRole("heading", { name: "Reset your password" })).toBeTruthy();
  });
});
