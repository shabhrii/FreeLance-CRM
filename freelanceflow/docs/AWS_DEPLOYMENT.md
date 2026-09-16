# FreelanceFlow CRM — AWS Cloud Deployment Guide

This guide outlines the production deployment architecture for **FreelanceFlow CRM** on Amazon Web Services (AWS).

---

## 1. High-Level AWS Architecture

```
                       [ Route 53 (DNS) ]
                                |
             +------------------+------------------+
             |                                     |
    [ AWS CloudFront CDN ]                 [ Application Load Balancer ]
             |                                     |
    [ S3 Bucket (Vite SPA) ]               [ AWS ECS Fargate / App Runner ]
                                                   |
                                       [ Express API (Node 20 Container) ]
                                                   |
                             +---------------------+---------------------+
                             |                                           |
                   [ AWS RDS PostgreSQL ]                    [ External Services ]
                   (Migrated from SQLite)                     • Groq LPU API
                                                             • Resend Email API
                                                             • Supabase Auth
```

---

## 2. Containerization & Artifacts Provided

FreelanceFlow includes production-grade container specifications out of the box:
- **`backend/Dockerfile`**: Multi-stage Node 20 alpine image with automated Prisma client generation, TypeScript build, and non-root execution.
- **`frontend/Dockerfile`**: Multi-stage Vite build served via an optimized Nginx alpine container.
- **`frontend/nginx.conf`**: Gzip compression, immutable asset caching, security headers, and Single Page Application (SPA) client-side routing fallback.
- **`docker-compose.yml`**: Full local and cloud-orchestrated multi-container stack.

---

## 3. Database Migration: SQLite to AWS RDS (PostgreSQL)

For local development and rapid evaluation, FreelanceFlow uses SQLite (`database/prisma/dev.db`). When porting to AWS RDS:

### Step 1: Provision an Amazon RDS PostgreSQL Instance
- Engine: PostgreSQL (v15 or v16)
- DB instance class: `db.t4g.micro` (AWS Free Tier eligible)
- Enable automated backups and assign to your private VPC subnets.

### Step 2: Update `schema.prisma`
In `database/prisma/schema.prisma`, update the datasource provider:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 3: Run Database Migrations
Set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL="postgresql://<USER>:<PASSWORD>@<RDS_ENDPOINT>:5432/<DB_NAME>?sslmode=require"
cd backend
npx prisma db push
```

---

## 4. Backend Deployment Options

### Option A: AWS App Runner (Recommended for Speed & Low Maintenance)
AWS App Runner provides fully managed container execution with automatic scaling and built-in TLS.

1. **Push Container to Amazon ECR**:
   ```bash
   aws ecr create-repository --repository-name freelanceflow-backend
   aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
   docker build -t freelanceflow-backend -f backend/Dockerfile .
   docker tag freelanceflow-backend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/freelanceflow-backend:latest
   docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/freelanceflow-backend:latest
   ```
2. **Create App Runner Service**:
   - Source: Amazon ECR
   - Port: `5000`
   - Configure Environment Variables:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
     - `DATABASE_URL`: `postgresql://...`
     - `GROQ_API_KEY`: Secrets Manager reference
     - `RESEND_API_KEY`: Secrets Manager reference
     - `SUPABASE_URL` & `SUPABASE_ANON_KEY`

### Option B: Amazon ECS (Fargate)
For enterprise clusters with custom VPC configurations:
1. Create an ECS Cluster with the **FARGATE** launch type.
2. Define a Task Definition allocating `0.5 vCPU` and `1 GB RAM`.
3. Configure the container mapping port `5000`.
4. Attach an **Application Load Balancer (ALB)** with target group health check at `/health`.

---

## 5. Frontend Deployment Options

### Option A: Amazon S3 + CloudFront (Recommended Serverless Edge Hosting)
1. **Build Static Assets**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://<YOUR_BUCKET_NAME> --delete
   ```
3. **Configure CloudFront Distribution**:
   - Origin: S3 Bucket
   - Default Root Object: `index.html`
   - Custom Error Response: HTTP `403` / `404` -> `/index.html` (HTTP 200) to support React Router SPA client-side routes.
   - Enforce HTTPS redirection.

### Option B: ECS / App Runner Nginx Container
If containerized frontend delivery is preferred, deploy `frontend/Dockerfile` directly using the provided `nginx.conf`.

---

## 6. Environment Variables Checklist

| Variable Name | Environment | Description |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string with SSL |
| `GROQ_API_KEY` | Backend | Groq AI key for proposal & health scoring |
| `GROQ_MODEL` | Backend | `openai/gpt-oss-20b` |
| `RESEND_API_KEY` | Backend | Resend transactional email API key |
| `SUPABASE_URL` | Both | Supabase project URL |
| `SUPABASE_ANON_KEY` | Both | Supabase client anon public key |
| `VITE_API_URL` | Frontend | Public URL pointing to the Backend ALB / App Runner |

---

## 7. Security Best Practices on AWS
- Store sensitive API keys (`GROQ_API_KEY`, `RESEND_API_KEY`, database credentials) in **AWS Secrets Manager** or **AWS Systems Manager Parameter Store**.
- Use AWS IAM execution roles with least privilege for ECS Task Execution.
- Keep the RDS database inside private VPC subnets with Security Group rules restricted solely to the backend container's security group.
