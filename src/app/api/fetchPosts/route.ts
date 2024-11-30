import { auth } from "@/lib/auth";
import { env } from "@/env";

export async function GET(_: Request): Promise<Response> {
  const user = await auth();

  if (!user?.user?.email) {
    return new Response(JSON.stringify({
      message: "Unauthorized",
    }), {
      status: 401,
    });
  }

  // Fetch posts from backend
  const getResponse = await fetch(
    `${env.BACKEND_BASE_URL}/api/v1/getAllPosts?user=${user.user.email}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${env.AUTH_TOKEN}`,
      },
    },
  );

  if (getResponse.status !== 200) {
    return new Response("Failed to get posts", {
      status: 500,
    });
  }

  const data = await getResponse.json();

  // Assuming the backend returns data in the format we need
  // If not, we might need to transform it here

  return new Response(JSON.stringify(data), {
    status: 200,
  });
}
