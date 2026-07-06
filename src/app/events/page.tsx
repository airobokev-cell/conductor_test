import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Parking in Downtown Boulder — Farmers Market & More",
  description:
    "Where to park for the Boulder Farmers Market, Bands on the Bricks, Boulder Creek Festival, and Pearl Street events. Flat-rate parking at 1144 Mapleton Ave, a short walk from all of it.",
  alternates: {
    canonical: "https://parkinboulder.com/events",
  },
};

const events = [
  {
    name: "Boulder Farmers Market",
    when: "Saturdays (and Wednesday evenings in summer), April–November",
    where: "13th Street between Canyon & Arapahoe",
    walk: "12-minute walk from the lot",
    tip: "Saturday mornings the streets around 13th are a feeding frenzy by 9am. Park here at 8, walk down, buy the peaches before they're gone.",
  },
  {
    name: "Bands on the Bricks",
    when: "Wednesday evenings, June–August",
    where: "Pearl Street Mall, 1300 block",
    walk: "7-minute walk from the lot",
    tip: "Weekday evening = $5 flat here while everyone else feeds meters until 8pm or hunts garage spots. Note: no overnight parking — take your car home after the encore.",
  },
  {
    name: "Boulder Creek Festival",
    when: "Memorial Day weekend",
    where: "Central Park & Boulder Creek Path",
    walk: "13-minute walk from the lot",
    tip: "The city closes streets near the festival and everything south of Canyon gets chaotic. Mapleton Hill stays calm — park here and stroll in past the crowds.",
  },
  {
    name: "Pearl Street holiday season",
    when: "Late November–December",
    where: "Pearl Street Mall",
    walk: "5-minute walk from the lot",
    tip: "Lights, carolers, zero available meters. Weekday shopping trips are $5 flat here, and you can haul bags back to the car mid-spree.",
  },
];

export default function EventsPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-navy">
      <div className="max-w-lg w-full mt-8 space-y-8">
        <div className="text-center">
          <p className="text-gold-light text-sm tracking-widest uppercase">
            <Link href="/" className="hover:text-gold">ParkInBoulder</Link>
          </p>
          <h1 className="font-serif text-3xl font-medium text-white mt-2">
            Event Parking, Minus the Circling
          </h1>
          <div className="w-12 h-px bg-gold mx-auto mt-3" />
          <p className="text-white/50 text-sm mt-4">
            Downtown Boulder&apos;s best events are all within a 15-minute walk
            of our 12 spaces at 1144 Mapleton Ave. Here&apos;s the playbook.
          </p>
        </div>

        <div className="space-y-4">
          {events.map((e) => (
            <div key={e.name} className="bg-navy-light rounded-lg p-5">
              <h2 className="font-serif text-gold text-lg">{e.name}</h2>
              <div className="mt-2 space-y-1 text-xs text-white/40">
                <p>{e.when}</p>
                <p>
                  {e.where} &middot;{" "}
                  <span className="text-white/60">{e.walk}</span>
                </p>
              </div>
              <p className="mt-3 text-sm text-white/60 leading-relaxed">{e.tip}</p>
            </div>
          ))}
        </div>

        <div className="bg-navy-light border border-gold/20 rounded-lg p-5 text-sm text-white/60 leading-relaxed">
          <h2 className="font-serif text-gold text-lg mb-2">The fine print</h2>
          <p>
            12 spaces, first come first served — check{" "}
            <Link href="/" className="text-gold hover:text-gold-light underline underline-offset-2">
              live availability
            </Link>{" "}
            before you drive over. $5/day weekdays, $15/day weekends, and the
            day rate covers you until close (8pm weekdays, 10pm weekends). No
            overnight parking, so plan your ride home accordingly.
          </p>
        </div>

        <div className="text-center py-4">
          <Link
            href="/pay"
            className="inline-block bg-gold hover:bg-gold-light text-navy-dark font-semibold py-3 px-8 rounded-lg transition-colors tracking-wide"
          >
            Park Now
          </Link>
          <p className="mt-4 text-xs">
            <Link href="/location" className="text-white/40 hover:text-gold">Location &amp; directions</Link>
            <span className="text-white/20 mx-2">&middot;</span>
            <Link href="/rates" className="text-white/40 hover:text-gold">Compare rates</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
