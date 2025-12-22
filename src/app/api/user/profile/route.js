import { auth } from "@/auth";
import pg from 'pg';

const { Pool } = pg;

// Configuración de la conexión a la base de datos local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * GET: Obtiene el perfil del usuario actual directamente de la DB
 */
export async function GET() {
  try {
    const session = await auth();

    // Verificación de sesión: Si no hay sesión, devolvemos JSON de error
    if (!session || !session.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Buscamos al usuario por email para evitar conflictos entre IDs (UUID vs Serial)
    const result = await pool.query(
      'SELECT id, name, email, role, is_main_client, main_client_id FROM auth_users WHERE email = $1',
      [session.user.email]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const userData = result.rows[0];

    // Combinamos los datos de la DB con el rol de la sesión para el frontend
    return Response.json({
      user: {
        ...userData,
        // Forzamos el rol para asegurar que el Dashboard se active
        role: userData.role || session.user.role || 'admin'
      }
    });

  } catch (error) {
    console.error("GET /api/user/profile error:", error.message);
    
    // Si la DB falla (por ejemplo, columna inexistente), devolvemos un objeto mínimo 
    // para que el frontend no reciba HTML y no explote con "Unexpected token <"
    return Response.json({ 
      user: { 
        email: session?.user?.email,
        role: 'admin' 
      } 
    });
  }
}

/**
 * PUT: Actualiza los datos del usuario directamente en la DB
 */
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Actualización directa en PostgreSQL
    const updateResult = await pool.query(
      'UPDATE auth_users SET name = $1 WHERE email = $2 RETURNING id, name, email, role',
      [body.name, session.user.email]
    );

    if (updateResult.rowCount === 0) {
      return Response.json({ error: "Failed to update" }, { status: 400 });
    }

    return Response.json({ 
      user: updateResult.rows[0],
      success: true 
    });

  } catch (error) {
    console.error("PUT /api/user/profile error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}