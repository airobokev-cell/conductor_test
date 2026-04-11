import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ParkInBoulder
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Easy, affordable parking in downtown Boulder.
        </p>

        <div className="space-y-4">
          <Link
            href="/pay"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
          >
            Pay for Parking
          </Link>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white border rounded-xl p-4">
              <p className="font-semibold text-gray-900">Weekdays</p>
              <p className="text-gray-600">$15/day</p>
              <p className="text-gray-400 text-xs">Mon-Fri 8am-8pm</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="font-semibold text-gray-900">Weekends</p>
              <p className="text-gray-600">$25/day</p>
              <p className="text-gray-400 text-xs">Sat-Sun 8am-10pm</p>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            No overnight parking. Lot closed outside posted hours.
            <br />
            Scan the QR code on the lot sign or tap above.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Owner Login
          </Link>
        </div>
      </div>
    </div>
  );
}
