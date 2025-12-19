const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  PORT,
  RABBITMQ_URL,
  GATEWAY_SECRET,
} = process.env;

if (
  !DB_HOST ||
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_NAME ||
  !DB_PORT ||
  !NODE_ENV ||
  !PORT ||
  !RABBITMQ_URL ||
  !GATEWAY_SECRET
) {
  throw new Error('Missing environment variables');
}

export {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  PORT,
  RABBITMQ_URL,
  GATEWAY_SECRET,
};
