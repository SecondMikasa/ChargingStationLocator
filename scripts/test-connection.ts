import dotenv from 'dotenv';
import connectDB from '../lib/mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    const connection = await connectDB();
    console.log('✅ Successfully connected to MongoDB!');

    // Safely access connection properties with null checks
    const db = connection.connection.db;
    const host = connection.connection.host;
    const port = connection.connection.port;

    if (db) {
      console.log(`Database: ${db.databaseName}`);
    }
    if (host) {
      console.log(`Host: ${host}`);
    }
    if (port) {
      console.log(`Port: ${port}`);
    }

    console.log(`Connection state: ${connection.connection.readyState}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();