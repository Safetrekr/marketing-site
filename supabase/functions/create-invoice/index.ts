/**
 * Create Stripe Invoice - Marketing Site
 * For "Request Invoice" and "Request Quote" payment modes - deferred payment via Stripe Invoices
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvoiceData {
  quoteId: string;
  tier: string;
  orgName: string;
  orgType: string;
  email: string;
  tripName: string;
  tierPrice: number;
  paymentMode: 'invoice' | 'quote';
  poNumber?: string;
  billingAddress?: string;
  apEmail?: string;
  daysUntilDue?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      quoteId,
      tier,
      orgName,
      orgType,
      email,
      tripName,
      tierPrice,
      paymentMode,
      poNumber,
      billingAddress,
      apEmail,
      daysUntilDue = 30
    } = await req.json() as InvoiceData;

    console.log('[CreateInvoice] Creating invoice for quote:', quoteId, 'mode:', paymentMode);

    // Validate tier code
    if (!['T1', 'T2', 'T3'].includes(tier)) {
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
      customer = await stripe.customers.retrieve(quote.stripe_customer_id);
      console.log('[CreateInvoice] Using existing customer:', customer.id);
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
      console.log('[CreateInvoice] Created new customer:', customer.id);

      // Update quote with customer ID
      await supabase
        .from('quotes')
        .update({ stripe_customer_id: customer.id })
        .eq('id', quoteId);
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: daysUntilDue,
      auto_advance: paymentMode === 'invoice', // Auto-finalize for invoice mode
      metadata: {
        quote_id: quoteId,
        tier,
        org_name: orgName,
        org_type: orgType,
        trip_name: tripName,
        source: 'marketing_site',
        payment_mode: paymentMode,
        po_number: poNumber || '',
        ap_email: apEmail || '',
      },
      description: `SafeTrekr ${tier} - ${tripName}`,
      footer: poNumber ? `PO Number: ${poNumber}` : undefined,
    });

    // Add line item to invoice
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      price: priceId,
      quantity: 1,
      description: `SafeTrekr ${tier} - ${tripName}`,
    });

    // Finalize invoice if in invoice mode
    let finalizedInvoice = invoice;
    if (paymentMode === 'invoice') {
      finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      console.log('[CreateInvoice] Invoice finalized:', finalizedInvoice.id);
    } else {
      console.log('[CreateInvoice] Invoice created as draft (quote mode):', invoice.id);
    }

    // Calculate due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysUntilDue);

    // Update quote with invoice details
    await supabase
      .from('quotes')
      .update({
        stripe_invoice_id: finalizedInvoice.id,
        invoice_due_date: dueDate.toISOString(),
        payment_status: 'pending'
      })
      .eq('id', quoteId);

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: finalizedInvoice.id,
        invoiceUrl: finalizedInvoice.hosted_invoice_url,
        invoicePdf: finalizedInvoice.invoice_pdf,
        dueDate: dueDate.toISOString(),
        amountDue: finalizedInvoice.amount_due,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('[CreateInvoice] Error:', error);
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
