// src/components/admin/SidebarComp.tsx
import type { ReactNode } from 'react';
import styles from './SidebarComp.module.css';

type SidebarSectionProps = {
  title: string;
  children: ReactNode;
};

const SidebarSection = ({ title, children }: SidebarSectionProps) => {
  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <nav className={styles.sectionNav}>{children}</nav>
    </section>
  );
};

export default SidebarSection;
