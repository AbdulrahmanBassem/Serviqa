import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { authService } from "../api/authService";
import styles from "./AuthForm.module.css";

export const LoginForm = () => {
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: () => navigate("/dashboard"),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sign in to Serviqa</h2>
      
      {error && <div className={styles.error}>{error.message}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input name="email" type="email" required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input name="password" type="password" required className={styles.input} />
        </div>

        <button type="submit" disabled={isPending} className={styles.button}>
          {isPending && <Loader2 className="animate-spin" size={20} />}
          {isPending ? "Signing in..." : "Sign In"}
        </button>
        <p className={styles.footer}>Don't have an account? <a href="/signup">Sign up</a></p>
      </form>
    </div>
  );
};