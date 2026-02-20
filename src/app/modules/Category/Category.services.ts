import { prisma } from "../../shared/prisma";
import {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./Category.interfaces";
import { TAuthUser } from "../../interfaces/common";
import queryValidator from "../../utils/query-validator";
import {
  categoryQueryValidationConfig,
  categorySearchableFields,
} from "./Category.utils";
import paginationMaker from "../../utils/pagination-maker";
import { Prisma } from "../../../generated/prisma/client";

const createCategory = async (
  user: TAuthUser,
  payload: CreateCategoryPayload,
) => {
  const result = await prisma.category.create({
    data: {
      ...payload,
      user_id: user.id,
    },
  });
  return result;
};

const getAllCategories = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const { search_term, page, limit, sort_by, sort_order } = query;

  if (sort_by)
    queryValidator(categoryQueryValidationConfig, "sort_by", sort_by);
  if (sort_order)
    queryValidator(categoryQueryValidationConfig, "sort_order", sort_order);

  const { pageNumber, limitNumber, skip, sortWith, sortSequence } =
    paginationMaker({
      page,
      limit,
      sort_by,
      sort_order,
    });

  const andConditions: Prisma.CategoryWhereInput[] = [{ user_id: user.id }];

  if (search_term) {
    andConditions.push({
      OR: categorySearchableFields.map((field) => {
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
    prisma.category.findMany({
      where: whereConditions,
      skip: skip,
      take: limitNumber,
      orderBy: {
        [sortWith]: sortSequence,
      },
    }),
    prisma.category.count({ where: whereConditions }),
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

const getCategoryById = async (user: TAuthUser, id: string) => {
  const result = await prisma.category.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });
  return result;
};

const updateCategory = async (
  user: TAuthUser,
  id: string,
  payload: UpdateCategoryPayload,
) => {
  await prisma.category.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });

  const result = await prisma.category.update({
    where: {
      id,
    },
    data: payload,
  });
  return result;
};

const deleteCategory = async (user: TAuthUser, id: string) => {
  await prisma.category.findFirstOrThrow({
    where: {
      id,
      user_id: user.id,
    },
  });

  const result = await prisma.category.delete({
    where: {
      id,
    },
  });
  return result;
};

export const CategoryServices = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
