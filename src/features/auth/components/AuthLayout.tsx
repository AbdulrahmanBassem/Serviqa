import { type ReactNode } from "react";
import { Wrench } from "lucide-react";
import styles from "./AuthLayout.module.css";

interface Props {
  children: ReactNode;
}

export const AuthLayout = ({ children }: Props) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.brandSection}>
        <div className={styles.brandTitle}>
          <Wrench size={32} color="var(--color-primary-500)" />
          Serviqa
        </div>
        <div className={styles.brandQuote}>
          "Streamlining vehicle maintenance, one repair at a time. The complete operating system for modern auto shops."
        </div>
      </div>
      <main className={styles.formSection}>
        {children}
      </main>
    </div>
  );
};