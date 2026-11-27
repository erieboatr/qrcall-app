import { productionTechDeps } from "@/lib/tech-deps"
import { handleTechLogin } from "@/lib/tech-handlers"

export async function POST(request: Request) {
  return handleTechLogin(request, productionTechDeps())
}
