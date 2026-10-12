import app from "./app";
import { logger } from "./lib/logger";
import { createServer } from "http";
import { initIO } from "./lib/socket";
import { seedDefaultRoutesIfEmpty } from "./routes/routes";
import { seedDefaultAdminIfMissing } from "./routes/auth";
import { seedDefaultCaptainIfMissing } from "./routes/captains";

import { env } from "./lib/env";

const port = Number(env.PORT);

const server = createServer(app);
initIO(server);

server.listen(port, async (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Ensure default routes, admin, and demo captain exist in DB
  try {
    await seedDefaultRoutesIfEmpty();
    await seedDefaultAdminIfMissing();
    await seedDefaultCaptainIfMissing();
  } catch (seedErr) {
    logger.error({ seedErr }, "Error during initial DB seeding");
  }
});
