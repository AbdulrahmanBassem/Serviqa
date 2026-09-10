import { type ReactNode } from "react";
import styles from "./AuthLayout.module.css";

interface Props {
  children: ReactNode;
}

export const AuthLayout = ({ children }: Props) => {
  return (
    <div className={styles.wrapper}>
      <main className={styles.formSection}>
        <div className={styles.logoContainer}>
          <img src="/serviqa logo blue.png" alt="Serviqa Logo" className={styles.logo} />
        </div>
        {children}
      </main>
    </div>
  );
};