"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PriceCardClient from "./PriceCardClient";
import { CAL_W } from "./CalendarClient";

const styles: Record<string, React.CSSProperties> = {
  // TOPBAR: her zaman takvim genişliğinde ve ortada
  wrap: {
    width: CAL_W,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr", // sol / orta / sağ
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },

  left: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "#f59e0b",
    color: "#111827",
    fontWeight: 900,
    fontSize: 20,
    flex: "0 0 auto",
  },
  brandText: { display: "flex", flexDirection: "column", gap: 4 },
  brandName: { fontSize: 20, fontWeight: 900 },
  brandMeta: { opacity: 0.75, fontSize: 13 },

  center: { display: "flex", justifyContent: "center" },
  nav: { display: "flex", gap: 10, alignItems: "center" },
  navLink: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(231,237,245,0.75)",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 13,
    transition: "all 0.18s ease",
  },
  navLinkActive: {
    color: "#e7edf5",
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
  },

  right: { display: "flex", justifyContent: "flex-end" },
};

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      style={{ ...styles.navLink, ...(active ? styles.navLinkActive : null) }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "rgba(247,147,26,0.45)";
        el.style.background = "rgba(247,147,26,0.10)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        if (active) {
          el.style.borderColor = "rgba(255,255,255,0.18)";
          el.style.background = "rgba(255,255,255,0.06)";
          return;
        }
        el.style.borderColor = "rgba(255,255,255,0.10)";
        el.style.background = "rgba(0,0,0,0.18)";
      }}
    >
      {label}
    </Link>
  );
}

export default function TopBar() {
  return (
    <div style={styles.wrap}>
      <div style={styles.left}>
        <div style={styles.brandIcon}>₿</div>
        <div style={styles.brandText}>
          <div style={styles.brandName}>BTCalendar</div>
          <div style={styles.brandMeta}>Track Bitcoin daily prices.</div>
        </div>
      </div>

      <div style={styles.center}>
        <nav style={styles.nav}>
          <NavItem href="/" label="Home" />
          <NavItem href="/about" label="About" />
          <NavItem href="/blog" label="Blog" />
        </nav>
      </div>

      <div style={styles.right}>
        <PriceCardClient />
      </div>
    </div>
  );
}
