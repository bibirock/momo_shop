import openApiDocument from "@/openapi/openapi.json";

export const dynamic = "force-static";

export function GET() {
  return Response.json(openApiDocument);
}
