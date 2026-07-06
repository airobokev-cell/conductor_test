// Single source of truth for business identity (NAP: name, address, phone).
// Every schema block, footer, and directory listing must pull from here —
// citation consistency is a local-SEO ranking factor. Never hand-type the
// address anywhere else in the codebase or in external listings.

export const BUSINESS = {
  name: "ParkInBoulder",
  url: "https://parkinboulder.com",
  streetAddress: "1144 Mapleton Ave",
  locality: "Boulder",
  region: "CO",
  postalCode: "80304",
  country: "US",
  // Geocoded from the street address (OSM); keep in sync if address changes
  latitude: 40.02072,
  longitude: -105.28164,
  // No public phone by choice — leave phone blank in directories
  numberOfSpaces: 12,
  priceRange: "$5-$15",
  description:
    "The cheapest daily parking in downtown Boulder, Colorado. 12 spaces at 1144 Mapleton Ave, a short walk from Pearl Street. $5/day weekdays, $15/day weekends. QR code payment — no app needed.",
} as const;

export const ADDRESS_DISPLAY = `${BUSINESS.streetAddress}, ${BUSINESS.locality}, ${BUSINESS.region} ${BUSINESS.postalCode}`;

export const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${BUSINESS.name} ${ADDRESS_DISPLAY}`
)}`;

export function postalAddressJsonLd() {
  return {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.streetAddress,
    addressLocality: BUSINESS.locality,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.country,
  };
}

export function geoJsonLd() {
  return {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.latitude,
    longitude: BUSINESS.longitude,
  };
}

export function openingHoursJsonLd() {
  return [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "08:00",
      closes: "22:00",
    },
  ];
}

// Base local-business entity. Typed as both ParkingFacility (what we are)
// and LocalBusiness (what Google's local rich results consume).
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["ParkingFacility", "LocalBusiness"],
    "@id": `${BUSINESS.url}/#business`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: BUSINESS.url,
    address: postalAddressJsonLd(),
    geo: geoJsonLd(),
    hasMap: GOOGLE_MAPS_URL,
    openingHoursSpecification: openingHoursJsonLd(),
    currenciesAccepted: "USD",
    paymentAccepted: "Credit Card",
    priceRange: BUSINESS.priceRange,
    numberOfParkingSpaces: BUSINESS.numberOfSpaces,
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "QR Code Payment", value: true },
      { "@type": "LocationFeatureSpecification", name: "Security Cameras", value: true },
      { "@type": "LocationFeatureSpecification", name: "License Plate Recognition", value: true },
    ],
  };
}
