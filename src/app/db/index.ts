
import bcrypt from "bcrypt";
import config from "../../config";
import { UserRole } from "../../generated/prisma/enums";
import { prisma } from "../shared/prisma";

const superAdmin = {
  name: config.super_admin_name,
  email: config.super_admin_email,
  contact_number: config.super_admin_contact_number,
  role: UserRole.SUPER_ADMIN,
};

export const seedSuperAdmin = async () => {
  const isExistSuperAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.SUPER_ADMIN,
    },
  });
  const hashedPassword = await bcrypt.hash(
    config.super_admin_password,
    Number(config.salt_rounds)
  );
  if (!isExistSuperAdmin?.id) {
    await prisma.user.create({
      data: {
        ...superAdmin,
        password: hashedPassword,
      },
    });
  }
};
