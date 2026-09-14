import { db } from "@workspace/db";
async function run() {
  try {
    const requests = await db.query.rideRequestsTable.findMany({
        with: {
          passenger: true,
          matchedCaptain: {
            with: {
              user: true,
              vehicle: true,
            }
          }
        },
      });
    console.log("Success");
  } catch (err) {
    console.error(err);
  }
}
run();
