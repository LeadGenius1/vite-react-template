#!/bin/bash

# Script to export all project files from Leap environment
# Run this in your Leap environment to create a downloadable archive

echo "🚀 Starting project export..."

# Create export directory
EXPORT_DIR="project-export-$(date +%Y%m%d-%H%M%S)"
mkdir -p $EXPORT_DIR

echo "📁 Copying project files..."

# Copy backend files
if [ -d "backend" ]; then
    cp -r backend $EXPORT_DIR/
    echo "✓ Backend files copied"
fi

# Copy frontend files
if [ -d "src" ]; then
    cp -r src $EXPORT_DIR/
    echo "✓ Frontend source files copied"
fi

if [ -d "public" ]; then
    cp -r public $EXPORT_DIR/
    echo "✓ Public files copied"
fi

# Copy migrations
if [ -d "migrations" ]; then
    cp -r migrations $EXPORT_DIR/
    echo "✓ Migration files copied"
fi

# Copy configuration files
for file in package.json package-lock.json tsconfig.json vite.config.ts .env.example README.md; do
    if [ -f "$file" ]; then
        cp $file $EXPORT_DIR/
        echo "✓ Copied $file"
    fi
done

# Copy any Encore-specific files
for file in encore.app encore.gen.go; do
    if [ -f "$file" ]; then
        cp $file $EXPORT_DIR/
        echo "✓ Copied Encore file: $file"
    fi
done

echo "📦 Creating archive..."

# Create tarball excluding node_modules and .git
tar -czf project-export.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='*.log' \
    --exclude='.env' \
    --exclude='dist' \
    --exclude='build' \
    $EXPORT_DIR/

# Clean up temporary directory
rm -rf $EXPORT_DIR

echo "✅ Export complete!"
echo "📥 Download file: project-export.tar.gz"
echo ""
echo "Next steps:"
echo "1. Download project-export.tar.gz to your local machine"
echo "2. Extract it in your Git repository folder"
echo "3. Commit and push to GitHub"