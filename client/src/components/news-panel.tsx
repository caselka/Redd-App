import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Newspaper } from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export function NewsPanel() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/news');
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNews(data.articles || []);
      setError(null);
    } catch (err) {
      setError('Unable to load financial news. Check your internet connection.');
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper size={20} />
            Financial News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper size={20} />
            Financial News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-gray-400 mb-2">📰</div>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchNews}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper size={20} />
          Financial News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {news.slice(0, 10).map((article, index) => (
            <div key={index} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
              <h4 className="font-medium text-sm mb-2 line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                  <span>•</span>
                  <span>{article.source.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  <ExternalLink size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={fetchNews} className="w-full">
            Refresh News
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}