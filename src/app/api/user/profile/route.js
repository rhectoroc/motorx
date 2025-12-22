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

    // Verificación de sesión: Si no hay sesión, devolvemos JSON (no HTML)
    if (!session || !session.user?.id) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    // Consulta directa a la tabla de usuarios
    const result = await pool.query(
      'SELECT id, name, email, role, image FROM auth_users WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const userData = result.rows[0];

    // IMPORTANTE: Unimos los datos de la DB con el rol de la sesión
    // Esto asegura que el Dashboard detecte 'admin'
    return Response.json({
      user: {
        ...userData,
        role: userData.role || session.user.role || 'client'
      }
    });

  } catch (error) {
    console.error("Error en GET /api/user/profile:", error);
    return Response.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

/**
 * PUT: Actualiza los datos del usuario directamente en la DB
 */
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Actualizamos solo el nombre por seguridad, como ejemplo
    const updateResult = await pool.query(
      'UPDATE auth_users SET name = $1 WHERE id = $2 RETURNING id, name, email, role',
      [body.name, userId]
    );

    if (updateResult.rowCount === 0) {
      return Response.json({ error: "No se pudo actualizar" }, { status: 400 });
    }

    return Response.json({ 
      user: updateResult.rows[0],
      success: true 
    });

  } catch (error) {
    console.error("Error en PUT /api/user/profile:", error);
    return Response.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}