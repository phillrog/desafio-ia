import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send } from "lucide-react";
import { aiInteractionService } from "../../services/api";

const VirtualAssistant = ({ personId, initialMessage, setInitialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const inputRef = useRef(null);
  const initialMessageSentRef = useRef(false);
  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(scrollToBottom, [messages]);

  const normalizeAIResponse = (text) => {

    const convertBoldToHtml = (str) => {
      return str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    };

    const TECHNICIAN_IDENTIFIER = "profissionais disponíveis para agendamento";
    
    if (text.toLowerCase().includes(TECHNICIAN_IDENTIFIER)) {
      const lines = text.split("\n");
      let html = "<p>" + convertBoldToHtml(lines[0]) + "</p>"; // Frase de abertura
      html += "<ul>";

      let currentTechnician = null;
      lines.slice(1).forEach((line) => {
        line = convertBoldToHtml(line);

        if (line.includes("<strong>Prof.") || line.includes("<strong>Dr.")) { 
          if (currentTechnician) {
            html += "</ul></li>";
          }
          currentTechnician = line.replace(/<\/?strong>/g, "").trim();
          html += `<li>${line}<ul>`;
        } else if (line.trim().startsWith("-")) {

          const parts = line.split(":");
          if (parts.length > 1) {
             const key = parts[0].replace('-', '').trim();
             const value = parts.slice(1).join(':').trim();
             html += `<li><strong>${key}:</strong> ${value}</li>`;
          } else {
             html += `<li>${line}</li>`;
          }
        }
      });

      if (currentTechnician) {
        html += "</ul></li>";
      }
      html += "</ul>";

      const closingParagraph = lines.slice(-1)[0];
      if (
        !closingParagraph.includes("Prof.") &&
        !closingParagraph.startsWith("-")
      ) {
        html += "<p>" + convertBoldToHtml(closingParagraph) + "</p>";
      }

      return { __html: html };
    }

    return { __html: convertBoldToHtml(text).replace(/\n/g, "<br>") };
  };

  const handleSendMessage = useCallback(async (messageText = input) => {
    if (messageText.trim()) {
      const personMessage = { text: messageText, sender: "person" };
      const updatedMessages = [...messages, personMessage];
      setMessages(updatedMessages);
      setInput("");
            
      setIsTyping(true);

      try {
        const response = await aiInteractionService.virtualAssistant(
          updatedMessages.map((msg) => ({
            role: msg.sender === "person" ? "person" : "assistant",
            content: msg.text,
          })),
          personId
        );
        setIsTyping(false);
        const assistantMessage = {
          text: response.data.response,
          sender: "assistant",
          html: normalizeAIResponse(response.data.response),
        };
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error("Error getting virtual assistant response:", error);
        setIsTyping(false);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
            sender: "assistant",
          },
        ]);
      
      } finally {
        setIsTyping(false);
        focusInput(); 
      }
    }
  }, [input, messages, personId, focusInput]);

  
  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
  
    if (initialMessage && !initialMessageSentRef.current) { 
      initialMessageSentRef.current = true; 

      handleSendMessage(initialMessage);
      
      if (setInitialMessage) {
        setInitialMessage(null); 
      }
    }
  }, [initialMessage, setInitialMessage, handleSendMessage]);

  useEffect(() => {
    focusInput();
  }, []);

  return (
    <div className="space-y-4">
      
      <h2 className="text-2xl font-bold text-pink-700">Assistente Virtual 🤖</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col h-[calc(100vh-200px)] border-t-4 border-pink-300">
        
        <div className="flex-grow overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 ${
                message.sender === "person" ? "justify-end" : ""
              }`}
            >        
              <div
                className={`${
                  message.sender === "person" ? "bg-pink-100" : "bg-gray-100"
                } rounded-lg p-3 max-w-[80%]`}
              >
                {message.html ? (
                  <div dangerouslySetInnerHTML={message.html} />
                ) : (
                  <p>{message.text}</p>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="typing-indicator">
                  <span className="bg-pink-500"></span>
                  <span className="bg-pink-500"></span>
                  <span className="bg-pink-500"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            className="flex-grow p-3 border border-gray-300 rounded-xl placeholder-gray-500 
                       focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            placeholder="Digite sua mensagem..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            className="bg-pink-600 text-white px-4 py-2 rounded-xl flex items-center justify-center 
                       hover:bg-pink-700 transition-colors disabled:bg-pink-300"
            onClick={handleSendMessage}
            disabled={!input.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualAssistant;