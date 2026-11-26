import { productionTechDeps } from "@/lib/tech-deps"
import { handleTechLogout } from "@/lib/tech-handlers"

export async function POST(request: Request) {
  return handleTechLogout(request, productionTechDeps())
}
