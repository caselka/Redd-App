import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddStockModal({ isOpen, onClose }: AddStockModalProps) {
  const [formData, setFormData] = useState({
    ticker: "",
    intrinsicValue: "",
    convictionScore: "",
    note: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const lookupMutation = useMutation({
    mutationFn: (ticker: string) => 
      fetch(`/api/lookup/${ticker}`).then(res => res.json()),
  });

  const addStockMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/stocks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Stock added to watchlist",
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add stock",
        variant: "destructive",
      });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/notes", data),
  });

  const handleClose = () => {
    setFormData({
      ticker: "",
      intrinsicValue: "",
      convictionScore: "",
      note: "",
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ticker || !formData.intrinsicValue || !formData.convictionScore) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Lookup company name
      const lookupResult = await lookupMutation.mutateAsync(formData.ticker.toUpperCase());
      
      // Add stock
      const stock = await addStockMutation.mutateAsync({
        ticker: formData.ticker.toUpperCase(),
        companyName: lookupResult.companyName,
        intrinsicValue: formData.intrinsicValue,
        convictionScore: parseInt(formData.convictionScore),
      });

      // Add note if provided
      if (formData.note && stock && 'id' in stock) {
        await addNoteMutation.mutateAsync({
          stockId: (stock as any).id,
          content: formData.note,
        });
      }
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" aria-describedby="add-stock-description">
        <DialogHeader>
          <DialogTitle>Add Stock to Watchlist</DialogTitle>
        </DialogHeader>
        <p id="add-stock-description" className="sr-only">
          Form to add a new stock to your investment watchlist with intrinsic value and conviction score
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="ticker">Stock Symbol *</Label>
            <Input
              id="ticker"
              placeholder="e.g., AAPL"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="intrinsicValue">Intrinsic Value ($) *</Label>
            <Input
              id="intrinsicValue"
              type="number"
              step="0.01"
              placeholder="200.00"
              value={formData.intrinsicValue}
              onChange={(e) => setFormData({ ...formData, intrinsicValue: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="conviction">Conviction Score (1-10) *</Label>
            <Select
              value={formData.convictionScore}
              onValueChange={(value) => setFormData({ ...formData, convictionScore: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select conviction level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Very Low</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5 - Medium</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="8">8</SelectItem>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10 - Very High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="note">Initial Note (Optional)</Label>
            <Textarea
              id="note"
              rows={3}
              placeholder="Add your investment thesis..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="mt-1 resize-none"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-brand-blue hover:bg-blue-700"
              disabled={addStockMutation.isPending}
            >
              {addStockMutation.isPending ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
