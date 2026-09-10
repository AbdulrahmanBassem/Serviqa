import React from 'react';
import styles from './DataCard.module.css';

interface DataCardProps {
  title: string;
  subtitle?: React.ReactNode;
  iconInitials: string;
  iconGradient: string;
  iconShape?: 'circle' | 'square';
  details: { label: string; value: React.ReactNode }[];
  actions?: React.ReactNode;
}

export const DataCard = ({ 
  title, 
  subtitle, 
  iconInitials, 
  iconGradient, 
  iconShape = 'square', 
  details, 
  actions 
}: DataCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div 
          className={`${styles.icon} ${iconShape === 'circle' ? styles.iconCircle : styles.iconSquare}`}
          style={{ background: iconGradient }}
        >
          {iconInitials}
        </div>
        <div className={styles.headerText}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
      </div>
      
      {details.length > 0 && (
        <div className={styles.detailsGrid}>
          {details.map((detail, index) => (
            <div key={index} className={styles.detailItem}>
              <span className={styles.detailLabel}>{detail.label}</span>
              <span className={styles.detailValue}>{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
};