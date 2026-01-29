const styles: Record<string, React.CSSProperties> = {
  navRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  navBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e7edf5",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },
  selectGroup: { display: "flex", gap: 10 },
  select: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e7edf5",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  monthTitleRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  monthTitle: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: 0.2,
    color: "#e7edf5",
  },
  loading: { opacity: 0.7, color: "#e7edf5" },

  // Fit to viewport wrapper
  fitWrap: {
    width: "100%",
    overflow: "hidden",
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginBottom: 8,
  },
  weekHeader: {
    opacity: 0.75,
    fontWeight: 800,
    paddingLeft: 6,
    color: "#e7edf5",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(150px, 1fr))",
    gap: 10,
  },

  padCell: {
    height: 128,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  },

  dayCell: {
    height: 128,
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  dayLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  dayLabel: { fontWeight: 900, color: "#e7edf5" },

  todayPill: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 0.6,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(96, 165, 250, 0.35)",
    background: "rgba(30, 64, 175, 0.20)",
    color: "#bfdbfe",
    whiteSpace: "nowrap",
  },

  line: { opacity: 0.9, marginTop: 2, color: "#e7edf5" },
  pct: { marginTop: 10, fontWeight: 900, fontSize: 18 },
  noData: { opacity: 0.6, color: "#e7edf5" },
  noDataTitle: { marginTop: 6, fontWeight: 900, color: "#bfdbfe" },
};
