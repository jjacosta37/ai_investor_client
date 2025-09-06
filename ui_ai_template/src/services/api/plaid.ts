/**
 * Plaid API Service
 *
 * Handles all API interactions with the Plaid integration backend endpoints.
 */

import { BaseApiService } from './base';
import { User } from 'firebase/auth';

// Types for Plaid API requests and responses
export interface LinkTokenCreateRequest {
  user_id?: string;
  products?: string[];
}

export interface LinkTokenCreateResponse {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PublicTokenExchangeRequest {
  public_token: string;
}

export interface PublicTokenExchangeResponse {
  message: string;
}

export interface ProcessHoldingsRequest {
  item_id: string;
  force_update?: boolean;
  dry_run?: boolean;
}

class PlaidService extends BaseApiService {
  /**
   * Create a link token for Plaid Link initialization
   */
  async createLinkToken(user: User): Promise<LinkTokenCreateResponse> {
    // No request body needed - server configures products automatically
    const response = await this.post<LinkTokenCreateResponse>(
      '/plaid/link-token/',
      null,
      user,
    );

    return response;
  }

  /**
   * Exchange public token for access token
   */
  async exchangePublicToken(
    publicToken: string,
    user: User,
  ): Promise<PublicTokenExchangeResponse> {
    const request: PublicTokenExchangeRequest = {
      public_token: publicToken,
    };

    const response = await this.post<PublicTokenExchangeResponse>(
      '/plaid/exchange-token/',
      request,
      user,
    );

    return response;
  }
}

// Export service instance
export const plaidService = new PlaidService();
