import React from "react";
import { CheckCircle } from "lucide-react";

const DashCard = () => {
  return (
    <div className="flex justify-between items-left mb-6">
      <div className="relative">
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dashboard Senhorio</span>
              <CheckCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rendas por cobrar</span>
              <span className="font-bold text-yellow-600">€2,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Rendas recebidas</span>
              <span className="font-bold text-green-600">€12,300</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Propriedades ativas</span>
              <span className="font-bold text-blue-600">8</span>
            </div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl transform rotate-6 opacity-20"></div>
      </div>
    </div>
  );
};
export default DashCard;
