import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface TenKAnalysis {
  summary: string;
  financialHighlights: {
    revenue: string;
    netIncome: string;
    totalAssets: string;
    debt: string;
    cashFlow: string;
  };
  businessOverview: string;
  riskFactors: string[];
  competitivePosition: string;
  managementDiscussion: string;
  keyMetrics: {
    profitMargin: string;
    returnOnEquity: string;
    debtToEquity: string;
    currentRatio: string;
  };
  investmentThesis: {
    bullCase: string[];
    bearCase: string[];
    valuation: string;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  confidenceScore: number;
}

export async function analyze10K(documentText: string, ticker: string): Promise<TenKAnalysis> {
  // Truncate document if too long (OpenAI has token limits)
  const maxLength = 50000; // Approximately 12,500 tokens
  const truncatedText = documentText.length > maxLength 
    ? documentText.substring(0, maxLength) + "\n\n[Document truncated due to length...]"
    : documentText;

  const prompt = `
You are an expert financial analyst specializing in SEC 10-K filings analysis. Analyze the following 10-K filing for ${ticker} and provide a comprehensive investment analysis.

Document Content:
${truncatedText}

Please provide a thorough analysis in JSON format with the following structure:
{
  "summary": "Brief 2-3 sentence executive summary of the company's current state",
  "financialHighlights": {
    "revenue": "Latest annual revenue with growth trend",
    "netIncome": "Net income with profitability analysis", 
    "totalAssets": "Total assets and asset quality assessment",
    "debt": "Debt levels and leverage analysis",
    "cashFlow": "Operating cash flow and cash position"
  },
  "businessOverview": "Detailed description of business model, segments, and strategy",
  "riskFactors": ["Array of 5-7 key risk factors identified"],
  "competitivePosition": "Analysis of competitive advantages and market position", 
  "managementDiscussion": "Key insights from management discussion and analysis",
  "keyMetrics": {
    "profitMargin": "Profit margin analysis with trends",
    "returnOnEquity": "ROE analysis and efficiency metrics",
    "debtToEquity": "Leverage ratios and debt sustainability", 
    "currentRatio": "Liquidity analysis and working capital"
  },
  "investmentThesis": {
    "bullCase": ["Array of 3-5 positive investment arguments"],
    "bearCase": ["Array of 3-5 risk/concern arguments"],
    "valuation": "Valuation assessment and price considerations"
  },
  "sentiment": "positive/neutral/negative overall investment sentiment",
  "confidenceScore": 0.85 // Confidence in analysis from 0-1
}

Focus on factual analysis from the filing data. Be specific with numbers and trends where available.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: "You are a professional financial analyst. Provide accurate, data-driven analysis based strictly on the 10-K filing content provided. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent, factual analysis
      max_tokens: 4000
    });

    const analysisText = response.choices[0].message.content;
    if (!analysisText) {
      throw new Error("No analysis content received from OpenAI");
    }

    const analysis = JSON.parse(analysisText) as TenKAnalysis;
    return analysis;

  } catch (error) {
    console.error("Error analyzing 10-K with OpenAI:", error);
    throw new Error("Failed to analyze 10-K filing: " + (error as Error).message);
  }
}

export async function summarizeSection(sectionText: string, sectionName: string): Promise<string> {
  const prompt = `
Analyze and summarize the following section from a 10-K filing: "${sectionName}"

Content:
${sectionText.substring(0, 8000)} // Limit section size

Provide a concise but comprehensive summary focusing on:
- Key financial metrics and trends
- Important business developments  
- Risk factors and opportunities
- Material changes from prior periods

Keep the summary factual and investment-focused, approximately 200-300 words.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a financial analyst summarizing SEC filing sections. Be concise and focus on material information for investors."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    });

    return response.choices[0].message.content || "Unable to generate summary";

  } catch (error) {
    console.error("Error summarizing section:", error);
    throw new Error("Failed to summarize section: " + (error as Error).message);
  }
}