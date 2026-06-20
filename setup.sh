#!/bin/bash
# Quick Setup Script for Expense Tracker

echo "=========================================="
echo "Expense Tracker - Quick Setup"
echo "=========================================="
echo ""

# Check PHP
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed. Please install PHP 7.4 or higher."
    exit 1
fi

echo "✅ PHP installed: $(php -v | head -n 1)"

# Check Composer
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer."
    echo "Visit: https://getcomposer.org/download/"
    exit 1
fi

echo "✅ Composer installed"

# Install dependencies
echo ""
echo "📦 Installing PHP dependencies..."
composer install

# Create .env file
echo ""
echo "📝 Setting up environment variables..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env and add your Supabase credentials:"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_KEY"
    echo "   - SUPABASE_JWT_SECRET"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env with your Supabase credentials"
echo "2. Set up database schema (see DATABASE_SCHEMA.md)"
echo "3. Configure CORS in Supabase (Settings → API → CORS)"
echo "4. Start development server:"
echo "   cd public && php -S localhost:8000"
echo ""
echo "Then visit: http://localhost:8000"
