# Digital Umroh - SaaS Travel Umrah-Haji Platform

A comprehensive multi-tenant SaaS platform for managing Umrah and Hajj pilgrimage operations, built with modern technology stack and enterprise-grade features.

## 🚀 Architecture Overview

This platform implements a complete multi-tenant architecture following the PRD specifications:

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS, PWA
- **Backend**: NestJS with Prisma ORM, PostgreSQL, Redis
- **Worker**: NestJS microservice with BullMQ for background jobs
- **Infrastructure**: Docker Compose, Nginx, Cloudflare R2
- **Communication**: WhatsApp (WAHA), Email, SMS
- **Payments**: Xendit, Midtrans integration

## 🏗️ Project Structure

```
digital-umroh/
├── apps/
│   ├── web/           # Next.js frontend
│   ├── api/           # NestJS API backend
│   └── worker/        # NestJS worker for background jobs
├── packages/
│   ├── ui/            # Shared UI components
│   ├── schemas/       # Shared Zod schemas & types
│   └── config/        # Shared ESLint, Prettier, TSConfig
├── infra/
│   ├── docker/        # Docker configurations & compose
│   └── db/            # Database migrations & seeds
└── .github/workflows/ # CI/CD pipelines
```

## 🌟 Key Features

### Multi-Tenant Architecture
- **Row Level Security (RLS)** for complete data isolation
- **Tenant resolution** via subdomain or header
- **Resource limits** per tenant (users, storage, API calls)
- **White-label customization** per tenant

### Core Business Modules
- **Package Management**: Umrah/Haji packages with pricing, quotas, hotels, flights
- **Booking System**: Complete booking lifecycle with payment tracking
- **Customer & Pilgrim Management**: Profile management with document tracking
- **Financial System**: Invoices, multi-gateway payments, reconciliation
- **Notifications**: Multi-channel (WhatsApp, Email, SMS) with templates

### Advanced Features
- **Real-time updates** via WebSocket
- **Document management** with Cloudflare R2 storage
- **Automated room assignment** algorithms
- **Report generation** (CSV, XLSX, PDF)
- **Audit logging** for compliance
- **Role-based access control** (RBAC)

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** + shadcn/ui for styling
- **React Query** for data fetching
- **Zustand** for state management
- **NextAuth** for authentication
- **React Hook Form** + Zod for forms

### Backend
- **NestJS** with TypeScript
- **Prisma ORM** with PostgreSQL
- **Redis** for caching and queues
- **BullMQ** for background jobs
- **JWT** for authentication
- **Winston** for logging
- **Swagger** for API documentation

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **PostgreSQL** with RLS
- **Cloudflare R2** for file storage
- **WAHA** for WhatsApp integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital-umroh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp infra/docker/.env.example infra/docker/.env
   # Edit .env with your configuration
   ```

4. **Start development environment**
   ```bash
   # Start database and Redis
   docker-compose -f infra/docker/docker-compose.yml up -d postgres redis

   # Setup database
   cd apps/api
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed

   # Start development servers
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:3001/api/v1/docs
   - Database Admin: http://localhost:8080 (PgAdmin)
   - Redis Commander: http://localhost:8081

### Production Deployment

1. **Configure production environment**
   ```bash
   cp infra/docker/.env.example infra/docker/.env
   # Update with production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose -f infra/docker/docker-compose.yml up -d
   ```

3. **Setup SSL certificates**
   ```bash
   # Add SSL certificates to infra/docker/nginx/ssl/
   # Uncomment SSL configuration in nginx.conf
   ```

## 📊 Database Schema

The platform uses PostgreSQL with **Row Level Security (RLS)** for multi-tenant data isolation:

### Core Entities
- **Tenants**: Multi-tenant configuration and limits
- **Users**: User management with RBAC
- **Packages**: Umrah/Haji packages with pricing
- **Customers**: Customer information management
- **Bookings**: Booking lifecycle management
- **Pilgrims**: Pilgrim data and document tracking
- **Invoices**: Financial invoicing system
- **Payments**: Multi-gateway payment processing
- **Notifications**: Multi-channel notifications

### Security Features
- **RLS policies** for tenant isolation
- **Audit logging** for all data changes
- **Role-based access control**
- **Rate limiting** per tenant
- **API key authentication**

## 🔧 API Documentation

### Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <jwt-token>
X-Tenant-Id: <tenant-slug>
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user

#### Packages
- `GET /api/v1/packages` - List packages
- `POST /api/v1/packages` - Create package
- `GET /api/v1/packages/:id` - Get package details
- `PATCH /api/v1/packages/:id` - Update package

#### Bookings
- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking details
- `PATCH /api/v1/bookings/:id` - Update booking

#### Payments
- `POST /api/v1/payments/process` - Process payment
- `POST /api/v1/webhooks/xendit` - Xendit webhook
- `POST /api/v1/webhooks/midtrans` - Midtrans webhook

For complete API documentation, visit `/api/v1/docs` when running the application.

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:e2e

# API tests
cd apps/api && npm test

# Frontend tests
cd apps/web && npm test

# E2E tests with Playwright
cd apps/web && npx playwright test
```

### Test Coverage
- **Unit tests**: Core business logic
- **Integration tests**: API endpoints
- **E2E tests**: Complete user flows
- **Security tests**: Authentication & authorization

## 📈 Monitoring & Observability

### Health Checks
- `GET /api/v1/health` - API health status
- Database connection checks
- Redis connection checks
- External service monitoring

### Logging
- Structured JSON logging
- Request correlation IDs
- Performance metrics
- Error tracking

### Metrics
- API response times
- Database query performance
- Queue processing times
- Resource usage per tenant

## 🔒 Security

### Multi-Tenant Isolation
- **Row Level Security (RLS)** enforced at database level
- **Tenant context** validation on all requests
- **Data leakage prevention** through strict policies

### Authentication & Authorization
- **JWT tokens** with expiration
- **Role-based access control (RBAC)**
- **API rate limiting** per tenant
- **CORS** configuration

### Data Protection
- **Encryption at rest** (PostgreSQL, R2)
- **Encryption in transit** (HTTPS)
- **PII data handling** compliance
- **Regular security scans**

## 🚀 CI/CD Pipeline

### Automated Workflows
- **Code quality checks**: ESLint, Prettier, TypeScript
- **Security scanning**: npm audit, vulnerability scanning
- **Automated testing**: Unit, integration, E2E tests
- **Docker image building**: Multi-stage builds
- **Automated deployment**: Staging and production environments

### Deployment Strategy
- **Blue-green deployment** for zero downtime
- **Health checks** during deployment
- **Rollback capabilities**
- **Database migration management**

## 📞 Support

### Documentation
- **API Documentation**: `/api/v1/docs`
- **Developer Guide**: See `/docs` directory
- **Architecture Decisions**: ADR documents in `/docs/adr`

### Troubleshooting
- Check logs in `docker-compose logs <service>`
- Verify environment variables
- Check database connectivity
- Review API documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow code review process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built following the comprehensive PRD specifications
- Uses modern best practices for SaaS applications
- Implements enterprise-grade security and scalability
- Designed for multi-tenant B2B SaaS deployment

---

**Digital Umroh** - Empowering pilgrimage management with technology 🕋