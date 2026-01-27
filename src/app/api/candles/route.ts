import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1–12

  if (!year || !month || month < 1 || month > 12) {
    return NextResponse.json(
      { error: "Invalid year or month" },
      { status: 400 }
    );
  }

  // Ayın UTC başlangıcı ve bitişi
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(year, month, 0)); // ayın son günü
  const end = `${year}-${String(month).padStart(2, "0")}-${String(
    endDate.getUTCDate()
  ).padStart(2, "0")}`;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        date_utc,
        open,
        close,
        abs_change,
        pct_change
      FROM daily_candles
      WHERE date_utc BETWEEN $1 AND $2
      ORDER BY date_utc ASC
      `,
      [start, end]
    );

    return NextResponse.json({
      year,
      month,
      days: rows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Database error" },
      { status: 500 }
    );
  }
}
