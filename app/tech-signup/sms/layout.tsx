import { pageMetadata } from '@/lib/site'

export const metadata = pageMetadata({
  title: 'Tech Signup',
  description:
    'Join QRcall SMS alerts. Only technicians who are on duty receive service-call texts. Reply STOP to opt out.',
  path: '/tech-signup/sms',
})

export default function TechSignupSmsLayout({ children }: { children: React.ReactNode }) {
  return children
}
