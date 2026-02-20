// async function SMSSender(contactNumber: string, body: string) {
//   try {
//     const message = await client.messages.create({
//       body: body,
//       from: config.twilio_phone_number,
//       to: `+88${contactNumber}`,
//     });
//     return {
//       success: true,
//       message: `SMS sent successfully: ${message.sid}`,
//     };
//   } catch (error) {
//     return {
//       success: false,
//       message: `Failed to send SMS: ${error}`,
//     };
//   }
// }

export const OTPGenerator = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const OTPVerifier = async (
  userInputOtp: number,
  storedOtp: number,
  expirationTime: number,
) => {
  const currentTime = new Date().getTime();

  if (currentTime > expirationTime) {
    return { success: false, message: "OTP has expired" };
  }

  if (userInputOtp === storedOtp) {
    return { success: true, message: "OTP verified successfully" };
  } else {
    return { success: false, message: "Invalid OTP" };
  }
};
