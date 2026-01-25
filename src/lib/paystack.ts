// Big Brother Crypto - Paystack Integration
// Handles Nigerian Naira payments via Paystack

import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'abandoned' | 'failed';
    reference: string;
    amount: number; // In kobo
    currency: string;
    channel: string;
    customer: {
      email: string;
      customer_code: string;
    };
    paid_at: string;
    created_at: string;
    metadata?: {
      userId?: string;
      stakesAmount?: number;
    };
  };
}

interface PaystackTransferRecipientResponse {
  status: boolean;
  message: string;
  data: {
    recipient_code: string;
    type: string;
    name: string;
    details: {
      account_number: string;
      bank_code: string;
      bank_name: string;
    };
  };
}

interface PaystackTransferResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    integration: number;
    domain: string;
    amount: number;
    currency: string;
    source: string;
    reason: string;
    recipient: number;
    status: string;
    transfer_code: string;
    id: number;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Initialize a payment transaction
 */
export async function initializePayment(
  email: string,
  amountInNaira: number,
  metadata: {
    userId: string;
    stakesAmount: number;
  },
  callbackUrl: string
): Promise<{
  success: boolean;
  authorizationUrl?: string;
  reference?: string;
  error?: string;
}> {
  if (!PAYSTACK_SECRET_KEY) {
    console.error('Paystack secret key not configured');
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    const response = await axios.post<PaystackInitializeResponse>(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInNaira * 100, // Convert to kobo
        currency: 'NGN',
        callback_url: callbackUrl,
        metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      return {
        success: true,
        authorizationUrl: response.data.data.authorization_url,
        reference: response.data.data.reference,
      };
    }

    return { success: false, error: response.data.message };
  } catch (error) {
    console.error('Paystack initialize error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment initialization failed',
    };
  }
}

/**
 * Verify a payment transaction
 */
export async function verifyPayment(reference: string): Promise<{
  success: boolean;
  verified: boolean;
  amount?: number;
  metadata?: {
    userId?: string;
    stakesAmount?: number;
  };
  error?: string;
}> {
  if (!PAYSTACK_SECRET_KEY) {
    return { success: false, verified: false, error: 'Payment service not configured' };
  }

  try {
    const response = await axios.get<PaystackVerifyResponse>(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status && response.data.data.status === 'success') {
      return {
        success: true,
        verified: true,
        amount: response.data.data.amount / 100, // Convert from kobo
        metadata: response.data.data.metadata,
      };
    }

    return {
      success: true,
      verified: false,
      error: `Payment status: ${response.data.data.status}`,
    };
  } catch (error) {
    console.error('Paystack verify error:', error);
    return {
      success: false,
      verified: false,
      error: error instanceof Error ? error.message : 'Payment verification failed',
    };
  }
}

/**
 * Create a transfer recipient (for withdrawals)
 */
export async function createTransferRecipient(
  name: string,
  accountNumber: string,
  bankCode: string
): Promise<{
  success: boolean;
  recipientCode?: string;
  error?: string;
}> {
  if (!PAYSTACK_SECRET_KEY) {
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    const response = await axios.post<PaystackTransferRecipientResponse>(
      `${PAYSTACK_BASE_URL}/transferrecipient`,
      {
        type: 'nuban',
        name,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN',
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      return {
        success: true,
        recipientCode: response.data.data.recipient_code,
      };
    }

    return { success: false, error: response.data.message };
  } catch (error) {
    console.error('Paystack create recipient error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transfer recipient',
    };
  }
}

/**
 * Initiate a transfer (withdrawal)
 */
export async function initiateTransfer(
  amountInNaira: number,
  recipientCode: string,
  reason: string
): Promise<{
  success: boolean;
  transferCode?: string;
  reference?: string;
  error?: string;
}> {
  if (!PAYSTACK_SECRET_KEY) {
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    const response = await axios.post<PaystackTransferResponse>(
      `${PAYSTACK_BASE_URL}/transfer`,
      {
        source: 'balance',
        amount: amountInNaira * 100, // Convert to kobo
        recipient: recipientCode,
        reason,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status) {
      return {
        success: true,
        transferCode: response.data.data.transfer_code,
        reference: response.data.data.reference,
      };
    }

    return { success: false, error: response.data.message };
  } catch (error) {
    console.error('Paystack transfer error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer initiation failed',
    };
  }
}

/**
 * Get list of Nigerian banks
 */
export async function getBanks(): Promise<{
  success: boolean;
  banks?: Array<{ name: string; code: string }>;
  error?: string;
}> {
  if (!PAYSTACK_SECRET_KEY) {
    return { success: false, error: 'Payment service not configured' };
  }

  try {
    const response = await axios.get(`${PAYSTACK_BASE_URL}/bank?country=nigeria`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    if (response.data.status) {
      return {
        success: true,
        banks: response.data.data.map((bank: { name: string; code: string }) => ({
          name: bank.name,
          code: bank.code,
        })),
      };
    }

    return { success: false, error: response.data.message };
  } catch (error) {
    console.error('Paystack get banks error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch banks',
    };
  }
}
