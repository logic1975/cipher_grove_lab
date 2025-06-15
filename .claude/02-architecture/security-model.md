# Security Model

## Security Architecture Overview

### Defense in Depth Strategy
```
Client: CSP, XSS protection, HTTPS, input validation
↓
CDN: DDoS protection, SSL termination, rate limiting
↓  
App: Authentication, authorization, validation, encoding
↓
DB: Connection security, parameterized queries, access controls
```

## Phase 1 Security Implementation

### Frontend Security

#### Frontend Security Implementation
```typescript
// CSP: vite.config.ts with security headers for self, fonts, streaming APIs
// XSS: DOMPurify sanitization with allowed tags (b, i, em, strong, p, br)
// HTTPS: Production enforcement via protocol check and redirect
```

### Backend Security

#### Security Implementation
```typescript
// Helmet: CSP, HSTS, security headers
// CORS: Frontend origin, credentials, standard methods/headers
// Rate limiting: express-rate-limit with IP-based limits
// Input validation: Joi schemas + validator.escape()
// SQL injection: Parameterized queries only
```

#### Input Validation and Sanitization
```typescript
import Joi from 'joi';
import validator from 'validator';

// Validation schemas
const artistSchema = Joi.object({
  name: Joi.string().min(1).max(255).required().pattern(/^[a-zA-Z0-9\s\-\_\.]+$/),
  bio: Joi.string().max(5000).optional(),
  image_url: Joi.string().uri().optional(),
  social_links: Joi.object().pattern(
    Joi.string(), 
    Joi.string().uri()
  ).optional()
});

// Input sanitization middleware
const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  for (const key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = validator.escape(req.body[key]);
    }
  }
  next();
};

// Rate limiting
import rateLimit from 'express-rate-limit';

const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/contact', createAccountLimiter);
```

#### SQL Injection Prevention
```typescript
// Using parameterized queries with pg
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Safe query example
const getArtistById = async (id: number) => {
  const query = 'SELECT * FROM artists WHERE id = $1';
  const values = [id];
  
  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error('Database query failed');
  }
};

// Unsafe example (NEVER DO THIS)
// const unsafeQuery = `SELECT * FROM artists WHERE id = ${id}`;
```

### Database Security

#### Connection Security
```typescript
// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
    ca: process.env.DB_SSL_CERT
  } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

#### Database User Permissions
```sql
-- Create limited database user for application
CREATE USER music_label_app WITH PASSWORD 'secure_password_here';

-- Grant only necessary permissions
GRANT CONNECT ON DATABASE music_label_dev TO music_label_app;
GRANT USAGE ON SCHEMA public TO music_label_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO music_label_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO music_label_app;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM music_label_app;
REVOKE ALL ON pg_user FROM music_label_app;
```

## Security Testing

### Automated Security Testing
```typescript
// Jest security tests
describe('Security Tests', () => {
  describe('XSS Prevention', () => {
    test('should sanitize malicious script tags', async () => {
      const maliciousInput = '<script>alert("xss")</script>Hello';
      const response = await request(app)
        .post('/api/artists')
        .send({ name: maliciousInput })
        .expect(400);
      
      expect(response.body.error).toContain('Invalid input');
    });
  });

  describe('SQL Injection Prevention', () => {
    test('should prevent SQL injection in artist search', async () => {
      const sqlInjection = "'; DROP TABLE artists; --";
      const response = await request(app)
        .get(`/api/artists?search=${encodeURIComponent(sqlInjection)}`)
        .expect(200);
      
      // Should return empty results, not cause error
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce rate limits on contact form', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
        type: 'general'
      };

      // Make 6 requests (limit is 5)
      for (let i = 0; i < 6; i++) {
        const response = await request(app)
          .post('/api/contact')
          .send(contactData);
        
        if (i < 5) {
          expect(response.status).toBe(200);
        } else {
          expect(response.status).toBe(429);
        }
      }
    });
  });
});
```

### Security Checklist

#### Frontend Security Checklist
- [ ] Content Security Policy implemented
- [ ] XSS protection in place
- [ ] HTTPS enforcement
- [ ] Input validation on forms
- [ ] Secure cookie configuration
- [ ] No sensitive data in localStorage
- [ ] Bundle analysis for vulnerabilities

#### Backend Security Checklist
- [ ] HTTP security headers configured
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Error messages don't leak information
- [ ] Dependency vulnerability scanning

#### Database Security Checklist
- [ ] Database user has minimal permissions
- [ ] Connection uses SSL in production
- [ ] Parameterized queries only
- [ ] Regular security updates
- [ ] Backup encryption
- [ ] Access logging enabled

## Incident Response Plan

### Security Incident Classification
1. **Critical**: Data breach, system compromise
2. **High**: Authentication bypass, privilege escalation
3. **Medium**: DoS attack, information disclosure
4. **Low**: Configuration issues, outdated dependencies

### Response Procedures
1. **Detection**: Monitor logs, automated alerts
2. **Assessment**: Determine scope and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat and vulnerabilities
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

### Emergency Contacts
- **Technical Lead**: [Contact Information]
- **Security Team**: [Contact Information]
- **Legal/Compliance**: [Contact Information]

## Compliance and Standards

### Data Protection
- **GDPR Compliance**: User consent, data portability, right to deletion
- **Privacy Policy**: Clear data usage disclosure
- **Cookie Policy**: Consent for non-essential cookies

### Security Standards
- **OWASP Top 10**: Protection against common vulnerabilities
- **ISO 27001**: Information security management
- **SOC 2**: Security, availability, and confidentiality

## Monitoring and Alerting

### Security Monitoring
```typescript
// Security event logging
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

// Log security events
const logSecurityEvent = (event: string, details: any, severity: string) => {
  securityLogger.log(severity, {
    event,
    details,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
};

// Example usage
app.use('/api/contact', (req, res, next) => {
  logSecurityEvent('contact_form_submission', {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    email: req.body.email
  }, 'info');
  next();
});
```

### Automated Alerts
- Failed login attempts (future feature)
- Multiple 404 errors from same IP
- Unusual traffic patterns
- Database connection failures
- High error rates

## Future Security Enhancements (Phase 2+)

### Authentication and Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Multi-factor authentication (MFA)
- OAuth integration

### Advanced Security Features
- Web Application Firewall (WAF)
- DDoS protection
- Advanced threat detection
- Security Information and Event Management (SIEM)
- Penetration testing
- Bug bounty program

### Compliance Enhancements
- PCI DSS compliance (if payment processing added)
- HIPAA compliance (if health data added)
- Regular security audits
- Third-party security assessments