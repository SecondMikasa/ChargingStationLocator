# MongoDB Database Setup

This guide will help you set up MongoDB for the EV Battery Monitoring System.

## Option 1: Local MongoDB Installation

### Install MongoDB Community Edition

#### Windows:
1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will start automatically as a Windows service
4. Default connection string: `mongodb://localhost:27017`

#### macOS (using Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Debian:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

## Option 2: MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Whitelist your IP address
6. Get your connection string

## Environment Configuration

1. Copy the connection string to your `.env.local` file:

### For Local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/ev-battery-monitoring
```

### For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ev-battery-monitoring?retryWrites=true&w=majority
```

Replace `username`, `password`, and `cluster` with your actual values.

## Database Initialization

1. Start your MongoDB service (if using local installation)
2. Run the database seeding script:

```bash
npm run seed
```

This will:
- Create the database collections
- Add sample users, devices, and charging stations
- Set up test data for development

## Test Accounts

After seeding, you can use these test accounts:

- **User Account**: john@example.com / password123
- **User Account**: jane@example.com / password123  
- **Admin Account**: admin@example.com / password123

## Database Schema

The application uses the following collections:

### Users
- `_id`: ObjectId
- `email`: String (unique)
- `name`: String
- `password`: String (hashed)
- `role`: String ('user' | 'admin')
- `createdAt`: Date
- `updatedAt`: Date

### UserDevices
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `vehicleId`: String (unique, ESP32-XXX format)
- `deviceName`: String
- `isActive`: Boolean
- `registeredAt`: Date
- `createdAt`: Date
- `updatedAt`: Date

### BatteryVoltages
- `_id`: ObjectId
- `voltage`: Number
- `percentage`: Number
- `timestamp`: Date
- `status`: String ('normal' | 'low' | 'critical')
- `vehicleId`: String
- `userId`: ObjectId (ref: User)
- `deviceId`: ObjectId (ref: UserDevice)
- `createdAt`: Date
- `updatedAt`: Date

### ChargingStations
- `_id`: ObjectId
- `name`: String
- `latitude`: Number
- `longitude`: Number
- `pricePerKwh`: Number
- `queueLength`: Number
- `amenities`: Array of Strings
- `operatingHours`: Object { open: String, close: String }
- `createdAt`: Date
- `updatedAt`: Date

## Troubleshooting

### Connection Issues
- Ensure MongoDB is running
- Check your connection string in `.env.local`
- Verify network connectivity (for Atlas)
- Check firewall settings

### Permission Issues
- Ensure database user has read/write permissions
- Check IP whitelist settings (for Atlas)

### Seeding Issues
- Ensure MongoDB is running before seeding
- Check console output for specific error messages
- Verify environment variables are set correctly

## Development Commands

```bash
# Start development server
npm run dev

# Seed database with test data
npm run seed

# Build for production
npm run build
```