import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueueStatusIndicator } from '../queue-status-indicator';

// Mock the useWebSocket hook
jest.mock('@/hooks/use-websocket', () => ({
  useWebSocket: () => ({
    isConnected: true,
    subscribeToStation: jest.fn(),
    unsubscribeFromStation: jest.fn(),
    onQueueUpdate: jest.fn(),
  }),
}));

describe('QueueStatusIndicator', () => {
  const mockProps = {
    stationId: 'test-station-1',
    initialQueueLength: 3,
    lastUpdated: new Date('2025-01-01T12:00:00Z'),
  };

  it('renders with the correct queue length', () => {
    render(<QueueStatusIndicator {...mockProps} />);
    expect(screen.getByText('3 people in queue')).toBeInTheDocument();
  });

  it('shows "person" for singular queue length', () => {
    render(<QueueStatusIndicator {...mockProps} initialQueueLength={1} />);
    expect(screen.getByText('1 person in queue')).toBeInTheDocument();
  });

  it('shows "Available Now" status when queue is empty', () => {
    render(<QueueStatusIndicator {...mockProps} initialQueueLength={0} />);
    expect(screen.getByText('Available Now')).toBeInTheDocument();
  });

  it('shows "Low Wait" status for small queues', () => {
    render(<QueueStatusIndicator {...mockProps} initialQueueLength={3} />);
    expect(screen.getByText('Low Wait')).toBeInTheDocument();
  });

  it('shows "High Wait" status for large queues', () => {
    render(<QueueStatusIndicator {...mockProps} initialQueueLength={5} />);
    expect(screen.getByText('High Wait')).toBeInTheDocument();
  });

  it('displays user position when provided', () => {
    render(<QueueStatusIndicator {...mockProps} userPosition={2} />);
    expect(screen.getByText('Your position: 2')).toBeInTheDocument();
  });

  it('shows "You\'re next!" notification when user is in position 1', () => {
    render(<QueueStatusIndicator {...mockProps} userPosition={1} />);
    expect(screen.getByText('You\'re next!')).toBeInTheDocument();
  });

  it('displays the last updated timestamp', () => {
    render(<QueueStatusIndicator {...mockProps} />);
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });
});