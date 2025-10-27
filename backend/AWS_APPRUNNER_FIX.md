# AWS App Runner Deployment Fix Guide

## 🔧 Fixes Applied for App Runner Deployment

Your deployment is failing because AWS App Runner's health checks aren't passing. Here are the fixes I've implemented:

### 1. Enhanced Health Check Endpoints
The server now responds to multiple health check paths that AWS might use:
- `/` - Root endpoint (200 OK with service info)
- `/health` - Main health check endpoint (returns JSON status)
- `/healthz` - Kubernetes-style health check (returns "OK")
- `/_health` - Alternative health check format
- `/ping` - AWS-specific ping/pong endpoint

### 2. Improved Server Configuration
- Server explicitly binds to `0.0.0.0:3001` (not just localhost)
- Added graceful shutdown handling for SIGTERM/SIGINT signals
- Health checks return proper HTTP 200 status codes
- All responses include appropriate headers

### 3. Docker Configuration Options

#### Option A: Use the simplified App Runner Dockerfile
```bash
# Build with the App Runner specific Dockerfile
docker build -f Dockerfile.apprunner -t your-app .
```

#### Option B: Use the standard Dockerfile
The main Dockerfile now includes curl for health checks and proper user permissions.

### 4. App Runner Configuration (apprunner.yaml)
Created an App Runner configuration file that specifies:
- Port 3001
- Node.js runtime
- Production environment variables

## 🚀 Deployment Steps

### For AWS App Runner:

1. **Push to ECR (Elastic Container Registry)**:
```bash
# Build the image
docker build -f Dockerfile.apprunner -t ai-lead-backend .

# Tag for ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
docker tag ai-lead-backend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/ai-lead-backend:latest

# Push to ECR
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/ai-lead-backend:latest
```

2. **Configure App Runner Service**:
   - Set Port to `3001`
   - Configure health check path to `/health`
   - Set environment variables:
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=your-secure-secret-here
     ALLOWED_ORIGINS=https://your-frontend-domain.com
     ```

3. **Health Check Configuration**:
   - Path: `/health`
   - Protocol: HTTP
   - Interval: 10 seconds
   - Timeout: 5 seconds
   - Healthy threshold: 1
   - Unhealthy threshold: 3

### Alternative: Use Source Code Deployment

If container deployment continues to fail, use source code deployment:

1. Connect your GitHub repository to App Runner
2. Use the `apprunner.yaml` configuration file
3. App Runner will build and deploy automatically

## 🔍 Debugging Tips

### Check if the service is actually running:
1. Look at the App Runner logs for startup messages
2. Check for any crash errors immediately after startup
3. Verify environment variables are set correctly

### Common Issues and Solutions:

**Issue**: Health checks timing out
**Solution**: The server now starts faster and responds immediately to health checks

**Issue**: Port mismatch
**Solution**: Server explicitly listens on PORT environment variable or 3001

**Issue**: CORS errors
**Solution**: Configure ALLOWED_ORIGINS environment variable with your frontend URL

**Issue**: Container crashes immediately
**Solution**: Use the simplified Dockerfile.apprunner which has fewer layers

## 📝 Testing Locally Before Deployment

```bash
# Build and run locally to verify
docker build -f Dockerfile.apprunner -t test-app .
docker run -p 3001:3001 -e NODE_ENV=production test-app

# Test health endpoint
curl http://localhost:3001/health
```

## 🎯 Expected Result

After applying these fixes and redeploying:
1. Health checks should pass within 30 seconds
2. The service should show as "Running" in App Runner console
3. You should be able to access:
   - `https://your-app-url.awsapprunner.com/health`
   - `https://your-app-url.awsapprunner.com/api/status`

## 💡 If Deployment Still Fails

Try these additional steps:
1. Increase health check start period to 20 seconds
2. Increase memory allocation to 1 GB
3. Check AWS App Runner service logs for specific error messages
4. Ensure your AWS IAM role has proper permissions
5. Try deploying without the health check first, then add it after confirming the service runs