import { Link } from 'react-router'; 

export default function IndexPage() {
  return (
    // Aplicamos clases de Tailwind para:
    // 1. Ocupar toda la altura de la pantalla (min-h-screen).
    // 2. Fondo azul (bg-blue-900 - ajusta el tono a tu gusto).
    // 3. Flexbox para centrar (flex items-center justify-center).
    <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
      
      {/* Contenedor del contenido (Tarjeta o Panel) */}
      <div className="bg-white p-10 md:p-16 rounded-xl shadow-2xl max-w-lg w-full text-center">
        
        {/* Título Principal */}
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
          MotorX
        </h1>
        
        {/* Subtítulo */}
        <p className="text-sm font-medium text-gray-600 mb-6">
          CRM and Integral Vehicle Management System
        </p>

        {/* Descripción */}
        <p className="text-gray-500 text-sm mb-8">
          Centralized management of clients, sub-clients, vehicles, services and pricing
        </p>
        
        {/* Botón/Enlace de Inicio de Sesión */}
        <Link 
          to="/sign-in" // Asumiendo que tu ruta de inicio de sesión es /sign-in
          className="inline-block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Sign In
        </Link>
        
        {/* Mensaje de Contacto (Menos prominente) */}
        <div className="mt-8 text-sm text-gray-400">
          Need an account? Contact your administrator
        </div>
        
      </div>
    </div>
  );
}
