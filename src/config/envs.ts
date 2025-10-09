const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  PORT,
} = process.env;

if (
  !DB_HOST ||
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_NAME ||
  !DB_PORT ||
  !NODE_ENV ||
  !PORT
) {
  throw new Error("Missing environment variables");
}

export {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  NODE_ENV,
  PORT,
};
