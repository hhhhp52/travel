// Simple timezone conversion helpers to show Taipei time (TPE) alongside local time.
// We rely on Intl.DateTimeFormat with specified timeZone.

const IATA_TZ: Record<string, string> = {
  TPE: 'Asia/Taipei',
  SIN: 'Asia/Singapore',
  FRA: 'Europe/Berlin',
  OPO: 'Europe/Lisbon',
  LIS: 'Europe/Lisbon',
  KEF: 'Atlantic/Reykjavik',
  CDG: 'Europe/Paris',
  KGL: 'Africa/Kigali',
  JRO: 'Africa/Dar_es_Salaam',
  LHR: 'Europe/London',
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

function parseDateLabel(dateLabel: string, yearFallback: number): { y: number; m: number; d: number } | null {
  // Supported formats examples in current content:
  // "09/12 Fri", "09/12–13", "09/25–26", "10/02 Thu", "10/10–11", "2025/09/16 Mon" (not present but safe),
  // Also ground section shows explicit (2025/09/19 Thu). For flights, year is 2025 by context.
  const rangeMatch = dateLabel.match(/^(\d{2})\/(\d{2})(?:[–-]\d{2})?/);
  if (rangeMatch) {
    const m = Number(rangeMatch[1]);
    const d = Number(rangeMatch[2]);
    return { y: yearFallback, m, d };
  }
  const fullMatch = dateLabel.match(/^(\d{4})[/-](\d{2})[/-](\d{2})/);
  if (fullMatch) {
    const y = Number(fullMatch[1]);
    const m = Number(fullMatch[2]);
    const d = Number(fullMatch[3]);
    return { y, m, d };
  }
  return null;
}

function toTpeFromLocal(date: { y: number; m: number; d: number }, timeHHmm: string, localTz: string): string | null {
  const [hh, mm] = timeHHmm.split(':').map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  try {
    // Build the local time in its TZ
    const iso = new Date(Date.UTC(date.y, date.m - 1, date.d, hh, mm));
    // Adjust: The above is UTC; we need to interpret hh:mm in localTz. Use formatting parts
    // trick: get offset by formatting the UTC time in local tz and compare; instead, use
    // DateTimeFormat to get epoch millis for that local representation via hack is complex.
    // Simpler: use Temporal if available; otherwise approximate using toLocaleString with timeZone
    // by creating the time in local tz from a fixed baseline. We'll use Intl API round-trip:
    const localStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: localTz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(iso);
    // localStr corresponds to some UTC instant shown in localTz; We need an instant whose local time equals given hh:mm on given date.
    // Iterate around iso by adjusting minutes to find matching local display.
    let guess = iso;
    for (let i = -1440; i <= 1440; i += 60) {
      const t = new Date(iso.getTime() + i * 60000);
      const s = new Intl.DateTimeFormat('en-CA', {
        timeZone: localTz,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(t);
      if (s.startsWith(`${date.y}-${pad(date.m)}-${pad(date.d)}`) && s.endsWith(`${pad(hh)}:${pad(mm)}`)) {
        guess = t;
        break;
      }
    }
    const tpe = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hour12: false }).format(guess);
    return tpe;
  } catch {
    return null;
  }
}

export function fmtWithTpe(iataOrTz: string, dateLabel: string, timeHHmm: string, yearFallback = 2025): string {
  const tz = IATA_TZ[iataOrTz] || iataOrTz; // allow passing TZ directly
  const date = parseDateLabel(dateLabel, yearFallback);
  if (!tz || !date) return `${iataOrTz} ${timeHHmm}`; // fallback
  const tpe = toTpeFromLocal(date, timeHHmm, tz);
  return tpe ? `${iataOrTz} ${timeHHmm} (TPE ${tpe})` : `${iataOrTz} ${timeHHmm}`;
}

export const tzMap = IATA_TZ;
