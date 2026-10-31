export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="mb-4">Last updated: October 31, 2026</p>
      <p className="mb-4">
        QRcall.app provides a service-call notification system for maintenance teams. 
        By using the technician signup form or receiving SMS alerts, you agree to these terms.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">SMS Alerts</h2>
      <p className="mb-4">
        Technicians who opt in will receive operational SMS messages about service calls. 
        Message frequency varies. Message and data rates may apply. 
        Reply STOP to opt out at any time. Reply HELP for help.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Use of the Service</h2>
      <p className="mb-4">
        You agree to use QRcall only for legitimate maintenance and operational purposes. 
        Plant administrators are responsible for adding only technicians who have consented.
      </p>
      <p className="mt-8 text-sm text-gray-600">
        Questions? Contact sales@qrcall.app
      </p>
    </div>
  )
}