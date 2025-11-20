-- Add Stripe fields to quotes table for payment processing
-- This allows tracking of customers, payments, and invoices across all three payment modes

-- Add Stripe-related columns to quotes table
ALTER TABLE quotes
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS invoice_due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS invoice_pdf_url TEXT;

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_quotes_stripe_customer
ON quotes(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_quotes_stripe_session
ON quotes(stripe_checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_quotes_stripe_invoice
ON quotes(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_quotes_stripe_payment_intent
ON quotes(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_quotes_payment_status
ON quotes(payment_status);

-- Add comment explaining the payment modes
COMMENT ON COLUMN quotes.stripe_customer_id IS 'Stripe customer ID - created for all payment modes';
COMMENT ON COLUMN quotes.stripe_checkout_session_id IS 'Stripe checkout session ID - only for "order" mode (immediate payment)';
COMMENT ON COLUMN quotes.stripe_invoice_id IS 'Stripe invoice ID - for "invoice" and "quote" modes (deferred payment)';
COMMENT ON COLUMN quotes.stripe_payment_intent_id IS 'Stripe payment intent ID - populated by webhook after successful payment';
COMMENT ON COLUMN quotes.invoice_due_date IS 'Due date for invoice (Net 30) - only for "invoice" mode';
COMMENT ON COLUMN quotes.invoice_pdf_url IS 'URL to invoice or quote PDF in Supabase Storage';

-- Update payment_status check constraint to include new statuses
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_payment_status_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_payment_status_check
CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded'));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quotes_updated_at_trigger ON quotes;
CREATE TRIGGER update_quotes_updated_at_trigger
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION update_quotes_updated_at();
