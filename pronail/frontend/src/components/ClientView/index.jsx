import { Calendar, FileText, Home, MessageSquare, Scissors } from "lucide-react";
import React, { useState } from "react";
import Bookings from "../Booking";
import ClientDashboard from "../ClientDashboard";
import VirtualAssistant from "../VirtualAssistant";

// Componente MenuItem com cores temáticas e tradução (sem mudança de lógica)
const MenuItem = ({ icon: Icon, label, active, onClick }) => (
  <div
    className={`flex items-center space-x-2 p-3 rounded-lg cursor-pointer transition-colors ${
      active ? "bg-pink-600 text-white shadow-md" : "text-gray-600 hover:bg-pink-100"
    }`}
    onClick={onClick}
  >
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </div>
);

const ClientView = ({ personRole, personId }) => {
  
  const [activeTab, setActiveTab] = useState("inicio");
  const [initialMessage, setInitialMessage] = useState(null);

  const handleTabChange = (tab, message = null) => {
    setInitialMessage(message); 
    setActiveTab(tab); 
  };

  const renderContent = () => {
    switch (activeTab) {
      case "inicio": 
      return <ClientDashboard personId={personId} setActiveTab={handleTabChange} />;
      case "agendamentos": 
        return <Bookings personId={personId} />;
      case "assistenteVirtual":
        return <VirtualAssistant personId={personId} initialMessage={initialMessage} setInitialMessage={setInitialMessage} />;
      default:
        return <ClientDashboard personId={personId} setActiveTab={handleTabChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-pink-50">
      
      {/* MENU LATERAL */}
      <nav className="w-64 bg-white shadow-lg p-6 flex flex-col">
        
        <div className="mb-8 border-b pb-4 border-pink-100">
            <div className="flex items-center space-x-2 mb-2">
                <span 
                    role="img" 
                    aria-label="Esmalte" 
                    className="text-3xl p-2 bg-pink-100 rounded-full"
                >
                    💅
                </span>
                <h1 className="text-3xl font-bold font-serif text-pink-700 tracking-wider">
                    Pro Nail
                </h1>
            </div>
            <p className="text-xs text-gray-500 font-medium ml-10 mt-[-5px]">
                Sua beleza na hora marcada
            </p>
            <p className="mt-4 text-sm text-gray-600">
                Olá, {personId}!
            </p>
        </div>
        
        <div className="space-y-2 flex-grow">
          <MenuItem
            icon={Home}
            label="Início" 
            active={activeTab === "inicio"}
            onClick={() => setActiveTab("inicio")}
          />
          
          <MenuItem
            icon={Calendar}
            label="Agendamentos" 
            active={activeTab === "agendamentos"}
            onClick={() => setActiveTab("agendamentos")}
          />          
        </div>
      

      </nav>
      
      <main className="flex-grow p-6 overflow-y-auto">{renderContent()}</main>

      <button
        onClick={() => setActiveTab("assistenteVirtual")}
        className="fixed bottom-8 right-8 p-4 bg-pink-600 text-white rounded-full shadow-2xl 
                   hover:bg-pink-700 transition-all duration-300 transform 
                   hover:scale-110 focus:outline-none focus:ring-4 focus:ring-pink-300 z-50"
        title="Assistente Virtual" 
      >
        <Scissors className="h-7 w-7" />
      </button>
    </div>
  );
};

export default ClientView;