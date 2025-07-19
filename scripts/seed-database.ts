import dotenv from 'dotenv';
import connectDB from '../lib/mongodb';

// Load environment variables
dotenv.config({ path: '.env.local' });
import User from '../models/User';
import UserDevice from '../models/UserDevice';
import ChargingStation from '../models/ChargingStation';
import BatteryVoltage from '../models/BatteryVoltage';
import { hashPassword } from '../lib/auth-utils';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await UserDevice.deleteMany({});
    await ChargingStation.deleteMany({});
    await BatteryVoltage.deleteMany({});

    // Create users
    console.log('Creating users...');
    const hashedPassword = await hashPassword('password123');
    
    const users = await User.insertMany([
      {
        email: 'john@example.com',
        name: 'John Doe',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: hashedPassword,
        role: 'user',
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'admin',
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create user devices
    console.log('Creating user devices...');
    const devices = await UserDevice.insertMany([
      {
        userId: users[0]._id,
        vehicleId: 'ESP32-001',
        deviceName: 'My Tesla Model 3',
        isActive: true,
        registeredAt: new Date('2024-01-15')
      },
      {
        userId: users[1]._id,
        vehicleId: 'ESP32-002',
        deviceName: 'My Nissan Leaf',
        isActive: true,
        registeredAt: new Date('2024-01-20')
      }
    ]);

    console.log(`Created ${devices.length} devices`);

    // Create charging stations
    console.log('Creating charging stations...');
    const stations = await ChargingStation.insertMany([
      {
        name: 'GreenVolt Charger',
        latitude: 28.6139,
        longitude: 77.2090,
        pricePerKwh: 6.5,
        queueLength: 2,
        amenities: ['WiFi', 'Restroom', 'Cafe'],
        operatingHours: { open: '06:00', close: '22:00' }
      },
      {
        name: 'PowerHub Station',
        latitude: 28.7041,
        longitude: 77.1025,
        pricePerKwh: 7.2,
        queueLength: 0,
        amenities: ['WiFi', 'Parking'],
        operatingHours: { open: '24/7', close: '24/7' }
      },
      {
        name: 'EcoCharge Point',
        latitude: 28.5355,
        longitude: 77.3910,
        pricePerKwh: 5.8,
        queueLength: 1,
        amenities: ['Restroom', 'Vending Machine'],
        operatingHours: { open: '05:00', close: '23:00' }
      },
      {
        name: 'FastCharge Express',
        latitude: 28.6692,
        longitude: 77.4538,
        pricePerKwh: 8.1,
        queueLength: 3,
        amenities: ['WiFi', 'Cafe', 'ATM'],
        operatingHours: { open: '06:00', close: '22:00' }
      }
    ]);

    console.log(`Created ${stations.length} charging stations`);

    // Create battery voltage readings
    console.log('Creating battery voltage readings...');
    const voltageReadings = await BatteryVoltage.insertMany([
      {
        voltage: 52.4,
        percentage: 85,
        timestamp: new Date(),
        status: 'normal',
        vehicleId: 'ESP32-001',
        userId: users[0]._id,
        deviceId: devices[0]._id
      },
      {
        voltage: 51.8,
        percentage: 80,
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'normal',
        vehicleId: 'ESP32-001',
        userId: users[0]._id,
        deviceId: devices[0]._id
      },
      {
        voltage: 47.2,
        percentage: 25,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        status: 'low',
        vehicleId: 'ESP32-001',
        userId: users[0]._id,
        deviceId: devices[0]._id
      },
      {
        voltage: 53.1,
        percentage: 90,
        timestamp: new Date(),
        status: 'normal',
        vehicleId: 'ESP32-002',
        userId: users[1]._id,
        deviceId: devices[1]._id
      }
    ]);

    console.log(`Created ${voltageReadings.length} voltage readings`);

    console.log('Database seeding completed successfully!');
    console.log('\nTest accounts:');
    console.log('- john@example.com / password123 (user)');
    console.log('- jane@example.com / password123 (user)');
    console.log('- admin@example.com / password123 (admin)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();