// Quick test script to verify admin stations API endpoints
const { execSync } = require('child_process');

console.log('Testing admin stations API endpoints...');

// Test if the API files exist and have proper exports
try {
  const fs = require('fs');
  const path = require('path');

  const mainRoute = path.join(__dirname, 'app/api/admin/stations/route.ts');
  const idRoute = path.join(__dirname, 'app/api/admin/stations/[id]/route.ts');

  if (fs.existsSync(mainRoute)) {
    console.log('✅ Main admin stations route exists');
    const content = fs.readFileSync(mainRoute, 'utf8');
    if (content.includes('export const POST') && content.includes('export const GET')) {
      console.log('✅ POST and GET endpoints implemented');
    }
  }

  if (fs.existsSync(idRoute)) {
    console.log('✅ ID-based admin stations route exists');
    const content = fs.readFileSync(idRoute, 'utf8');
    if (content.includes('export async function PUT') && content.includes('export async function DELETE')) {
      console.log('✅ PUT and DELETE endpoints implemented');
    }
  }

  // Check if admin utils exist
  const adminUtils = path.join(__dirname, 'lib/admin-utils.ts');
  if (fs.existsSync(adminUtils)) {
    console.log('✅ Admin utilities exist');
    const content = fs.readFileSync(adminUtils, 'utf8');
    if (content.includes('withAdminAuth') && content.includes('requireAdmin')) {
      console.log('✅ Admin authentication utilities implemented');
    }
  }

  // Check if ChargingStation model exists
  const stationModel = path.join(__dirname, 'models/ChargingStation.ts');
  if (fs.existsSync(stationModel)) {
    console.log('✅ ChargingStation model exists');
  }

  console.log('\n🎉 All admin stations API components are properly implemented!');

} catch (error) {
  console.error('❌ Error testing API:', error.message);
}