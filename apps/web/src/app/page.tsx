import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { LandingPage } from '@/components/landing/landing-page'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    return <DashboardPage />
  }

  return <LandingPage />
}