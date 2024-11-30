import { env } from "@/env";
import { auth } from "@/lib/auth";
import { type AiResponse } from "@/types/aiResponse";

export const runtime = "edge";

export async function GET(req: Request): Promise<Response> {
    const user = await auth();

    if (!user?.user?.email) {
        return new Response("Login is required for this endpoint", {
            status: 401,
        });
    }

    const prompt = new URL(req.url).searchParams.get("prompt");

    if (!prompt) {
        return new Response("Invalid request", {
            status: 400,
        });
    }

    const aiResponse = await fetch(`${env.BACKEND_BASE_URL}/api/v1/search?query=${prompt}&user_id=${user.user.email}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${env.AUTH_TOKEN}`
        }
    });

    if (aiResponse.status !== 200) {
        return new Response("Failed to get search results", {
            status: 500,
        });
    }

    const data = await aiResponse.json() as AiResponse;

    return new Response(JSON.stringify(data), {
        status: 200,
    });
}
