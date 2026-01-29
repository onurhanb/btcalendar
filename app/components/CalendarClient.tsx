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
const DISABLED_BORDER = "rgba(255,255,255,0.10)";
const DISABLED_BG = "rgba(255,255,255,0.04)";
const DISABLED_TEXT = "rgba(255,255,255,0.35)";
const CELL_W = 150;
const CELL_H = 116;
const GAP = 10;

// Hover renkleri (BTC)
const HOVER_BORDER = "rgba(247,147,26,0.50)"; // #F7931A @ 50%
const HOVER_BG = "rgba(247,147,26,0.12)";

const BASE_BORDER = "rgba(255,255,255,0.14)";
const BASE_BG = "rgba(0,0,0,0.25)";

function utcNowYM() {
  const now = new Date();
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
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

// 1st, 2nd, 3rd, 4th ... 11th, 12th, 13th ... 21st ...
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function hoverOn(el: HTMLElement) {
  el.style.borderColor = HOVER_BORDER;
  el.style.background = HOVER_BG;
}

function hoverOff(el: HTMLElement) {
  el.style.borderColor = BASE_BORDER;
  el.style.background = BASE_BG;
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

  const isAtMax = year === initial.year && month === initial.month;

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
      {/* Kontroller */}
      <div style={styles.controlsRow}>
        {/* Prev */}
        <button
          onClick={prev}
          style={styles.navBtn}
          onMouseEnter={(e) => hoverOn(e.currentTarget)}
          onMouseLeave={(e) => hoverOff(e.currentTarget)}
        >
          ‹ Prev
        </button>

        {/* Month + Year */}
        <div style={styles.centerControls}>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={styles.select}
            onMouseEnter={(e) => hoverOn(e.currentTarget)}
            onMouseLeave={(e) => hoverOff(e.currentTarget)}
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
            onMouseEnter={(e) => hoverOn(e.currentTarget)}
            onMouseLeave={(e) => hoverOff(e.currentTarget)}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Next */}
<button
  onClick={next}
  disabled={isAtMax}
  style={{
    ...styles.navBtn,
    borderColor: isAtMax ? DISABLED_BORDER : BASE_BORDER,
    background: isAtMax ? DISABLED_BG : BASE_BG,
    color: isAtMax ? DISABLED_TEXT : "#e7edf5",
    cursor: isAtMax ? "not-allowed" : "pointer",
  }}
  onMouseEnter={(e) => {
    if (isAtMax) return;
    hoverOn(e.currentTarget);
  }}
  onMouseLeave={(e) => {
    if (isAtMax) return;
    hoverOff(e.currentTarget);
  }}
>
  Next ›
</button>

      </div>

      {/* Takvim */}
      <div ref={fitWrapRef} style={styles.fitWrap}>
        <div
          ref={fitInnerRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            display: "inline-block",
          }}
        >
          <CalendarGrid year={year} month={month} rows={rows} loading={loading} />
        </div>
      </div>
    </section>
  );
}

function CalendarGrid({
  year,
  month,
  rows,
  loading,
}: {
  year: number;
  month: number;
  rows: CandleRow[];
  loading: boolean;
}) {
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
        ? "linear-gradient(360deg, rgba(34,197,94,0.22) 0%, rgba(34,197,94,0.04) 66%)"
        : "linear-gradient(360deg, rgba(239,68,68,0.22) 0%, rgba(239,68,68,0.04) 66%)"
      : isToday
      ? "linear-gradient(360deg, rgba(59,130,246,0.25) 0%, rgba(59,130,246,0.06) 66%)"
      : "rgba(255,255,255,0.02)";

    const border = row
      ? isUp
        ? "rgba(34, 197, 94, 0.35)"
        : "rgba(239, 68, 68, 0.35)"
      : isToday
      ? "rgba(96, 165, 250, 0.35)"
      : "rgba(255,255,255,0.10)";

    const pctText = pct === null ? "" : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
    const label = ordinal(d);

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
          <div style={styles.noDataTitle}>{loading ? "Loading…" : "in progress"}</div>
        ) : (
          <div style={styles.noData}>{loading ? "Loading…" : "No data"}</div>
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
    border: `1px solid ${BASE_BORDER}`,
    background: BASE_BG,
    color: "#e7edf5",
    padding: "8px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    transition: "background 0.18s ease, border-color 0.18s ease",
  },

  centerControls: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  select: {
    border: `1px solid ${BASE_BORDER}`,
    background: BASE_BG,
    color: "#e7edf5",
    padding: "8px 12px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    transition: "background 0.18s ease, border-color 0.18s ease",
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
    height: CELL_H,
    borderRadius: 14,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    boxSizing: "border-box",
    backdropFilter: "blur(2px)",
  },

  dayLabelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },

  dayLabel: { fontWeight: 950, color: "#e7edf5", fontSize: 16 },

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

  line: {
    opacity: 0.5,
    marginTop: 0,
    fontSize: 12,
    lineHeight: 1.3,
    color: "#e7edf5",
  },

  pct: { marginTop: 10, fontWeight: 900, fontSize: 17 },

  noData: { opacity: 0.6, color: "#e7edf5" },
  noDataTitle: { marginTop: 6, fontWeight: 950, color: "#bfdbfe" },
};
