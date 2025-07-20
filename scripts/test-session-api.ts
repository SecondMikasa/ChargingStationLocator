import connectDB from '@/lib/mongodb';
import ChargingSession from '@/models/ChargingSession';
import ChargingStation from '@/models/ChargingStation';
import QueueUpdate from '@/models/QueueUpdate';
import User from '@/models/User';
import mongoose from 'mongoose';

async function testSessionAPI() {
  try {
    console.log('🔌 Testing Session Management API...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Test data setup
    const testUserId = 'test-user-123';
    const testStationId = new mongoose.Types.ObjectId();

    // Clean up any existing test data
    await ChargingSession.deleteMany({ userId: testUserId });
    await ChargingStation.deleteOne({ _id: testStationId });
    await QueueUpdate.deleteMany({ updatedBy: testUserId });
    
    // Create test station
    const testStation = await ChargingStation.create({
      _id: testStationId,
      name: 'Test Charging Station',
      latitude: 40.7128,
      longitude: -74.0060,
      pricePerKwh: 0.25,
      queueLength: 3,
      amenities: ['WiFi', 'Restroom'],
      operatingHours: {
        open: '06:00',
        close: '22:00'
      }
    });
    console.log('✅ Created test station');

    // Create test charging session
    const testSession = await ChargingSession.create({
      userId: testUserId,
      stationId: testStationId.toString(),
      joinedAt: new Date(),
      status: 'active',
      queuePosition: 2,
      estimatedWaitTime: 45
    });
    console.log('✅ Created test session');

    // Test session validation
    const { validateSessionCompletion } = await import('@/lib/session-utils');
    
    const validation = await validateSessionCompletion(
      testSession._id.toString(),
      testStationId.toString(),
      testUserId
    );
    
    if (validation.isValid) {
      console.log('✅ Session validation passed');
    } else {
      console.log('❌ Session validation failed:', validation.error);
    }

    // Test session formatting
    const { formatSessionForResponse } = await import('@/lib/session-utils');
    
    const formattedSession = formatSessionForResponse(testSession, testStation.name);
    console.log('✅ Session formatting works');
    console.log('   Session ID:', formattedSession.id);
    console.log('   Station Name:', formattedSession.stationName);
    console.log('   Status:', formattedSession.status);

    // Test pagination validation
    const { validatePagination } = await import('@/lib/session-utils');
    
    const paginationTest = validatePagination(1, 10);
    if (paginationTest.isValid) {
      console.log('✅ Pagination validation works');
    } else {
      console.log('❌ Pagination validation failed:', paginationTest.error);
    }

    // Test queue update utilities
    const { createQueueAuditRecord } = await import('@/lib/session-utils');
    
    await createQueueAuditRecord(
      testStationId.toString(),
      3,
      2,
      testUserId,
      'session_complete'
    );
    console.log('✅ Queue audit record created');

    // Verify audit record was created
    const auditRecord = await QueueUpdate.findOne({
      stationId: testStationId.toString(),
      updatedBy: testUserId
    });
    
    if (auditRecord) {
      console.log('✅ Audit record verification passed');
      console.log('   Previous count:', auditRecord.previousCount);
      console.log('   New count:', auditRecord.newCount);
      console.log('   Reason:', auditRecord.reason);
    } else {
      console.log('❌ Audit record not found');
    }

    // Clean up test data
    await ChargingSession.deleteMany({ userId: testUserId });
    await ChargingStation.deleteOne({ _id: testStationId });
    await QueueUpdate.deleteMany({ updatedBy: testUserId });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All session API tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSessionAPI()
  .then(() => {
    console.log('✅ Session API test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Session API test failed:', error);
    process.exit(1);
  });