import { User } from 'firebase/auth';
import { BaseApiService } from './base';
import {
  NewsSummaryTaskResponse,
  NewsSummaryStatusResponse,
} from '@/types/api';

export class NewsSummaryService extends BaseApiService {
  /**
   * Queue a background task to fetch news summary for a security
   */
  async queueNewsSummaryFetch(
    symbol: string,
    user: User | null = null,
    forceUpdate: boolean = false,
  ): Promise<NewsSummaryTaskResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = `/api/securities/${symbol.toUpperCase()}/fetch-news-summary/`;

    return this.post<NewsSummaryTaskResponse>(endpoint, {}, user);
  }

  /**
   * Check the status of a news summary background task
   */
  async checkTaskStatus(
    symbol: string,
    taskId: string,
    user: User | null = null,
  ): Promise<NewsSummaryStatusResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    const endpoint = `/api/securities/${symbol.toUpperCase()}/news-summary-status/${taskId}/`;
    return this.get<NewsSummaryStatusResponse>(endpoint, user);
  }

  /**
   * Smart polling mechanism with 110s initial delay, then 10s intervals
   * Based on P99 completion time of 106 seconds
   */
  async pollUntilComplete(
    symbol: string,
    taskId: string,
    user: User | null = null,
    onStatusUpdate?: (status: NewsSummaryStatusResponse) => void,
  ): Promise<NewsSummaryStatusResponse> {
    if (!user) {
      throw new Error('User authentication required');
    }

    return new Promise((resolve, reject) => {
      // First poll after 110 seconds (P99 + buffer)
      const initialTimeout = setTimeout(async () => {
        let attempts = 0;
        const maxAttempts = 4;

        const pollStatus = async () => {
          try {
            attempts++;
            const statusResponse = await this.checkTaskStatus(
              symbol,
              taskId,
              user,
            );

            // Notify caller of status update
            if (onStatusUpdate) {
              onStatusUpdate(statusResponse);
            }

            if (statusResponse.status === 'completed') {
              // Task completed successfully
              resolve(statusResponse);
              return;
            } else if (statusResponse.status === 'failed') {
              // Task failed
              reject(
                new Error(
                  `News summary task failed for ${symbol}: ${statusResponse.message}`,
                ),
              );
              return;
            } else if (attempts >= maxAttempts) {
              // Max attempts reached
              reject(
                new Error(
                  `News summary task for ${symbol} timed out after ${maxAttempts} attempts`,
                ),
              );
              return;
            }

            // Still processing, schedule next poll in 10 seconds
            setTimeout(pollStatus, 10000);
          } catch (error) {
            reject(error);
          }
        };

        // Start the polling loop
        pollStatus();
      }, 110000); // 110 seconds initial delay

      // Store timeout ID for potential cleanup
      (resolve as any).timeoutId = initialTimeout;
    });
  }

  /**
   * Cancel ongoing polling (cleanup utility)
   */
  cancelPolling(pollingPromise: Promise<any>) {
    if ((pollingPromise as any).timeoutId) {
      clearTimeout((pollingPromise as any).timeoutId);
    }
  }
}

// Create and export singleton instance
export const newsSummaryService = new NewsSummaryService();
