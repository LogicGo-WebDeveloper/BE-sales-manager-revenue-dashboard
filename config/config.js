import Joi from "joi";
import dotenv from "dotenv";
import enums from "./enum.config.js";
import { parseJoiError } from "../helper/api-response.helper.js";

const nodeEnv = enums.nodeEnvEnums.PRODUCTION;

dotenv.config({
  path: nodeEnv === enums.nodeEnvEnums.DEVELOPMENT ? ".env.dev" : ".env",
});

console.log(
  `Loaded env file: ${
    nodeEnv === enums.nodeEnvEnums.DEVELOPMENT ? ".env.dev" : ".env"
  }`
);

const envVarsSchema = Joi.object({
  PORT: Joi.number().required(),
  MONGODB_URL: Joi.string().trim().required(),
  CLIENT_URL: Joi.string().trim().required(),
  BASE_URL: Joi.string().trim().required(),
  FRONTEND_URL: Joi.string().trim().optional(),
  SERVER_URL: Joi.string().trim().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  JWT_TOKEN_EXPIRES_IN: Joi.string().optional(),
  OTP_EXPIRY_DURATION_SECONDS: Joi.number().optional(),
  APP_NAME: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USERNAME: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().required(),

  DIGITAL_OCEAN_DIRNAME: Joi.string().required(),
  DIGITAL_OCEAN_SPACES_ACCESS_KEY: Joi.string().required(),
  DIGITAL_OCEAN_SPACES_SECRET_KEY: Joi.string().required(),
  DIGITAL_OCEAN_SPACES_REGION: Joi.string().required(),
  DIGITAL_OCEAN_SPACES_BASE_URL: Joi.string().required(),
  DIGITAL_OCEAN_BUCKET_NAME: Joi.string().required(),
  DIGITAL_OCEAN_ENDPOINT: Joi.string().required(),

  SUPPORT_EMAIL: Joi.string().optional(),
  SUPPORT_PASSWORD: Joi.string().optional(),
})
  .unknown()
  .prefs({ errors: { label: "key" } });

const { value: envVars, error } = envVarsSchema.validate(process.env, {
  abortEarly: false,
});

if (error) {
  const parsedError = parseJoiError(error);
  console.log("Config Error: ", parsedError);
  throw new Error("Invalid environment variables");
}

export default {
  port: envVars.PORT,
  appName: envVars.APP_NAME,
  nodeEnv,
  mongodb: {
    url: envVars.MONGODB_URL,
    options: {},
  },
  base_url: envVars.BASE_URL,
  frontendUrl: envVars.FRONTEND_URL,
  server_url: envVars.SERVER_URL,
  client_url: envVars.CLIENT_URL,
  jwt: {
    secretKey: envVars.JWT_SECRET_KEY,
    expiresIn: envVars.JWT_TOKEN_EXPIRES_IN || "7d",
  },
  otpExpiryDurationSeconds: envVars.OTP_EXPIRY_DURATION_SECONDS || 300,
  cloud: {
    digitalocean: {
      rootDirname: envVars.DIGITAL_OCEAN_DIRNAME,
      region: envVars.DIGITAL_OCEAN_SPACES_REGION,
      baseUrl: envVars.DIGITAL_OCEAN_SPACES_BASE_URL,
      bucketName: envVars.DIGITAL_OCEAN_BUCKET_NAME,
      endpoint: envVars.DIGITAL_OCEAN_ENDPOINT,
      credentials: {
        accessKeyId: envVars.DIGITAL_OCEAN_SPACES_ACCESS_KEY,
        secretAccessKey: envVars.DIGITAL_OCEAN_SPACES_SECRET_KEY,
      },
    },
  },
  nodemailer: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    auth: {
      user: envVars.SMTP_USERNAME,
      pass: envVars.SMTP_PASSWORD,
    },
    supportEmail: envVars.SUPPORT_EMAIL,
    supportPassword: envVars.SUPPORT_PASSWORD,
  },
  email: {
    from: envVars.EMAIL_FROM,
  },
  serverBaseUrl: envVars.SERVER_BASE_URL,
};
