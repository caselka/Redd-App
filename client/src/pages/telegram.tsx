import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TelegramPanel } from "@/components/telegram-panel";
import { AddStockModal } from "@/components/add-stock-modal";

export default function Telegram() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Telegram Bot</h1>
            <p className="text-gray-600">Manage your investments via Telegram commands</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TelegramPanel />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Setup</h3>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">Configuration Required</h4>
                  <p className="text-sm text-yellow-700">
                    To enable Telegram bot functionality, you need to provide a bot token. 
                    The bot will allow you to manage your portfolio directly from Telegram.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Quick Setup:</h4>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Message @BotFather on Telegram</li>
                    <li>2. Create a new bot with /newbot</li>
                    <li>3. Copy the bot token</li>
                    <li>4. Add the token to your environment</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}