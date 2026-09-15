import { config } from "./config";
import { createApp } from "./app";
import { pool } from "./db/pool";
import { logger } from "./middleware/requestLogger";

const app = createApp();

const server = app.listen(config.port, () => {
  logger.info(`coligo api listening on :${config.port} (${config.nodeEnv})`);
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "shutting down");
  server.close();
  await pool.end().catch(() => undefined);
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
