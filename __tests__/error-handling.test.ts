import { 
  createErrorResponse, 
  createSuccessResponse, 
  getErrorCode, 
  withRetry, 
  fetchWithRetry, 
  parseApiResponse, 
  apiCall,
  isRetryableError,
  getUserFriendlyErrorMessage,
  ErrorCode 
} from '@/lib/error-handling';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Error Handling System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createErrorResponse', () => {
    it('should create a standardized error response', () => {
      const response = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Custom error message',
        'Additional details'
      );

      expect(response).toEqual({
        success: false,
        error: 'Custom error message',
        code: ErrorCode.VALIDATION_ERROR,
        details: 'Additional details',
        retryAfter: undefined,
        canRetry: false // VALIDATION_ERROR is not retryable
      });
    });

    it('should use default message when no custom message provided', () => {
      const response = createErrorResponse(ErrorCode.UNAUTHORIZED);

      expect(response.error).toBe('Please log in to continue.');
      expect(response.canRetry).toBe(false);
    });
  });

  describe('createSuccessResponse', () => {
    it('should create a standardized success response', () => {
      const data = { id: 1, name: 'test' };
      const response = createSuccessResponse(data, 'Success message');

      expect(response).toEqual({
        success: true,
        data,
        message: 'Success message'
      });
    });
  });

  describe('getErrorCode', () => {
    it('should return existing error code', () => {
      const error = { code: ErrorCode.NETWORK_ERROR };
      expect(getErrorCode(error)).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('should detect validation errors', () => {
      const error = { name: 'ValidationError' };
      expect(getErrorCode(error)).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should detect MongoDB duplicate key errors', () => {
      const error = { name: 'MongoError', code: 11000 };
      expect(getErrorCode(error)).toBe(ErrorCode.DUPLICATE_COMPLETION);
    });

    it('should detect timeout errors', () => {
      const error = { message: 'Request timeout occurred' };
      expect(getErrorCode(error)).toBe(ErrorCode.TIMEOUT_ERROR);
    });

    it('should return unknown error for unrecognized errors', () => {
      const error = { message: 'Some random error' };
      expect(getErrorCode(error)).toBe(ErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await withRetry(operation);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce({ code: ErrorCode.NETWORK_ERROR, message: 'Network failed' })
        .mockResolvedValue('success');
      
      const promise = withRetry(operation, { maxAttempts: 2 });
      
      // Fast-forward timers to trigger retry
      jest.advanceTimersByTime(5000);
      
      const result = await promise;
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    }, 10000);

    it('should not retry on non-retryable errors', async () => {
      const operation = jest.fn()
        .mockRejectedValue({ code: ErrorCode.UNAUTHORIZED, message: 'Unauthorized' });
      
      await expect(withRetry(operation)).rejects.toEqual({
        code: ErrorCode.UNAUTHORIZED,
        message: 'Unauthorized'
      });
      
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should fail after max attempts', async () => {
      const error = { code: ErrorCode.NETWORK_ERROR, message: 'Network failed' };
      const operation = jest.fn().mockRejectedValue(error);
      
      const promise = withRetry(operation, { maxAttempts: 2 });
      
      // Fast-forward timers for all retry attempts
      jest.advanceTimersByTime(15000);
      
      await expect(promise).rejects.toEqual(error);
      expect(operation).toHaveBeenCalledTimes(2);
    }, 10000);
  });

  describe('fetchWithRetry', () => {
    it('should return successful response', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      const response = await fetchWithRetry('/api/test');
      
      expect(response).toBe(mockResponse);
      expect(fetch).toHaveBeenCalledWith('/api/test', { signal: expect.any(AbortSignal) });
    });

    it('should throw error for failed response', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ 
          error: 'Bad request', 
          code: ErrorCode.VALIDATION_ERROR 
        })
      };
      
      (fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      await expect(fetchWithRetry('/api/test')).rejects.toEqual({
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Bad request',
        status: 400
      });
    });

    it('should handle timeout', async () => {
      (fetch as jest.Mock).mockRejectedValue({ name: 'AbortError' });
      
      await expect(fetchWithRetry('/api/test')).rejects.toEqual({
        code: ErrorCode.TIMEOUT_ERROR,
        message: 'Request timed out'
      });
    });
  });

  describe('parseApiResponse', () => {
    it('should parse successful response', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { id: 1 }
        })
      } as any;
      
      const result = await parseApiResponse(mockResponse);
      
      expect(result).toEqual({
        success: true,
        data: { id: 1 }
      });
    });

    it('should throw error for failed response', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({
          success: false,
          error: 'Something went wrong',
          code: ErrorCode.INTERNAL_ERROR
        })
      } as any;
      
      await expect(parseApiResponse(mockResponse)).rejects.toEqual({
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Something went wrong',
        canRetry: undefined
      });
    });
  });

  describe('isRetryableError', () => {
    it('should identify retryable errors', () => {
      expect(isRetryableError({ code: ErrorCode.NETWORK_ERROR })).toBe(true);
      expect(isRetryableError({ code: ErrorCode.TIMEOUT_ERROR })).toBe(true);
      expect(isRetryableError({ code: ErrorCode.INTERNAL_ERROR })).toBe(true);
    });

    it('should identify non-retryable errors', () => {
      expect(isRetryableError({ code: ErrorCode.UNAUTHORIZED })).toBe(false);
      expect(isRetryableError({ code: ErrorCode.VALIDATION_ERROR })).toBe(false);
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return custom error message', () => {
      const error = { message: 'Custom error message' };
      expect(getUserFriendlyErrorMessage(error)).toBe('Custom error message');
    });

    it('should return default message for error code', () => {
      const error = { code: ErrorCode.UNAUTHORIZED };
      expect(getUserFriendlyErrorMessage(error)).toBe('Please log in to continue.');
    });
  });
});