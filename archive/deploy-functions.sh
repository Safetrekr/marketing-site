#!/bin/bash
# Deploy Marketing Site Edge Functions to Supabase
# Run this script after running: supabase login

set -e  # Exit on error

echo "🚀 Deploying Marketing Site Edge Functions to Supabase"
echo ""

# Change to the marketing site directory
cd "$(dirname "$0")"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if user is logged in
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Error: Not logged in to Supabase"
    echo "Please run: supabase login"
    exit 1
fi

echo "✅ Logged in to Supabase"
echo ""

# Link project if not already linked
echo "🔗 Linking project..."
supabase link --project-ref olgjdqguafidgrutubih || echo "Already linked"
echo ""

# Set secrets
echo "🔐 Setting edge function secrets..."

supabase secrets set \
  STRIPE_SECRET_KEY=sk_test_51SNa4HPih7iRZkzn34vZOIQB8DAee0AAskBAtmpsRZlloDK4JZloIWKJalKZOgHtRPkgbPAjWN0GN9f5dHMFGsi400aSz7CZk7 \
  STRIPE_PRICE_T1=price_1SNaTMPih7iRZkzn6O2fIyak \
  STRIPE_PRICE_T2=price_1SNaTMPih7iRZkznG5h21SKV \
  STRIPE_PRICE_T3=price_1SNaTMPih7iRZkzn7AqXz0Yq \
  SUPABASE_URL=https://olgjdqguafidgrutubih.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2pkcWd1YWZpZGdydXR1YmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYxNjg0OCwiZXhwIjoyMDc2MTkyODQ4fQ.pEG6FlXqOVVYcT1VYocEpqkp2S8m23VJUcAzQFXCyD0

echo ""
echo "✅ Secrets set successfully"
echo ""

# Deploy functions
echo "📦 Deploying edge functions..."
echo ""

echo "  1️⃣ Deploying create-checkout-session..."
supabase functions deploy create-checkout-session

echo ""
echo "  2️⃣ Deploying create-invoice..."
supabase functions deploy create-invoice

echo ""
echo "  3️⃣ Deploying marketing-stripe-webhook..."
supabase functions deploy marketing-stripe-webhook

echo ""
echo "✅ All edge functions deployed successfully!"
echo ""
echo "🎉 Stripe checkout is now ready to use!"
echo ""
echo "📝 Next steps:"
echo "  1. Go to http://localhost:5173/request-quote.html"
echo "  2. Fill out the quote form"
echo "  3. Select 'Order Now' payment mode"
echo "  4. Click 'Checkout Now'"
echo "  5. You should be redirected to Stripe Checkout"
echo ""
echo "💳 Test with these Stripe test cards:"
echo "  • Success: 4242 4242 4242 4242"
echo "  • Decline: 4000 0000 0000 0002"
echo ""
