/**
 * Formats a date string into an object with multiple formats for UI display.
 * @param {string} dateStr - The ISO date string (YYYY-MM-DD).
 * @returns {object} - Formatted date parts.
 */
export function formatEventDate(dateStr) {
    if (!dateStr) return { day: "--", month: "--", year: "----", formatted: "--/--/----", label: "--", monthName: "--", weekday: "--" };
    try {
      const d = new Date(dateStr + "T00:00:00");
      if (isNaN(d.getTime())) return { day: dateStr, month: "", year: "", formatted: dateStr, label: dateStr, monthName: "", weekday: "" };
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear());
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return {
        day,
        month,
        year,
        formatted: `${day}/${month}/${year}`,
        label: `${day} ${monthNames[d.getMonth()]} ${year}`,
        monthName: monthNames[d.getMonth()],
        weekday: weekdays[d.getDay()],
      };
    } catch {
      return { day: dateStr, month: "", year: "", formatted: dateStr, label: dateStr, monthName: "", weekday: "" };
    }
}
