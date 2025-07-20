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
      // Stations very close to default location (28.6139, 77.2090) - Connaught Place area
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
        name: 'Central Delhi Fast Charge',
        latitude: 28.6289,
        longitude: 77.2065,
        pricePerKwh: 7.2,
        queueLength: 0,
        amenities: ['WiFi', 'Parking'],
        operatingHours: { open: '24/7', close: '24/7' }
      },
      {
        name: 'CP Metro Station Charger',
        latitude: 28.6169,
        longitude: 77.2295,
        pricePerKwh: 5.8,
        queueLength: 1,
        amenities: ['Metro Access', 'WiFi'],
        operatingHours: { open: '05:30', close: '23:30' }
      },
      {
        name: 'India Gate Charging Hub',
        latitude: 28.6129,
        longitude: 77.2295,
        pricePerKwh: 6.8,
        queueLength: 2,
        amenities: ['Restroom', 'Vending Machine', 'Tourist Area'],
        operatingHours: { open: '05:00', close: '23:00' }
      },
      {
        name: 'Khan Market EV Station',
        latitude: 28.5989,
        longitude: 77.2295,
        pricePerKwh: 8.0,
        queueLength: 3,
        amenities: ['WiFi', 'Cafe', 'Restroom', 'Shopping'],
        operatingHours: { open: '06:00', close: '22:00' }
      },
      {
        name: 'Rajiv Gandhi Bhawan Charger',
        latitude: 28.6304,
        longitude: 77.2177,
        pricePerKwh: 7.5,
        queueLength: 1,
        amenities: ['WiFi', 'Parking', 'ATM'],
        operatingHours: { open: '07:00', close: '21:00' }
      },
      {
        name: 'Lodhi Road Power Point',
        latitude: 28.5755,
        longitude: 77.2390,
        pricePerKwh: 9.0,
        queueLength: 0,
        amenities: ['Restroom', 'Food Court', 'Fuel Station'],
        operatingHours: { open: '24/7', close: '24/7' }
      },
      {
        name: 'Green Energy Station',
        latitude: 28.6512,
        longitude: 77.2219,
        pricePerKwh: 6.0,
        queueLength: 1,
        amenities: ['Solar Powered', 'WiFi', 'Parking'],
        operatingHours: { open: '06:00', close: '20:00' }
      },
      // Additional stations in nearby areas
      {
        name: 'PowerHub Station North',
        latitude: 28.7041,
        longitude: 77.1025,
        pricePerKwh: 7.2,
        queueLength: 0,
        amenities: ['WiFi', 'Parking'],
        operatingHours: { open: '24/7', close: '24/7' }
      },
      {
        name: 'EcoCharge Point East',
        latitude: 28.5355,
        longitude: 77.3910,
        pricePerKwh: 5.8,
        queueLength: 1,
        amenities: ['Restroom', 'Vending Machine'],
        operatingHours: { open: '05:00', close: '23:00' }
      },
      {
        name: 'FastCharge Express Gurgaon',
        latitude: 28.4595,
        longitude: 77.0266,
        pricePerKwh: 8.1,
        queueLength: 3,
        amenities: ['WiFi', 'Cafe', 'ATM'],
        operatingHours: { open: '06:00', close: '22:00' }
      },
      {
        name: 'Noida Sector 18 Charger',
        latitude: 28.5706,
        longitude: 77.3272,
        pricePerKwh: 7.8,
        queueLength: 2,
        amenities: ['Mall Access', 'WiFi', 'Food Court'],
        operatingHours: { open: '10:00', close: '22:00' }
      },
      // Charging stations near Jhapa, Nepal (25.7556, 87.4709)
      {
        name: 'Birtamod EV Hub',
        latitude: 25.7456,
        longitude: 87.4609,
        pricePerKwh: 5.5,
        queueLength: 1,
        amenities: ['WiFi', 'Restroom', 'Local Market'],
        operatingHours: { open: '06:00', close: '22:00' }
      },
      {
        name: 'Jhapa Green Charge',
        latitude: 25.7656,
        longitude: 87.4809,
        pricePerKwh: 6.0,
        queueLength: 0,
        amenities: ['Solar Powered', 'WiFi', 'Parking'],
        operatingHours: { open: '05:00', close: '23:00' }
      },
      {
        name: 'Border City Charging',
        latitude: 25.7356,
        longitude: 87.4509,
        pricePerKwh: 6.8,
        queueLength: 2,
        amenities: ['WiFi', 'Cafe', 'Border Crossing'],
        operatingHours: { open: '24/7', close: '24/7' }
      },
      {
        name: 'Mechinagar Power Station',
        latitude: 25.7756,
        longitude: 87.4909,
        pricePerKwh: 7.2,
        queueLength: 1,
        amenities: ['Restroom', 'ATM', 'Shopping'],
        operatingHours: { open: '06:00', close: '21:00' }
      },
      {
        name: 'Nepal-India Transit Charger',
        latitude: 25.7256,
        longitude: 87.4309,
        pricePerKwh: 5.8,
        queueLength: 0,
        amenities: ['WiFi', 'Parking', 'Transit Hub'],
        operatingHours: { open: '05:30', close: '22:30' }
      },
      {
        name: 'Himalayan EV Station',
        latitude: 25.7856,
        longitude: 87.5109,
        pricePerKwh: 6.5,
        queueLength: 1,
        amenities: ['Mountain View', 'WiFi', 'Local Food'],
        operatingHours: { open: '07:00', close: '20:00' }
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