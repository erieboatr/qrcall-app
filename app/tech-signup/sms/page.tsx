import SignupForm from './signup-form'

export const instant = false

export default async function TechSignupSmsPage({
  searchParams,
}: {
  searchParams: Promise<{ plant?: string | string[] }>
}) {
  const params = await searchParams
  const plantParam = params.plant
  const plantId = (Array.isArray(plantParam) ? plantParam[0] : plantParam) || 'QRcall'

  return (
    <main>
      <SignupForm plantId={plantId} />
    </main>
  )
}
