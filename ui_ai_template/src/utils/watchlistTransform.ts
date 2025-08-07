import { WatchlistItem } from '@/types/api';
import { StockData } from '@/components/watchlist/WatchlistCard';

/**
 * Transform server WatchlistItem to UI StockData format
 */
export function transformWatchlistItemToStockData(item: WatchlistItem): StockData {
  const security = item.security;
  const currentPrice = security.current_price || 0;

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
    weekHigh52: security.week_52_high || currentPrice,
    weekLow52: security.week_52_low || currentPrice,
    lastUpdated: item.added_at,
    news: security.news_summary ? [
      {
        id: `${item.id}-news-1`,
        headline: security.news_summary.substring(0, 100) + (security.news_summary.length > 100 ? '...' : ''),
        source: 'Market News',
        publishedAt: '1 hour ago',
        sentiment: 'positive' as const
      }
    ] : [
      {
        id: `${item.id}-news-1`,
        headline: `${security.name} shows strong market performance`,
        source: 'Market News',
        publishedAt: '1 hour ago',
        sentiment: 'positive' as const
      }
    ],
    upcomingEvents: [
      {
        type: 'earnings' as const,
        date: 'Feb 15, 2024',
        description: 'Next Earnings Report'
      }
    ]
  };
}

/**
 * Transform array of WatchlistItems to StockData array
 */
export function transformWatchlistToStockDataArray(watchlistItems: WatchlistItem[]): StockData[] {
  return watchlistItems.map(transformWatchlistItemToStockData);
}

/**
 * Find watchlist item ID by security symbol
 */
export function findWatchlistItemIdBySymbol(
  watchlistItems: WatchlistItem[], 
  symbol: string
): number | null {
  const item = watchlistItems.find(item => 
    item.security.symbol.toUpperCase() === symbol.toUpperCase()
  );
  return item ? item.id : null;
}