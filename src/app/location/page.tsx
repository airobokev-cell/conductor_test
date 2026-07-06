import Link from "next/link";
import type { Metadata } from "next";
import {
  localBusinessJsonLd,
  ADDRESS_DISPLAY,
  GOOGLE_MAPS_URL,
} from "@/lib/business";

export const metadata: Metadata = {
  title: "Location & Directions — Parking Near Pearl Street",
  description:
    "ParkInBoulder is at 1144 Mapleton Ave, a five-minute walk from Pearl Street Mall. Directions from US-36, Broadway, and Canyon Blvd, plus walking times to downtown Boulder landmarks.",
  alternates: {
    canonical: "https://parkinboulder.com/location",
  },
};

const jsonLd = localBusinessJsonLd();

const walkingTimes = [
  { place: "Pearl Street Mall (west end)", time: "5 min", detail: "3 blocks south on 11th St" },
  { place: "Boulder County Courthouse", time: "7 min", detail: "13th & Pearl" },
  { place: "Boulder Theater", time: "8 min", detail: "14th & Spruce" },
  { place: "Boulder Farmers Market", time: "12 min", detail: "13th St at Canyon (Sat, Apr–Nov)" },
  { place: "Mount Sanitas Trailhead", time: "15 min", detail: "west end of Mapleton Ave" },
];

export default function LocationPage() {
  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-lg w-full mt-8 space-y-8">
        <div className="text-center">
          <p className="text-gold-light text-sm tracking-widest uppercase">
            <Link href="/" className="hover:text-gold">ParkInBoulder</Link>
          </p>
          <h1 className="font-serif text-3xl font-medium text-white mt-2">
            Where to Park Near Pearl Street
          </h1>
          <div className="w-12 h-px bg-gold mx-auto mt-3" />
        </div>

        <div className="bg-navy-light border border-gold/20 rounded-lg p-5 text-center">
          <p className="font-serif text-gold text-xl">{ADDRESS_DISPLAY}</p>
          <p className="text-white/50 text-sm mt-2">
            On Mapleton Hill, three blocks north of Pearl Street — closer than
            most of the city garages, without the garage.
          </p>
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-gold hover:bg-gold-light text-navy-dark font-semibold py-2 px-6 rounded-lg transition-colors text-sm"
          >
            Open in Google Maps
          </a>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-gold text-sm tracking-wider uppercase text-center">
            Getting Here
          </h2>
          <div className="space-y-3 text-white/60 text-sm leading-relaxed">
            <div className="bg-navy-light rounded-lg p-4">
              <p className="text-white/80 font-medium">From Denver / US-36</p>
              <p className="mt-1">
                Take US-36 into Boulder, exit onto 28th Street, turn left on
                Canyon Blvd, right on Broadway, then left on Mapleton Ave. The
                lot is at 1144 Mapleton, just west of Broadway.
              </p>
            </div>
            <div className="bg-navy-light rounded-lg p-4">
              <p className="text-white/80 font-medium">From North Boulder</p>
              <p className="mt-1">
                Take Broadway south and turn right (west) on Mapleton Ave —
                you&apos;ll see the lot within a block and a half.
              </p>
            </div>
            <div className="bg-navy-light rounded-lg p-4">
              <p className="text-white/80 font-medium">Walking to Pearl Street</p>
              <p className="mt-1">
                Head south on 11th Street for three short blocks and you&apos;re
                standing at the west end of the Pearl Street Mall. Flat sidewalk
                the whole way — about five minutes at a stroll.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-gold text-sm tracking-wider uppercase text-center">
            Walking Times From the Lot
          </h2>
          <div className="bg-navy-light rounded-lg divide-y divide-white/5">
            {walkingTimes.map((w) => (
              <div key={w.place} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="text-white/80">{w.place}</p>
                  <p className="text-white/40 text-xs mt-0.5">{w.detail}</p>
                </div>
                <p className="font-serif text-gold whitespace-nowrap ml-4">{w.time}</p>
              </div>
            ))}
          </div>
          <p className="text-white/40 text-xs text-center">
            Downtown Boulder is compact. If it&apos;s worth doing, it&apos;s
            within a 15-minute walk of this lot.
          </p>
        </div>

        <div className="text-center py-4">
          <Link
            href="/pay"
            className="inline-block bg-gold hover:bg-gold-light text-navy-dark font-semibold py-3 px-8 rounded-lg transition-colors tracking-wide"
          >
            Park Now &mdash; $5/day Weekdays
          </Link>
          <p className="mt-4 text-xs">
            <Link href="/rates" className="text-white/40 hover:text-gold">Compare Boulder parking rates</Link>
            <span className="text-white/20 mx-2">&middot;</span>
            <Link href="/events" className="text-white/40 hover:text-gold">Event parking</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
