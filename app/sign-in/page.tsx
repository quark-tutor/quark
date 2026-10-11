import { SignInForm } from "./sign-in-form";
import styles from "./sign-in.module.css";

export default function SignInPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Quark</h1>
      <p className={styles.note}>Sign in as a guardian.</p>
      <SignInForm />
    </main>
  );
}
