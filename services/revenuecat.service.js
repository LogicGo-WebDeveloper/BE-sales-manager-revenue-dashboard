import axios from "axios";
import enumConfig from "../config/enum.config.js";

/**
 * Maps RevenueCat product ID to transaction subscription status
 * @param {string} productId - The product ID from RevenueCat webhook event
 * @returns {string} The corresponding transaction subscription status
 */

const fetchRevenueCatSubscription = async (customerId) => {
  const response = await axios.get(
    `https://api.revenuecat.com/v1/subscribers/${customerId}`,
    {
      headers: {
        Authorization: `Bearer goog_WIXVJWkgdiyFnVMDcUOCfNdNDPe`,
      },
    }
  );

  return response.data.subscriber;
};


const mapRevenueCatProductToSubscription = (productId) => {
  if (!productId) {
    return enumConfig.transactionSubscriptionStatusEnums.LIFETIME;
  }

  const lowerProductId = productId.toLowerCase();

  if (lowerProductId.includes("weekly")) {
    return enumConfig.transactionSubscriptionStatusEnums.WEEKLY;
  } else if (lowerProductId.includes("monthly")) {
     return enumConfig.transactionSubscriptionStatusEnums.WEEKLY; 
  } else if (lowerProductId.includes("quarterly")) {
    return enumConfig.transactionSubscriptionStatusEnums.QUATERLY;
  } else if (lowerProductId.includes("yearly")) {
    return enumConfig.transactionSubscriptionStatusEnums.YEARLY;
  } else if (lowerProductId.includes("lifetime")) {
    return enumConfig.transactionSubscriptionStatusEnums.LIFETIME;
  } else {
    return enumConfig.transactionSubscriptionStatusEnums.WEEKLY; 
  }
};

export default {
  fetchRevenueCatSubscription,
  mapRevenueCatProductToSubscription,
};
