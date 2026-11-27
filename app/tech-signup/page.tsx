import { redirect } from 'next/navigation'
import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Tech Signup',
  description:
    'Technicians opt in to on-duty SMS service-call alerts from QRcall. English and Spanish.',
  path: '/tech-signup',
})

export default function TechSignupPage() {
  redirect('/tech-signup/sms')
}
