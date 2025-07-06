import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/services/api';
import { useToast } from '@chakra-ui/react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation completed successfully',
    errorMessage = 'An error occurred',
  } = options;

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiCall();

        setState({
          data: result,
          loading: false,
          error: null,
        });

        if (showSuccessToast) {
          toast({
            title: 'Success',
            description: successMessage,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }

        return result;
      } catch (error) {
        const errorMsg =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
            ? error.message
            : 'Unknown error occurred';

        setState({
          data: null,
          loading: false,
          error: errorMsg,
        });

        if (showErrorToast) {
          toast({
            title: 'Error',
            description: errorMessage + ': ' + errorMsg,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }

        return null;
      }
    },
    [toast, showSuccessToast, showErrorToast, successMessage, errorMessage],
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    user,
  };
}

// Specialized hooks for common operations
export function useChatApi() {
  return useApi({
    showSuccessToast: true,
    showErrorToast: true,
    successMessage: 'Chat operation completed successfully',
    errorMessage: 'Failed to perform chat operation',
  });
}

export function useMessageApi() {
  return useApi({
    showSuccessToast: false, // Don't show success toast for messages
    showErrorToast: true,
    errorMessage: 'Failed to send message',
  });
}

// Hook for API operations without toast notifications
export function useApiSilent<T = any>() {
  return useApi<T>({
    showSuccessToast: false,
    showErrorToast: false,
  });
}
