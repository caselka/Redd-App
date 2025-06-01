import React, { useState } from 'react';
import { StockDetailsModal } from '@/components/stock-details-modal';

interface ClickableTickerProps {
  ticker: string;
  companyName?: string;
  className?: string;
  children?: React.ReactNode;
}

export function ClickableTicker({ 
  ticker, 
  companyName = ticker, 
  className = "", 
  children 
}: ClickableTickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <span 
        onClick={handleClick}
        className={`cursor-pointer hover:text-blue-600 hover:underline transition-colors ${className}`}
        title={`View ${ticker} company details, financials & chart`}
      >
        {children || ticker}
      </span>
      
      <StockDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticker={ticker}
        companyName={companyName}
      />
    </>
  );
}