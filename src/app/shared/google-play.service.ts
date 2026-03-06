import { google } from "googleapis";

// IMPORTANT: These should be in environment variables or a secure JSON file
const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/androidpublisher"],
});

const publisher = google.androidpublisher("v3");

/**
 * Validates a Google Play subscription.
 */
const validateSubscription = async (
  packageName: string,
  subscriptionId: string,
  purchaseToken: string,
) => {
  try {
    const response = await publisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
      auth,
    });

    return response.data;
  } catch (error) {
    console.error("Error validating Google Play subscription:", error);
    throw error;
  }
};

/**
 * Validates a Google Play one-time product purchase (e.g., Lifetime).
 */
const validateProduct = async (
  packageName: string,
  productId: string,
  purchaseToken: string,
) => {
  try {
    const response = await publisher.purchases.products.get({
      packageName,
      productId,
      token: purchaseToken,
      auth,
    });

    return response.data;
  } catch (error) {
    console.error("Error validating Google Play product:", error);
    throw error;
  }
};

export const GooglePlayService = {
  validateSubscription,
  validateProduct,
};
