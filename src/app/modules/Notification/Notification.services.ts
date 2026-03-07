import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import {
  notificationQueryValidationConfig,
  notificationSearchableFields,
} from "./Notification.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

// -------------------------------------- GET ALL NOTIFICATIONS --------------------------
const getAllNotifications = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const { search_term, page, limit, sort_by, sort_order } = query;

  if (sort_by)
    queryValidator(notificationQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(notificationQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.NotificationWhereInput[] = [
    {
      user_id: user.id,
    },
  ];

  if (search_term) {
    andConditions.push({
      OR: notificationSearchableFields.map((field) => {
        return {
          [field]: {
            contains: search_term.trim(),
            mode: "insensitive",
          },
        };
      }),
    });
  }

  const whereConditions = {
    AND: andConditions,
  };

  const [result, total] = await Promise.all([
    prisma.notification.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.notification.count({ where: whereConditions }),
  ]);

  return {
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total,
    },
    data: result,
  };
};

// -------------------------------------- MARK NOTIFICATIONS AS READ --------------------
const markNotificationsAsRead = async (user: TAuthUser, ids: string[]) => {
  const result = await prisma.notification.updateMany({
    where: {
      id: {
        in: ids,
      },
      user_id: user.id,
    },
    data: {
      is_read: true,
    },
  });
  return result;
};

export const NotificationServices = {
  getAllNotifications,
  markNotificationsAsRead,
};
