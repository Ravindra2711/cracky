import { env } from "@/env";
import { auth } from "@/lib/auth";
import { exportContentAsText } from "@/lib/note";

export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  const user = await auth();

  if (!user?.user?.email) {
    return new Response("Saved locally | Login for Cloud Sync", {
      status: 401,
    });
  }

  const body = await req.json();
  const { id, data } = body;

  if (!id || !data) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const key = `${user.user.email}-${id}`;

  // Save to backend
  const putResponse = await fetch(`${env.BACKEND_BASE_URL}/api/v1/save`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.AUTH_TOKEN}`,
    },
    body: JSON.stringify({ key, data }),
  });

  if (putResponse.status !== 200) {
    return new Response("Failed to save", {
      status: 500,
    });
  }

  // Create embeddings using Embedchain
  try {
    const saveEmbedding = await fetch(`${env.BACKEND_BASE_URL}/api/v1/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.AUTH_TOKEN}`
      },
      body: JSON.stringify({
        source: exportContentAsText(data),
        user: user.user.email,
        note_id: id,
      }),
    });

    if (saveEmbedding.status !== 200) {
      console.error("Failed to save embedding");
    }
  } catch (error) {
    console.error("Error occurred while saving embedding: ", error);
  }

  return new Response("Saved", {
    status: 200,
  });
}

export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  const user = await auth();

  if (!user?.user?.email) {
    return new Response("Saved locally | Login for Cloud Sync", {
      status: 401,
    });
  }
  if (!id) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const key = `${user.user.email}-${id}`;

  // Get from backend
  const getResponse = await fetch(`${env.BACKEND_BASE_URL}/api/v1/get?key=${key}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${env.AUTH_TOKEN}`,
    },
  });

  if (getResponse.status !== 200) {
    return new Response(await getResponse.text(), {
      status: getResponse.status,
    });
  }

  const data = await getResponse.json();

  return new Response(JSON.stringify(data), {
    status: 200,
  });
}

export async function DELETE(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  const user = await auth();

  if (!user?.user?.email) {
    return new Response("Saved locally | Login for Cloud Sync", {
      status: 401,
    });
  }
  if (!id) {
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const key = `${user.user.email}-${id}`;

  // Delete from backend
  const deleteResponse = await fetch(`${env.BACKEND_BASE_URL}/api/v1/delete?key=${key}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${env.AUTH_TOKEN}`,
    },
  });

  const data = await deleteResponse.text();
  console.log(data);
  if (deleteResponse.status !== 200) {
    return new Response(data, {
      status: 404,
    });
  }

  return new Response("Deleted", {
    status: 200,
  });
}
