import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { CreateSubscriptionPayload } from "./Subscription.interfaces";
import { SubscriptionPlan } from "../../../generated/prisma/enums";

import { GooglePlayService } from "../../shared/google-play.service";
import httpStatus from "http-status";
import CustomizedError from "../../error/customized-error";

const createSubscription = async (
  user: TAuthUser,
  payload: CreateSubscriptionPayload,
) => {
  // Check if purchase token already exists
  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      purchase_token: payload.purchase_token,
    },
  });

  if (existingSubscription) {
    throw new CustomizedError(
      httpStatus.BAD_REQUEST,
      "Purchase token already used",
    );
  }

  const packageName = payload.package_name || "com.codemine.cashflow"; // Default package name

  let validationResult;
  let end_date: Date | null = null;

  if (payload.plan === "LIFETIME") {
    validationResult = await GooglePlayService.validateProduct(
      packageName,
      payload.product_id,
      payload.purchase_token,
    );
    // Lifetime usually doesn't have an end date, or it's very far in the future
    end_date = null;
  } else {
    validationResult = await GooglePlayService.validateSubscription(
      packageName,
      payload.product_id,
      payload.purchase_token,
    );

    if (validationResult.expiryTimeMillis) {
      end_date = new Date(Number(validationResult.expiryTimeMillis));
    } else {
      // Fallback if expiryTimeMillis is missing
      if (payload.plan === "MONTHLY") {
        end_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
      } else if (payload.plan === "YEARLY") {
        end_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
      }
    }
  }

  const result = await prisma.subscription.create({
    data: {
      user_id: user.id,
      plan: payload.plan as SubscriptionPlan,
      price: payload.price,
      purchase_token: payload.purchase_token,
      product_id: payload.product_id,
      package_name: packageName,
      end_date,
      transaction_id: validationResult.orderId || null,
    },
  });
  return result;
};

const getMySubscription = async (user: TAuthUser) => {
  const result = await prisma.subscription.findFirst({
    where: {
      user_id: user.id,
      is_active: true,
      OR: [
        {
          end_date: null,
        },
        {
          end_date: {
            gt: new Date(),
          },
        },
      ],
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return result;
};

export const SubscriptionServices = {
  createSubscription,
  getMySubscription,
};
