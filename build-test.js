const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Testing build process...');

try {
  // Test backend build
  console.log('📦 Testing backend dependencies...');
  execSync('cd server && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');

  // Test frontend build
  console.log('📦 Testing frontend build...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');

  console.log('🔨 Building frontend...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build successful');

  console.log('🎉 All builds successful! Ready for deployment.');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
