import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { authService } from "../api/authService";
import styles from "./AuthForm.module.css";

export const SignupForm = () => {
  const navigate = useNavigate();
  const [validationError, setValidationError] = useState("");

  const { mutate, isPending, error } = useMutation({
    mutationFn: authService.registerShop,
    onSuccess: () => {
      navigate("/dashboard");
    },
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Register your Shop</h2>
      
      {(validationError || error) && (
        <div className={styles.error}>
          {validationError || error?.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Full Name</label>
          <input name="ownerName" type="text" required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Shop Name</label>
          <input name="shopName" type="text" required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Phone Number</label>
          <input name="phoneNumber" type="tel" required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email Address</label>
          <input name="email" type="email" required className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password</label>
          <input name="password" type="password" required minLength={6} className={styles.input} />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password</label>
          <input name="confirmPassword" type="password" required minLength={6} className={styles.input} />
        </div>

        <button type="submit" disabled={isPending} className={styles.button}>
          {isPending && <Loader2 className="animate-spin" size={20} />}
          {isPending ? "Creating Account..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};