import { format, parse, isValid } from "date-fns";

/**
 * Standardizes date strings for resume display.
 * Handles formats like "2021-01", "Jan 2021", "January 2021", "2021", "Present", "Ongoing".
 * Returns a formatted string like "Jan 2021" or "2021".
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  
  const trimmed = dateStr.trim();
  if (!trimmed) return "";
  
  const lower = trimmed.toLowerCase();
  if (lower === "present" || lower === "ongoing" || lower === "current") {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }

  // Try parsing common formats
  const formats = ["yyyy-MM-dd", "yyyy-MM", "MM/yyyy", "MMM yyyy", "MMMM yyyy", "yyyy"];
  
  for (const f of formats) {
    try {
      const parsed = parse(trimmed, f, new Date());
      if (isValid(parsed)) {
        if (f === "yyyy") return format(parsed, "yyyy");
        return format(parsed, "MMM yyyy");
      }
    } catch (e) {
      // Continue to next format
    }
  }

  // If parsing fails, return as is (but cleaned up)
  return trimmed;
}

/**
 * Formats a date range.
 */
export function formatDateRange(start?: string, end?: string): string {
  const s = formatDate(start || "");
  const e = formatDate(end || "");
  
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  
  return `${s} — ${e}`;
}
