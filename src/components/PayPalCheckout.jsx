import React, { useEffect, useState } from 'react';
import { CreditCard, Check } from 'lucide-react';

export default function PayPalCheckout({ userEmail, onSuccess, onCancel }) {
  const [subscriptionPlan, setSubscriptionPlan] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);

  const plans = {
    premium: { name: 'Premium', price: 9.99, description: 'Unlimited wellness coaching' },
    pro: { name: 'Pro', price: 19.99, description: 'Priority support + Advanced metrics' },
  };

  const currentPlan = plans[subscriptionPlan];

  const handleCreateOrder = async () => {
    setError('');
    setLoading(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      // Create PayPal order
      const createResponse = await fetch(
        `${supabaseUrl}/functions/v1/paypal-create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            amount: currentPlan.price,
            description: `ZAB ${currentPlan.name} Subscription`,
            userEmail: userEmail,
          }),
        }
      );

      const data = await createResponse.json();

      if (!createResponse.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      setOrderId(data.orderId);

      // Find the approve link
      const approveLink = data.links?.find(link => link.rel === 'approve');
      if (approveLink) {
        // Redirect to PayPal checkout
        window.location.href = approveLink.href;
      } else {
        throw new Error('PayPal approval link not found');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="paypal-checkout" style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '32px',
      background: 'var(--night-800)',
      borderRadius: '16px',
      border: '1px solid rgba(245,243,255,0.1)',
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CreditCard size={28} />
        Choose Your Plan
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {Object.entries(plans).map(([key, plan]) => (
          <button
            key={key}
            onClick={() => setSubscriptionPlan(key)}
            style={{
              padding: '16px',
              background: subscriptionPlan === key ? 'rgba(201,168,240,0.15)' : 'rgba(245,243,255,0.05)',
              border: subscriptionPlan === key ? '2px solid var(--lotus-300)' : '1px solid rgba(245,243,255,0.1)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{plan.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--ink-400)' }}>{plan.description}</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--lotus-300)' }}>
              ${plan.price}
            </div>
          </button>
        ))}
      </div>

      <div style={{
        background: 'rgba(245,243,255,0.05)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '24px',
      }}>
        <div style={{ fontSize: '12px', color: 'var(--ink-400)', marginBottom: '8px' }}>Summary</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>{currentPlan.name} Plan</span>
          <span>${currentPlan.price}</span>
        </div>
        <div style={{
          borderTop: '1px solid rgba(245,243,255,0.1)',
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '600',
        }}>
          <span>Total</span>
          <span>${currentPlan.price}</span>
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
        {loading ? 'Processing...' : 'Continue to PayPal'}
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
        Secure payment powered by PayPal
      </div>
    </div>
  );
}
