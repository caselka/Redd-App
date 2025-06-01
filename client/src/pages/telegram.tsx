import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TelegramPanel } from "@/components/telegram-panel";
import { AddStockModal } from "@/components/add-stock-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Bot, Save, Eye, EyeOff } from "lucide-react";

export default function Telegram() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [botToken, setBotToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [botUsername, setBotUsername] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current bot configuration
  const { data: botConfig, isLoading: configLoading } = useQuery({
    queryKey: ['/api/telegram/config'],
    retry: false,
  });

  // Save bot token mutation
  const saveBotTokenMutation = useMutation({
    mutationFn: async (data: { token: string, username: string }) => 
      apiRequest('/api/telegram/config', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/telegram/config'] });
      toast({
        title: "Success",
        description: "Bot token saved successfully",
      });
      setBotToken('');
      setBotUsername('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save bot token",
        variant: "destructive",
      });
    },
  });

  // Test bot token mutation
  const testBotMutation = useMutation({
    mutationFn: async () => apiRequest('/api/telegram/test'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot is working correctly",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Bot test failed - check your token",
        variant: "destructive",
      });
    },
  });

  const handleSaveToken = () => {
    if (!botToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a bot token",
        variant: "destructive",
      });
      return;
    }
    saveBotTokenMutation.mutate({ token: botToken.trim(), username: botUsername.trim() });
  };

  const handleOpenTelegram = () => {
    if (botConfig?.username) {
      window.open(`https://t.me/${botConfig.username}`, '_blank');
    } else {
      toast({
        title: "Error",
        description: "Bot not configured yet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-2 md:p-6 mobile-main max-w-full">
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Telegram Bot</h1>
            <p className="text-sm md:text-base text-gray-600">Manage your investments via Telegram commands</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <TelegramPanel />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  Bot Configuration
                </CardTitle>
                <CardDescription>
                  Set up your personal Telegram bot for investment tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {botConfig?.isConfigured ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-green-800 mb-2">Bot Active</h4>
                      <p className="text-sm text-green-700 mb-3">
                        Your bot @{botConfig.username} is configured and ready to use.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={handleOpenTelegram}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Telegram
                        </Button>
                        <Button 
                          onClick={() => testBotMutation.mutate()}
                          disabled={testBotMutation.isPending}
                          variant="outline"
                          size="sm"
                        >
                          Test Bot
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-yellow-800 mb-2">Setup Required</h4>
                      <p className="text-sm text-yellow-700">
                        Configure your personal Telegram bot to receive price alerts and manage investments.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="botToken">Bot Token</Label>
                        <div className="relative mt-1">
                          <Input
                            id="botToken"
                            type={showToken ? "text" : "password"}
                            value={botToken}
                            onChange={(e) => setBotToken(e.target.value)}
                            placeholder="Enter your bot token from @BotFather"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowToken(!showToken)}
                          >
                            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="botUsername">Bot Username (optional)</Label>
                        <Input
                          id="botUsername"
                          value={botUsername}
                          onChange={(e) => setBotUsername(e.target.value)}
                          placeholder="@your_bot_username"
                          className="mt-1"
                        />
                      </div>

                      <Button 
                        onClick={handleSaveToken}
                        disabled={saveBotTokenMutation.isPending}
                        className="w-full"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saveBotTokenMutation.isPending ? 'Saving...' : 'Save Configuration'}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Quick Setup:</h4>
                      <ol className="text-sm text-gray-600 space-y-2 pl-4">
                        <li>1. Open Telegram and message @BotFather</li>
                        <li>2. Send /newbot and follow the instructions</li>
                        <li>3. Copy the bot token you receive</li>
                        <li>4. Paste the token above and save</li>
                        <li>5. Start chatting with your bot!</li>
                      </ol>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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