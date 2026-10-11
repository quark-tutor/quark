"use client";

import { useActionState } from "react";
import { sendCode, verifyCode, type SignInState } from "./actions";
import styles from "./sign-in.module.css";

const start: SignInState = { step: "email", email: "" };

export function SignInForm() {
  const [emailState, emailAction, sending] = useActionState(sendCode, start);
  const [codeState, codeAction, checking] = useActionState(verifyCode, start);

  if (emailState.step === "email") {
    return (
      <form action={emailAction} className={styles.form}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={emailState.email}
            required
            autoFocus
          />
        </label>
        {emailState.error && <p className={styles.error}>{emailState.error}</p>}
        <button className={styles.button} disabled={sending}>
          {sending ? "Sending…" : "Email me a sign-in link"}
        </button>
      </form>
    );
  }

  return (
    <form action={codeAction} className={styles.form}>
      <p className={styles.note}>
        Check <strong>{emailState.email}</strong> and open the sign-in link in this browser.
      </p>
      <input type="hidden" name="email" value={emailState.email} />
      <label className={styles.label}>
        Or type the code, if your email has one
        <input
          className={styles.input}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,12}"
          required
        />
      </label>
      {codeState.error && <p className={styles.error}>{codeState.error}</p>}
      <button className={styles.button} disabled={checking}>
        {checking ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
