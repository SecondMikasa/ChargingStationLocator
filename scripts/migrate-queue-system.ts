import dotenv from 'dotenv';
import connectDB from '../lib/mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Import the new models to ensure indexes are created
import ChargingSession from '../models/ChargingSession';
import QueueUpdate from '../models/QueueUpdate';
import UserNotification from '../models/UserNotification';

async function migrateQueueSystem() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Creating indexes for queue completion system...');

    // Ensure indexes are created for ChargingSession
    console.log('Creating ChargingSession indexes...');
    await ChargingSession.createIndexes();

    // Ensure indexes are created for QueueUpdate
    console.log('Creating QueueUpdate indexes...');
    await QueueUpdate.createIndexes();

    // Ensure indexes are created for UserNotification
    console.log('Creating UserNotification indexes...');
    await UserNotification.createIndexes();

    console.log('Queue system migration completed successfully!');
    console.log('\nCreated indexes for:');
    console.log('- ChargingSession: userId+status, stationId+status, stationId+queuePosition, status+joinedAt');
    console.log('- QueueUpdate: stationId+timestamp, updatedBy+timestamp, reason+timestamp, timestamp');
    console.log('- UserNotification: userId+read+createdAt, sessionId+createdAt, userId+type, createdAt');

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    process.exit(0);
  }
}

migrateQueueSystem();