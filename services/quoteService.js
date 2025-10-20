/**
 * Quote Service
 * Handles quote submissions from marketing site and quote retrieval for onboarding
 */

import supabase from './supabaseClient.js';

/**
 * Submit a quote from the marketing site
 * @param {Object} quoteData - The complete quote form data
 * @returns {Promise<Object>} - Quote submission result with magic_token
 */
export async function submitQuote(quoteData) {
  try {
    console.log('[QuoteService] Submitting quote:', quoteData);

    // Validate required fields
    if (!quoteData.org?.email) {
      throw new Error('Email is required');
    }

    if (!quoteData.plan?.tier) {
      throw new Error('Tier selection is required');
    }

    // Insert quote into database
    const { data, error } = await supabase
      .from('quotes')
      .insert({
        email: quoteData.org.email,
        quote_data: quoteData,
        status: 'pending',
        payment_mode: quoteData.checkout?.mode || null,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('[QuoteService] Error inserting quote:', error);
      throw error;
    }

    console.log('[QuoteService] Quote submitted successfully:', data.id);

    return {
      success: true,
      quote_id: data.id,
      magic_token: data.magic_token,
      email: data.email,
      expires_at: data.expires_at
    };
  } catch (error) {
    console.error('[QuoteService] submitQuote failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get quote by magic token
 * @param {string} magicToken - The UUID magic token from the URL
 * @returns {Promise<Object|null>} - Quote data or null if not found/expired
 */
export async function getQuoteByToken(magicToken) {
  try {
    console.log('[QuoteService] Fetching quote by token:', magicToken);

    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .eq('magic_token', magicToken)
      .single();

    if (error) {
      console.error('[QuoteService] Error fetching quote:', error);
      throw error;
    }

    // Check if quote is expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.warn('[QuoteService] Quote has expired:', magicToken);

      // Mark as expired
      await supabase
        .from('quotes')
        .update({ status: 'expired' })
        .eq('id', data.id);

      return {
        success: false,
        error: 'Quote link has expired',
        expired: true
      };
    }

    // Check if already activated
    if (data.status === 'activated') {
      console.warn('[QuoteService] Quote already activated:', magicToken);
      return {
        success: false,
        error: 'This quote has already been activated',
        already_activated: true,
        user_id: data.user_id
      };
    }

    console.log('[QuoteService] Quote retrieved successfully:', data.id);

    return {
      success: true,
      quote: {
        id: data.id,
        email: data.email,
        quote_data: data.quote_data,
        payment_mode: data.payment_mode,
        created_at: data.created_at,
        expires_at: data.expires_at
      }
    };
  } catch (error) {
    console.error('[QuoteService] getQuoteByToken failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Activate a quote (called after user completes onboarding)
 * @param {string} quoteId - Quote ID
 * @param {string} userId - Created user ID
 * @param {string} orgId - Created organization ID
 * @returns {Promise<Object>} - Activation result
 */
export async function activateQuote(quoteId, userId, orgId) {
  try {
    console.log('[QuoteService] Activating quote:', quoteId);

    const { data, error } = await supabase
      .from('quotes')
      .update({
        status: 'activated',
        user_id: userId,
        org_id: orgId,
        activated_at: new Date().toISOString()
      })
      .eq('id', quoteId)
      .select()
      .single();

    if (error) {
      console.error('[QuoteService] Error activating quote:', error);
      throw error;
    }

    console.log('[QuoteService] Quote activated successfully');

    return {
      success: true,
      quote: data
    };
  } catch (error) {
    console.error('[QuoteService] activateQuote failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create organization from quote data
 * @param {Object} quoteData - Quote data containing org info
 * @returns {Promise<Object>} - Created organization
 */
export async function createOrgFromQuote(quoteData) {
  try {
    console.log('[QuoteService] Creating org from quote data');

    const orgSettings = {
      branding: {
        primary_color: '#003D82',
        secondary_color: '#FF6B35'
      },
      legal: {
        terms_accepted: true,
        privacy_accepted: true
      },
      notifications: {
        email_enabled: true
      }
    };

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        name: quoteData.org.orgName,
        type: quoteData.org.orgType,
        settings: orgSettings
      })
      .select()
      .single();

    if (error) {
      console.error('[QuoteService] Error creating org:', error);
      throw error;
    }

    console.log('[QuoteService] Organization created:', data.id);

    return {
      success: true,
      org: data
    };
  } catch (error) {
    console.error('[QuoteService] createOrgFromQuote failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create user from quote and account data
 * @param {string} quoteId - Quote ID
 * @param {string} orgId - Organization ID
 * @param {Object} accountData - Account data from onboarding
 * @param {string} email - Email from quote
 * @returns {Promise<Object>} - Created user
 */
export async function createUserFromQuote(quoteId, orgId, accountData, email) {
  try {
    console.log('[QuoteService] Creating user from quote');

    const { data, error } = await supabase
      .from('users')
      .insert({
        org_id: orgId,
        email: email,
        name: `${accountData.first_name} ${accountData.last_name}`,
        phone: accountData.phone || null,
        role: 'org_admin',
        quote_id: quoteId
      })
      .select()
      .single();

    if (error) {
      console.error('[QuoteService] Error creating user:', error);
      throw error;
    }

    console.log('[QuoteService] User created:', data.id);

    return {
      success: true,
      user: data
    };
  } catch (error) {
    console.error('[QuoteService] createUserFromQuote failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create trip draft from quote data
 * @param {string} quoteId - Quote ID
 * @param {string} orgId - Organization ID
 * @param {string} userId - User ID
 * @param {Object} tripData - Trip data from quote
 * @returns {Promise<Object>} - Created trip draft
 */
export async function createTripDraftFromQuote(quoteId, orgId, userId, tripData) {
  try {
    console.log('[QuoteService] Creating trip draft from quote');

    const { data, error } = await supabase
      .from('trip_drafts')
      .insert({
        quote_id: quoteId,
        org_id: orgId,
        user_id: userId,
        trip_data: tripData,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('[QuoteService] Error creating trip draft:', error);
      throw error;
    }

    console.log('[QuoteService] Trip draft created:', data.id);

    return {
      success: true,
      draft: data
    };
  } catch (error) {
    console.error('[QuoteService] createTripDraftFromQuote failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get trip draft for user
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} - Trip draft or null
 */
export async function getTripDraftForUser(userId) {
  try {
    console.log('[QuoteService] Fetching trip draft for user:', userId);

    const { data, error } = await supabase
      .from('trip_drafts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return {
          success: true,
          draft: null
        };
      }
      console.error('[QuoteService] Error fetching trip draft:', error);
      throw error;
    }

    return {
      success: true,
      draft: data
    };
  } catch (error) {
    console.error('[QuoteService] getTripDraftForUser failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Complete onboarding flow: create org, user, and trip draft
 * @param {string} quoteId - Quote ID
 * @param {Object} accountData - Account data from onboarding
 * @param {Object} quoteData - Quote data (contains trip, org, etc.)
 * @returns {Promise<Object>} - Result with all created entities
 */
export async function completeQuoteOnboarding(quoteId, accountData, quoteData) {
  try {
    console.log('[QuoteService] Starting complete onboarding flow');

    // 1. Create organization
    const orgResult = await createOrgFromQuote(quoteData);
    if (!orgResult.success) {
      throw new Error(`Failed to create org: ${orgResult.error}`);
    }

    // 2. Create user
    const userResult = await createUserFromQuote(
      quoteId,
      orgResult.org.id,
      accountData,
      quoteData.org.email
    );
    if (!userResult.success) {
      throw new Error(`Failed to create user: ${userResult.error}`);
    }

    // 3. Create trip draft
    const tripDraftResult = await createTripDraftFromQuote(
      quoteId,
      orgResult.org.id,
      userResult.user.id,
      quoteData.trip
    );
    if (!tripDraftResult.success) {
      throw new Error(`Failed to create trip draft: ${tripDraftResult.error}`);
    }

    // 4. Activate quote
    const activateResult = await activateQuote(
      quoteId,
      userResult.user.id,
      orgResult.org.id
    );
    if (!activateResult.success) {
      throw new Error(`Failed to activate quote: ${activateResult.error}`);
    }

    console.log('[QuoteService] Complete onboarding flow finished successfully');

    return {
      success: true,
      org: orgResult.org,
      user: userResult.user,
      trip_draft: tripDraftResult.draft,
      quote: activateResult.quote
    };
  } catch (error) {
    console.error('[QuoteService] completeQuoteOnboarding failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
