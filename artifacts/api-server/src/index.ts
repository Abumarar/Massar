import app from "./app";
import { logger } from "./lib/logger";
import { createServer } from "http";
import { initIO } from "./lib/socket";

import { env } from "./lib/env";

const port = Number(env.PORT);

const server = createServer(app);
initIO(server);

server.listen(port, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
