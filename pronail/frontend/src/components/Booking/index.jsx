import React, { useState, useEffect } from "react";
import { bookingService, technicianService } from "../../services/api";
import { Trash2, Plus } from "lucide-react";

const Bookings = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newBooking, setNewBooking] = useState({
    technicianId: "",
    dateTime: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const bookingsResponse = await bookingService.getBookings({
          clientId: userId,
        });
        setBookings(bookingsResponse.data);

        const techniciansResponse = await technicianService.getTechnicians();
        setTechnicians(techniciansResponse.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      const response = await bookingService.createBooking({
        ...newBooking,
        clientId: userId,
      });
      setBookings([...bookings, response.data]);
      setShowModal(false);
      setNewBooking({ technicianId: "", dateTime: "", notes: "" });
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Erro ao criar agendamento. Tente novamente."); // Tradução do erro
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    // Texto de confirmação traduzido
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) { 
      try {
        await bookingService.deleteBooking(bookingId);
        setBookings(bookings.filter((app) => app.id !== bookingId));
      } catch (error) {
        console.error("Error deleting booking:", error);
        alert("Erro ao cancelar agendamento. Tente novamente."); // Tradução do erro
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {/* Spinner com cor temática */}
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-3 border-pink-100">
        <h2 className="text-2xl font-bold text-gray-800">Meus Agendamentos 📅</h2>
        <button
          // Estilo do botão primário
          className="bg-pink-600 text-white px-4 py-2 rounded shadow-md hover:bg-pink-700 transition-colors flex items-center space-x-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={20} /> 
          <span>Novo</span>
        </button>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-pink-400">
        {bookings.length > 0 ? (
          <ul className="space-y-4">
            {bookings
              .sort(
                (a, b) =>
                  new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
              )
              .map((booking) => (
                <li
                  key={booking.id}
                  className="p-3 border-b flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="text-sm">
                    {/* Dados da Reserva traduzidos e formatados */}
                    <p className="font-semibold text-pink-700">
                      Data: {new Date(booking.dateTime).toLocaleString("pt-BR")}
                    </p>
                    <p className="text-gray-700">
                      Profissional:{" "}
                      {technicians.find((e) => e.id === booking.technicianId) &&
                        technicians.find((e) => e.id === booking.technicianId)
                          .firstName + ' ( ' + technicians.find((e) => e.id === booking.technicianId)
                          .specialization + ')'} 
                    </p>
                    <p className="text-gray-600">Status: **{booking.status}**</p>
                    {booking.notes && <p className="text-gray-500 italic">Observações: {booking.notes}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                    title="Cancelar Agendamento" // Dica de ferramenta traduzida
                  >
                    <Trash2 size={20} />
                  </button>
                </li>
              ))}
          </ul>
        ) : (
          // Mensagem traduzida
          <p className="text-gray-500 italic p-4 text-center">Nenhum agendamento marcado.</p>
        )}
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-8 w-full max-w-md shadow-xl rounded-xl bg-white animate-fade-in">
            {/* Título do Modal traduzido */}
            <h3 className="text-xl font-bold mb-4 text-pink-700 border-b pb-2">Criar Novo Agendamento</h3>
            <form onSubmit={handleCreateBooking}>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Profissional</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-pink-500"
                  value={newBooking.technicianId}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      technicianId: e.target.value,
                    })
                  }
                  required
                >
                  {/* Opção padrão traduzida */}
                  <option value="">Selecione um profissional</option>
                  {technicians.map((technician) => (
                    <option key={technician.id} value={technician.id}>
                      {technician.firstName} {technician.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2 font-medium text-gray-700">Data e Hora</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-pink-500"
                  value={newBooking.dateTime}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      dateTime: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">Observações</label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-pink-500"
                  value={newBooking.notes}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      notes: e.target.value,
                    })
                  }
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  // Estilo do botão primário do modal
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors shadow-md"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;