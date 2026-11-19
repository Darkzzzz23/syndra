import { afterEach, describe, expect, it } from "vitest";
import { confirmPasswordReset } from "firebase/auth";
import { auth, firebaseConfigured } from "./config";
import {
  createAccount,
  logOut,
  requestPasswordReset,
  signIn,
} from "../services/authService";

const emulatorEnabled = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";

describe.skipIf(!emulatorEnabled || !firebaseConfigured)("Firebase Auth emulator", () => {
  afterEach(async () => {
    if (auth?.currentUser) await logOut();
  });

  it("signs up, creates a Firestore workspace profile, logs in/out, and requests a password reset", async () => {
    if (!auth) throw new Error("Firebase Auth was not initialized");
    const email = `crm-emulator-${Date.now()}@example.test`;
    const password = `CrmTest-${Math.random().toString(36).slice(2)}-Password`;

    const created = await createAccount(email, password, "Emulator User", "Test Workspace");
    expect(created.user.email).toBe(email);
    expect(created.profile).toMatchObject({
      email,
      displayName: "Emulator User",
      workspaceName: "Test Workspace",
    });

    await logOut();
    expect(auth.currentUser).toBeNull();

    const signedIn = await signIn(email, password);
    expect(signedIn.user.uid).toBe(created.user.uid);
    expect(signedIn.profile.workspaceName).toBe("Test Workspace");

    await requestPasswordReset(email);
    const codesResponse = await fetch(
      "http://127.0.0.1:9099/emulator/v1/projects/demo-syndra-crm/oobCodes",
    );
    expect(codesResponse.ok).toBe(true);
    const { oobCodes } = await codesResponse.json() as {
      oobCodes: { email: string; oobCode: string; requestType: string }[];
    };
    const resetCode = oobCodes.find(
      (code) => code.email === email && code.requestType.toLowerCase().includes("password"),
    );
    expect(resetCode).toBeTruthy();
    const nextPassword = `${password}-changed`;
    await confirmPasswordReset(auth, resetCode!.oobCode, nextPassword);
    await logOut();
    expect(auth.currentUser).toBeNull();
    const signedInWithResetPassword = await signIn(email, nextPassword);
    expect(signedInWithResetPassword.user.uid).toBe(created.user.uid);
  }, 20_000);
});
