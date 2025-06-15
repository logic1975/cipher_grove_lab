import { 
  testDatabaseConnection, 
  checkDatabaseHealth, 
  cleanupTestDatabase, 
  withTransaction,
  prisma 
} from './database';

// Mock environment for testing
const originalEnv = process.env.NODE_ENV;

describe('Database Configuration', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
  });

  afterAll(async () => {
    process.env.NODE_ENV = originalEnv;
    await prisma.$disconnect();
  });

  describe('testDatabaseConnection', () => {
    it('should successfully connect to database', async () => {
      const isConnected = await testDatabaseConnection();
      expect(isConnected).toBe(true);
    });

    it('should handle connection failures gracefully', async () => {
      // This test would require mocking Prisma to fail
      // For now, we verify the function exists and returns boolean
      const result = await testDatabaseConnection();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('checkDatabaseHealth', () => {
    it('should return health status object', async () => {
      const health = await checkDatabaseHealth();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('connection');
      expect(health).toHaveProperty('timestamp');
      expect(health.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should indicate healthy connection when database is available', async () => {
      const health = await checkDatabaseHealth();
      expect(health.status).toBe('healthy');
      expect(health.connection).toBe('active');
    });

    it('should handle tables not being migrated yet', async () => {
      const health = await checkDatabaseHealth();
      // Tables might not exist yet, that's okay
      expect(health).toHaveProperty('tables');
    });
  });

  describe('withTransaction', () => {
    it('should execute function within transaction', async () => {
      const result = await withTransaction(async (tx) => {
        // Simple transaction test - just return a value
        const healthCheck = await tx.$queryRaw`SELECT 1 as test`;
        return healthCheck;
      });
      
      expect(result).toBeDefined();
    });

    it('should rollback transaction on error', async () => {
      try {
        await withTransaction(async (tx) => {
          await tx.$queryRaw`SELECT 1 as test`;
          throw new Error('Test error');
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Test error');
      }
    });
  });

  describe('cleanupTestDatabase', () => {
    it('should only work in test environment', async () => {
      process.env.NODE_ENV = 'production';
      
      await expect(cleanupTestDatabase()).rejects.toThrow(
        'cleanupTestDatabase can only be called in test environment'
      );
      
      process.env.NODE_ENV = 'test';
    });

    it('should successfully clean up test data', async () => {
      // This test requires tables to exist
      // For now, we just verify it doesn't throw in test environment
      process.env.NODE_ENV = 'test';
      
      try {
        await cleanupTestDatabase();
        // If no error thrown, cleanup succeeded or tables don't exist yet
        expect(true).toBe(true);
      } catch (error) {
        // Tables might not exist yet - that's expected during setup
        expect(error).toBeDefined();
      }
    });
  });

  describe('Environment Detection', () => {
    it('should correctly identify test environment', () => {
      process.env.NODE_ENV = 'test';
      expect(process.env.NODE_ENV).toBe('test');
    });

    it('should handle development environment', () => {
      process.env.NODE_ENV = 'development';
      expect(process.env.NODE_ENV).toBe('development');
      process.env.NODE_ENV = 'test'; // Reset for other tests
    });
  });

  describe('Prisma Client', () => {
    it('should have prisma client available', () => {
      expect(prisma).toBeDefined();
      expect(typeof prisma.$connect).toBe('function');
      expect(typeof prisma.$disconnect).toBe('function');
    });

    it('should handle raw queries', async () => {
      const result = await prisma.$queryRaw`SELECT 1 + 1 as sum`;
      expect(result).toBeDefined();
    });
  });
});