import React, { useState } from "react";
import { Home } from "lucide-react";
import TechnicianDashboard from "../TechnicianDashboard";

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

const TechnicianView = ({ userRole, userId }) => {
  
  const [activeTab, setActiveTab] = useState("painel");

  const renderContent = () => {
    switch (activeTab) {
      case "painel":
        return <TechnicianDashboard />;  
      default:
        return <TechnicianDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-pink-50">
      
      <nav className="w-72 bg-white shadow-xl p-6 flex flex-col border-r border-pink-100"> 
        
        <div className="mb-10 border-b pb-4 border-pink-200"> 
          <div className="flex items-center space-x-2 mb-2">
            <span 
              role="img" 
              aria-label="Esmalte" 
              className="text-3xl p-2 bg-pink-100 rounded-full shadow-inner"
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
          <p className="mt-4 text-md text-gray-700 font-semibold"> 
            Olá, <span className="text-pink-600">{userId}</span>!
          </p>
        </div>
        
        <div className="space-y-3 flex-grow"> 
          <MenuItem
            icon={Home}
            label="Painel Principal"
            active={activeTab === "painel"}
            onClick={() => setActiveTab("painel")}
          />
     
        </div>
        
      </nav>
      
      <main className="flex-grow p-8 overflow-y-auto">{renderContent()}</main> 
    </div>
  );
};

export default TechnicianView;