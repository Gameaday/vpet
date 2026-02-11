# 💳 Payment Integration Guide for VPet

This guide explains how to integrate payment processing for premium features in VPet.

## Overview

VPet uses a freemium model with two premium tiers:
- **Basic Premium**: $2.99/month
- **Premium Plus**: $4.99/month

## Payment Provider: Stripe

We use Stripe for payment processing due to its:
- Easy integration
- Global availability
- Support for subscriptions
- PCI compliance
- Mobile SDK support

## Setup

### 1. Create Stripe Account

1. Sign up at https://stripe.com
2. Complete account verification
3. Get your API keys from the Dashboard

### 2. Install Stripe SDK

```bash
npm install stripe @stripe/stripe-js
```

For Android:
Add to `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.stripe:stripe-android:20.25.0'
}
```

### 3. Configure Environment Variables

Create `.env` file (never commit this):
```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 4. Create Stripe Products

In Stripe Dashboard:
1. Go to Products
2. Create "VPet Basic Premium" - $2.99/month recurring
3. Create "VPet Premium Plus" - $4.99/month recurring
4. Note the Price IDs

## Implementation

### Client-Side (Web/Mobile)

The `premium.js` file contains the PremiumManager class that handles:
- Premium status tracking
- Feature unlocking
- Purchase initiation
- Subscription management

### Server-Side Integration

Create a backend endpoint for payment processing:

```javascript
// server/payment.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
    const { tier } = req.body;
    
    const prices = {
        basic: 'price_...', // Your Stripe Price ID
        premium: 'price_...'
    };
    
    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{
                price: prices[tier],
                quantity: 1,
            }],
            success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${YOUR_DOMAIN}/cancel`,
            customer_email: req.body.email,
        });
        
        res.json({ sessionId: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook for subscription events
app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    switch (event.type) {
        case 'checkout.session.completed':
            // Activate premium for user
            const session = event.data.object;
            await activatePremium(session.customer, session.subscription);
            break;
            
        case 'customer.subscription.deleted':
            // Deactivate premium
            const subscription = event.data.object;
            await deactivatePremium(subscription.customer);
            break;
            
        case 'invoice.payment_failed':
            // Handle failed payment
            await handlePaymentFailure(event.data.object);
            break;
    }
    
    res.json({ received: true });
});
```

### Update PremiumManager

Modify `premium.js` to call your backend:

```javascript
async initiatePurchase(tier) {
    try {
        // Show loading
        showToast('Preparing checkout...', 'info');
        
        // Create checkout session
        const response = await fetch('/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tier, email: userEmail })
        });
        
        const { sessionId } = await response.json();
        
        // Redirect to Stripe Checkout
        const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId });
        
    } catch (error) {
        console.error('Payment error:', error);
        showToast('Payment failed. Please try again.', 'error');
    }
}
```

## Android Integration

### Add Stripe Dependency

In `android/app/build.gradle`:
```gradle
dependencies {
    implementation 'com.stripe:stripe-android:20.25.0'
}
```

### Initialize Stripe

Create `MainActivity.java` or update existing:
```java
import com.stripe.android.PaymentConfiguration;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize Stripe
        PaymentConfiguration.init(
            getApplicationContext(),
            "pk_live_..." // Your publishable key
        );
    }
}
```

### Handle Payment Results

```java
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    
    if (requestCode == STRIPE_PAYMENT_REQUEST) {
        if (resultCode == RESULT_OK) {
            // Payment successful
            notifyWebView("payment_success");
        } else {
            // Payment failed or cancelled
            notifyWebView("payment_cancelled");
        }
    }
}
```

## Google Play Billing (Alternative)

For Play Store builds, you can use Google Play Billing instead:

### Setup

```bash
npm install @capacitor-community/in-app-purchases
npx cap sync
```

### Implementation

```javascript
import { InAppPurchase2 } from '@capacitor-community/in-app-purchases';

// Initialize
await InAppPurchase2.initialize();

// Register products
InAppPurchase2.register({
    id: 'vpet_premium_basic',
    type: InAppPurchase2.PAID_SUBSCRIPTION
});

// Purchase
await InAppPurchase2.order('vpet_premium_basic');

// Listen for events
InAppPurchase2.addListener('purchaseCompleted', (purchase) => {
    // Activate premium
    premiumManager.activatePremium('basic', 30);
});
```

## Testing

### Test Mode

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires Auth: `4000 0025 0000 3155`

### Test Checklist

- [ ] Successful payment flow
- [ ] Failed payment handling
- [ ] Subscription cancellation
- [ ] Payment method update
- [ ] Webhook delivery
- [ ] Premium feature activation
- [ ] Premium feature expiration
- [ ] Refund handling
- [ ] Multiple device sync
- [ ] Offline mode behavior

## Security Best Practices

1. **Never store payment info client-side**
   - Use Stripe's secure elements
   - Token-based authentication only

2. **Validate on server**
   - Don't trust client-side premium status
   - Always verify with Stripe API

3. **Use webhooks**
   - Handle all subscription events
   - Verify webhook signatures

4. **PCI Compliance**
   - Never handle raw card data
   - Use Stripe's hosted checkout

5. **Secure API keys**
   - Use environment variables
   - Rotate keys regularly
   - Different keys for dev/prod

## Premium Feature Implementation

### Coin Multiplier

```javascript
function awardCoins(baseAmount) {
    const multiplier = premiumManager.getCoinMultiplier();
    const finalAmount = baseAmount * multiplier;
    
    pet.coins += finalAmount;
    
    if (multiplier > 1) {
        showToast(`+${finalAmount} coins (${multiplier}x premium bonus!)`, 'success');
    }
}
```

### Cloud Save

```javascript
async function saveToCloud() {
    if (!premiumManager.canAccessFeature('cloud_save')) {
        showToast('Cloud save is a premium feature', 'warning');
        return;
    }
    
    try {
        await fetch('/api/save-pet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                petData: pet.save()
            })
        });
        showToast('Saved to cloud!', 'success');
    } catch (error) {
        showToast('Cloud save failed', 'error');
    }
}
```

### Exclusive Features

```javascript
function unlockEvolutionPath(pathId) {
    if (pathId.startsWith('premium_') && !premiumManager.hasPremium()) {
        showPremiumUpgradePrompt('Unlock exclusive evolution paths!');
        return false;
    }
    
    // Unlock the evolution path
    pet.unlockedPaths.push(pathId);
    return true;
}
```

## Subscription Management

### Customer Portal

Create a customer portal link:

```javascript
async function openCustomerPortal() {
    const response = await fetch('/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user.stripeCustomerId })
    });
    
    const { url } = await response.json();
    window.open(url, '_blank');
}
```

### Cancel Subscription

```javascript
async function cancelSubscription() {
    if (!confirm('Are you sure you want to cancel your premium subscription?')) {
        return;
    }
    
    try {
        await fetch('/cancel-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id })
        });
        
        showToast('Subscription cancelled. Premium features will remain active until the end of your billing period.', 'info', 5000);
    } catch (error) {
        showToast('Failed to cancel subscription', 'error');
    }
}
```

## Revenue Analytics

Track key metrics:
- Monthly Recurring Revenue (MRR)
- Churn rate
- Conversion rate (free to premium)
- Average Revenue Per User (ARPU)
- Lifetime Value (LTV)

Use Stripe Dashboard or integrate with:
- Mixpanel
- Google Analytics
- Custom analytics dashboard

## Legal Requirements

### Required Pages

1. **Privacy Policy**
   - How payment data is handled
   - Stripe's role as processor
   - Data retention policies

2. **Terms of Service**
   - Subscription terms
   - Cancellation policy
   - Refund policy

3. **Refund Policy**
   - Clear refund terms
   - How to request refunds
   - Processing timeframe

### Required Disclosures

In Play Store listing:
- In-app purchases available
- Subscription pricing
- Auto-renewal terms
- Cancellation instructions

## Support

For payment issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- VPet Issues: https://github.com/Gameaday/vpet/issues

## Roadmap

Future payment features:
- [ ] Annual subscription discount (save 20%)
- [ ] Family plan (up to 5 devices)
- [ ] One-time purchases (cosmetics, items)
- [ ] Gift subscriptions
- [ ] Regional pricing
- [ ] Multiple payment methods (PayPal, etc.)
- [ ] Promotional codes/discounts
- [ ] Free trial period (7 days)

## License

MIT License - See LICENSE file for details
