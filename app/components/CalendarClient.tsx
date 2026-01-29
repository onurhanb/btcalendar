"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type CandleRow = {
  date_utc: string;
  open: string;
  close: string;
  abs_change: string;
  pct_change: string;
};

const START_YEAR = 2020;

// Grid ölçüleri (stabil görünüm için SABİT)
const CELL_W = 150;
const CELL_H = 128;
const GAP = 10;

function utcNowYM() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

function monthLabel(year: number, month: number) {
  const d = new Date(Date.UTC(year, month - 1, 1));
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function weekdayLabelShort(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleString("en-US", { weekday: "short" });
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

  // Fit-to-viewport (sadece küçült)
  const fitWrapRef = useRef<HTMLDivElement | null>(null);
  const fitInnerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  const years = useMemo(() => {
    const y: number[] = [];
    for (let i = START_YEAR; i <= initial.year; i++) y.push(i);
    return y;
  }, [initial.year]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/candles?year=${year}&month=${month}`, { cache: "no-store" });
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
      if (year > START_YEAR) {
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

  useEffect(() => {
    function recalc() {
      const wrap = fitWrapRef.current;
      const inner = fitInnerRef.current;
      if (!wrap || !inner) return;

      // İçeriği 1x ölç
      inner.style.transform = "scale(1)";
      inner.style.transformOrigin = "top center";

      const wrapRect = wrap.getBoundingClientRect();
      const availW = wrapRect.width;

      // Footer’a çok yaklaşmasın diye küçük bir pay
      const topOffset = wrapRect.top;
      const availH = window.innerHeight - topOffset - 24;

      const innerRect = inner.getBoundingClientRect();
      const needW = innerRect.width;
      const needH = innerRect.height;

      const s = Math.min(availW / needW, availH / needH, 1);
      setScale(Number.isFinite(s) ? s : 1);
    }

    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [year, month, rows.length]);

  return (
    <section>
      {/* Kontroller: ortada toplanmış */}
      <div style={styles.controlsRow}>
        <button onClick={prev} style={styles.navBtn}>
          ‹ Prev
        </button>

        <div style={styles.centerControls}>
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={styles.select}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(Date.UTC(2025, m - 1, 1)).toLocaleString("en-US", { month: "long" })}
              </option>
            ))}
          </select>

          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={styles.select}>
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


      {/* Takvim: ortalanır + gerekiyorsa scale ile küçülür */}
      <div ref={fitWrapRef} style={styles.fitWrap}>
        <div
          ref={fitInnerRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            display: "inline-block",
          }}
        >
          <CalendarGrid year={year} month={month} rows={rows} />
        </div>
      </div>
    </section>
  );
}

function CalendarGrid({ year, month, rows }: { year: number; month: number; rows: CandleRow[] }) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekdayMon0 = (first.getUTCDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const byDate = new Map<string, CandleRow>();
  for (const r of rows) {
    const key = new Date(r.date_utc).toISOString().slice(0, 10);
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
      ? "rgba(30, 64, 175, 0.22)"
      : "rgba(255,255,255,0.03)";

    const border = row
      ? isUp
        ? "rgba(34, 197, 94, 0.35)"
        : "rgba(239, 68, 68, 0.35)"
      : isToday
      ? "rgba(96, 165, 250, 0.35)"
      : "rgba(255,255,255,0.10)";

    const pctText = pct === null ? "" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;

    const label = `${d} ${new Date(Date.UTC(year, month - 1, d)).toLocaleString("en-US", {
      month: "short",
    })} - ${weekdayLabelShort(dateKey)}`;

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
          <div style={styles.noDataTitle}>Today (in progress)</div>
        ) : (
          <div style={styles.noData}>No data</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: 7 * CELL_W + 6 * GAP }}>
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
  controlsRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },
  navBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e7edf5",
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
  },
  centerControls: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  select: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "#e7edf5",
    padding: "10px 12px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },

  fitWrap: {
    width: "100%",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: `repeat(7, ${CELL_W}px)`,
    gap: GAP,
    marginBottom: 8,
  },
  weekHeader: {
    opacity: 0.75,
    fontWeight: 900,
    paddingLeft: 6,
    color: "#e7edf5",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: `repeat(7, ${CELL_W}px)`,
    gap: GAP,
  },

  padCell: {
    height: CELL_H,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    boxSizing: "border-box",
  },

dayCell: {
  height: 128,
  borderRadius: 14,
  padding: "10px 12px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between", // ⬅️ kritik
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
},

  dayLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  dayLabel: { fontWeight: 950, color: "#e7edf5" },

  todayPill: {
    fontSize: 11,
    fontWeight: 950,
    letterSpacing: 0.6,
    padding: "4px 8px",
    borderRadius: 999,
    border: "1px solid rgba(96, 165, 250, 0.35)",
    background: "rgba(30, 64, 175, 0.20)",
    color: "#bfdbfe",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
  },

  line: { opacity: 0.9, marginTop: 2, color: "#e7edf5" },
  pct: { marginTop: 6, fontWeight: 900, fontSize: 17 },
  noData: { opacity: 0.6, color: "#e7edf5" },
  noDataTitle: { marginTop: 6, fontWeight: 950, color: "#bfdbfe" },
};
