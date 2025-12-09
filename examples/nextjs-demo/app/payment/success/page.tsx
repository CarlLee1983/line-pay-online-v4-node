import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full max-w-sm rounded-[24px] border border-gray-200 bg-white p-8 text-center shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Payment Successful!
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Your transaction has been completed securely.
        </p>
        <Link
          href="/"
          className="block w-full rounded-xl bg-gray-900 px-5 py-3 text-center text-sm font-medium text-white transition-all hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Back to Home
        </Link>
      </div>
    </main>
  )
}
