import { WatchlistItem } from '@/types/api';
import { StockData } from '@/components/watchlist/WatchlistCard';

/**
 * Transform server WatchlistItem to UI StockData format
 */
export function transformWatchlistItemToStockData(
  item: WatchlistItem,
): StockData {
  const security = item.security;
  const currentPrice = security.current_price || 0;
  const newsSummary = item.security_news_summary;
  const latestNews = item.latest_news || [];
  const keyHighlights = item.key_highlights || [];
  const upcomingEvents = item.upcoming_events || [];

  // Helper function to convert server sentiment to UI sentiment
  const convertSentiment = (
    sentiment: string,
  ): 'positive' | 'negative' | 'neutral' => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'positive';
      case 'bearish':
        return 'negative';
      case 'neutral':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  // Helper function to format date
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString();
    } catch {
      return dateStr; // Return as-is if parsing fails
    }
  };

  // Helper function to convert event category to UI format
  const convertEventType = (
    category: string,
  ): 'earnings' | 'dividend' | 'split' => {
    switch (category.toLowerCase()) {
      case 'earnings':
        return 'earnings';
      case 'corporate_actions':
        return 'dividend';
      default:
        return 'split';
    }
  };

  // Helper function to split text into bullet points
  const splitIntoBullets = (text: string): string[] => {
    // Split by common delimiters and filter out empty lines
    return text
      .split(/[•\n\r]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 5); // Limit to 5 items for UI
  };

  return {
    symbol: security.symbol,
    companyName: security.name,
    currentPrice: currentPrice,
    change: security.day_change || 0,
    changePercent: security.day_change_percent || 0,
    volume: security.volume || 0,
    marketCap: security.market_cap
      ? `$${(security.market_cap / 1000000000).toFixed(1)}B`
      : 'N/A',
    peRatio: security.pe_ratio || 0,
    weekHigh52: security.year_high || currentPrice,
    weekLow52: security.year_low || currentPrice,
    lastUpdated: item.added_at,

    // Map latest news from server data (only actual news items)
    news: latestNews.map((newsItem, index) => ({
      id: `${item.id}-news-${index + 1}`,
      headline: newsItem.headline,
      source: newsItem.source,
      publishedAt: formatDate(newsItem.date),
      sentiment: convertSentiment(
        newsSummary?.overall_sentiment?.sentiment || 'neutral',
      ),
      summary: newsItem.summary,
      url: newsItem.url,
      favicon: newsItem.favicon,
      impactLevel: newsItem.impact_level,
    })),

    // Map AI-generated summary separately
    newsSummary: newsSummary?.summary || undefined,

    // Map sentiment rationale for tooltip
    sentimentRationale: newsSummary?.overall_sentiment?.rationale || undefined,

    // Map upcoming events from server data
    upcomingEvents:
      upcomingEvents.length > 0
        ? upcomingEvents.map((event) => ({
            type: convertEventType(event.category),
            date: event.date,
            description: event.event,
          }))
        : [],

    // Map analysis data from server
    executiveSummary: newsSummary?.executive_summary || undefined,

    // Map key highlights from server data
    keyHighlights:
      keyHighlights.length > 0
        ? keyHighlights
            .sort((a, b) => a.order - b.order)
            .map((highlight) => highlight.highlight)
        : newsSummary?.executive_summary
        ? splitIntoBullets(newsSummary.executive_summary)
        : [],

    // Map positive catalysts from server data
    positiveCatalysts: newsSummary?.positive_catalysts
      ? splitIntoBullets(newsSummary.positive_catalysts)
      : [],

    // Map risk factors from server data
    riskFactors: newsSummary?.risk_factors
      ? splitIntoBullets(newsSummary.risk_factors)
      : [],
  };
}

/**
 * Transform array of WatchlistItems to StockData array
 */
export function transformWatchlistToStockDataArray(
  watchlistItems: WatchlistItem[],
): StockData[] {
  return watchlistItems.map(transformWatchlistItemToStockData);
}

/**
 * Find watchlist item ID by security symbol
 */
export function findWatchlistItemIdBySymbol(
  watchlistItems: WatchlistItem[],
  symbol: string,
): number | null {
  const item = watchlistItems.find(
    (item) => item.security.symbol.toUpperCase() === symbol.toUpperCase(),
  );
  return item ? item.id : null;
}
