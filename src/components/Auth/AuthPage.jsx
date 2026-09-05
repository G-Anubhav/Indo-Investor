import Image from "next/image";
import Link from "next/link";
import logo from "@/images/logo/new-logo.png";
import styles from "./Auth.module.css";

export default function AuthPage({ children, dictionary }) {
  return (
    <main className={styles.authPage}>
      <section className={styles.visual}>
        <Link className={styles.visualLogo} href="/" aria-label={dictionary.common.backHome}>
          <Image src={logo} alt={dictionary.common.brand} width={112} height={112} priority />
        </Link>
        <div className={styles.visualShade} />
        <div className={styles.visualText}>
          <span>{dictionary.auth.securePortal}</span>
          <strong>{dictionary.common.brand}</strong>
        </div>
      </section>
      <section className={styles.formSide}>
        <div className={styles.mobileLogo}>
          <Link href="/" aria-label={dictionary.common.backHome}>
            <Image src={logo} alt={dictionary.common.brand} width={76} height={76} priority />
          </Link>
        </div>
        <div className={styles.formContainer}>{children}</div>
      </section>
    </main>
  );
}
