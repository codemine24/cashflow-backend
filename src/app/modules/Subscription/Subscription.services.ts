import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { CreateSubscriptionPayload } from "./Subscription.interfaces";
import { SubscriptionPlan } from "../../../generated/prisma/enums";

const createSubscription = async (
  user: TAuthUser,
  payload: CreateSubscriptionPayload,
) => {
  let end_date = null;
  if (payload.plan === "MONTHLY") {
    end_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  } else if (payload.plan === "YEARLY") {
    end_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);
  }

  const result = await prisma.subscription.create({
    data: {
      ...payload,
      plan: payload.plan as SubscriptionPlan,
      user_id: user.id,
      end_date,
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
