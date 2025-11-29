import React, { useState } from "react";
import { authService } from "../../services/api";
import Register from "../Register";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await authService.login(
        formData.email,
        formData.password
      );
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      onLoginSuccess(token, user.email, user.role);
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Falha na autenticação. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // --- DIV PRINCIPAL COM A IMAGEM DE FUNDO ---
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/manicure-background.jpg')" }} 
    >

      <div className="max-w-md w-full p-8 space-y-8 bg-white rounded-xl shadow-2xl z-10 relative">
<div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-pink-800 tracking-wide mb-1">
                Pro Nail
            </h1>
            <p className="text-sm text-gray-600 font-medium">
                Sua beleza na hora marcada
            </p>
        </div>

      <div className="flex justify-center mb-6">
            <span 
                role="img" 
                aria-label="Esmalte" 
                className="text-6xl p-4 bg-pink-100 rounded-full shadow-lg transition-transform duration-300 hover:scale-105"
            >
                💅
            </span>
        </div>
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-800">
            {isRegistering ? "Crie sua conta" : "Acesse sua conta"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Seja bem-vinda(o) à sua agenda de beleza!
          </p>
        </div>

        {!isRegistering ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">E-mail:</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Informe o e-mail"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Senha:</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Informe a senha"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                  isLoading
                    ? "bg-pink-300 cursor-not-allowed"
                    : "bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Acessando...
                  </span>
                ) : (
                  "Entrar"
                )}
              </button>
            </div>
          </form>
        ) : (
          <Register setIsRegistering={setIsRegistering} />
        )}

        <div className="text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="font-medium text-pink-700 hover:text-pink-500 transition-colors duration-200"
          >
            {isRegistering
              ? "Já tem conta? Faça login"
              : "Precisa de uma conta? Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;