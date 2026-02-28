import { prisma } from "../../shared/prisma";
import {
  CreateSettingPayload,
  UpdateSettingPayload,
} from "./Setting.interfaces";

// -------------------------------------- CREATE SETTING -----------------------------------
const createSetting = async (payload: CreateSettingPayload) => {
  const result = await prisma.settings.create({
    data: payload,
  });
  return result;
};

// -------------------------------------- GET SETTINGS -------------------------------------
const getSettings = async () => {
  const result = await prisma.settings.findMany();
  return result;
};

// -------------------------------------- GET SETTING BY ID --------------------------------
const getSettingById = async (id: string) => {
  const result = await prisma.settings.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

// -------------------------------------- UPDATE SETTING -----------------------------------
const updateSetting = async (id: string, payload: UpdateSettingPayload) => {
  await prisma.settings.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.settings.update({
    where: { id },
    data: payload,
  });

  return result;
};

// -------------------------------------- DELETE SETTING -----------------------------------
const deleteSetting = async (id: string) => {
  await prisma.settings.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.settings.delete({
    where: { id },
  });

  return result;
};

export const SettingServices = {
  createSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
};
