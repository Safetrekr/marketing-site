/**
 * Create Stripe Checkout Session - Marketing Site
 * For "Order Now" payment mode - immediate payment via Stripe Checkout
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuoteData {
  quoteId: string;
  tier: string;
  orgName: string;
  orgType: string;
  email: string;
  tripName: string;
  tierPrice: number;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json() as QuoteData;
    const { quoteId, tier, orgName, orgType, email, tripName, tierPrice, successUrl, cancelUrl } = requestBody;

    console.log('[CreateCheckoutSession] Request received:', JSON.stringify(requestBody, null, 2));
    console.log('[CreateCheckoutSession] Creating session for quote:', quoteId);
    console.log('[CreateCheckoutSession] Tier:', tier, 'Type:', typeof tier);

    // Validate tier code
    if (!['T1', 'T2', 'T3'].includes(tier)) {
      console.error('[CreateCheckoutSession] Invalid tier code received:', tier);
      throw new Error(`Invalid tier code: ${tier}`);
    }

    // Get Stripe Price ID from environment
    const priceId = Deno.env.get(`STRIPE_PRICE_${tier}`);
    if (!priceId) {
      throw new Error(`Stripe Price ID not found for tier: ${tier}`);
    }

    // Retrieve or create Stripe customer
    let customer;
    const { data: quote } = await supabase
      .from('quotes')
      .select('stripe_customer_id')
      .eq('id', quoteId)
      .single();

    if (quote?.stripe_customer_id) {
      // Customer already exists
      customer = await stripe.customers.retrieve(quote.stripe_customer_id);
      console.log('[CreateCheckoutSession] Using existing customer:', customer.id);
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email,
        name: orgName,
        metadata: {
          quote_id: quoteId,
          org_type: orgType,
          source: 'marketing_site'
        }
      });
      console.log('[CreateCheckoutSession] Created new customer:', customer.id);

      // Update quote with customer ID
      await supabase
        .from('quotes')
        .update({ stripe_customer_id: customer.id })
        .eq('id', quoteId);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        quote_id: quoteId,
        tier,
        org_name: orgName,
        org_type: orgType,
        trip_name: tripName,
        source: 'marketing_site',
        payment_mode: 'order'
      },
      customer_update: {
        name: 'auto',
        address: 'auto',
      },
      billing_address_collection: 'required',
      allow_promotion_codes: true,
      consent_collection: {
        terms_of_service: 'required',
      },
    });

    console.log('[CreateCheckoutSession] Session created:', session.id);

    // Update quote with session ID
    await supabase
      .from('quotes')
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: 'processing'
      })
      .eq('id', quoteId);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[CreateCheckoutSession] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
