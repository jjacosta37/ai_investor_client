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
        headline: `Oscar Health faces significant near-term challenges with deteriorating profitability metrics despite strong membership growth, as elevated medical costs and higher market risk scores pressure margins.`,
        source: 'Market News',
        publishedAt: '1 hour ago',
        sentiment: 'negative' as const
      }
    ],
    upcomingEvents: [
      {
        type: 'earnings' as const,
        date: 'Feb 15, 2024',
        description: 'Next Earnings Report'
      }
    ],
    executiveSummary: `Oscar Health (OSCR) is facing significant headwinds following its Q2 2025 earnings release on August 6, 2025. Despite strong membership growth to 2.03 million members (up from 1.58 million YoY), the company reported disappointing financial results with a substantial net loss and deteriorating medical loss ratios. The company has revised its 2025 guidance downward due to higher-than-expected market risk scores across its ACA marketplace footprint. Revenue of $2.86 billion missed analyst estimates of $2.97 billion, though it represented 29% year-over-year growth. The medical loss ratio surged to 91.1%, well above the ~80% threshold typically required for profitability in the ACA market, driven by rising healthcare costs and higher member morbidity. The company reported a net loss of $228.4 million (-$0.89 EPS) compared to a net income of $56.2 million in Q2 2024. Medical expenses jumped dramatically from $1.71 billion to $2.55 billion year-over-year. Oscar has revised its 2025 guidance to expect a medical loss ratio of 86-87%, operating losses of $200-300 million, and adjusted EBITDA losses of approximately $120 million. The stock declined following the earnings announcement, though the company maintains a strong cash position of $2.99 billion.`,
    keyHighlights: [
      'Q2 2025 revenue miss ($2.86B vs $2.97B est.) with 91.1% medical loss ratio well above profitability threshold',
      'Net loss of $228.4M (-$0.89 EPS) compared to $56.2M profit in Q2 2024, driven by $2.55B in medical expenses',
      '2025 guidance revised with MLR expectations of 86-87% and operating losses of $200-300M',
      'Membership grew 28% YoY to 2.03M members, showing strong market penetration',
      'Stock declined following earnings but maintains $2.99B cash position for strategic flexibility'
    ],
    positiveCatalysts: [
      'Strong membership growth of 28% YoY demonstrates market traction and competitive positioning',
      'Robust cash position of $2.99B provides financial flexibility for strategic investments',
      'Expanding ACA marketplace footprint with potential for geographic diversification',
      'Technology-driven healthcare model appeals to younger demographics',
      'Opportunity for medical cost management improvements as operations mature'
    ],
    riskFactors: [
      'Medical loss ratio of 91.1% significantly above profitability threshold of ~80%',
      'Higher-than-expected market risk scores pressuring profitability across footprint',
      'Revised 2025 guidance indicates ongoing operational challenges with $200-300M operating losses',
      'Competitive ACA marketplace with established insurers having cost advantages',
      'Regulatory risk from potential ACA marketplace changes affecting business model'
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