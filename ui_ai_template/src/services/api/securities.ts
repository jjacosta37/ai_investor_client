import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import {
  SecurityListResponse,
  SecurityDetailResponse,
  SecuritySearchParams,
} from '@/types/api';

export class SecuritiesService extends BaseApiService {
  // Search securities with optional filters
  async searchSecurities(
    searchParams: SecuritySearchParams,
    user: User | null = null,
  ): Promise<SecurityListResponse> {
    // Build query parameters
    const params = new URLSearchParams();

    if (searchParams.search) {
      params.append('search', searchParams.search);
    }
    if (searchParams.type) {
      params.append('type', searchParams.type);
    }
    if (searchParams.exchange) {
      params.append('exchange', searchParams.exchange);
    }
    if (searchParams.limit) {
      params.append('limit', searchParams.limit.toString());
    }
    if (searchParams.offset) {
      params.append('offset', searchParams.offset.toString());
    }
    if (searchParams.ordering) {
      params.append('ordering', searchParams.ordering);
    }

    const queryString = params.toString();
    const endpoint = `/api/securities/${queryString ? `?${queryString}` : ''}`;

    return this.get<SecurityListResponse>(endpoint, user);
  }

  // Get all securities with optional filters
  async getSecurities(
    filters: {
      type?: 'CS' | 'ETF' | 'ADRC';
      exchange?: string;
      limit?: number;
      offset?: number;
      ordering?: string;
    } = {},
    user: User | null = null,
  ): Promise<SecurityListResponse> {
    return this.searchSecurities(filters, user);
  }

  // Get specific security details
  async getSecurityDetails(
    symbol: string,
    user: User | null = null,
  ): Promise<SecurityDetailResponse> {
    const endpoint = `/api/securities/${symbol.toUpperCase()}/`;
    return this.get<SecurityDetailResponse>(endpoint, user);
  }

  // Quick search for autocomplete/typeahead
  async quickSearch(
    query: string,
    limit: number = 10,
    user: User | null = null,
  ): Promise<SecurityListResponse> {
    if (query.length < 2) {
      return { count: 0, results: [] };
    }

    return this.searchSecurities(
      {
        search: query,
        limit,
        ordering: 'symbol',
      },
      user,
    );
  }

  // Get securities by type (CS, ETF, ADRC)
  async getSecuritiesByType(
    type: 'CS' | 'ETF' | 'ADRC',
    limit: number = 50,
    user: User | null = null,
  ): Promise<SecurityListResponse> {
    return this.searchSecurities(
      {
        type,
        limit,
        ordering: 'symbol',
      },
      user,
    );
  }

  // Get securities by exchange
  async getSecuritiesByExchange(
    exchange: string,
    limit: number = 50,
    user: User | null = null,
  ): Promise<SecurityListResponse> {
    return this.searchSecurities(
      {
        exchange,
        limit,
        ordering: 'symbol',
      },
      user,
    );
  }
}

// Create and export singleton instance
export const securitiesService = new SecuritiesService();
