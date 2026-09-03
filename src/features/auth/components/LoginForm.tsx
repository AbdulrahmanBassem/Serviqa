import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "../api/authService";
import { AuthLayout } from "./AuthLayout";
import styles from "./AuthForm.module.css";

export const LoginForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
    <AuthLayout>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Enter your credentials to access your shop</p>
        </div>
        
        {error && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} />
            <span>{error.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input id="email" name="email" type="email" required className={styles.input} placeholder="name@shop.com" />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className={styles.input} 
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className={styles.toggleButton}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isPending} className={styles.button}>
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>
          Don't have an account? 
          <Link to="/signup" className={styles.link}>Sign up</Link>
        </div>
      </div>
    </AuthLayout>
  );
};