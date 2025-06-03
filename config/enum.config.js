const nodeEnvEnums = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
};

const authProviderEnum = {
  GOOGLE: "google",
  APPLE: "apple",
  EMAIL: "email",
  MOBILE: "mobile",
};

const userRoleEnum = {
  USER: "user",
  ADMIN: "admin",
  MANAGER: "manager",
};

const socketEventEnums = {
  SEND_MESSAGE: "send_message",
};

const supportTicketCategoryEnum = {
  PROJECT_QUESTION: "Project Question",
  ACCOUNT_QUESTION: "Account Question",
  FEATURE_REQUEST: "Feature Request",
}

const supportTicketStatusEnum = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved"
};

const supportSDKEnum = {
  NA: "none",
  ANDROID: "android",
  FLUTTER: "flutter",
  IOS: "ios",
  REACT_NATIVE: "react-native",
  UNITY: "unity",
  WEB_RC_BILLING: "web",
};

const subscriptionStatusEnums = {
  ACTIVE: "active",
  RENEWED: "renewed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

const activityLogEnums = {
  SUBSCRIBED: "subscribed",
  RENEWED: "renewed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
};

const transactionStatusEnum = {
  PURCHASED: "purchased",
  TRIAL: "trial",
  RENEWAL: "Renewal",
  LIFETIME: "Lifetime",
  CANCELLED: "cancelled",
}

const transactionSubscriptionStatusEnums = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUATERLY: "Quaterly",
  YEARLY: "Yearly",
  LIFETIME: "Lifetime",
}

const platformEnum = {
  IOS: "Ios",
  ANDROID: "Android",
  WEB: "Web",
}

export default {
  nodeEnvEnums,
  authProviderEnum,
  userRoleEnum,
  socketEventEnums,
  supportTicketCategoryEnum,
  supportTicketStatusEnum,
  supportSDKEnum,
  subscriptionStatusEnums,
  activityLogEnums,
  transactionStatusEnum,
  transactionSubscriptionStatusEnums,
  platformEnum,
};
