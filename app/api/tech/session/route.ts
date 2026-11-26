import { productionTechDeps } from "@/lib/tech-deps"
import { handleTechSession } from "@/lib/tech-handlers"

export async function GET(request: Request) {
  return handleTechSession(request, productionTechDeps())
}
