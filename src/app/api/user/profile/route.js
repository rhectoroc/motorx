import { auth } from "@/auth";

// Asumimos que API_USER viene de tus variables de entorno
const API_URL = process.env.API_USER; 

export async function GET() {
  try {
    const session = await auth();
    // Verificación de sesión basada en tu configuración de auth.js
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Obtener datos del usuario desde la API externa
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "GET",
        id: userId,
      }),
    });

    const userData = await response.json();

    if (!response.ok) {
      throw new Error(userData.error || "Failed to read user data.");
    }

    // Lógica de sub-clientes
    let subClients = [];
    if (userData.is_main_client) {
      const subResponse = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUB",
          id: userId,
        }),
      });
      
      const subData = await subResponse.json();
      if (!subResponse.ok) {
        throw new Error(subData.error || "Failed to read subclients data.");
      }
      subClients = subData;
    }

    return Response.json({
      user: {
        ...userData,
        sub_clients: subClients,
      },
    });
  } catch (error) {
    console.error("GET /api/user/profile error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "UPDATE",
        id: userId,
        name: body["name"], // Corregido de 'nane'
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update user data.");
    }

    // Retornamos el primer elemento si es un array, o el objeto si es directo
    const updatedUser = Array.isArray(result) ? result[0] : result;
    return Response.json({ user: updatedUser });

  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}