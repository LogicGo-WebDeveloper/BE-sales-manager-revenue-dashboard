import moment from "moment";
import enumConfig from "../config/enum.config.js";
import PromoCode from "../models/promocode.model.js";

const expirePromosAndSubscriptions = async () => {
  try {
    const now = new Date();

    // Fetch all promo codes that are not expired
    const promos = await PromoCode.find({
      "codes.isExpired": false,
    });

    for (const promo of promos) {
      let updated = false;

      promo.codes.forEach((code) => {
        if (!code.isExpired) {
          const { startDate, endDate, startTime, endTime } = promo;

          const startDateTime = startTime
            ? moment(
                `${moment(startDate).format("YYYY-MM-DD")} ${startTime}`,
                "YYYY-MM-DD hh:mm A"
              ).toDate()
            : startDate;

          const endDateTime = endTime
            ? moment(
                `${moment(endDate).format("YYYY-MM-DD")} ${endTime}`,
                "YYYY-MM-DD hh:mm A"
              ).toDate()
            : endDate;

          if (now > endDateTime) {
            code.isExpired = true;

            // Optional: expire subscription
            if (
              code.subscription &&
              code.subscription.status ===
                enumConfig.subscriptionStatusEnums.ACTIVE
            ) {
              code.subscription.status =
                enumConfig.subscriptionStatusEnums.EXPIRED;
              code.subscription.activityLog.push({
                status: enumConfig.subscriptionStatusEnums.EXPIRED,
                date: now,
              });
            }

            updated = true;
          }
        }
      });

      if (updated) {
        await promo.save();
      }
    }

    console.log("Promo code and subscription expiration check complete.");
  } catch (error) {
    console.error("Error expiring promo codes:", error);
  }
};

export default expirePromosAndSubscriptions;
