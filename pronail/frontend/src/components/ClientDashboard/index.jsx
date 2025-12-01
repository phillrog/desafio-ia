import React, { useState, useEffect } from "react";
import { clientService, bookingService } from "../../services/api";
import { Scissors } from "lucide-react";

const ClientDashboard = ({ userId, setActiveTab }) => {
  const [client, setClient] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        // Tradução do erro
        setError("ID da Pessoa está faltando");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const clientResponse = await clientService.getClient(userId);
        setClient(clientResponse.data);

        const bookingsResponse = await bookingService.getBookings({
          clientId: userId,
          status: "Agendado",
        });
        setUpcomingBookings(bookingsResponse.data);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching client data:", error);
        // Tradução do erro
        setError("Falha ao carregar dados do cliente");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Estilo do spinner ajustado para o tema pink */}
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    // Tradução do erro
    return <div className="text-red-600 font-medium">Erro: {error}</div>;
  }

  if (!client) {
    // Tradução da mensagem
    return <div className="text-gray-600 p-4">Nenhum dado de cliente disponível.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-pink-800">Bem-vinda(o), {client.firstName}!</h2>
      
      {/* Informações Pessoais */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-400">
        <h3 className="text-xl font-semibold mb-3 text-pink-700">Suas Informações</h3>
        <p className="text-gray-700">
          <span className="font-medium">Nome:</span> {client.firstName} {client.lastName}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Nascimento:</span>{" "}
          {/* Formato PT-BR */}
          {new Date(client.dateOfBirth).toLocaleDateString("pt-BR")}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Contato:</span> {client.contactNumber}
        </p>
      </div>

      {/* Próximos Agendamentos */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-400">
        <h3 className="text-xl font-semibold mb-3 text-pink-700">Próximos Agendamentos 📅</h3>
        {upcomingBookings.length > 0 ? (
          <ul className="space-y-3">
            {upcomingBookings
              .sort(
                (a, b) =>
                  new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
              )
              .map((booking) => (
                <li 
                  key={booking.id} 
                  className="p-3 bg-pink-50 rounded-lg border-l-4 border-pink-500 transition-shadow hover:shadow-md"
                >
                  {/* Formato PT-BR */}
                  Agendado para: <strong>{new Date(booking.dateTime).toLocaleString("pt-BR")}</strong>
                </li>
              ))}
          </ul>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-pink-50 rounded-lg border-l-4 border-pink-300">
            <p className="text-gray-600 italic mb-2 sm:mb-0">
              Você não tem agendamentos futuros. Que tal marcar um horário?
            </p>
            <button
              onClick={() => setActiveTab("assistenteVirtual", "Quero fazer um agendamento")}
              className="flex items-center space-x-1 text-pink-700 font-semibold hover:text-pink-900 transition-colors bg-pink-100 px-3 py-1 rounded-full shadow-sm hover:shadow-md"
              aria-label="Abrir Assistente Virtual para agendar"
            >
              <Scissors className="h-4 w-4" />
              <span>Clique aqui</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;