import { User, UserDevice, AdminUser } from '@/types/auth';
import { BatteryVoltage } from '@/types/battery';
import { ChargingStation } from '@/types/station';

// Mock database structure
export interface MockDatabase {
  users: User[];
  userDevices: UserDevice[];
  stations: ChargingStation[];
  voltageReadings: BatteryVoltage[];
  adminUsers: AdminUser[];
}

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO', // hashed 'password123'
    role: 'user',
    createdAt: new Date('2024-01-01'),
    devices: []
  },
  {
    id: 'user-2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO', // hashed 'password123'
    role: 'user',
    createdAt: new Date('2024-01-15'),
    devices: []
  }
];

// Mock user devices
export const mockUserDevices: UserDevice[] = [
  {
    id: 'device-1',
    userId: 'user-1',
    vehicleId: 'ESP32-001',
    deviceName: 'My Tesla Model 3',
    isActive: true,
    registeredAt: new Date('2024-01-15')
  },
  {
    id: 'device-2',
    userId: 'user-2',
    vehicleId: 'ESP32-002',
    deviceName: 'My Nissan Leaf',
    isActive: true,
    registeredAt: new Date('2024-01-20')
  }
];

// Mock voltage readings
export const mockVoltageReadings: BatteryVoltage[] = [
  {
    id: 'reading-1',
    voltage: 52.4,
    percentage: 85,
    timestamp: new Date(),
    status: 'normal',
    vehicleId: 'ESP32-001',
    userId: 'user-1',
    deviceId: 'device-1'
  },
  {
    id: 'reading-2',
    voltage: 51.8,
    percentage: 80,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    status: 'normal',
    vehicleId: 'ESP32-001',
    userId: 'user-1',
    deviceId: 'device-1'
  },
  {
    id: 'reading-3',
    voltage: 47.2,
    percentage: 25,
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    status: 'low',
    vehicleId: 'ESP32-001',
    userId: 'user-1',
    deviceId: 'device-1'
  },
  {
    id: 'reading-4',
    voltage: 53.1,
    percentage: 90,
    timestamp: new Date(),
    status: 'normal',
    vehicleId: 'ESP32-002',
    userId: 'user-2',
    deviceId: 'device-2'
  }
];

// Mock charging stations
export const mockStations: ChargingStation[] = [
  {
    id: '1',
    name: 'GreenVolt Charger',
    latitude: 28.6139,
    longitude: 77.2090,
    pricePerKwh: 6.5,
    queueLength: 2,
    amenities: ['WiFi', 'Restroom', 'Cafe'],
    operatingHours: { open: '06:00', close: '22:00' }
  },
  {
    id: '2',
    name: 'PowerHub Station',
    latitude: 28.7041,
    longitude: 77.1025,
    pricePerKwh: 7.2,
    queueLength: 0,
    amenities: ['WiFi', 'Parking'],
    operatingHours: { open: '24/7', close: '24/7' }
  },
  {
    id: '3',
    name: 'EcoCharge Point',
    latitude: 28.5355,
    longitude: 77.3910,
    pricePerKwh: 5.8,
    queueLength: 1,
    amenities: ['Restroom', 'Vending Machine'],
    operatingHours: { open: '05:00', close: '23:00' }
  },
  {
    id: '4',
    name: 'FastCharge Express',
    latitude: 28.6692,
    longitude: 77.4538,
    pricePerKwh: 8.1,
    queueLength: 3,
    amenities: ['WiFi', 'Cafe', 'ATM'],
    operatingHours: { open: '06:00', close: '22:00' }
  }
];

// Mock admin users
export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    role: 'admin'
  }
];

// Mock database instance
export const mockDatabase: MockDatabase = {
  users: mockUsers,
  userDevices: mockUserDevices,
  stations: mockStations,
  voltageReadings: mockVoltageReadings,
  adminUsers: mockAdminUsers
};

// Helper functions for data relationships
export function getUserDevices(userId: string): UserDevice[] {
  return mockUserDevices.filter(device => device.userId === userId);
}

export function getVoltageReadingsForDevice(deviceId: string, limit?: number): BatteryVoltage[] {
  const readings = mockVoltageReadings
    .filter(reading => reading.deviceId === deviceId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  return limit ? readings.slice(0, limit) : readings;
}

export function getLatestVoltageReading(deviceId: string): BatteryVoltage | null {
  const readings = getVoltageReadingsForDevice(deviceId, 1);
  return readings.length > 0 ? readings[0] : null;
}

export function getUserByEmail(email: string): User | null {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getUserById(id: string): User | null {
  return mockUsers.find(user => user.id === id) || null;
}

export function getDeviceByVehicleId(vehicleId: string): UserDevice | null {
  return mockUserDevices.find(device => device.vehicleId === vehicleId) || null;
}

export function addUser(user: User): void {
  mockUsers.push(user);
}

export function addUserDevice(device: UserDevice): void {
  mockUserDevices.push(device);
}

export function addVoltageReading(reading: BatteryVoltage): void {
  mockVoltageReadings.push(reading);
}

export function addStation(station: ChargingStation): void {
  mockStations.push(station);
}

export function updateStation(id: string, updates: Partial<ChargingStation>): boolean {
  const index = mockStations.findIndex(station => station.id === id);
  if (index !== -1) {
    mockStations[index] = { ...mockStations[index], ...updates };
    return true;
  }
  return false;
}

export function deleteStation(id: string): boolean {
  const index = mockStations.findIndex(station => station.id === id);
  if (index !== -1) {
    mockStations.splice(index, 1);
    return true;
  }
  return false;
}