import { addLedgerEntry, getLedgerByUser, getLedgerByTransaction } from "./dbService";

// ============ COMMISSION CALCULATIONS ============

/**
 * Calculate how a payment splits.
 * 
 * @param {number} amount - Total payment amount
 * @param {object} rates - Configurable rates
 * @param {number} rates.creatorRoyalty - % to creator
 * @param {number} rates.resellerMargin - % to reseller (if reseller sale)
 * @param {number} rates.referralCommission - % to referrer (if referral)
 * @returns {object} Split amounts
 */
export const calculateSplit = (amount, { creatorRoyalty = 70, resellerMargin = 0, referralCommission = 0 }) => {
  const creatorAmount = Math.round(amount * creatorRoyalty / 100);
  const resellerAmount = Math.round(amount * resellerMargin / 100);
  const referralAmount = Math.round(amount * referralCommission / 100);
  const platformAmount = amount - creatorAmount - resellerAmount - referralAmount;

  return {
    total: amount,
    creator: creatorAmount,
    reseller: resellerAmount,
    referral: referralAmount,
    platform: platformAmount,
  };
};

// ============ BALANCE CALCULATION ============

/**
 * Calculate a user's balance from the ledger.
 * Never trust a stored "balance" field. Always sum ledger entries.
 */
export const getUserBalance = async (userId) => {
  const entries = await getLedgerByUser(userId);
  return entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
};

// ============ TRANSACTION RECORDING ============

/**
 * Record a complete product sale with all commission splits.
 */
export const recordProductSale = async ({
  transactionId,
  productId,
  productTitle,
  customerId,
  creatorId,
  resellerId = null,
  referrerId = null,
  amount,
  rates,
}) => {
  const split = calculateSplit(amount, rates);

  const entries = [
    // Customer payment (platform receives)
    {
      transactionId,
      userId: "platform",
      amount: amount,
      type: "sale_revenue",
      source: "customer_payment",
      status: "qualified",
      description: `Payment received for ${productTitle}`,
    },
    // Platform cut (negative from platform revenue = actual platform profit)
    {
      transactionId,
      userId: "platform",
      amount: -split.creator,
      type: "creator_royalty_paid",
      source: "sale",
      status: "qualified",
      description: `Creator royalty for ${productTitle}`,
    },
    {
      transactionId,
      userId: "platform",
      amount: -split.reseller,
      type: "reseller_commission_paid",
      source: "sale",
      status: "qualified",
      description: `Reseller commission for ${productTitle}`,
    },
    {
      transactionId,
      userId: "platform",
      amount: -split.referral,
      type: "referral_commission_paid",
      source: "sale",
      status: "qualified",
      description: `Referral commission for ${productTitle}`,
    },
  ];

  // Creator earning
  if (creatorId) {
    entries.push({
      transactionId,
      userId: creatorId,
      amount: split.creator,
      type: "creator_royalty",
      source: "sale",
      status: "qualified",
      description: `Royalty from sale of ${productTitle}`,
    });
  }

  // Reseller earning
  if (resellerId && split.reseller > 0) {
    entries.push({
      transactionId,
      userId: resellerId,
      amount: split.reseller,
      type: "reseller_commission",
      source: "sale",
      status: "qualified",
      description: `Commission from sale of ${productTitle}`,
    });
  }

  // Referral earning
  if (referrerId && split.referral > 0) {
    entries.push({
      transactionId,
      userId: referrerId,
      amount: split.referral,
      type: "referral_commission",
      source: "referral",
      status: "qualified",
      description: `Referral commission from ${productTitle} purchase`,
    });
  }

  // Write all ledger entries
  for (const entry of entries) {
    await addLedgerEntry(entry);
  }

  return split;
};

// ============ WITHDRAWALS ============

/**
 * Record a withdrawal. Creates negative ledger entry for user.
 */
export const recordWithdrawal = async (userId, amount, method) => {
  // Check available balance first
  const balance = await getUserBalance(userId);
  if (balance < amount) {
    throw new Error("Insufficient balance.");
  }

  await addLedgerEntry({
    transactionId: null,
    userId,
    amount: -amount,
    type: "withdrawal",
    source: "payout",
    status: "pending",
    description: `Withdrawal request via ${method}`,
  });

  return { userId, amount, method, status: "pending" };
};

// ============ REFUNDS / REVERSALS ============

/**
 * Reverse all commissions from a transaction when refunded or charged back.
 */
export const reverseTransaction = async (transactionId, reason) => {
  const entries = await getLedgerByTransaction(transactionId);

  for (const entry of entries) {
    if (entry.amount !== 0) {
      await addLedgerEntry({
        transactionId,
        userId: entry.userId,
        amount: -entry.amount, // Reverse
        type: "reversal",
        source: reason,
        status: "qualified",
        description: `Reversal: ${reason} (original: ${entry.description})`,
      });
    }
  }
};

// ============ REFERRAL RECORDING ============

/**
 * Record referral commission when someone purchases a bundle.
 */
export const recordReferralCommission = async ({
  transactionId,
  referrerId,
  purchaserId,
  bundleName,
  amount,
  referralRate,
}) => {
  const commission = Math.round(amount * referralRate / 100);

  await addLedgerEntry({
    transactionId,
    userId: referrerId,
    amount: commission,
    type: "referral_commission",
    source: "bundle_referral",
    status: "qualified",
    description: `Referral commission from ${bundleName} purchase`,
  });

  await addLedgerEntry({
    transactionId,
    userId: "platform",
    amount: -commission,
    type: "referral_commission_paid",
    source: "bundle_referral",
    status: "qualified",
    description: `Referral payout for ${bundleName}`,
  });

  return commission;
};

// ============ FRAUD CHECKS ============

/**
 * Basic fraud detection. Returns list of flags for admin review.
 */
export const checkForFraud = async ({ userId, ip, deviceId, amount, recentTransactions }) => {
  const flags = [];

  // Self-referral check
  // (Would compare IP/device in real implementation)

  // High amount check
  if (amount > 10000) flags.push("HIGH_VALUE_TRANSACTION");

  // Rapid transactions check
  if (recentTransactions && recentTransactions.length > 5) {
    flags.push("MULTIPLE_RECENT_TRANSACTIONS");
  }

  return flags;
};