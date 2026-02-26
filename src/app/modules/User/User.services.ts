import { TAuthUser } from "../../interfaces/common";
import { TFile } from "../../interfaces/file";
import sharp from "sharp";
import supabase from "../../shared/supabase";
import config from "../../../config";
import CustomizedError from "../../error/customized-error";
import httpStatus from "http-status";
import { prisma } from "../../shared/prisma";

// -------------------------------------- UPDATE PROFILE ------------------------------------
const updateProfile = async (
  user: TAuthUser,
  payload: Record<string, any>,
  file: TFile | undefined,
) => {
  let avatar;

  if (file) {
    const metadata = await sharp(file.buffer).metadata();
    const fileName = `${Date.now()}_${file.originalname}`;
    const { data } = await supabase.storage
      .from(config.user_bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (!data?.id) {
      throw new CustomizedError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to upload profile picture",
      );
    }

    const avatarData = {
      user_id: user.id,
      name: file.originalname,
      alt_text: file.originalname,
      type: file.mimetype,
      size: file.size,
      width: metadata.width || 0,
      height: metadata.height || 0,
      path: data.path,
      bucket_id: data.id,
      bucket_name: config.user_bucket,
    };

    avatar = await prisma.file.create({
      data: avatarData,
    });

    console.log;

    const userInfo = await prisma.user.findUniqueOrThrow({
      where: {
        id: user?.id,
      },
    });

    if (userInfo.avatar) {
      const profilePic = await prisma.file.findFirst({
        where: {
          path: userInfo.avatar,
        },
      });
      if (profilePic) {
        await supabase.storage
          .from(config.user_bucket)
          .remove([profilePic.path]);
        await prisma.file.delete({
          where: {
            id: profilePic.id,
          },
        });
      }
    }
  }

  if (avatar?.path) {
    payload.profile_pic = avatar.path;
  }

  const result = prisma.user.update({
    where: {
      id: user?.id,
    },
    data: payload,
  });

  return result;
};

export const UserServices = {
  updateProfile,
};
