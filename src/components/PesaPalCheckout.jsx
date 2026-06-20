import React, { useState } from 'react';
import { CreditCard, Check } from 'lucide-react';

export default function PesaPalCheckout({ userEmail, selectedPlan, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentPlan = selectedPlan || { name: 'Premium', price: 0 };

  const handleCreateOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      // Create PesaPal order
      const createResponse = await fetch(
        `${supabaseUrl}/functions/v1/pesapal-create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            amount: currentPlan.price,
            description: `ZAB ${currentPlan.name} Subscription`,
            userEmail,
          }),
        }
      );

      const data = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      const approveLink = data.links?.find((link) => link.rel === 'approve');
      if (approveLink) {
        window.location.href = approveLink.href;
      } else {
        throw new Error('PesaPal approval link not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <div className="pesapal-checkout" style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '32px',
      background: 'var(--night-800)',
      borderRadius: '16px',
      border: '1px solid rgba(245,243,255,0.1)',
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CreditCard size={28} />
        Checkout
      </h2>

      <div style={{
        background: 'rgba(245,243,255,0.05)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--ink-400)', marginBottom: '8px' }}>Summary</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>{currentPlan.name} Plan</span>
          <span>UGX {currentPlan.price.toLocaleString()}</span>
        </div>
        <div style={{
          borderTop: '1px solid rgba(245,243,255,0.1)',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
        }}>
          <span>Total</span>
          <span>UGX {currentPlan.price.toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(240,138,168,0.1)',
          color: '#F08AA8',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleCreateOrder}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, var(--lotus-300) 0%, var(--lotus-400) 100%)',
          color: 'var(--night-900)',
          border: 'none',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginBottom: '12px',
        }}
      >
        {loading ? 'Processing...' : 'Continue to PesaPal'}
      </button>

      <button
        onClick={onCancel}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          background: 'transparent',
          color: 'var(--ink-400)',
          border: '1px solid rgba(245,243,255,0.1)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '500',
        }}
      >
        Cancel
      </button>

      <div style={{
        marginTop: '24px',
        padding: '12px',
        background: 'rgba(201,168,240,0.08)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'var(--ink-400)',
        lineHeight: '1.5',
      }}>
        <Check size={14} style={{ display: 'inline-block', marginRight: '6px' }} />
        Secure payment powered by PesaPal
      </div>
    </div>
  );
}
