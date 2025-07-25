# Comprehensive Error Handling System

This document describes the comprehensive error handling and user feedback system implemented for the queue completion system.

## Overview

The error handling system provides:
- Standardized error responses across all API endpoints
- Retry logic with exponential backoff for transient failures
- User-friendly error messages and notifications
- Loading states and success confirmations
- Comprehensive error categorization and handling

## Components

### 1. Error Handling Utilities (`lib/error-handling.ts`)

#### Error Codes
```typescript
enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Session Management
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  INVALID_SESSION = 'INVALID_SESSION',
  DUPLICATE_COMPLETION = 'DUPLICATE_COMPLETION',
  
  // Queue Management
  QUEUE_UPDATE_FAILED = 'QUEUE_UPDATE_FAILED',
  CONCURRENT_UPDATE = 'CONCURRENT_UPDATE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Network & Infrastructure
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // WebSocket
  WEBSOCKET_CONNECTION_FAILED = 'WEBSOCKET_CONNECTION_FAILED',
  WEBSOCKET_DISCONNECTED = 'WEBSOCKET_DISCONNECTED'
}
```

#### Key Functions

**`createErrorResponse(code, message?, details?, retryAfter?)`**
Creates standardized error responses with consistent structure.

**`createSuccessResponse(data?, message?)`**
Creates standardized success responses.

**`withRetry(operation, config?)`**
Wraps operations with retry logic and exponential backoff.

**`apiCall(url, options?, retryConfig?)`**
Enhanced fetch wrapper with comprehensive error handling.

**`isRetryableError(error)`**
Determines if an error should trigger retry logic.

**`getUserFriendlyErrorMessage(error)`**
Returns user-friendly error messages.

### 2. Toast Notification System (`components/ui/toast.tsx`)

Provides user feedback through toast notifications:

```typescript
// Usage examples
const { addToast } = useToast();

// Success notification
addToast({
  type: 'success',
  title: 'Session Completed',
  description: 'Your charging session has been completed successfully.',
  duration: 5000
});

// Error notification with retry
addToast({
  type: 'error',
  title: 'Failed to Complete Session',
  description: 'Network error occurred while completing your session.',
  duration: 7000,
  action: {
    label: 'Retry',
    onClick: () => retryOperation()
  }
});
```

### 3. Error Boundary (`components/ui/error-boundary.tsx`)

Catches and handles React component errors:

```typescript
<ErrorBoundary onError={handleError}>
  <YourComponent />
</ErrorBoundary>
```

### 4. Loading Components (`components/ui/loading-spinner.tsx`)

Provides consistent loading states:

```typescript
<LoadingSpinner size="md" text="Loading..." />
<LoadingSection text="Fetching data..." />
<LoadingButton text="Saving..." />
```

## API Error Handling

### Standardized Response Format

All API endpoints return responses in this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "details": "Optional technical details",
  "retryAfter": 30,
  "canRetry": true
}
```

### Retry Logic

The system implements intelligent retry logic:

- **Retryable Errors**: Network errors, timeouts, internal server errors, concurrent updates
- **Non-Retryable Errors**: Authentication, validation, authorization errors
- **Exponential Backoff**: Base delay of 1 second, multiplier of 2, max delay of 10 seconds
- **Jitter**: Random delay added to prevent thundering herd problem
- **Max Attempts**: Configurable, default is 3 attempts

### Example Implementation

```typescript
// API endpoint with error handling
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await sessionCompletionRateLimiter(request);
    if (rateLimitResponse) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'Too many requests. Please wait before trying again.',
          undefined,
          30 // retry after 30 seconds
        ),
        { status: 429 }
      );
    }

    // Validate authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse(
          ErrorCode.UNAUTHORIZED,
          'Please log in to complete your charging session.'
        ),
        { status: 401 }
      );
    }

    // Perform operation with retry logic
    const result = await withRetry(async () => {
      return await performDatabaseOperation();
    }, {
      maxAttempts: 3,
      retryableErrors: [ErrorCode.CONCURRENT_UPDATE, ErrorCode.DATABASE_ERROR]
    });

    return NextResponse.json(
      createSuccessResponse(result, 'Operation completed successfully!')
    );

  } catch (error) {
    console.error('Operation failed:', error);
    
    return NextResponse.json(
      createErrorResponse(
        ErrorCode.INTERNAL_ERROR,
        'Failed to complete operation. Please try again.'
      ),
      { status: 500 }
    );
  }
}
```

## Frontend Error Handling

### Hook Implementation

```typescript
// Enhanced hook with error handling
export function useActiveSessions() {
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchActiveSessions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiCall<{ data: ActiveSessionsResponse }>(
        '/api/sessions/active',
        {},
        {
          maxAttempts: 3,
          retryableErrors: [ErrorCode.NETWORK_ERROR, ErrorCode.TIMEOUT_ERROR]
        }
      );

      setSessions(response.data?.sessions || []);
    } catch (err: any) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      setError(errorMessage);
      
      addToast({
        type: 'error',
        title: 'Failed to Load Sessions',
        description: errorMessage,
        action: isRetryableError(err) ? {
          label: 'Retry',
          onClick: () => fetchActiveSessions()
        } : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async (sessionId: string, stationId: string) => {
    try {
      await apiCall('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, stationId })
      });

      addToast({
        type: 'success',
        title: 'Session Completed',
        description: 'Your charging session has been completed successfully.'
      });

      // Update local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Complete Session',
        description: getUserFriendlyErrorMessage(err),
        action: isRetryableError(err) ? {
          label: 'Retry',
          onClick: () => completeSession(sessionId, stationId)
        } : undefined
      });
      throw err;
    }
  };

  return { sessions, isLoading, error, fetchActiveSessions, completeSession };
}
```

### Component Implementation

```typescript
export function ActiveSessionsCard() {
  const { sessions, isLoading, error, completeSession, fetchActiveSessions } = useActiveSessions();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCompleteSession = async (sessionId: string, stationId: string) => {
    try {
      setIsCompleting(true);
      await completeSession(sessionId, stationId);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchActiveSessions();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error Loading Sessions
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 mb-4">{error}</div>
          <div className="text-sm text-muted-foreground">
            Unable to load your active charging sessions. This might be due to a network issue.
          </div>
        </CardContent>
      </Card>
    );
  }

  // ... rest of component
}
```

## WebSocket Error Handling

The WebSocket connection includes comprehensive error handling:

- **Connection Retry**: Automatic reconnection with exponential backoff
- **Error Recovery**: Graceful handling of connection failures
- **Fallback Behavior**: Components continue to work without real-time updates
- **User Feedback**: Clear indication of connection status

## Testing

The error handling system includes comprehensive tests:

```bash
npm test -- __tests__/error-handling.test.ts --run
```

Tests cover:
- Error response creation
- Retry logic with various scenarios
- Error code detection
- User-friendly message generation
- API call wrapper functionality

## Best Practices

1. **Always use standardized error responses** in API endpoints
2. **Implement retry logic** for transient failures
3. **Provide user-friendly error messages** instead of technical details
4. **Show loading states** during operations
5. **Offer retry options** for recoverable errors
6. **Log errors appropriately** for debugging and monitoring
7. **Handle edge cases** like network disconnection
8. **Test error scenarios** thoroughly

## Configuration

Error handling behavior can be configured:

```typescript
const customRetryConfig: RetryConfig = {
  maxAttempts: 5,
  baseDelayMs: 2000,
  maxDelayMs: 30000,
  backoffMultiplier: 1.5,
  retryableErrors: [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT_ERROR,
    ErrorCode.INTERNAL_ERROR
  ]
};

await withRetry(operation, customRetryConfig);
```

## Monitoring and Logging

The system includes comprehensive logging:
- Security audit logs for failed operations
- Performance metrics for retry attempts
- Error categorization for monitoring
- User action tracking for analytics

This error handling system ensures a robust and user-friendly experience even when things go wrong, with clear feedback and recovery options for users.