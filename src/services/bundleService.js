import { getBundleById, getProductById, addTransaction, updateUser, getUserById, addReferral, updateReferral } from "./dbService";
import { recordReferralCommission } from "./ledgerService";

// ============ BUNDLE PURCHASE ============

/**
 * Process a reseller bundle purchase.
 * 
 * Flow:
 * 1. Verify bundle exists and is active
 * 2. Create transaction record
 * 3. Update user's reseller status
 * 4. Record referral commission if applicable
 * 5. Return purchase confirmation
 */
export const purchaseBundle = async ({
  userId,
  bundleId,
  paymentMethod, // "telebirr" | "cbe"
  paymentReference, // Transaction ID from Telebirr or CBE
  referrerId = null, // Who referred this buyer (if any)
}) => {
  // 1. Get bundle
  const bundle = await getBundleById(bundleId);
  if (!bundle || bundle.status !== "active") {
    throw new Error("Bundle not available.");
  }

  // 2. Create transaction
  const transaction = await addTransaction({
    userId,
    type: "bundle_purchase",
    bundleId,
    bundleName: bundle.name,
    amount: bundle.price,
    currency: "ETB",
    paymentMethod,
    paymentReference,
    referrerId,
    status: "pending", // Admin verifies Telebirr/CBE payment manually
  });

  // 3. Update user reseller status (pending until payment verified)
  await updateUser(userId, {
    resellerStatus: "pending_payment",
    lastBundleId: bundleId,
    lastBundleName: bundle.name,
  });

  // 4. Record referral if applicable
  let referralCommission = 0;
  if (referrerId && bundle.referralCommission > 0) {
    const referral = await addReferral({
      transactionId: transaction.id,
      referrerId,
      purchaserId: userId,
      bundleId,
      bundleName: bundle.name,
      amount: bundle.price,
      commissionRate: bundle.referralCommission,
      status: "pending", // Qualifies once payment verified
    });

    // DON'T pay commission yet — payment not verified
    // Commission recorded as pending
  }

  return {
    transactionId: transaction.id,
    bundleName: bundle.name,
    amount: bundle.price,
    paymentMethod,
    paymentReference,
    status: "pending",
    message: "Payment pending verification. You'll get access once confirmed.",
  };
};

// ============ VERIFY PAYMENT (Admin Action) ============

/**
 * Admin verifies Telebirr/CBE payment.
 * Then grants reseller access and qualifies commissions.
 */
export const verifyBundlePayment = async (transactionId) => {
  const { getTransactions, updateTransaction } = require("./dbService");
  const transactions = await getTransactions();
  const tx = transactions.find(t => t.id === transactionId);
  
  if (!tx || tx.status !== "pending") {
    throw new Error("Transaction not found or already processed.");
  }

  // Mark transaction paid
  await updateTransaction(transactionId, { status: "paid" });

  // Grant reseller access
  await updateUser(tx.userId, {
    resellerStatus: "active",
    resellerSince: new Date().toISOString(),
    currentBundleId: tx.bundleId,
    currentBundleName: tx.bundleName,
  });

  // Qualify referral commission
  if (tx.referrerId) {
    const bundle = await getBundleById(tx.bundleId);
    if (bundle && bundle.referralCommission > 0) {
      const commission = Math.round(tx.amount * bundle.referralCommission / 100);
      
      // Record ledger entry
      await recordReferralCommission({
        transactionId,
        referrerId: tx.referrerId,
        purchaserId: tx.userId,
        bundleName: tx.bundleName,
        amount: tx.amount,
        referralRate: bundle.referralCommission,
      });

      // Update referral record
      const { getReferrals, updateReferral } = require("./dbService");
      const referrals = await getReferrals();
      const ref = referrals.find(r => r.transactionId === transactionId);
      if (ref) {
        await updateReferral(ref.id, { status: "qualified" });
      }
    }
  }

  return { status: "verified", message: "Payment verified. Reseller access granted." };
};

// ============ RESELLER PRODUCT ACCESS ============

/**
 * Get products a reseller can sell based on their bundle.
 */
export const getResellerProducts = async (userId) => {
  const user = await getUserById(userId);
  if (!user || user.resellerStatus !== "active" || !user.currentBundleId) {
    return [];
  }

  const bundle = await getBundleById(user.currentBundleId);
  if (!bundle) return [];

  const products = [];
  for (const productId of bundle.products || []) {
    const product = await getProductById(productId);
    if (product && product.allowResell) {
      products.push(product);
    }
  }

  return products;
};

// ============ RESELLER SALE ============

/**
 * Record a sale made by a reseller.
 * Reseller earns their margin from the bundle config.
 */
export const recordResellerSale = async ({
  resellerId,
  productId,
  productTitle,
  customerId,
  amount,
  bundleId,
}) => {
  const bundle = await getBundleById(bundleId);
  const resellerMargin = bundle?.resellerMargin || 20;
  const creatorRoyalty = 70; // Configurable later

  const { recordProductSale } = require("./ledgerService");

  const split = await recordProductSale({
    transactionId: `sale_${Date.now()}`,
    productId,
    productTitle,
    customerId,
    creatorId: "platform", // You're the creator
    resellerId,
    amount,
    rates: {
      creatorRoyalty,
      resellerMargin,
      referralCommission: 0,
    },
  });

  return split;
};

// ============ RESELLER DASHBOARD DATA ============

/**
 * Get reseller dashboard summary.
 */
export const getResellerDashboard = async (userId) => {
  const user = await getUserById(userId);
  const products = await getResellerProducts(userId);
  const { getLedgerByUser } = require("./dbService");
  const ledger = await getLedgerByUser(userId);
  
  const earnings = ledger
    .filter(e => e.type === "reseller_commission")
    .reduce((sum, e) => sum + e.amount, 0);

  const referrals = ledger
    .filter(e => e.type === "referral_commission")
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = ledger.reduce((sum, e) => sum + e.amount, 0);

  return {
    user,
    products,
    totalEarnings: earnings,
    totalReferrals: referrals,
    balance,
    bundleName: user?.currentBundleName || "No bundle",
    resellerStatus: user?.resellerStatus || "none",
  };
};