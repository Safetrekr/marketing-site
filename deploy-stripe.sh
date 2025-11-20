#!/bin/bash

# =================================================================
# Stripe Deployment Script - Marketing Site
# =================================================================
# This script deploys Edge Functions and sets up Stripe secrets
# Run this AFTER filling in your .env file with Stripe keys
# =================================================================

set -e  # Exit on error

echo "🚀 SafeTrekr Marketing Site - Stripe Deployment"
echo "================================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file and add your Stripe keys"
    echo "See STRIPE_KEYS_GUIDE.md for instructions"
    exit 1
fi

# Load environment variables
source .env

# Check if Stripe keys are set
if [[ $STRIPE_SECRET_KEY == *"PUT YOUR"* ]]; then
    echo "❌ Error: STRIPE_SECRET_KEY not configured in .env"
    echo "Please add your Stripe secret key to .env file"
    exit 1
fi

echo "✅ Environment file loaded"
echo ""

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."
echo ""

echo "  1/3 Deploying create-checkout-session..."
supabase functions deploy create-checkout-session --no-verify-jwt

echo "  2/3 Deploying create-invoice..."
supabase functions deploy create-invoice --no-verify-jwt

echo "  3/3 Deploying marketing-stripe-webhook..."
supabase functions deploy marketing-stripe-webhook --no-verify-jwt

echo ""
echo "✅ Edge Functions deployed"
echo ""

# Set Supabase secrets
echo "🔐 Setting Supabase Edge Function secrets..."
echo ""

supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
supabase secrets set STRIPE_PRICE_T1="$STRIPE_PRICE_T1"
supabase secrets set STRIPE_PRICE_T2="$STRIPE_PRICE_T2"
supabase secrets set STRIPE_PRICE_T3="$STRIPE_PRICE_T3"
supabase secrets set STRIPE_PRICE_BG_DOMESTIC="$STRIPE_PRICE_BG_DOMESTIC"
supabase secrets set STRIPE_PRICE_BG_INTERNATIONAL="$STRIPE_PRICE_BG_INTERNATIONAL"

echo ""
echo "✅ Secrets configured"
echo ""

# Get Supabase project URL
SUPABASE_URL=$(supabase status | grep "API URL" | awk '{print $3}')

echo "================================================"
echo "🎉 Deployment Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Run database migration:"
echo "   psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f supabase/migrations/20251029_add_stripe_to_quotes.sql"
echo ""
echo "2. Set up Stripe webhooks:"
echo "   Go to: https://dashboard.stripe.com/test/webhooks"
echo "   Click 'Add endpoint'"
echo "   Endpoint URL: ${SUPABASE_URL}/functions/v1/marketing-stripe-webhook"
echo "   Select events:"
echo "     - checkout.session.completed"
echo "     - invoice.paid"
echo "     - invoice.payment_failed"
echo "     - payment_intent.succeeded"
echo "     - payment_intent.payment_failed"
echo "     - charge.refunded"
echo "   Copy the webhook signing secret and update STRIPE_WEBHOOK_SECRET in .env"
echo "   Then run this script again to update the secret"
echo ""
echo "3. Test the integration:"
echo "   npm run dev"
echo "   Visit: http://localhost:5173/request-quote.html"
echo ""
