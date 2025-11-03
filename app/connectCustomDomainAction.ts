'use server'

type DomainState = {
  success?: boolean
  message?: string
  error?: string
}

export async function connectCustomDomainAction(
  prevState: DomainState,
  formData: FormData
): Promise<DomainState> {
  const domain = (formData.get('domain') as string)?.trim().toLowerCase()

  if (!domain) {
    return { success: false, error: 'Domain is required' }
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_AUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: domain }),
      }
    )

    const result = await response.json()

    if (response.ok) {
      const subdomain = domain.split('.')[0]
      return {
        success: true,
        message: `✅ Domain ${domain} connected successfully. Please add a CNAME → cname.vercel-dns.com`,
      }
    }

    return {
      success: false,
      error: result.error?.message ?? 'Failed to connect domain. Check DNS or permissions.',
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
