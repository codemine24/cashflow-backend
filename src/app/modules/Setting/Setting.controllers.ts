import catchAsync from "../../shared/catch-async";
import sendResponse from "../../shared/send-response";
import httpStatus from "http-status";
import { SettingServices } from "./Setting.services";

// -------------------------------------- CREATE SETTING -----------------------------------
const createSetting = catchAsync(async (req, res) => {
  const result = await SettingServices.createSetting(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Setting created successfully",
    data: result,
  });
});

// -------------------------------------- GET SETTINGS -------------------------------------
const getSettings = catchAsync(async (req, res) => {
  const result = await SettingServices.getSettings();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Settings retrieved successfully",
    data: result,
  });
});

// -------------------------------------- GET SETTING BY ID --------------------------------
const getSettingById = catchAsync(async (req, res) => {
  const result = await SettingServices.getSettingById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting retrieved successfully",
    data: result,
  });
});

// -------------------------------------- UPDATE SETTING -----------------------------------
const updateSetting = catchAsync(async (req, res) => {
  const result = await SettingServices.updateSetting(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting updated successfully",
    data: result,
  });
});

// -------------------------------------- DELETE SETTING -----------------------------------
const deleteSetting = catchAsync(async (req, res) => {
  const result = await SettingServices.deleteSetting(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Setting deleted successfully",
    data: result,
  });
});

export const SettingControllers = {
  createSetting,
  getSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
};
