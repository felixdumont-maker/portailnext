import { redirect } from 'next/navigation'

export default async function LegacyConfirmRedirect({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  redirect(`/confirm-email?token=${token}`)
}
