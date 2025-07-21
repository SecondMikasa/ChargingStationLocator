import { webSocketService } from '../lib/websocket-service';
import { setTimeout } from 'timers/promises';

/**
 * Test script for WebSocket functionality
 * 
 * This script:
 * 1. Initializes the WebSocket server
 * 2. Simulates queue updates for a test station
 * 3. Logs connection statistics
 * 4. Shuts down the server after tests complete
 */
async function testWebSocketServer() {
  console.log('Starting WebSocket server test...');
  
  // Initialize WebSocket server
  webSocketService.initialize();
  
  console.log('WebSocket server initialized');
  console.log('Waiting for potential client connections (10 seconds)...');
  
  // Wait for potential client connections
  await setTimeout(10000);
  
  // Get connection statistics
  const stats = webSocketService.getStats();
  console.log('WebSocket connection statistics:', stats);
  
  // Test station ID
  const testStationId = 'test-station-123';
  
  // Simulate queue updates
  console.log(`Simulating queue updates for station ${testStationId}...`);
  
  for (let i = 5; i >= 0; i--) {
    console.log(`Broadcasting queue update: ${i} users in queue`);
    webSocketService.broadcastQueueUpdate(testStationId, i, 'test-script');
    await setTimeout(2000);
  }
  
  // Simulate user notification
  console.log('Simulating user notification...');
  webSocketService.broadcastUserNotification('test-user-123', {
    notificationType: 'next_in_line',
    message: "You're next in line! The charging station will be available soon.",
    priority: 'high',
    sessionId: 'test-session-123'
  });
  
  // Wait a bit before shutting down
  await setTimeout(5000);
  
  // Shutdown WebSocket server
  console.log('Shutting down WebSocket server...');
  webSocketService.shutdown();
  
  console.log('WebSocket server test completed');
}

// Run the test
testWebSocketServer().catch(error => {
  console.error('Error in WebSocket test:', error);
  process.exit(1);
});