import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import { 
  HoldingsResponse, 
  SimpleHoldingsResponse, 
  CreateHoldingRequest, 
  CreateHoldingResponse 
} from '@/types/api';

export class HoldingsService extends BaseApiService {
  // Get user's holdings with portfolio composition
  async getUserHoldings(user: User | null = null): Promise<HoldingsResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = '/api/holdings/';
    return this.get<HoldingsResponse>(endpoint, user);
  }

  // Get manual holdings only (simple format for management)
  async getManualHoldings(user: User | null = null): Promise<SimpleHoldingsResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = '/api/holdings/?source=user_manual';
    return this.get<SimpleHoldingsResponse>(endpoint, user);
  }

  // Create a new manual holding
  async createHolding(
    user: User | null = null,
    holdingData: CreateHoldingRequest
  ): Promise<CreateHoldingResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = '/api/holdings/';
    return this.post<CreateHoldingResponse>(endpoint, holdingData, user);
  }

  // Delete a manual holding
  async deleteHolding(user: User | null = null, holdingId: string): Promise<void> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = `/api/holdings/${holdingId}/`;
    return this.delete(endpoint, user);
  }
}

// Create and export a singleton instance
export const holdingsService = new HoldingsService();