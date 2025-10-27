# Sync Leap Environment to GitHub

## Current Situation
- **GitHub Repository**: https://github.com/LeadGenius1/vite-react-template.git
- **Issue**: The repo contains an old Vite template, not your Encore.ts application
- **Goal**: Replace the GitHub content with your Leap environment code

## Method 1: Manual Download & Push (Recommended for Windows)

### Step 1: Backup Current Repository
```powershell
# Create a backup branch
git checkout -b backup-old-template
git push origin backup-old-template
git checkout main
```

### Step 2: Clear Current Repository Content
```powershell
# Remove all files except .git
Get-ChildItem -Path . -Exclude .git | Remove-Item -Recurse -Force
```

### Step 3: Download Files from Leap
1. In your Leap environment, run:
   ```bash
   # Create a tarball of all files
   tar -czf project-export.tar.gz --exclude=node_modules --exclude=.git *
   ```

2. Download the tarball to your local machine
3. Extract it in your local repository:
   ```powershell
   # Extract the tarball (requires tar on Windows)
   tar -xzf project-export.tar.gz
   ```

### Step 4: Commit and Push
```powershell
# Add all new files
git add .

# Commit the changes
git commit -m "Replace template with Encore.ts application from Leap environment"

# Push to GitHub
git push origin main --force
```

## Method 2: Using Git Remote (If Leap has Git)

### Step 1: In Leap Environment
```bash
# Initialize git if not already done
git init

# Add all files
git add .
git commit -m "Initial Encore.ts application"

# Add your GitHub as remote
git remote add github https://github.com/LeadGenius1/vite-react-template.git

# Force push to replace content
git push github main --force
```

## Method 3: Create New Repository (Cleanest Approach)

### Step 1: Create New GitHub Repository
1. Go to https://github.com/new
2. Name it: `ai-sales-crm-platform`
3. Make it private/public as needed
4. Don't initialize with README

### Step 2: Update Encore Cloud
1. Go to Encore Cloud dashboard
2. Update the Git repository URL to the new repo
3. Update deployment settings

### Step 3: Push Code
```powershell
# Change remote URL
git remote set-url origin https://github.com/LeadGenius1/ai-sales-crm-platform.git

# Push code
git push -u origin main
```

## Important Files to Sync

### Backend Structure (Required for Encore)
```
backend/
├── migrations/
│   ├── 7_fix_workflows.up.sql
│   └── 7_fix_workflows.down.sql
├── package.json
├── server.js
└── ... (other backend files)
```

### Frontend (Optional)
```
src/
├── components/
├── pages/
└── ... (React files)
```

## After Syncing

1. **Verify GitHub**: Check that all files are in the repository
2. **Encore Cloud Settings**: 
   - Ensure "Root Directory" is set to `backend`
   - Verify database migrations path
3. **Trigger Deployment**: Push a small change or manually trigger

## Troubleshooting

### If Deployment Still Fails
1. Check Encore logs for specific errors
2. Verify `backend/` directory exists in GitHub
3. Ensure migrations are in correct format
4. Check database connection settings in Encore Cloud

### Common Issues
- **Missing backend directory**: Make sure to include the entire backend folder
- **Migration errors**: Ensure SQL files are properly formatted
- **Build errors**: Check package.json dependencies

## Need Help?
- Encore Documentation: https://encore.dev/docs
- GitHub Support: https://support.github.com