import config from "../../config";

export const shareGoalTemplate = (data: {
  receiverName: string;
  senderName: string;
  goalName: string;
  role: string;
}) => {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Goal Shared With You</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333333;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <tr>
                <td style="padding: 20px 0; text-align: center; background-color: #4f46e5;">
                    <img src="${config.logo_url}" alt="${
                      config.app_name
                    } Logo" style="max-width: 200px; height: auto;">
                </td>
                </tr>

                <!-- Main Content -->
                <tr>
                <td style="background-color: #ffffff; padding: 40px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td>
                        <h1 style="margin: 0 0 20px 0; font-size: 24px; line-height: 30px; color: #333333; font-weight: bold;">Hello ${
                          data.receiverName
                        },</h1>
                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;"><strong>${
                          data.senderName
                        }</strong> has shared a goal with you on <strong>${
                          config.app_name
                        }</strong>.</p>

                        <!-- Share Details Box -->
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px; border: 1px solid #dddddd; border-radius: 5px;">
                            <tr>
                            <td style="padding: 20px; background-color: #f9fafb;">
                                <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Goal Name:</strong> <span style="color: #4f46e5;">${
                                  data.goalName
                                }</span></p>
                                <p style="margin: 0; font-size: 16px;"><strong>Your Role:</strong> <span style="color: #4f46e5;">${
                                  data.role
                                }</span></p>
                            </td>
                            </tr>
                        </table>

                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">You can now track and contribute to this goal directly from your dashboard.</p>

                        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">If you have any questions, feel free to contact our support team.</p>

                        <p style="margin: 0; font-size: 16px; line-height: 24px;">Best regards,<br>The ${
                          config.app_name
                        } Team</p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>

                <!-- Footer -->
                <tr>
                <td style="background-color: #f4f4f4; padding: 20px 30px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="text-align: center; padding-bottom: 10px; color: #666666; font-size: 14px;">
                        <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} ${
                          config.app_name
                        }. All rights reserved.</p>
                        <p style="margin: 0;">${config.company_address}</p>
                        </td>
                    </tr>
                    </table>
                </td>
                </tr>
            </table>
        </body>
    </html>

        `;
};
