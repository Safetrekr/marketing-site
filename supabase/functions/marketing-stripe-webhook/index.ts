/**
 * Stripe Webhook Handler - Marketing Site
 * Processes webhook events from Stripe for all payment modes
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5174';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('[MarketingWebhook] Processing event:', event.type);

    switch (event.type) {
      // Checkout Session Completed (Order Now mode)
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // Invoice Paid (Request Invoice/Quote modes)
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      // Invoice Payment Failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      // Payment Intent Succeeded
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      // Payment Intent Failed
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      // Charge Refunded
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      default:
        console.log('[MarketingWebhook] Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[MarketingWebhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    );
  }
});

/**
 * Provision Organization and Send Onboarding Invite
 * Creates/updates org, creates onboarding token, sends Supabase Auth invite
 */
async function provisionOrganizationAndSendInvite(quoteId: string) {
  console.log('[MarketingWebhook] Provisioning organization for quote:', quoteId);

  // 1. Fetch quote data
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (quoteError || !quote) {
    console.error('[MarketingWebhook] Error fetching quote:', quoteError);
    throw new Error('Quote not found');
  }

  const quoteData = quote.quote_data as any;
  const email = quote.email;
  const stripeCustomerId = quote.stripe_customer_id;

  console.log('[MarketingWebhook] Quote data:', { email, stripeCustomerId });

  // 2. Create or update organization
  let orgId = quote.org_id;

  if (!orgId) {
    // Create new organization
    const orgSettings = {
      branding: {
        primary_color: '#003D82',
        secondary_color: '#FF6B35',
      },
      legal: {
        terms_accepted: false, // Will be accepted during onboarding
        privacy_accepted: false,
      },
      notifications: {
        email_enabled: true,
      },
    };

    const { data: newOrg, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: quoteData?.org?.orgName || 'New Organization',
        type: quoteData?.org?.orgType || 'school',
        settings: orgSettings,
        stripe_customer_id: stripeCustomerId,
        payment_status: 'paid',
        quote_id: quoteId,
      })
      .select()
      .single();

    if (orgError) {
      console.error('[MarketingWebhook] Error creating organization:', orgError);
      throw orgError;
    }

    orgId = newOrg.id;
    console.log('[MarketingWebhook] Organization created:', orgId);

    // Update quote with org_id
    await supabase
      .from('quotes')
      .update({ org_id: orgId })
      .eq('id', quoteId);
  } else {
    // Update existing organization
    await supabase
      .from('organizations')
      .update({
        stripe_customer_id: stripeCustomerId,
        payment_status: 'paid',
      })
      .eq('id', orgId);

    console.log('[MarketingWebhook] Organization updated:', orgId);
  }

  // 3. Create onboarding token
  const { data: token, error: tokenError } = await supabase
    .from('onboarding_tokens')
    .insert({
      subject_email: email,
      role: 'org_admin',
      org_id: orgId,
      quote_id: quoteId,
      state: 'pending',
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      metadata: {
        source: 'marketing_purchase',
        payment_mode: quote.payment_mode,
        quote_data: quoteData,
      },
    })
    .select()
    .single();

  if (tokenError) {
    console.error('[MarketingWebhook] Error creating onboarding token:', tokenError);
    throw tokenError;
  }

  console.log('[MarketingWebhook] Onboarding token created:', token.token);

  // 4. Send Supabase Auth invite email
  const redirectUrl = `${appUrl}/join/${token.token}`;

  try {
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: redirectUrl,
        data: {
          role: 'org_admin',
          org_id: orgId,
          onboarding_token: token.token,
        },
      }
    );

    if (authError) {
      console.error('[MarketingWebhook] Error sending invite email:', authError);
      throw authError;
    }

    console.log('[MarketingWebhook] Invite email sent to:', email);
  } catch (error) {
    console.error('[MarketingWebhook] Failed to send invite:', error);
    // Don't throw - token is created, user can still be manually invited
  }

  // 5. Mark quote as provisioned
  await supabase
    .from('quotes')
    .update({
      provisioned_at: new Date().toISOString(),
      status: 'provisioned',
    })
    .eq('id', quoteId);

  console.log('[MarketingWebhook] Quote marked as provisioned:', quoteId);

  return { orgId, tokenId: token.id, redirectUrl };
}

/**
 * Handle Checkout Session Completed (Order Now mode)
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[MarketingWebhook] Checkout completed:', session.id);

  const quoteId = session.metadata?.quote_id;
  if (!quoteId) {
    console.error('[MarketingWebhook] No quote_id in session metadata');
    return;
  }

  // Update quote to paid status
  const { error } = await supabase
    .from('quotes')
    .update({
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: session.customer as string,
      payment_status: 'paid',
    })
    .eq('id', quoteId);

  if (error) {
    console.error('[MarketingWebhook] Error updating quote:', error);
    throw error;
  }

  console.log('[MarketingWebhook] Quote updated to paid:', quoteId);

  // Provision organization and send onboarding invite
  try {
    await provisionOrganizationAndSendInvite(quoteId);
  } catch (error) {
    console.error('[MarketingWebhook] Error provisioning organization:', error);
    // Don't throw - payment succeeded, we can retry provisioning later
  }
}

/**
 * Handle Invoice Paid (Request Invoice/Quote modes)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log('[MarketingWebhook] Invoice paid:', invoice.id);

  const quoteId = invoice.metadata?.quote_id;
  if (!quoteId) {
    console.error('[MarketingWebhook] No quote_id in invoice metadata');
    return;
  }

  // Update quote to paid status
  const { error } = await supabase
    .from('quotes')
    .update({
      stripe_payment_intent_id: invoice.payment_intent as string,
      stripe_customer_id: invoice.customer as string,
      payment_status: 'paid',
    })
    .eq('id', quoteId);

  if (error) {
    console.error('[MarketingWebhook] Error updating quote:', error);
    throw error;
  }

  console.log('[MarketingWebhook] Quote updated to paid:', quoteId);

  // Provision organization and send onboarding invite
  try {
    await provisionOrganizationAndSendInvite(quoteId);
  } catch (error) {
    console.error('[MarketingWebhook] Error provisioning organization:', error);
    // Don't throw - payment succeeded, we can retry provisioning later
  }
}

/**
 * Handle Invoice Payment Failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('[MarketingWebhook] Invoice payment failed:', invoice.id);

  const quoteId = invoice.metadata?.quote_id;
  if (!quoteId) {
    console.error('[MarketingWebhook] No quote_id in invoice metadata');
    return;
  }

  // Update quote to failed status
  const { error } = await supabase
    .from('quotes')
    .update({
      payment_status: 'failed'
    })
    .eq('id', quoteId);

  if (error) {
    console.error('[MarketingWebhook] Error updating quote:', error);
    throw error;
  }

  console.log('[MarketingWebhook] Quote updated to failed:', quoteId);

  // TODO: Send payment failed email
}

/**
 * Handle Payment Intent Succeeded
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('[MarketingWebhook] Payment intent succeeded:', paymentIntent.id);

  // Find quote by payment intent ID
  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, status, provisioned_at')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (error || !quote) {
    console.log('[MarketingWebhook] No quote found for payment intent:', paymentIntent.id);
    return;
  }

  // Ensure status is paid (in case checkout.session.completed didn't fire)
  await supabase
    .from('quotes')
    .update({
      payment_status: 'paid',
    })
    .eq('id', quote.id);

  console.log('[MarketingWebhook] Quote confirmed as paid:', quote.id);

  // Provision if not already done (fallback in case checkout.session.completed didn't fire)
  if (!quote.provisioned_at) {
    console.log('[MarketingWebhook] Provisioning not done yet, triggering provisioning');
    try {
      await provisionOrganizationAndSendInvite(quote.id);
    } catch (error) {
      console.error('[MarketingWebhook] Error provisioning organization:', error);
    }
  }
}

/**
 * Handle Payment Intent Failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('[MarketingWebhook] Payment intent failed:', paymentIntent.id);

  // Find quote by payment intent ID or session ID
  const { data: quote } = await supabase
    .from('quotes')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (!quote) {
    console.log('[MarketingWebhook] No quote found for failed payment intent');
    return;
  }

  // Update quote to failed status
  await supabase
    .from('quotes')
    .update({
      payment_status: 'failed'
    })
    .eq('id', quote.id);

  console.log('[MarketingWebhook] Quote updated to failed:', quote.id);
}

/**
 * Handle Charge Refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('[MarketingWebhook] Charge refunded:', charge.id);

  const paymentIntentId = charge.payment_intent as string;
  if (!paymentIntentId) {
    console.log('[MarketingWebhook] No payment intent on charge');
    return;
  }

  // Find quote by payment intent ID
  const { data: quote } = await supabase
    .from('quotes')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (!quote) {
    console.log('[MarketingWebhook] No quote found for refunded charge');
    return;
  }

  // Update quote to refunded status
  await supabase
    .from('quotes')
    .update({
      payment_status: 'refunded',
      status: 'cancelled'
    })
    .eq('id', quote.id);

  console.log('[MarketingWebhook] Quote updated to refunded:', quote.id);
}
