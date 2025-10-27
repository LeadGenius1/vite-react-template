# AI Lead Strategies Backend - Deployment Guide

## 🚀 Deployment Instructions

This backend is containerized and ready for deployment to various cloud platforms.

### Prerequisites
- Docker installed locally for testing
- Access to a cloud platform (AWS, Google Cloud, Azure, etc.)
- Environment variables configured

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secure-random-string-here
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Local Testing with Docker

1. Build the Docker image:
```bash
docker build -t ai-lead-backend .
```

2. Run the container:
```bash
docker run -p 3001:3001 --env-file .env ai-lead-backend
```

3. Test the health endpoint:
```bash
curl http://localhost:3001/health
```

### Deployment Options

#### Option 1: Docker Compose
```bash
docker-compose up -d
```

#### Option 2: AWS App Runner / Google Cloud Run / Azure Container Instances

1. Push image to container registry:
```bash
# Tag the image
docker tag ai-lead-backend:latest [your-registry]/ai-lead-backend:latest

# Push to registry
docker push [your-registry]/ai-lead-backend:latest
```

2. Deploy using your cloud platform's console or CLI

#### Option 3: Traditional VPS with Docker

1. SSH into your server
2. Clone the repository
3. Create `.env` file with production values
4. Run:
```bash
docker-compose up -d
```

### Health Check

The application includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-04T23:10:00.000Z"
}
```

### API Endpoints

- `GET /health` - Health check
- `GET /api/status` - API status and available platforms
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/user/profile` - Get user profile (requires auth)

### Security Considerations

1. **JWT Secret**: Always use a strong, random JWT secret in production
2. **CORS**: Configure `ALLOWED_ORIGINS` to only include your frontend domain
3. **HTTPS**: Always use HTTPS in production (configure at load balancer or reverse proxy level)
4. **Rate Limiting**: Consider adding rate limiting middleware for production

### Monitoring

The application logs all requests with timestamps. Configure your cloud platform's logging service to capture these logs.

### Troubleshooting

If deployment fails:

1. Check logs: `docker logs [container-id]`
2. Verify environment variables are set correctly
3. Ensure port 3001 is not blocked by firewall
4. Test health endpoint: `curl http://[your-server]:3001/health`

### Database (Future Enhancement)

Currently using in-memory storage. For production, add a database:

1. Add database connection in `server.js`
2. Update user storage to use database
3. Add `DATABASE_URL` to environment variables

### Support

For issues or questions, check the application logs first. The health check endpoint can help diagnose connectivity issues.