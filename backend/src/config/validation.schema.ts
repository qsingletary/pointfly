import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ADMIN_API_KEY: Joi.string().required(),
  ODDS_API_KEY: Joi.string().required(),
  ODDS_API_SPORT: Joi.string().default('basketball_nba'),
  GOOGLE_CLIENT_ID: Joi.string().required(),
});
