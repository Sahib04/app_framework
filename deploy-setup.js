const { sequelize } = require('./server/models');
require('dotenv').config();

async function setupDatabase() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');
    
    console.log('🔍 Syncing database models...');
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synced successfully');
    
    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.log('💡 Set it like: DATABASE_URL=postgres://username:password@host:port/database node deploy-setup.js');
  process.exit(1);
}

setupDatabase();
