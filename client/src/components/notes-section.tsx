import { useState } from "react";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Note {
  id: number;
  content: string;
  createdAt: string;
  ticker: string;
  companyName: string;
}

interface NotesSectionProps {
  notes: Note[];
}

export function NotesSection({ notes }: NotesSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Investment Notes</h3>
        <Button variant="outline" className="text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>
      
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📝</div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No notes yet</h4>
          <p className="text-gray-500">Start adding investment notes to track your thoughts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-brand-blue bg-opacity-10 text-brand-blue">
                    {note.ticker}
                  </Badge>
                  <span className="text-sm text-gray-500">{formatDate(note.createdAt)}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-gray-900 text-sm">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
