'use client'

import { useState } from 'react'

export default function Home() {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()

      console.log('Checkout Response:', data) // Log full response for debugging

      if (!res.ok) {
        throw new Error(data.error || `HTTP error! status: ${res.status}`)
      }

      if (data.returnCode && data.returnCode !== '0000') {
        alert(`LINE Pay Error: ${data.returnCode} - ${data.returnMessage}`)
        return
      }

      if (data.info?.paymentUrl?.web) {
        window.location.href = data.info.paymentUrl.web
      } else {
        alert('Failed to get payment URL. Check console for details.')
      }
    } catch (e) {
      console.error(e)
      alert(`Error during checkout: ${(e as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="z-10 w-full max-w-sm rounded-[24px] border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-700 dark:bg-gray-800 transition-all hover:scale-105">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#06C755]/10 text-[#06C755]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Demo Product
        </h2>
        <p className="mb-6 text-gray-500 dark:text-gray-400">
          Official LINE Pay V4 SDK Demo
        </p>
        <div className="mb-8 flex items-end justify-between border-t border-gray-100 pt-6 dark:border-gray-700">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Price
            </span>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              $100
            </div>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            TWD
          </span>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-xl bg-[#06C755] px-5 py-3 text-center text-sm font-medium text-white shadow-lg shadow-green-500/30 transition-all hover:bg-[#05b34c] hover:shadow-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Pay with LINE Pay'
          )}
        </button>
      </div>
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Edit{' '}
          <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">
            .env.local
          </code>{' '}
          to configure credentials
        </p>
      </div>
    </main>
  )
}
