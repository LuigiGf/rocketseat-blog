import Link from "next/link"
import styles from "./header.module.scss"

export default function Header() {
  return (<header className={styles.postHeader}>
    <Link href="/">
      <a><img src="/logo.svg" alt="logo"></img></a>
    </Link>
  </header>)
}
