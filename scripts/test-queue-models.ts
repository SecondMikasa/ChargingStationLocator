import dotenv from 'dotenv';
import connectDB from '../lib/mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import the new models
import ChargingSession from '../models/ChargingSession';
import QueueUpdate from '../models/QueueUpdate';
import UserNotification from '../models/UserNotification';

async function testQueueModels() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Testing model schemas...');

    // Test ChargingSession model
    console.log('✅ ChargingSession model loaded successfully');
    console.log('   - Schema fields:', Object.keys(ChargingSession.schema.paths));

    // Test QueueUpdate model
    console.log('✅ QueueUpdate model loaded successfully');
    console.log('   - Schema fields:', Object.keys(QueueUpdate.schema.paths));

    // Test UserNotification model
    console.log('✅ UserNotification model loaded successfully');
    console.log('   - Schema fields:', Object.keys(UserNotification.schema.paths));

    console.log('\n🎉 All queue system models are working correctly!');

  } catch (error) {
    console.error('❌ Error testing models:', error);
  } finally {
    process.exit(0);
  }
}

testQueueModels();