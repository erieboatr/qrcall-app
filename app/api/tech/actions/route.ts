import { productionTechDeps } from "@/lib/tech-deps"
import { handleTechAction } from "@/lib/tech-handlers"

export async function POST(request: Request) {
  return handleTechAction(request, productionTechDeps())
}
