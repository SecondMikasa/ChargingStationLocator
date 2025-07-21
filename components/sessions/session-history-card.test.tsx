import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionHistoryCard } from './session-history-card';
import { ChargingSession } from '@/types/queue';

// Mock data
const mockSessions: ChargingSession[] = [
  {
    id: 'session-1',
    userId: 'user-1',
    stationId: 'station-abc123',
    stationName: 'Downtown Charging Hub',
    joinedAt: new Date('2024-01-15T10:00:00Z'),
    completedAt: new Date('2024-01-15T11:30:00Z'),
    status: 'completed',
    queuePosition: 1,
    estimatedWaitTime: 0,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T11:30:00Z'),
  },
  {
    id: 'session-2',
    userId: 'user-1',
    stationId: 'station-def456',
    stationName: 'Mall Charging Station',
    joinedAt: new Date('2024-01-14T14:00:00Z'),
    completedAt: new Date('2024-01-14T14:45:00Z'),
    status: 'completed',
    queuePosition: 2,
    estimatedWaitTime: 15,
    createdAt: new Date('2024-01-14T14:00:00Z'),
    updatedAt: new Date('2024-01-14T14:45:00Z'),
  },
  {
    id: 'session-3',
    userId: 'user-1',
    stationId: 'station-ghi789',
    joinedAt: new Date('2024-01-13T09:00:00Z'),
    completedAt: new Date('2024-01-13T09:15:00Z'),
    status: 'cancelled',
    queuePosition: 3,
    estimatedWaitTime: 30,
    createdAt: new Date('2024-01-13T09:00:00Z'),
    updatedAt: new Date('2024-01-13T09:15:00Z'),
  },
];

const mockPagination = {
  page: 1,
  limit: 5,
  total: 10,
};

const mockOnPageChange = jest.fn();

describe('SessionHistoryCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with title', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Charging Session History')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    render(
      <SessionHistoryCard
        sessions={[]}
        isLoading={true}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('displays empty state when no sessions exist', () => {
    render(
      <SessionHistoryCard
        sessions={[]}
        pagination={{ page: 1, limit: 5, total: 0 }}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('No charging session history')).toBeInTheDocument();
    expect(screen.getByText('Your completed charging sessions will appear here')).toBeInTheDocument();
  });

  it('displays session information correctly', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    // Check if session names are displayed
    expect(screen.getByText('Downtown Charging Hub')).toBeInTheDocument();
    expect(screen.getByText('Mall Charging Station')).toBeInTheDocument();

    // Check if station IDs are displayed for sessions without names (using getAllByText since it appears twice)
    expect(screen.getAllByText(/Station #i789/)).toHaveLength(2);

    // Check if status badges are displayed
    expect(screen.getAllByText('Completed')).toHaveLength(2);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('calculates and displays session duration correctly', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    // First session: 1h 30m duration
    expect(screen.getByText('Duration: 1h 30m')).toBeInTheDocument();
    
    // Second session: 45 min duration
    expect(screen.getByText('Duration: 45 min')).toBeInTheDocument();
    
    // Third session: 15 min duration
    expect(screen.getByText('Duration: 15 min')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    // Check completion dates
    expect(screen.getByText(/Completed Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Completed Jan 14, 2024/)).toBeInTheDocument();
    
    // Check start dates
    expect(screen.getByText(/Started: Jan 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/Started: Jan 14, 2024/)).toBeInTheDocument();
  });

  it('displays pagination information correctly', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.getByText('Showing 1 to 5 of 10 sessions')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('handles pagination navigation correctly', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByText('Next');
    const prevButton = screen.getByText('Previous');

    // Previous button should be disabled on first page
    expect(prevButton).toBeDisabled();
    
    // Next button should be enabled
    expect(nextButton).not.toBeDisabled();

    // Click next button
    fireEvent.click(nextButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('handles pagination on last page correctly', () => {
    const lastPagePagination = {
      page: 2,
      limit: 5,
      total: 10,
    };

    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={lastPagePagination}
        onPageChange={mockOnPageChange}
      />
    );

    const nextButton = screen.getByText('Next');
    const prevButton = screen.getByText('Previous');

    // Next button should be disabled on last page
    expect(nextButton).toBeDisabled();
    
    // Previous button should be enabled
    expect(prevButton).not.toBeDisabled();

    // Click previous button
    fireEvent.click(prevButton);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('does not show pagination when there is only one page', () => {
    const singlePagePagination = {
      page: 1,
      limit: 5,
      total: 3,
    };

    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={singlePagePagination}
        onPageChange={mockOnPageChange}
      />
    );

    expect(screen.queryByText('Previous')).not.toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
  });

  it('applies correct badge colors for different statuses', () => {
    render(
      <SessionHistoryCard
        sessions={mockSessions}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    const completedBadges = screen.getAllByText('Completed');
    const cancelledBadge = screen.getByText('Cancelled');

    // Check if badges have correct classes (this would depend on your Badge component implementation)
    completedBadges.forEach(badge => {
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
    
    expect(cancelledBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('handles sessions without station names correctly', () => {
    const sessionsWithoutNames = mockSessions.map(session => ({
      ...session,
      stationName: undefined,
    }));

    render(
      <SessionHistoryCard
        sessions={sessionsWithoutNames}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    // Should display station ID as fallback (using getAllByText since it appears twice per session)
    expect(screen.getAllByText(/Station #c123/)).toHaveLength(2);
    expect(screen.getAllByText(/Station #f456/)).toHaveLength(2);
    expect(screen.getAllByText(/Station #i789/)).toHaveLength(2);
  });

  it('handles sessions without completion dates correctly', () => {
    const sessionsWithoutCompletionDates = mockSessions.map(session => ({
      ...session,
      completedAt: undefined,
    }));

    render(
      <SessionHistoryCard
        sessions={sessionsWithoutCompletionDates}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
      />
    );

    // Should show "Unknown" duration and use updatedAt for completion time
    expect(screen.getAllByText('Duration: Unknown')).toHaveLength(3);
  });
});