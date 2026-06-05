// Formats a date string like "June 5th 2026 11:36 a.m."
export const formatFullDate = (input: string | Date): string => {
  const d = typeof input === "string" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "";

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const day = d.getDate();
  const suffix = (n: number) => {
    const v = n % 100;
    if (v >= 11 && v <= 13) return "th";
    switch (n % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "p.m." : "a.m.";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${months[d.getMonth()]} ${day}${suffix(day)} ${d.getFullYear()} ${hours}:${minutes} ${ampm}`;
};
