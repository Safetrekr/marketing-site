/**
 * Stripe Quote Service - Marketing Site
 * Handles Stripe integration for all three payment modes
 */

import supabase from '/services/supabaseClient.js';

/**
 * Process quote submission with Stripe based on payment mode
 * @param {string} quoteId - Quote ID from database
 * @param {Object} quoteData - Complete quote form data
 * @returns {Promise<Object>} - Result with checkout URL or invoice details
 */
export async function processStripePayment(quoteId, quoteData) {
  const { checkout, plan, trip, org, pricing } = quoteData;

  console.log('[StripeQuoteService] Processing payment for quote:', quoteId, 'mode:', checkout.mode);
  console.log('[StripeQuoteService] Quote data received:', quoteData);
  console.log('[StripeQuoteService] Plan tier:', plan.tier, 'Type:', typeof plan.tier);

  const tierInfo = {
    quoteId,
    tier: plan.tier,
    orgName: org.orgName,
    orgType: org.orgType,
    email: org.email,
    tripName: trip.name,
    tierPrice: pricing?.tierPrice || getTierPrice(plan.tier)
  };

  console.log('[StripeQuoteService] Tier info to be sent:', tierInfo);

  switch (checkout.mode) {
    case 'order':
      // Immediate payment via Stripe Checkout
      return await createCheckoutSession(tierInfo);

    case 'invoice':
      // Deferred payment via Stripe Invoice (Net 30)
      return await createStripeInvoice(tierInfo, {
        paymentMode: 'invoice',
        billingAddress: checkout.billingAddress,
        apEmail: checkout.apEmail,
        poNumber: checkout.poNumber,
        daysUntilDue: 30
      });

    case 'quote':
      // Deferred payment via Stripe Invoice (quote PDF + payment link)
      return await createStripeInvoice(tierInfo, {
        paymentMode: 'quote',
        daysUntilDue: 30
      });

    default:
      throw new Error(`Invalid payment mode: ${checkout.mode}`);
  }
}

/**
 * Create Stripe Checkout Session for immediate payment (Order Now)
 */
async function createCheckoutSession(tierInfo) {
  try {
    console.log('[StripeQuoteService] Creating checkout session for quote:', tierInfo.quoteId);
    console.log('[StripeQuoteService] Tier info:', tierInfo);

    const origin = window.location.origin;

    const requestBody = {
      quoteId: tierInfo.quoteId,
      tier: tierInfo.tier,
      orgName: tierInfo.orgName,
      orgType: tierInfo.orgType,
      email: tierInfo.email,
      tripName: tierInfo.tripName,
      tierPrice: tierInfo.tierPrice,
      successUrl: `${origin}/checkout-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/request-quote.html?quote_id=${tierInfo.quoteId}&cancelled=true`
    };

    console.log('[StripeQuoteService] Request body:', requestBody);

    // Make a direct fetch call to get better error details
    const supabaseUrl = 'https://olgjdqguafidgrutubih.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sZ2pkcWd1YWZpZGdydXR1YmloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTY4NDgsImV4cCI6MjA3NjE5Mjg0OH0.wgxdXUekbqiORvs9ruHf29looIRWZEaGY2aObCuep5A';

    const fetchResponse = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify(requestBody)
    });

    console.log('[StripeQuoteService] Fetch response status:', fetchResponse.status);

    const responseText = await fetchResponse.text();
    console.log('[StripeQuoteService] Response body text:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[StripeQuoteService] Parsed response:', data);
    } catch (e) {
      console.error('[StripeQuoteService] Could not parse response as JSON:', e);
      throw new Error('Invalid response from server');
    }

    if (!fetchResponse.ok) {
      const errorMessage = data?.error || data?.message || 'Failed to create checkout session';
      console.error('[StripeQuoteService] Server error:', errorMessage);
      throw new Error(errorMessage);
    }

    if (!data?.checkoutUrl) {
      console.error('[StripeQuoteService] No checkout URL in response');
      throw new Error('No checkout URL returned from server');
    }

    console.log('[StripeQuoteService] Checkout session created, redirecting to:', data.checkoutUrl);

    return {
      success: true,
      mode: 'order',
      action: 'redirect',
      checkoutUrl: data.checkoutUrl,
      sessionId: data.sessionId
    };

  } catch (error) {
    console.error('[StripeQuoteService] createCheckoutSession failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create Stripe Invoice for deferred payment (Request Invoice or Request Quote)
 */
async function createStripeInvoice(tierInfo, options) {
  try {
    console.log('[StripeQuoteService] Creating invoice for quote:', tierInfo.quoteId, 'mode:', options.paymentMode);

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-invoice', {
      body: {
        quoteId: tierInfo.quoteId,
        tier: tierInfo.tier,
        orgName: tierInfo.orgName,
        orgType: tierInfo.orgType,
        email: tierInfo.email,
        tripName: tierInfo.tripName,
        tierPrice: tierInfo.tierPrice,
        paymentMode: options.paymentMode,
        poNumber: options.poNumber,
        billingAddress: options.billingAddress,
        apEmail: options.apEmail,
        daysUntilDue: options.daysUntilDue
      }
    });

    if (error) {
      console.error('[StripeQuoteService] Error creating invoice:', error);
      throw new Error(error.message || 'Failed to create invoice');
    }

    if (!data?.invoiceId) {
      throw new Error('No invoice ID returned from server');
    }

    console.log('[StripeQuoteService] Invoice created:', data.invoiceId);

    return {
      success: true,
      mode: options.paymentMode,
      action: 'email',
      invoiceId: data.invoiceId,
      invoiceUrl: data.invoiceUrl,
      invoicePdf: data.invoicePdf,
      dueDate: data.dueDate,
      amountDue: data.amountDue
    };

  } catch (error) {
    console.error('[StripeQuoteService] createStripeInvoice failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get tier price in cents
 */
function getTierPrice(tier) {
  const prices = {
    T1: 45000, // $450
    T2: 75000, // $750
    T3: 125000 // $1250
  };
  return prices[tier] || 0;
}

/**
 * Check if user can access the app (payment completed or deferred)
 * @param {string} quoteId - Quote ID
 * @returns {Promise<Object>} - Access status with payment info
 */
export async function checkQuoteAccess(quoteId) {
  try {
    const { data: quote, error } = await supabase
      .from('quotes')
      .select('payment_status, stripe_invoice_id, stripe_customer_id, payment_mode')
      .eq('id', quoteId)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      canAccess: true, // User can always access after quote submission
      paymentComplete: quote.payment_status === 'paid',
      paymentPending: quote.payment_status === 'pending',
      paymentMode: quote.payment_mode,
      hasInvoice: !!quote.stripe_invoice_id,
      hasCustomer: !!quote.stripe_customer_id
    };

  } catch (error) {
    console.error('[StripeQuoteService] checkQuoteAccess failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export default {
  processStripePayment,
  checkQuoteAccess
};
