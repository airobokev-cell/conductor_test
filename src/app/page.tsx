import Link from "next/link";
import type { Metadata } from "next";
import LotStatus from "./components/lot-status";
import { localBusinessJsonLd } from "@/lib/business";

export const metadata: Metadata = {
  title: "Downtown Boulder Parking | Just $5/day Weekdays | ParkInBoulder",
  description:
    "The cheapest parking in downtown Boulder, CO. 12 spaces near Pearl Street. Just $5/day weekdays, $15/day weekends. QR code payment — no app, no meter, no regrets. Live availability online.",
  alternates: {
    canonical: "https://parkinboulder.com",
  },
};

const jsonLd = localBusinessJsonLd();

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Where can I find cheap parking in downtown Boulder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ParkInBoulder offers the cheapest daily parking in downtown Boulder at just $5/day on weekdays and $15/day on weekends. Located near Pearl Street with 12 spaces, QR code payment, and live availability at parkinboulder.com.",
      },
    },
    {
      "@type": "Question",
      name: "How much does parking cost near Pearl Street in Boulder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ParkInBoulder is $5/day Monday through Friday (8am-8pm) and $15/day Saturday and Sunday (8am-10pm). No meters, no app download — just scan the QR code and pay.",
      },
    },
    {
      "@type": "Question",
      name: "Is there all-day parking available in Boulder Colorado?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. ParkInBoulder offers flat-rate all-day parking in downtown Boulder. Pay once and you're covered until close. $5/day weekdays, $15/day weekends.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need an app to pay for parking in Boulder?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. ParkInBoulder uses QR code payment — scan with your phone camera, select your space, and pay by card. No app download, no account creation, no coins needed.",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center p-6 bg-navy">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="max-w-md w-full text-center mt-8">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-gold rounded-full mb-4">
            <span className="font-serif text-gold text-2xl font-semibold">P</span>
          </div>
          <h1 className="font-serif text-4xl font-medium text-white tracking-wide">
            ParkInBoulder
          </h1>
          <div className="w-12 h-px bg-gold mx-auto mt-3" />
          <p className="text-gold-light text-sm tracking-widest uppercase mt-3">
            Downtown Boulder Parking
          </p>
        </div>

        <div className="space-y-5">
          {/* Tagline */}
          <p className="font-serif text-white/70 text-lg italic">
            &ldquo;Finally, parking that costs less than your coffee.&rdquo;
          </p>

          <Link
            href="/pay"
            className="block w-full bg-gold hover:bg-gold-light text-navy-dark font-semibold py-4 rounded-lg transition-colors text-lg tracking-wide"
          >
            Pay for Parking
          </Link>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-navy-light border border-navy-light rounded-lg p-4">
              <p className="font-serif text-gold text-2xl">$5</p>
              <p className="text-white/80 text-xs tracking-wider uppercase mt-1">Weekdays</p>
              <p className="text-white/40 text-xs mt-1">Mon &ndash; Fri &middot; 8am &ndash; 8pm</p>
            </div>
            <div className="bg-navy-light border border-navy-light rounded-lg p-4">
              <p className="font-serif text-gold text-2xl">$15</p>
              <p className="text-white/80 text-xs tracking-wider uppercase mt-1">Weekends</p>
              <p className="text-white/40 text-xs mt-1">Sat &ndash; Sun &middot; 8am &ndash; 10pm</p>
            </div>
          </div>

          <LotStatus />
        </div>
      </div>

      {/* The Pitch — cheeky, SEO-rich, shareable */}
      <div className="max-w-lg w-full mt-12 space-y-8">

        <div className="text-center">
          <h2 className="font-serif text-gold text-xl tracking-wide">
            The Parking Lot With Main Character Energy
          </h2>
          <div className="w-8 h-px bg-gold/30 mx-auto mt-3" />
        </div>

        <div className="space-y-6 text-white/60 text-sm leading-relaxed">
          <p>
            Most parking lots have the personality of a DMV waiting room.
            We decided to be different. <span className="text-white/80">ParkInBoulder is a 12-space lot
            in downtown Boulder</span> that charges <span className="text-gold">$5 a day</span> on weekdays &mdash;
            less than a single hour at a parking meter &mdash; and treats your car
            like it actually matters.
          </p>

          <p>
            <span className="text-white/80">No app downloads.</span> No creating an account just to give us
            your money. No fishing for quarters like it&apos;s 1997. Scan the QR code,
            pick your space, pay by card. Done. The whole thing takes about 30 seconds,
            which is roughly how long you&apos;d spend reading the instructions
            on a parking meter that doesn&apos;t work.
          </p>

          <p>
            We&apos;re at <span className="text-white/80">1144 Mapleton Ave</span>, a{" "}
            <Link href="/location" className="text-gold hover:text-gold-light underline underline-offset-2">
              five-minute walk from Pearl Street
            </Link>{" "}
            &mdash; walking distance to everything worth doing.
            Your car gets <span className="text-white/80">24/7 camera surveillance</span> and{" "}
            <span className="text-white/80">license plate recognition</span>, so
            you can go enjoy your overpriced açaí bowl in peace.
          </p>
        </div>

        {/* Why Us — quick hits */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-navy-light rounded-lg p-4 text-center">
            <p className="font-serif text-gold text-lg">30s</p>
            <p className="text-white/40 text-xs mt-1">To pay</p>
          </div>
          <div className="bg-navy-light rounded-lg p-4 text-center">
            <p className="font-serif text-gold text-lg">0</p>
            <p className="text-white/40 text-xs mt-1">Apps to download</p>
          </div>
          <div className="bg-navy-light rounded-lg p-4 text-center">
            <p className="font-serif text-gold text-lg">24/7</p>
            <p className="text-white/40 text-xs mt-1">Cameras</p>
          </div>
        </div>

        {/* FAQ section — Google loves these */}
        <div className="space-y-4">
          <h2 className="font-serif text-gold text-sm tracking-wider uppercase text-center">
            Questions People Actually Ask
          </h2>

          <div className="space-y-3">
            <details className="bg-navy-light rounded-lg group">
              <summary className="p-4 cursor-pointer text-white/70 text-sm hover:text-white/90 transition-colors">
                Where can I find cheap parking in downtown Boulder?
              </summary>
              <div className="px-4 pb-4 text-white/50 text-xs leading-relaxed">
                You&apos;re looking at it. ParkInBoulder is $5/day on weekdays and $15/day on weekends &mdash;
                the cheapest daily parking in downtown Boulder. We&apos;re near Pearl Street with 12 spaces
                and live availability right on this page. No meters, no apps, no selling a kidney.
              </div>
            </details>

            <details className="bg-navy-light rounded-lg group">
              <summary className="p-4 cursor-pointer text-white/70 text-sm hover:text-white/90 transition-colors">
                How does QR code parking payment work?
              </summary>
              <div className="px-4 pb-4 text-white/50 text-xs leading-relaxed">
                Scan the QR code on our sign with your phone camera. It opens parkinboulder.com &mdash;
                select your space number, enter your plate, and pay by card. Takes about 30 seconds.
                No app to download, no account to create. We text you a receipt if you want one.
              </div>
            </details>

            <details className="bg-navy-light rounded-lg group">
              <summary className="p-4 cursor-pointer text-white/70 text-sm hover:text-white/90 transition-colors">
                Is there all-day parking near Pearl Street?
              </summary>
              <div className="px-4 pb-4 text-white/50 text-xs leading-relaxed">
                Yes. Pay once at ParkInBoulder and you&apos;re covered all day until we close
                (8pm weekdays, 10pm weekends). No re-feeding meters, no two-hour limits.
                Park, walk to Pearl Street, do your thing.
              </div>
            </details>

            <details className="bg-navy-light rounded-lg group">
              <summary className="p-4 cursor-pointer text-white/70 text-sm hover:text-white/90 transition-colors">
                Is ParkInBoulder safe? Is my car secure?
              </summary>
              <div className="px-4 pb-4 text-white/50 text-xs leading-relaxed">
                We have 24/7 security cameras with license plate recognition technology.
                We know exactly which cars are in our lot at all times. It&apos;s a 12-space lot,
                not a 2,000-car garage where things disappear. Your car is safer here than
                in your own driveway. Probably.
              </div>
            </details>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-4">
          <Link
            href="/pay"
            className="inline-block bg-gold hover:bg-gold-light text-navy-dark font-semibold py-3 px-8 rounded-lg transition-colors tracking-wide"
          >
            Park Now &mdash; $5/day
          </Link>
        </div>

        {/* Plan your visit — internal links for crawl + users */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <Link href="/location" className="bg-navy-light rounded-lg p-3 text-white/60 hover:text-gold transition-colors">
            Location &amp; Directions
          </Link>
          <Link href="/rates" className="bg-navy-light rounded-lg p-3 text-white/60 hover:text-gold transition-colors">
            Compare Rates
          </Link>
          <Link href="/events" className="bg-navy-light rounded-lg p-3 text-white/60 hover:text-gold transition-colors">
            Event Parking
          </Link>
        </div>

        <div className="border-t border-white/10 pt-4 text-center">
          <p className="text-white/30 text-xs tracking-wide uppercase">
            No overnight parking &middot; Cameras in use
          </p>
          <p className="text-white/30 text-xs tracking-wide mt-1">
            1144 Mapleton Ave, Boulder, CO 80304
          </p>
        </div>

        <div className="text-center pb-8">
          <Link
            href="/login"
            className="text-xs text-white/15 hover:text-white/30 tracking-wider uppercase"
          >
            Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
}
