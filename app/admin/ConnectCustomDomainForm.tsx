'use client'

import { useActionState } from 'react'
import { connectCustomDomainAction } from '../connectCustomDomainAction'

export function ConnectCustomDomainForm() {
  const [state, formAction, isPending] = useActionState(connectCustomDomainAction, {})

  return (
    <form action={formAction} className="mt-8">
      <input
        type="text"
        name="domain"
        placeholder="Enter your domain (e.g. tomy.com)"
        className="border p-2 rounded w-full"
        disabled={isPending}
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        disabled={isPending}
      >
        {isPending ? 'Connecting...' : 'Connect Domain'}
      </button>

      {state?.error && (
        <p className="text-red-500 mt-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-green-600 mt-2">{state.message}</p>
      )}
    </form>
  )
}
