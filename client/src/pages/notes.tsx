import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { NotesSection } from "@/components/notes-section";
import { AddStockModal } from "@/components/add-stock-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Calendar, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Note {
  id: number;
  content: string;
  createdAt: string;
  ticker: string;
  companyName: string;
}

export default function Notes() {
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [searchTicker, setSearchTicker] = useState("");
  const [filterTicker, setFilterTicker] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedStock, setSelectedStock] = useState("");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  const { data: stocks = [] } = useQuery<any[]>({
    queryKey: ["/api/stocks"],
  });

  // Filter and sort notes
  const filteredNotes = useMemo(() => {
    let filtered = notes.filter(note => {
      const matchesTicker = filterTicker === "all" || note.ticker === filterTicker;
      const matchesSearch = searchTicker === "" || 
        note.ticker.toLowerCase().includes(searchTicker.toLowerCase()) ||
        note.companyName.toLowerCase().includes(searchTicker.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTicker.toLowerCase());
      return matchesTicker && matchesSearch;
    });

    // Sort notes
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "ticker") {
      filtered.sort((a, b) => a.ticker.localeCompare(b.ticker));
    }

    return filtered;
  }, [notes, filterTicker, searchTicker, sortBy]);

  // Get unique tickers for filter dropdown
  const uniqueTickers = useMemo(() => {
    const tickers = new Set(notes.map(note => note.ticker));
    return Array.from(tickers).sort();
  }, [notes]);

  const addNoteMutation = useMutation({
    mutationFn: async (data: { stockId: number; content: string }) => {
      await apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setNewNoteContent("");
      setSelectedStock("");
      setIsAddNoteModalOpen(false);
      toast({
        title: "Note added successfully",
        description: "Your investment note has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding note",
        description: "Failed to save your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddNote = () => {
    if (!selectedStock || !newNoteContent.trim()) return;
    
    const stock = stocks.find(s => s.ticker === selectedStock);
    if (!stock) return;

    addNoteMutation.mutate({
      stockId: stock.id,
      content: newNoteContent.trim(),
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <Header onAddStock={() => setIsAddStockModalOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-3 md:p-6 pt-16 md:pt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Investment Notes</h1>
                <p className="text-gray-600">Track your investment thoughts and analysis</p>
              </div>
              <Button onClick={() => setIsAddNoteModalOpen(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes, tickers, or companies..."
                  value={searchTicker}
                  onChange={(e) => setSearchTicker(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterTicker} onValueChange={setFilterTicker}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by ticker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tickers</SelectItem>
                    {uniqueTickers.map(ticker => (
                      <SelectItem key={ticker} value={ticker}>{ticker}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="ticker">Ticker A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredNotes.length} of {notes.length} notes
                {filterTicker !== "all" && ` for ${filterTicker}`}
              </p>
            </div>
          </div>

          {/* Notes Display */}
          <div className="space-y-4">
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <TrendingUp className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTicker || filterTicker !== "all" 
                      ? "Try adjusting your search or filter criteria." 
                      : "Start by adding your first investment note."}
                  </p>
                  <Button onClick={() => setIsAddNoteModalOpen(true)}>
                    Add Your First Note
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono">
                          {note.ticker}
                        </Badge>
                        <div>
                          <CardTitle className="text-lg">{note.companyName}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Add Note Modal */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add Investment Note</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Stock</label>
                <Select value={selectedStock} onValueChange={setSelectedStock}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a stock" />
                  </SelectTrigger>
                  <SelectContent>
                    {stocks.map((stock) => (
                      <SelectItem key={stock.id} value={stock.ticker}>
                        {stock.ticker} - {stock.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Note</label>
                <Textarea
                  placeholder="Enter your investment thoughts, analysis, or observations..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => setIsAddNoteModalOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNote}
                disabled={!selectedStock || !newNoteContent.trim() || addNoteMutation.isPending}
                className="flex-1"
              >
                {addNoteMutation.isPending ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <AddStockModal 
        isOpen={isAddStockModalOpen}
        onClose={() => setIsAddStockModalOpen(false)}
      />
    </div>
  );
}