import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import { 
  WatchlistListResponse, 
  WatchlistCreateRequest, 
  WatchlistCreateResponse 
} from '@/types/api';

export class WatchlistService extends BaseApiService {
  // Get user's watchlist items
  async getUserWatchlist(user: User | null = null): Promise<WatchlistListResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = '/api/watchlist/';
    return this.get<WatchlistListResponse>(endpoint, user);
  }

  // Add security to watchlist
  async addToWatchlist(
    securitySymbol: string, 
    user: User | null = null
  ): Promise<WatchlistCreateResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = '/api/watchlist/';
    const data: WatchlistCreateRequest = {
      security_symbol: securitySymbol
    };

    return this.post<WatchlistCreateResponse>(endpoint, data, user);
  }

  // Remove item from watchlist
  async removeFromWatchlist(
    watchlistItemId: number, 
    user: User | null = null
  ): Promise<void> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = `/api/watchlist/${watchlistItemId}/`;
    await this.delete(endpoint, user);
  }
}

// Create and export singleton instance
export const watchlistService = new WatchlistService();