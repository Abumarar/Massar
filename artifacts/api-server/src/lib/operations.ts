import { count, desc, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { db, driverDocumentsTable, driversTable, operationsActivityTable, operationsRidesTable } from "@workspace/db";

type ComplianceRequirement = {
  type: "driver_license" | "national_id" | "vehicle_registration" | "compulsory_insurance" | "vehicle_inspection" | "ltrc_permit" | "additional_passenger_insurance";
  title: string;
  description: string;
  required: boolean;
  sourceLabel: string;
};
type DriverVehicle = { makeModel: string; color: string; plate: string; seats: number };
type DriverDocument = typeof driverDocumentsTable.$inferSelect;
type OperationsActivity = typeof operationsActivityTable.$inferSelect;
type OperationsRide = typeof operationsRidesTable.$inferSelect;
type OperationsSummary = {
  pendingApplications: number;
  inReview: number;
  approvedDrivers: number;
  activeRides: number;
  documentsExpiringSoon: number;
  openIssues: number;
};
type DriverDetail = ReturnType<typeof toDriver> & { documents: Array<{
  id: string;
  driverId: string;
  type: ComplianceRequirement["type"];
  fileName: string;
  fileUri: string | null;
  status: "pending" | "approved" | "rejected";
  expiresAt: string | null;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewNote: string | null;
}> };

export const complianceRequirements: ComplianceRequirement[] = [
  {
    type: "driver_license",
    title: "Valid driver licence",
    description: "Current licence matching the vehicle class used for passenger transport.",
    required: true,
    sourceLabel: "DVLD / driver licensing record",
  },
  {
    type: "national_id",
    title: "National ID",
    description: "Identity document used to verify the applicant and account holder.",
    required: true,
    sourceLabel: "Identity verification",
  },
  {
    type: "vehicle_registration",
    title: "Vehicle registration",
    description: "Current vehicle licence and registration record.",
    required: true,
    sourceLabel: "DVLD / vehicle licensing record",
  },
  {
    type: "compulsory_insurance",
    title: "Compulsory vehicle insurance",
    description: "Valid compulsory insurance for the registered vehicle.",
    required: true,
    sourceLabel: "Jordan insurance requirement",
  },
  {
    type: "vehicle_inspection",
    title: "Vehicle inspection / fitness",
    description: "Current inspection evidence showing the vehicle is fit for operation.",
    required: true,
    sourceLabel: "DVLD inspection record",
  },
  {
    type: "ltrc_permit",
    title: "LTRC / smart transport permit",
    description: "Operator or vehicle authorization required for the approved service model.",
    required: true,
    sourceLabel: "Land Transport Regulatory Commission",
  },
  {
    type: "additional_passenger_insurance",
    title: "Additional passenger cover",
    description: "Additional coverage required by the approved smart transport operating arrangement.",
    required: true,
    sourceLabel: "Smart applications operating instructions",
  },
];

const seedDocuments = (driverId: string, approved: boolean): Array<typeof driverDocumentsTable.$inferInsert> =>
  complianceRequirements.map((requirement, index) => ({
    id: `${driverId}-doc-${index + 1}`,
    driverId,
    type: requirement.type,
    fileName: `${requirement.type}.jpg`,
    fileUri: null,
    status: approved ? "approved" : "pending",
    expiresAt: index === 3 ? "2026-12-31" : "2027-06-30",
    submittedAt: new Date(),
  }));

let operationsSeedPromise: Promise<void> | null = null;

async function seedOperations(): Promise<void> {
  const [driverCount] = await db.select({ value: count() }).from(driversTable);
  if (Number(driverCount.value) === 0) {
    const now = new Date();
    await db.insert(driversTable).values([
      {
        id: "driver-ahmad",
        fullName: "Ahmad Al-Khatib",
        phone: "+962 7 9012 4455",
        nationalIdLast4: "3812",
        route: "Jerash → Amman",
        status: "pending",
        vehicleMakeModel: "Toyota Corolla 2020",
        vehicleColor: "White",
        vehiclePlate: "32-4821",
        vehicleSeats: 4,
        submittedAt: now,
      },
      {
        id: "driver-rana",
        fullName: "Rana Al-Masri",
        phone: "+962 7 8876 1102",
        nationalIdLast4: "9044",
        route: "Jerash → Amman",
        status: "in_review",
        vehicleMakeModel: "Kia Cerato 2021",
        vehicleColor: "Silver",
        vehiclePlate: "21-7730",
        vehicleSeats: 4,
        submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8),
      },
      {
        id: "driver-samer",
        fullName: "Samer Haddad",
        phone: "+962 7 7991 0033",
        nationalIdLast4: "2771",
        route: "Amman → Jerash",
        status: "approved",
        vehicleMakeModel: "Hyundai Elantra 2019",
        vehicleColor: "Black",
        vehiclePlate: "18-2294",
        vehicleSeats: 4,
        submittedAt: new Date(now.getTime() - 1000 * 60 * 60 * 48),
        reviewedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
        reviewNote: "All required records reviewed.",
      },
    ]);
    await db.insert(driverDocumentsTable).values([
      ...seedDocuments("driver-ahmad", false),
      ...seedDocuments("driver-rana", false).map((document, index) =>
        index < 4 ? { ...document, status: "approved" } : document,
      ),
      ...seedDocuments("driver-samer", true),
    ]);
  }

  const [rideCount] = await db.select({ value: count() }).from(operationsRidesTable);
  if (Number(rideCount.value) === 0) {
    const now = new Date();
    await db.insert(operationsRidesTable).values([
      {
        id: "ride-1001",
        route: "Jerash → Amman",
        departureAt: new Date(now.getTime() + 1000 * 60 * 35),
        driverName: "Samer Haddad",
        passengerCount: 3,
        status: "boarding",
        fareJod: 9,
        issue: null,
      },
      {
        id: "ride-1002",
        route: "Amman → Jerash",
        departureAt: new Date(now.getTime() + 1000 * 60 * 90),
        driverName: "Ahmad Al-Khatib",
        passengerCount: 2,
        status: "scheduled",
        fareJod: 6,
        issue: null,
      },
      {
        id: "ride-1003",
        route: "Jerash → Amman",
        departureAt: new Date(now.getTime() - 1000 * 60 * 20),
        driverName: "Rana Al-Masri",
        passengerCount: 1,
        status: "issue",
        fareJod: 3,
        issue: "Passenger pickup confirmation is missing.",
      },
    ]);
  }

  const [activityCount] = await db.select({ value: count() }).from(operationsActivityTable);
  if (Number(activityCount.value) === 0) {
    await db.insert(operationsActivityTable).values([
      { id: "activity-1", actor: "Operations", action: "received an application from", subject: "Ahmad Al-Khatib", createdAt: new Date() },
      { id: "activity-2", actor: "Compliance", action: "approved the document set for", subject: "Samer Haddad", createdAt: new Date(Date.now() - 1000 * 60 * 45) },
      { id: "activity-3", actor: "Dispatch", action: "flagged a pickup issue on", subject: "Ride #1003", createdAt: new Date(Date.now() - 1000 * 60 * 90) },
    ]);
  }
}

export function ensureOperationsSeeded(): Promise<void> {
  if (operationsSeedPromise) return operationsSeedPromise;
  operationsSeedPromise = seedOperations().catch((error) => {
    operationsSeedPromise = null;
    throw error;
  });
  return operationsSeedPromise;
}

type DriverRow = typeof driversTable.$inferSelect;

function toVehicle(row: DriverRow): DriverVehicle {
  return {
    makeModel: row.vehicleMakeModel,
    color: row.vehicleColor,
    plate: row.vehiclePlate,
    seats: row.vehicleSeats,
  };
}

export function toDriver(row: DriverRow, documents: DriverDocument[]) {
  const driverDocuments = documents.filter((document) => document.driverId === row.id);
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    nationalIdLast4: row.nationalIdLast4,
    route: row.route,
    status: row.status as "pending" | "in_review" | "approved" | "rejected" | "suspended",
    vehicle: toVehicle(row),
    submittedAt: row.submittedAt,
    reviewedAt: row.reviewedAt,
    reviewNote: row.reviewNote,
    documentCount: driverDocuments.length,
    approvedDocumentCount: driverDocuments.filter((document) => document.status === "approved").length,
  };
}

export async function listDriversWithDocuments() {
  const [drivers, documents] = await Promise.all([
    db.select().from(driversTable).orderBy(desc(driversTable.submittedAt)),
    db.select().from(driverDocumentsTable),
  ]);
  return { drivers, documents };
}

export async function getDriverDetail(driverId: string): Promise<DriverDetail | null> {
  const [row] = await db.select().from(driversTable).where(eq(driversTable.id, driverId));
  if (!row) return null;
  const documents = await db.select().from(driverDocumentsTable).where(eq(driverDocumentsTable.driverId, driverId));
  return { ...toDriver(row, documents), documents: documents.map((document) => ({
    id: document.id,
    driverId: document.driverId,
    type: document.type as (typeof complianceRequirements)[number]["type"],
    fileName: document.fileName,
    fileUri: document.fileUri,
    status: document.status as "pending" | "approved" | "rejected",
    expiresAt: document.expiresAt,
    submittedAt: document.submittedAt,
    reviewedAt: document.reviewedAt,
    reviewNote: document.reviewNote,
  })) };
}

export async function addActivity(actor: string, action: string, subject: string) {
  await db.insert(operationsActivityTable).values({
    id: randomUUID(),
    actor,
    action,
    subject,
  });
}

export async function getSummary(): Promise<OperationsSummary> {
  const { drivers, documents } = await listDriversWithDocuments();
  const rides = await db.select().from(operationsRidesTable);
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  return {
    pendingApplications: drivers.filter((driver) => driver.status === "pending").length,
    inReview: drivers.filter((driver) => driver.status === "in_review").length,
    approvedDrivers: drivers.filter((driver) => driver.status === "approved").length,
    activeRides: rides.filter((ride) => ["boarding", "en_route"].includes(ride.status)).length,
    documentsExpiringSoon: documents.filter((document) => document.expiresAt && new Date(document.expiresAt) <= soon).length,
    openIssues: rides.filter((ride) => ride.status === "issue").length,
  };
}

export function toOperationsRide(row: OperationsRide) {
  return {
    id: row.id,
    route: row.route,
    departureAt: row.departureAt,
    driverName: row.driverName,
    passengerCount: row.passengerCount,
    status: row.status as "scheduled" | "boarding" | "en_route" | "completed" | "issue",
    fareJod: row.fareJod,
    issue: row.issue,
  };
}

export function toOperationsActivity(row: OperationsActivity) {
  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    subject: row.subject,
    createdAt: row.createdAt,
  };
}