import React, { useState } from "react";
import { userService } from "../../services/api";

const Register = ({ setIsRegistering }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "client", // client = Cliente
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    contactNumber: "",
    // Campos específicos para Profissional (manicure/pedicure)
    specialization: "", // Tipo de Serviço (Manicure, Pedicure, etc.)
    licenseNumber: "", // Número de Registro/Licença
  });

  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError(""); // Limpa erro anterior

    if (formData.password.length < 6) {
      // Tradução da mensagem de erro
      setPasswordError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    
    setIsLoading(true);
    try {
      await userService.register(formData);

      // Feedback de sucesso (você pode substituir por um toast ou modal)
      alert("Cadastro realizado com sucesso! Faça login para continuar.");
      
      setIsRegistering(false); // Volta para a tela de Login
    } catch (error) {
      console.error("Registration failed:", error);
      // Tradução da mensagem de erro
      alert("Falha no cadastro. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SELEÇÃO DE PERFIL */}
      <div>
        <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700">Eu sou:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
          // Aplicação da cor temática no foco
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
        >
          <option value="client">Cliente</option>
          <option value="technician">Profissional</option>
        </select>
      </div>
      
      {/* INFORMAÇÕES PESSOAIS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block mb-1 text-sm font-medium text-gray-700">Nome:</label>
          <input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block mb-1 text-sm font-medium text-gray-700">Sobrenome:</label>
          <input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            placeholder="Seu sobrenome"
          />
        </div>
      </div>
      
      {/* E-MAIL E SENHA */}
      <div>
        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">E-mail:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          placeholder="exemplo@email.com"
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
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          placeholder="Mínimo 6 caracteres"
        />
        {passwordError && (
          <p className="text-red-500 text-sm mt-1">{passwordError}</p>
        )}
      </div>

      {/* DETALHES ADICIONAIS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateOfBirth" className="block mb-1 text-sm font-medium text-gray-700">Data de Nascimento:</label>
          <input
            id="dateOfBirth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700">Gênero:</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          >
            <option value="">Selecione</option>
            <option value="male">Masculino</option>
            <option value="female">Feminino</option>
            <option value="other">Outro</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="contactNumber" className="block mb-1 text-sm font-medium text-gray-700">Telefone/WhatsApp:</label>
        <input
          id="contactNumber"
          type="tel"
          name="contactNumber"
          value={formData.contactNumber}
          onChange={handleChange}
          required
          className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          placeholder="(XX) XXXXX-XXXX"
        />
      </div>

      {/* CAMPOS ESPECÍFICOS PARA PROFISSIONAIS */}
      {formData.role === "technician" && (
        <div className="border-t pt-4 border-pink-200 space-y-4">
          <h3 className="text-lg font-semibold text-pink-700">Dados do Profissional ✂️</h3>
          <div>
            <label htmlFor="specialization" className="block mb-1 text-sm font-medium text-gray-700">Tipo de Serviço:</label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              className="appearance-none relative block w-full px-3 py-2 border border-pink-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm bg-pink-50"
            >
                <option value="" disabled>Selecione a especialidade...</option>
                <option value="manicure">Manicure</option>
                <option value="pedicure">Pedicure</option>
                <option value="manicurePedicure">Manicure e Pedicure</option>
                <option value="maquiador">Maquiador(a)</option>
                <option value="cabeleireiro">Cabeleireiro(a)</option>
                <option value="esteticista">Esteticista</option>
                <option value="depilacao">Depilação</option>
                <option value="sombrancelha">Designer de Sobrancelhas</option>
            </select>
          </div>
          <div>
            <label htmlFor="licenseNumber" className="block mb-1 text-sm font-medium text-gray-700">Registro/CNPJ (opcional):</label>
            <input
              id="licenseNumber"
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              // Removi o 'required' para ser mais flexível com profissionais autônomos
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              placeholder="Número de registro profissional ou CNPJ"
            />
          </div>
        </div>
      )}
      
      {/* BOTÃO DE CADASTRO */}
      <button
        type="submit"
        className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
          isLoading
            ? "bg-pink-300 cursor-not-allowed" // Cor de desabilitado
            : "bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500" // Cor temática
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            {/* SVG do spinner de carregamento */}
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
            Cadastrando...
          </span>
        ) : (
          "Cadastrar"
        )}
      </button>
    </form>
  );
};

export default Register;