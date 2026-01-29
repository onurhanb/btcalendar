"use client";

import { useEffect, useMemo, useState } from "react";

type DayData = {
  date_utc: string;
  open: string;
  close: string;
  abs_change: string;
  pct_change: string;
};

type ApiResponse = {
  year: number;
  month: number;
  days: DayData[];
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function CalendarClient() {
  const now = new Date();
  const [year, setYear] = useState(now.getUTCFullYear());
  const [month, setMonth] = useState(now.getUTCMonth() + 1);
  const [data, setData] = useState<Record<string, DayData>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/candles?year=${year}&month=${month}`)
      .then(r => r.json())
      .then((res: ApiResponse) => {
        const map: Record<string, DayData> = {};
        res.days.forEach(d => {
          map[d.date_utc.slice(0, 10)] = d;
        });
        setData(map);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const daysInMonth = useMemo(
    () => new Date(Date.UTC(year, month, 0)).getUTCDate(),
    [year, month]
  );

  const firstWeekdayMon0 = useMemo(() => {
    const d = new Date(Date.UTC(year, month - 1, 1));
    return (d.getUTCDay() + 6) % 7; // Mon=0
  }, [year, month]);

  const todayUTC = new Date().toISOString().slice(0, 10);

  const cells: JSX.Element[] = [];

  for (let i = 0; i < firstWeekdayMon0; i++) {
    cells.push(<div key={`pad-${i}`} style={styles.padCell} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateUTC = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const d = data[dateUTC];
    const isToday = dateUTC === todayUTC;

    let cellStyle = styles.emptyCell;
    let content: JSX.Element | string = "No data";

    if (d) {
      const pct = parseFloat(d.pct_change);
      cellStyle = pct >= 0 ? styles.greenCell : styles.redCell;

      content = (
        <>
          <div style={styles.dayTitle}>
            {day} {MONTHS[month - 1].slice(0, 3)}
          </div>
          <div>Open: {Number(d.open).toLocaleString()}</div>
          <div>Close: {Number(d.close).toLocaleString()}</div>
          <div style={styles.pct}>
            {pct > 0 ? "+" : ""}{pct.toFixed(2)}%
          </div>
        </>
      );
    }

    if (isToday && !d) {
      cellStyle = styles.todayCell;
      content = (
        <>
          <div style={styles.dayTitle}>{day} {MONTHS[month - 1].slice(0, 3)}</div>
          <div style={styles.todayBadge}>TODAY</div>
          <div style={styles.todayText}>Today (in progress)</div>
          <div style={styles.todaySub}>Daily candle closes at 23:59 UTC</div>
        </>
      );
    }

    cells.push(
      <div key={dateUTC} style={cellStyle}>
        {content}
      </div>
    );
  }

  return (
    <>
      <div style={styles.controls}>
        <button onClick={() => setMonth(m => (m === 1 ? 12 : m - 1))}>
          ‹ Prev
        </button>

        <div style={styles.selectRow}>
          <select value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          <select value={year} onChange={e => setYear(+e.target.value)}>
            {Array.from({ length: 10 }).map((_, i) => (
              <option key={i} value={2020 + i}>{2020 + i}</option>
            ))}
          </select>
        </div>

        <button onClick={() => setMonth(m => (m === 12 ? 1 : m + 1))}>
          Next ›
        </button>
      </div>

      <h2 style={styles.monthTitle}>
        {MONTHS[month - 1]} {year}
      </h2>

      <div style={styles.weekRow}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} style={styles.weekDay}>{d}</div>
        ))}
      </div>

      <div style={styles.grid}>
        {loading ? <div>Loading…</div> : cells}
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  controls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  selectRow: {
    display: "flex",
    gap: 8,
  },

  monthTitle: {
    fontSize: 22,
    fontWeight: 800,
    margin: "10px 0 12px",
  },

  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginBottom: 8,
  },

  weekDay: {
    opacity: 0.7,
    fontSize: 13,
    textAlign: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(150px, 1fr))",
    gap: 10,
  },

  padCell: {
    minHeight: 128,
    borderRadius: 14,
  },

  emptyCell: {
    minHeight: 128,
    borderRadius: 14,
    padding: 12,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  greenCell: {
    minHeight: 128,
    borderRadius: 14,
    padding: 12,
    background: "linear-gradient(180deg, #0f3d27, #0b2a1c)",
    border: "1px solid rgba(34,197,94,0.35)",
  },

  redCell: {
    minHeight: 128,
    borderRadius: 14,
    padding: 12,
    background: "linear-gradient(180deg, #3d0f0f, #2a0b0b)",
    border: "1px solid rgba(239,68,68,0.35)",
  },

  todayCell: {
    minHeight: 128,
    borderRadius: 14,
    padding: 12,
    background: "linear-gradient(180deg, #0b1f3d, #08152a)",
    border: "1px solid rgba(59,130,246,0.45)",
  },

  dayTitle: {
    fontWeight: 700,
    marginBottom: 6,
  },

  pct: {
    marginTop: 6,
    fontWeight: 800,
  },

  todayBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 800,
    padding: "2px 6px",
    borderRadius: 999,
    background: "#2563eb",
    marginBottom: 6,
  },

  todayText: {
    fontWeight: 700,
  },

  todaySub: {
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
};
