import { productionTechDeps } from "@/lib/tech-deps"
import { handleSetPin } from "@/lib/tech-handlers"

export async function POST(request: Request) {
  return handleSetPin(request, productionTechDeps())
}
