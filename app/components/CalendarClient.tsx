"use client";

import React, { useEffect, useMemo, useState } from "react";

type CandleRow = {
  date_utc: string;
  open: string;
  close: string;
  abs_change: string;
  pct_change: string;
};

function utcNowYM() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function monthLabel(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function weekdayLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleString("en-US", {
    weekday: "short",
  });
}

function fmt(v: string | number) {
  const n = Number(v);
  if (!isFinite(n)) return String(v);
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function todayKeyUTC() {
  const n = new Date();
  const y = n.getUTCFullYear();
  const m = String(n.getUTCMonth() + 1).padStart(2, "0");
  const d = String(n.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarClient() {
  const initial = utcNowYM();
  const [year, setYear] = useState<number>(initial.year);
  const [month, setMonth] = useState<number>(initial.month);
  const [rows, setRows] = useState<CandleRow[]>([]);
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const y: number[] = [];
    for (let i = 2020; i <= initial.year; i++) y.push(i);
    return y;
  }, [initial.year]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/candles?year=${year}&month=${month}`, {
          cache: "no-store",
        });
        const j = await r.json();
        if (!cancelled) setRows(Array.isArray(j.days) ? j.days : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  function prev() {
    if (month === 1) {
      if (year > 2020) {
        setYear(year - 1);
        setMonth(12);
      }
    } else setMonth(month - 1);
  }

  function next() {
    const maxY = initial.year;
    const maxM = initial.month;
    if (year > maxY || (year === maxY && month >= maxM)) return;
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else setMonth(month + 1);
  }

  return (
    <section style={{ marginTop: 14 }}>
      <div style={styles.navRow}>
        <button onClick={prev} style={styles.navBtn}>
          ‹ Prev
        </button>

        <div style={styles.selectGroup}>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={styles.select}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(Date.UTC(2025, m - 1, 1)).toLocaleString("en-US", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={styles.select}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={next}
          style={{
            ...styles.navBtn,
            opacity: year === initial.year && month === initial.month ? 0.45 : 1,
          }}
        >
          Next ›
        </button>
      </div>

      <div style={styles.monthTitleRow}>
        <div style={styles.monthTitle}>{monthLabel(year, month)}</div>
        {loading ? <div style={styles.loading}>Loading…</div> : null}
      </div>

      <CalendarGrid year={year} month={month} rows={rows} />
    </section>
  );
}

function CalendarGrid({
  year,
  month,
  rows,
}: {
  year: number;
  month: number;
  rows: CandleRow[];
}) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekdayMon0 = (first.getUTCDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const byDate = new Map<string, CandleRow>();
  for (const r of rows) {
    const key = new Date(r.date_utc).toISOString().slice(0, 10); // YYYY-MM-DD
    byDate.set(key, r);
  }

  const today = todayKeyUTC();
  const cells: React.ReactNode[] = [];

  for (let i = 0; i < firstWeekdayMon0; i++) {
    cells.push(<div key={`pad-${i}`} style={styles.padCell} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    const dateKey = `${year}-${mm}-${dd}`;

    const row = byDate.get(dateKey);
    const isToday = dateKey === today;

    const pct = row ? Number(row.pct_change) : null;
    const isUp = pct !== null && pct >= 0;

    const bg = row
      ? isUp
        ? "rgba(20, 83, 45, 0.45)"
        : "rgba(127, 29, 29, 0.45)"
      : isToday
      ? "rgba(30, 64, 175, 0.25)"
      : "rgba(255,255,255,0.03)";

    const border = row
      ? isUp
        ? "rgba(34, 197, 94, 0.35)"
        : "rgba(239, 68, 68, 0.35)"
      : isToday
      ? "rgba(96, 165, 250, 0.35)"
      : "rgba(255,255,255,0.10)";

    const pctText =
      pct === null ? "" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

    const label = `${d} ${new Date(Date.UTC(year, month - 1, d)).toLocaleString(
      "en-US",
      { month: "short" }
    )} - ${weekdayLabel(dateKey)}`;

    cells.push(
      <div
        key={dateKey}
        style={{
          ...styles.dayCell,
          background: bg,
          border: `1px solid ${border}`,
        }}
      >
        <div style={styles.dayLabelRow}>
          <div style={styles.dayLabel}>{label}</div>
          {isToday ? <div style={styles.todayPill}>TODAY</div> : null}
        </div>

        {row ? (
          <>
            <div style={styles.line}>Open: {fmt(row.open)}</div>
            <div style={styles.line}>Close: {fmt(row.close)}</div>
            <div
              style={{
                ...styles.pct,
                color: pct !== null && pct < 0 ? "#fecaca" : "#bbf7d0",
              }}
            >
              {pctText}
            </div>
          </>
        ) : isToday ? (
          <>
            <div style={styles.noDataTitle}>Today (in progress)</div>
            <div style={styles.noDataHint}>Daily candle closes at 23:59 UTC</div>
          </>
        ) : (
          <div style={styles.noData}>No data</div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div style={styles.weekRow}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((w) => (
          <div key={w} style={styles.weekHeader}>
            {w}
          </div>
        ))}
      </div>

      <div style={styles.grid}>{cells}</div>
    </div>
  );
}

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

  // ✅ daha kompakt
  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginBottom: 8,
  },
  weekHeader: { opacity: 0.75, fontWeight: 800, paddingLeft: 6, color: "#e7edf5" },

  // ✅ daha kompakt + minimum genişlik
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(150px, 1fr))",
    gap: 10,
  },

  padCell: {
    minHeight: 128,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
  },

  dayCell: {
    minHeight: 128,
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
  noDataHint: { marginTop: 6, opacity: 0.75, fontSize: 12, color: "#e7edf5" },
};
