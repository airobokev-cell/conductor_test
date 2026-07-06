// Pricing for ParkInBoulder
// Mon-Fri: $5/day, enforced 8am-8pm
// Sat-Sun: $15/day, enforced 8am-10pm
// All times in America/Denver

const TIMEZONE = "America/Denver";

interface PricingInfo {
  rateCents: number;
  rateDisplay: string;
  isEnforced: boolean;
  dayType: "weekday" | "weekend";
  enforceStart: number; // hour (24h)
  enforceEnd: number; // hour (24h)
}

export function getPricingForDate(date: Date): PricingInfo {
  const denverTime = new Date(
    date.toLocaleString("en-US", { timeZone: TIMEZONE })
  );
  const day = denverTime.getDay(); // 0=Sun, 6=Sat
  const hour = denverTime.getHours();
  const minutes = denverTime.getMinutes();
  const currentTime = hour + minutes / 60;

  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return {
      rateCents: 1500,
      rateDisplay: "$15.00",
      isEnforced: currentTime >= 8 && currentTime < 22,
      dayType: "weekend",
      enforceStart: 8,
      enforceEnd: 22,
    };
  }

  return {
    rateCents: 500,
    rateDisplay: "$5.00",
    isEnforced: currentTime >= 8 && currentTime < 20,
    dayType: "weekday",
    enforceStart: 8,
    enforceEnd: 20,
  };
}

export function getTimezone() {
  return TIMEZONE;
}
