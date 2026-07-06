import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boulder Parking Rates Compared — Garages, Meters & Us",
  description:
    "What parking actually costs in downtown Boulder: city garages, surface lots, street meters, and ParkInBoulder's $5/day flat rate. An honest comparison, including when a garage is the better deal.",
  alternates: {
    canonical: "https://parkinboulder.com/rates",
  },
};

const rows = [
  {
    option: "ParkInBoulder",
    weekday: "$5 flat, all day",
    weekend: "$15 flat, all day",
    limit: "None — pay once, done",
    highlight: true,
  },
  {
    option: "City garages",
    weekday: "$1.75/hr, up to ~$16/day",
    weekend: "Free",
    limit: "None",
    highlight: false,
  },
  {
    option: "City surface lots",
    weekday: "First 90 min free, then $1.75/hr",
    weekend: "Free",
    limit: "3 hours max",
    highlight: false,
  },
  {
    option: "Street meters",
    weekday: "$1.50–$3.00/hr",
    weekend: "$1.50–$3.00/hr",
    limit: "3 hours max",
    highlight: false,
  },
];

export default function RatesPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-navy">
      <div className="max-w-lg w-full mt-8 space-y-8">
        <div className="text-center">
          <p className="text-gold-light text-sm tracking-widest uppercase">
            <Link href="/" className="hover:text-gold">ParkInBoulder</Link>
          </p>
          <h1 className="font-serif text-3xl font-medium text-white mt-2">
            What Parking Costs in Boulder
          </h1>
          <div className="w-12 h-px bg-gold mx-auto mt-3" />
          <p className="text-white/50 text-sm mt-4">
            An honest comparison — including the times we&apos;re not the
            cheapest option. (Yes, really.)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
                <th className="p-3">Option</th>
                <th className="p-3">Weekdays</th>
                <th className="p-3">Weekends</th>
                <th className="p-3">Time limit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.option}
                  className={
                    r.highlight
                      ? "bg-navy-light border border-gold/30 text-white/90"
                      : "bg-navy-light/50 text-white/60"
                  }
                >
                  <td className={`p-3 font-medium ${r.highlight ? "text-gold" : ""}`}>
                    {r.option}
                  </td>
                  <td className="p-3">{r.weekday}</td>
                  <td className="p-3">{r.weekend}</td>
                  <td className="p-3">{r.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-white/30 text-xs text-center -mt-4">
          City rates per{" "}
          <a
            href="https://bouldercolorado.gov/guide/parking"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/50"
          >
            bouldercolorado.gov
          </a>{" "}
          — check current rates before you go.
        </p>

        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <div>
            <h2 className="font-serif text-gold text-lg mb-2">
              Weekdays: this isn&apos;t close
            </h2>
            <p>
              Staying downtown more than three hours on a weekday? Meters cap
              out at three hours, surface lots too. That leaves garages at
              $1.75/hour — about $14 for a work day — or{" "}
              <span className="text-white/80">$5 flat here, three blocks
              from Pearl Street</span>. If you&apos;re working, shopping, or
              making a day of it, the math does itself.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-gold text-lg mb-2">
              Weekends: the city garages are free (seriously)
            </h2>
            <p>
              We could hide this, but you&apos;d find out. City garages are free
              on Saturdays, Sundays, and holidays — and on a nice Saturday they
              fill up while you&apos;re circling the block watching pedestrians
              carry burritos. Our $15 weekend rate buys you a real space on a
              quiet street with no ramps, no ticket machines, and no circling.
              If the garages have room, take the free spot. If they don&apos;t,
              you know where we are.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-gold text-lg mb-2">
              The hidden cost nobody prices in
            </h2>
            <p>
              Meters mean re-parking every three hours or eating a ticket —
              Boulder parking fines start around $25, which is five days of
              parking here. Flat-rate means you pay once and forget your car
              exists until you need it.
            </p>
          </div>
        </div>

        <div className="text-center py-4">
          <Link
            href="/pay"
            className="inline-block bg-gold hover:bg-gold-light text-navy-dark font-semibold py-3 px-8 rounded-lg transition-colors tracking-wide"
          >
            Park Now &mdash; $5/day Weekdays
          </Link>
          <p className="mt-4 text-xs">
            <Link href="/location" className="text-white/40 hover:text-gold">Location &amp; directions</Link>
            <span className="text-white/20 mx-2">&middot;</span>
            <Link href="/events" className="text-white/40 hover:text-gold">Event parking</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
