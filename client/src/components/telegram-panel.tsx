import { MessageSquare, Clock, StickyNote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TelegramPanel() {
  const commands = [
    { command: "/watch AAPL", description: "Add to watchlist" },
    { command: "/price AAPL", description: "Get current price" },
    { command: "/note AAPL", description: "Add investment note" },
    { command: "/conviction", description: "Set conviction score" },
  ];

  const recentActivity = [
    { icon: Clock, text: "Price check: AAPL - 3 mins ago", color: "text-blue-500" },
    { icon: StickyNote, text: "Note added: MSFT - 1 hour ago", color: "text-blue-500" },
    { icon: Star, text: "Conviction updated: GOOGL - 2 hours ago", color: "text-blue-500" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Telegram Bot</h3>
        <div className="w-3 h-3 bg-profit-green rounded-full"></div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Available Commands</h4>
          <div className="space-y-2 text-xs">
            {commands.map((cmd, index) => (
              <div key={index} className="flex justify-between">
                <code className="bg-gray-200 px-2 py-1 rounded text-gray-800">{cmd.command}</code>
                <span className="text-gray-600">{cmd.description}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Recent Activity</h4>
          <div className="space-y-2 text-xs text-blue-800">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-2">
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
                <span>{activity.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <Button className="w-full bg-brand-blue hover:bg-blue-700 text-sm font-medium">
            <MessageSquare className="mr-2 h-4 w-4" />
            Open in Telegram
          </Button>
        </div>
      </div>
    </div>
  );
}
