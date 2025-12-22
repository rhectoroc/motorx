import { auth } from "@/auth";
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Consulta directa a la base de datos PostgreSQL
    const result = await pool.query(
      'SELECT id, name, email, role, image FROM auth_users WHERE id = $1',
      [session.user.id]
    );

    if (result.rowCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = result.rows[0];

    return Response.json({
      user: {
        ...user,
        // Usamos el rol de la DB o el de la sesión como respaldo
        role: user.role || session.user.role || 'client'
      },
    });
  } catch (error) {
    console.error("Error en profile local:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}