import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import { HoldingsResponse } from '@/types/api';

export class HoldingsService extends BaseApiService {
  // Get user's holdings with portfolio composition
  async getUserHoldings(user: User | null = null): Promise<HoldingsResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = '/api/holdings/';
    return this.get<HoldingsResponse>(endpoint, user);
  }
}

// Create and export a singleton instance
export const holdingsService = new HoldingsService();