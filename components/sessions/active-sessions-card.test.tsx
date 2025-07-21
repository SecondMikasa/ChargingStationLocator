import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ActiveSessionsCard } from './active-sessions-card';
import { ChargingSession } from '@/types/queue';

// Mock data for testing
const mockSessions: ChargingSession[] = [
  {
    id: 'session1',
    userId: 'user1',
    stationId: 'station1',
    stationName: 'Downtown Charging Station',
    joinedAt: new Date('2025-07-20T10:00:00'),
    status: 'active',
    queuePosition: 1,
    estimatedWaitTime: 0,
    createdAt: new Date('2025-07-20T10:00:00'),
    updatedAt: new Date('2025-07-20T10:00:00')
  },
  {
    id: 'session2',
    userId: 'user1',
    stationId: 'station2',
    stationName: 'Mall Charging Station',
    joinedAt: new Date('2025-07-20T09:00:00'),
    status: 'active',
    queuePosition: 3,
    estimatedWaitTime: 90,
    createdAt: new Date('2025-07-20T09:00:00'),
    updatedAt: new Date('2025-07-20T09:00:00')
  }
];

// Mock completion function
const mockCompleteSession = jest.fn(() => Promise.resolve());

describe('ActiveSessionsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    render(
      <ActiveSessionsCard 
        sessions={[]} 
        isLoading={true} 
        onCompleteSession={mockCompleteSession} 
      />
    );
    
    expect(screen.getByText('Active Charging Sessions')).toBeInTheDocument();
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('renders empty state when no sessions', () => {
    render(
      <ActiveSessionsCard 
        sessions={[]} 
        isLoading={false} 
        onCompleteSession={mockCompleteSession} 
      />
    );
    
    expect(screen.getByText('No active charging sessions')).toBeInTheDocument();
    expect(screen.getByText('Join a queue at a charging station to start charging')).toBeInTheDocument();
  });

  it('renders sessions correctly', () => {
    render(
      <ActiveSessionsCard 
        sessions={mockSessions} 
        isLoading={false} 
        onCompleteSession={mockCompleteSession} 
      />
    );
    
    expect(screen.getByText('Downtown Charging Station')).toBeInTheDocument();
    expect(screen.getByText('Mall Charging Station')).toBeInTheDocument();
    expect(screen.getByText("You're next!")).toBeInTheDocument();
    expect(screen.getByText('Position 3')).toBeInTheDocument();
    expect(screen.getByText('Wait: No wait')).toBeInTheDocument();
    expect(screen.getByText('Wait: 1h 30m')).toBeInTheDocument();
  });

  it('opens confirmation dialog when Complete Charging is clicked', async () => {
    render(
      <ActiveSessionsCard 
        sessions={mockSessions} 
        isLoading={false} 
        onCompleteSession={mockCompleteSession} 
      />
    );
    
    // Click the first Complete Charging button
    const completeButtons = screen.getAllByText('Complete Charging');
    fireEvent.click(completeButtons[0]);
    
    // Check if confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('Complete Charging Session')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to complete your charging session/)).toBeInTheDocument();
      expect(screen.getByText('Downtown Charging Station')).toBeInTheDocument();
    });
  });

  it('calls onCompleteSession when confirmation is confirmed', async () => {
    render(
      <ActiveSessionsCard 
        sessions={mockSessions} 
        isLoading={false} 
        onCompleteSession={mockCompleteSession} 
      />
    );
    
    // Click the first Complete Charging button
    const completeButtons = screen.getAllByText('Complete Charging');
    fireEvent.click(completeButtons[0]);
    
    // Click the confirm button in the dialog
    const confirmButton = await screen.findByText('Complete Session');
    fireEvent.click(confirmButton);
    
    // Check if onCompleteSession was called with correct parameters
    expect(mockCompleteSession).toHaveBeenCalledWith('session1', 'station1');
  });
});