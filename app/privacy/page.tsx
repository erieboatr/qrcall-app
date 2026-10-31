export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">Last updated: October 31, 2026</p>
      <p className="mb-4">
        QRcall.app collects only the information needed to deliver service-call alerts.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc pl-5 mb-4">
        <li>Technician name and mobile number (when you sign up)</li>
        <li>Plant affiliation</li>
        <li>Service call details submitted through the system</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use It</h2>
      <p className="mb-4">
        We use your phone number solely to send operational SMS alerts about equipment service calls. 
        We do not sell or share your information with third parties for marketing.
      </p>
      <p className="mb-4">
        We will not share or sell your mobile information with third parties for promotional or marketing purposes.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Opt-Out</h2>
      <p className="mb-4">
        You may opt out at any time by replying STOP to any message. 
        You may also contact your plant administrator to be removed.
      </p>
      <p className="mt-8 text-sm text-gray-600">
        Questions? Contact sales@qrcall.app
      </p>
    </div>
  )
}