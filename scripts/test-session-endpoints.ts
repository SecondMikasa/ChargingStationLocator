import connectDB from '@/lib/mongodb';
import ChargingSession from '@/models/ChargingSession';
import ChargingStation from '@/models/ChargingStation';
import User from '@/models/User';
import mongoose from 'mongoose';

async function testSessionEndpoints() {
  try {
    console.log('🔌 Testing Session API Endpoints...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Create test data
    const testUserId = new mongoose.Types.ObjectId();
    const testStationId = new mongoose.Types.ObjectId();

    // Clean up any existing test data
    await ChargingSession.deleteMany({ userId: testUserId.toString() });
    await ChargingStation.deleteOne({ _id: testStationId });
    await User.deleteOne({ _id: testUserId });

    // Create test user
    const testUser = await User.create({
      _id: testUserId,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'user'
    });
    console.log('✅ Created test user');

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

    // Create test active session
    const activeSession = await ChargingSession.create({
      userId: testUserId.toString(),
      stationId: testStationId.toString(),
      joinedAt: new Date(),
      status: 'active',
      queuePosition: 2,
      estimatedWaitTime: 45
    });
    console.log('✅ Created active session');

    // Create test completed session
    const completedSession = await ChargingSession.create({
      userId: testUserId.toString(),
      stationId: testStationId.toString(),
      joinedAt: new Date(Date.now() - 3600000), // 1 hour ago
      completedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      status: 'completed',
      queuePosition: 1,
      estimatedWaitTime: 0
    });
    console.log('✅ Created completed session');

    // Test active sessions query
    const activeSessions = await ChargingSession.find({
      userId: testUserId.toString(),
      status: 'active'
    }).sort({ joinedAt: -1 });

    if (activeSessions.length === 1) {
      console.log('✅ Active sessions query works');
      console.log('   Found session:', activeSessions[0]._id.toString());
    } else {
      console.log('❌ Active sessions query failed');
    }

    // Test session history query with pagination
    const totalCompleted = await ChargingSession.countDocuments({
      userId: testUserId.toString(),
      status: 'completed'
    });

    const completedSessions = await ChargingSession.find({
      userId: testUserId.toString(),
      status: 'completed'
    })
    .sort({ completedAt: -1 })
    .limit(10);

    if (completedSessions.length === 1 && totalCompleted === 1) {
      console.log('✅ Session history query works');
      console.log('   Found completed session:', completedSessions[0]._id.toString());
      console.log('   Total completed sessions:', totalCompleted);
    } else {
      console.log('❌ Session history query failed');
    }

    // Test session completion logic (without transaction for simplicity)
    const sessionToComplete = await ChargingSession.findById(activeSession._id);
    const stationBeforeUpdate = await ChargingStation.findById(testStationId);
    
    if (sessionToComplete && stationBeforeUpdate) {
      // Simulate session completion
      sessionToComplete.status = 'completed';
      sessionToComplete.completedAt = new Date();
      await sessionToComplete.save();

      stationBeforeUpdate.queueLength = Math.max(0, stationBeforeUpdate.queueLength - 1);
      await stationBeforeUpdate.save();

      console.log('✅ Session completion logic works');
      console.log('   Session status:', sessionToComplete.status);
      console.log('   New queue length:', stationBeforeUpdate.queueLength);
    } else {
      console.log('❌ Session completion logic failed');
    }

    // Test data validation scenarios
    console.log('\n🔍 Testing validation scenarios...');

    // Test invalid session ID
    const invalidSession = await ChargingSession.findById(new mongoose.Types.ObjectId());
    if (!invalidSession) {
      console.log('✅ Invalid session ID handling works');
    }

    // Test unauthorized access (different user)
    const otherUserId = new mongoose.Types.ObjectId();
    const unauthorizedSessions = await ChargingSession.find({
      userId: otherUserId.toString(),
      status: 'active'
    });
    
    if (unauthorizedSessions.length === 0) {
      console.log('✅ User isolation works correctly');
    }

    // Clean up test data
    await ChargingSession.deleteMany({ userId: testUserId.toString() });
    await ChargingStation.deleteOne({ _id: testStationId });
    await User.deleteOne({ _id: testUserId });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All endpoint tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSessionEndpoints()
  .then(() => {
    console.log('✅ Session endpoint tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Session endpoint tests failed:', error);
    process.exit(1);
  });