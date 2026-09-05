import { useState } from "react";
import {  Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail, Lock, User, Store, Phone, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authService } from "../api/authService";
import { AuthLayout } from "./AuthLayout";
import styles from "./AuthForm.module.css";

export const SignupForm = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: authService.registerShop,
    onSuccess: () => setIsSuccess(true),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationError("");
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    mutate({
      ownerName: formData.get("ownerName") as string,
      shopName: formData.get("shopName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      email: formData.get("email") as string,
      password,
    });
  };

  // if (isSuccess) {
  //   return (
  //     <AuthLayout>
  //       <div className={styles.formContainer} style={{ textAlign: "center" }}>
  //         <div className={styles.header}>
  //           <h2 className={styles.title} style={{ color: "var(--color-success)" }}>Registration Successful!</h2>
  //           <p className={styles.subtitle}>
  //             We have sent a verification link to your email address. Please verify your email to activate your account.
  //           </p>
  //         </div>
  //         <Link to="/login" className={styles.button} style={{ textDecoration: "none" }}>
  //           Return to Login
  //         </Link>
  //       </div>
  //     </AuthLayout>
  //   );
  // }
  if (isSuccess) {
    navigate("/login");
  }

  return (
    <AuthLayout>
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>Start managing your shop operations today</p>
        </div>
        
        {(validationError || error) && (
          <div className={styles.errorAlert} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{validationError || error?.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input name="ownerName" type="text" required className={styles.input} placeholder="John Doe" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Shop Name</label>
            <div className={styles.inputWrapper}>
              <Store className={styles.inputIcon} size={18} />
              <input name="shopName" type="text" required className={styles.input} placeholder="Doe Auto Repair" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Phone Number</label>
            <div className={styles.inputWrapper}>
              <Phone className={styles.inputIcon} size={18} />
              <input name="phoneNumber" type="tel" required className={styles.input} placeholder="+20 123 456 7890" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input name="email" type="email" required className={styles.input} placeholder="name@shop.com" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6} 
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

          <div className={styles.formGroup}>
            <label className={styles.label}>Confirm Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input 
                name="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6} 
                className={styles.input} 
                placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" disabled={isPending} className={styles.button}>
            {isPending ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
          </button>
        </form>

        <div className={styles.footer}>
          Already have an account? 
          <Link to="/login" className={styles.link}>Log in</Link>
        </div>
      </div>
    </AuthLayout>
  );
};