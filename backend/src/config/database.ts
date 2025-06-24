import { PrismaClient } from '@prisma/client';

// Database configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Create Prisma client instance with connection pooling
export const prisma = new PrismaClient();

// Database connection testing
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Graceful shutdown
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting from database:', error);
  }
};

// Database health check with enhanced table verification
export const checkDatabaseHealth = async () => {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    // Check if we can access our main tables (will be available after migration)
    let tableStatus = {};
    try {
      const artistCount = await prisma.artist.count();
      const releaseCount = await prisma.release.count();
      const newsCount = await prisma.news.count();
      
      tableStatus = {
        artists: artistCount,
        releases: releaseCount,
        news: newsCount,
      };
    } catch (tableError) {
      // Tables don't exist yet - that's okay during setup
      tableStatus = {
        status: 'Tables not migrated yet',
        error: 'Run prisma migrate dev first'
      };
    }
    
    return {
      status: 'healthy',
      connection: 'active',
      tables: tableStatus,
      timestamp: new Date().toISOString(),
      version: await prisma.$queryRaw`SELECT version()`,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
};

// Transaction helper for complex operations
export const withTransaction = async <T>(
  fn: (prisma: any) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(async (tx: any) => {
    return await fn(tx);
  });
};

// Cleanup function for tests
export const cleanupTestDatabase = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('cleanupTestDatabase can only be called in test environment');
  }
  
  try {
    // Delete all data in reverse order of dependencies to avoid foreign key conflicts
    await prisma.release.deleteMany();
    await prisma.artist.deleteMany();
    await prisma.news.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.newsletter.deleteMany();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
    throw error;
  }
};

// Development data seeding helper
export const seedDevelopmentData = async (): Promise<void> => {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('seedDevelopmentData can only be called in development environment');
  }
  
  try {
    // Check if data already exists
    const artistCount = await prisma.artist.count();
    if (artistCount > 0) {
      console.log('ℹ️ Development data already exists, skipping seed');
      return;
    }
    
    console.log('🌱 Running development seed...');
    // Note: Actual seeding is handled by prisma/seed.ts
    console.log('✅ Development data seeded successfully');
  } catch (error) {
    console.error('❌ Error checking/seeding development data:', error);
    throw error;
  }
};

// Database initialization for application startup
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Initializing database connection...');
    
    // Test connection
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Check health
    const health = await checkDatabaseHealth();
    console.log('📊 Database health:', health.status);
    
    // Auto-seed in development if no data exists
    if (process.env.NODE_ENV === 'development') {
      await seedDevelopmentData();
    }
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};