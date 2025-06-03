import config from "../config/config.js";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const sendEmail = async ({
  from = config.email.from,
  to,
  subject,
  templateVariables,
  filename,
}) => {
  try {
    // Read html template
    let html = fs.readFileSync(
      path.join(process.cwd(), "html-templates", filename),
      "utf-8"
    );

    // Replace template variables with their values
    Object.keys(templateVariables).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      html = html.replace(regex, templateVariables[key]);
    });

    // create transporter
    const mailTransport = nodemailer.createTransport({
      host: config.nodemailer.host,
      port: config.nodemailer.port,
      secure: false,
      auth: {
        user: config.nodemailer.auth.user,
        pass: config.nodemailer.auth.pass,
      },
    });

    // Send email
    const result = mailTransport.sendMail(
      {
        from: from,
        to,
        subject,
        html,
      },
      async (error, info) => {
        if (error) {
          return error;
        } else {
          console.log(`Email successfully sent to ${info.accepted.join(", ")}`);
          return info;
        }
      }
    );

    return result;
  } catch (error) {
    console.log(error);
  }
};

const sendOTPEmail = async ({ email, otp, otpExpiresAt }) => {
  return sendEmail({
    to: email,
    subject: "OTP verification",
    templateVariables: {
      otp: otp,
      otpExpiresAt: otpExpiresAt,
    },
    filename: "verifyOTP.html",
  });
};

export default {
  sendOTPEmail,
  sendEmail,
};
