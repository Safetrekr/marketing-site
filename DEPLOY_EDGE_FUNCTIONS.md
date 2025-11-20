# Deploy Marketing Site Edge Functions

## Issue
The Stripe checkout isn't working because the edge functions need to be deployed to Supabase with the proper environment variables.

## Prerequisites

✅ **Supabase CLI is now installed!**

Now you need to:

### 1. Login to Supabase

Run this command in your terminal (it will open a browser):

```bash
supabase login
```

This will open your browser to authenticate with Supabase.

### 2. Link Your Project

```bash
cd /Users/jessetms/Sites/Safetrekr/marketing-site
supabase link --project-ref olgjdqguafidgrutubih
```

## Step 1: Set Edge Function Secrets

These environment variables need to be set in Supabase for the edge functions to work:

```bash
# Set Stripe Secret Key
supabase secrets set STRIPE_SECRET_KEY=sk_test_51SNa4HPih7iRZkzn34vZOIQB8DAee0AAskBAtmpsRZlloDK4JZloIWKJalKZOgHtRPkgbPAjWN0GN9f5dHMFGsi400aSz7CZk7

# Set Stripe Price IDs
supabase secrets set STRIPE_PRICE_T1=price_1SNaTMPih7iRZkzn6O2fIyak
supabase secrets set STRIPE_PRICE_T2=price_1SNaTMPih7iRZkznG5h21SKV
supabase secrets set STRIPE_PRICE_T3=price_1SNaTMPih7iRZkzn7AqXz0Yq

# Set Supabase credentials (these are already in the .env but edge functions need them)
supabase secrets set SUPABASE_URL=https://olgjdqguafidgrutubih.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2pkcWd1YWZpZGdydXR1YmloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYxNjg0OCwiZXhwIjoyMDc2MTkyODQ4fQ.pEG6FlXqOVVYcT1VYocEpqkp2S8m23VJUcAzQFXCyD0
```

## Step 2: Deploy Edge Functions

Deploy all three edge functions:

```bash
cd /Users/jessetms/Sites/Safetrekr/marketing-site

# Deploy create-checkout-session (for Order Now)
supabase functions deploy create-checkout-session

# Deploy create-invoice (for Request Invoice / Request Quote)
supabase functions deploy create-invoice

# Deploy marketing-stripe-webhook (for handling Stripe events)
supabase functions deploy marketing-stripe-webhook
```

## Step 3: Verify Deployment

Check that functions are deployed:

```bash
supabase functions list
```

## Step 4: Test the Checkout Flow

1. Go to http://localhost:5173/request-quote.html
2. Fill out the quote form
3. Select "Order Now" payment mode
4. Click "Checkout Now"
5. You should be redirected to Stripe Checkout page

## Troubleshooting

### If checkout still doesn't work:

1. **Check browser console** for errors
2. **Check edge function logs**:
   ```bash
   supabase functions logs create-checkout-session
   ```
3. **Verify secrets are set**:
   ```bash
   supabase secrets list
   ```

### Common Issues:

- **"Failed to create checkout session"**: Edge function secrets not set
- **"Invalid tier code"**: Price IDs not set correctly
- **"No checkout URL"**: Stripe API error - check secret key

## Testing with Stripe Test Cards

Use these test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any 3-digit CVC

## What Was Fixed

1. ✅ Button text now says "Checkout Now" for Order Now mode
2. ✅ Added pricing calculation before form submission
3. ✅ Better error logging for debugging
4. ⏳ Edge functions need to be deployed with secrets (this document)
