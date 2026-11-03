"use client"

import { useEffect } from "react"

export default function TechSignupRedirect() {
  useEffect(() => {
    window.location.href = "/tech-signup/terms"
  }, [])

  return <div className="p-6 text-center">Redirecting…</div>
}