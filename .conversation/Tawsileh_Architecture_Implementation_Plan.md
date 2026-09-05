# Tawsileh Intercity
## Architecture & Implementation Plan

**Version:** 0.1  
**Scope:** Prototype / MVP for Jerash ↔ Amman  
**Recommended architecture:** Modular monolith with Flutter mobile clients, NestJS API, PostgreSQL/PostGIS, and Socket.IO

---

## 1. Product goal

Tawsileh matches passengers and captains travelling in the same intercity direction so that a vehicle's cost and available seats can be shared. The first release should prove the matching loop—not compete with a full ride-hailing platform:

1. Passenger selects pickup and destination.
2. Backend finds route-compatible captains.
3. Passenger submits a request.
4. Captain accepts.
5. Both sides see the trip lifecycle and relevant location updates.
6. The trip completes, seats are updated, and the passenger rates the captain.

The first supported route is:

- Jerash → Amman
- Amman → Jerash

The route catalogue must be data-driven so more city pairs can be added without changing matching code.

## 2. MVP boundary

### Included

- One Flutter application with passenger and captain modes
- Phone authentication with OTP abstraction
- Arabic and English, with RTL support
- Passenger pickup and destination selection
- Captain vehicle, route, radius, seat, and online/offline configuration
- Route-based matching with PostGIS
- Ride request, captain acceptance, cancellation, and trip lifecycle
- Basic live captain location during an accepted trip
- Push notifications
- Trip history and one-way rating
- Small admin dashboard for captain approval, routes, users, and active trips

### Deliberately deferred

- Payments, wallet, subscriptions, promotions, referrals
- Multiple cities in the UI
- Dynamic surge pricing
- Advanced multi-stop route optimization
- AI matching
- Complex driver incentives
- Corporate accounts and loyalty
- Microservices

The first prototype should use a simple, explainable matching model and a simple fare policy. It should not attempt to solve nationwide transportation before the Jerash–Amman loop is validated.

## 3. Architecture

```text
┌──────────────────────────────┐
│ Flutter mobile app           │
│ Passenger + Captain modes    │
└──────────────┬───────────────┘
               │ HTTPS REST + Socket.IO
┌──────────────▼───────────────┐
│ NestJS modular monolith      │
│                              │
│ Auth  Users  Captains        │
│ Routes  Matching  Requests   │
│ Trips  Locations  Ratings    │
│ Notifications  Admin         │
└───────┬──────────┬───────────┘
        │          │
┌───────▼──────┐ ┌─▼─────────────┐
│ PostgreSQL   │ │ External       │
│ + PostGIS   │ │ providers       │
│ source of   │ │ Maps / OTP /    │
│ truth       │ │ FCM              │
└──────────────┘ └─────────────────┘

Optional later:
Redis for online state, location cache, rate limits, and Socket.IO scaling.
```

### Why this shape

- A modular monolith keeps deployment, debugging, and transactions simple.
- Modules still enforce clear business boundaries and can later be extracted if scale requires it.
- PostgreSQL/PostGIS is the authoritative store for users, routes, requests, trips, and ratings.
- Real-time state is initially persisted in PostgreSQL and broadcast through Socket.IO; Redis is an optimization, not an MVP dependency.
- The mobile app uses one codebase while keeping passenger and captain journeys isolated by role.

## 4. Repository structure

```text
tawsileh/
├── mobile/                    # Flutter + Dart
│   ├── lib/core/
│   ├── lib/features/auth/
│   ├── lib/features/passenger/
│   ├── lib/features/captain/
│   ├── lib/features/ride_requests/
│   ├── lib/features/trips/
│   ├── lib/features/profile/
│   └── test/
├── backend/                   # NestJS + TypeScript
│   ├── src/modules/
│   ├── src/common/
│   ├── src/database/
│   └── test/
├── admin/                     # Next.js + TypeScript
├── packages/
│   └── contracts/             # Generated API/event types if useful
├── docs/
│   ├── architecture/
│   ├── api/
│   └── database/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 5. Backend module boundaries

### Auth

Owns phone/OTP verification, access and refresh tokens, logout, and role guards.

### Users

Owns the base user profile, status, role, language, and account suspension.

### Captains

Owns captain approval, license/verification data, vehicle association, online status, and captain preferences.

### Routes

Owns supported route definitions, direction, canonical geometry, route status, corridor limits, and prototype fare configuration.

### Ride Requests

Owns passenger intent before it becomes a trip: pickup, destination, requested seats, request status, expiry, and selected match.

### Matching

Owns candidate filtering, geographic compatibility, score calculation, ranking, and match explanations. It should be a pure domain service wherever possible so it can be unit-tested without HTTP or Flutter.

### Trips

Owns trip creation, passenger allocation, state transitions, seat reservations, cancellation, start, completion, and history.

### Locations

Owns captain location ingestion, privacy filtering, latest-location lookup, and retention. Exact live location is only available to relevant passengers during the pickup/active-trip window.

### Notifications

Owns device tokens, push notification templates, and event-to-notification mapping. Push is an auxiliary channel; the backend remains authoritative.

### Ratings

Owns one rating per completed passenger-trip relationship and captain aggregate rating updates.

### Admin

Owns protected operational views and actions. Admin actions call the same domain services as the public API instead of writing tables directly.

## 6. Data model

Use UUID primary keys and UTC timestamps. Store coordinates as PostGIS `geography(Point, 4326)` and route geometry as `geography(LineString, 4326)` or a geometry type with an explicit SRID policy.

### Core tables

```text
users
  id, role, full_name, phone, email, password_hash
  status, preferred_language, created_at, updated_at

captains
  id, user_id, verification_status, license_number
  rating_average, completed_trip_count, created_at, updated_at

vehicles
  id, captain_id, make, model, year, color
  license_plate, capacity, created_at, updated_at

routes
  id, origin_city, destination_city, direction
  geometry, max_corridor_km, base_fare_jod, status
  created_at, updated_at

captain_routes
  id, captain_id, route_id, pickup_radius_km
  available_seats, is_online, updated_at

ride_requests
  id, passenger_id, route_id
  pickup_point, destination_point, requested_seats
  status, expires_at, created_at, updated_at

trips
  id, captain_id, route_id, status
  capacity, reserved_seats, started_at, completed_at
  created_at, updated_at

trip_passengers
  id, trip_id, passenger_id, ride_request_id
  pickup_point, destination_point, seats
  fare_jod, status, created_at, updated_at

captain_locations
  id, captain_id, trip_id, point
  accuracy_m, recorded_at

ratings
  id, trip_id, from_user_id, to_user_id
  rating, comment, created_at

device_tokens
  id, user_id, token, platform, last_seen_at

notifications
  id, user_id, type, payload, read_at, created_at
```

### Important constraints

- `users.phone` is unique.
- A user has one role in the prototype.
- A captain can have at most one active vehicle.
- A captain can have at most one active route configuration per direction.
- Vehicle capacity is between 1 and 4 for the prototype.
- `available_seats` cannot be negative.
- Only approved captains can go online.
- A passenger cannot have two active ride requests or active trip memberships.
- A captain cannot accept a request unless a transaction reserves the requested seats.
- A rating can be submitted once per completed passenger-trip relationship.
- Every state-changing action records actor, timestamp, and previous/new status in an audit log.

Add GiST indexes for route geometry and point columns, plus indexes on active status, route direction, captain online state, and trip status.

## 7. Matching engine v1

The matching engine is the product's most important technical component. Keep it deterministic, explainable, and versioned.

### Candidate pipeline

```text
1. Resolve the passenger journey to a supported route/direction.
2. Filter captain route configurations with the same direction.
3. Filter approved, online captains.
4. Filter active trips/configurations with enough seats.
5. Check pickup point within captain pickup radius.
6. Check destination point within route corridor.
7. Verify pickup occurs before destination along the directed route.
8. Estimate detour for the candidate.
9. Reject candidates above configured detour limits.
10. Normalize component scores and rank candidates.
```

### Geographic rules

- `ST_DWithin(route.geometry, pickup_point, pickup_radius_m)` checks pickup corridor eligibility.
- Destination is checked against the route's maximum corridor, with a route-specific limit.
- Use `ST_LineLocatePoint` on the directed route geometry to calculate approximate journey order. A passenger whose destination projects before their pickup is not a match for that direction.
- Use road distance/duration for the top few candidates when needed; do not call a paid routing API for every database candidate.
- Store the route geometry in the intended direction. The reverse direction is a separate route record.

### Score

Start with configurable weights:

```text
route compatibility       40%
pickup distance            25%
destination distance      20%
available seats            10%
detour                      5%
```

The result should include both `match_score` and component values so the admin and future experiments can explain why a candidate ranked highly. Do not present the score itself to passengers in the MVP; present useful facts such as pickup distance, seats, ETA, and estimated fare.

### Concurrency

Captain acceptance must use a database transaction with row-level locking:

1. Lock the captain route/trip capacity row.
2. Re-check captain status, request status, and remaining seats.
3. Reserve seats.
4. Create or attach the passenger to the trip.
5. Transition the request and trip atomically.
6. Emit events only after commit.

This prevents two captains or two passengers from overselling the same seats.

### Matching interface

```ts
type MatchCandidate = {
  captainId: string;
  routeId: string;
  pickupDistanceKm: number;
  destinationDistanceKm: number;
  detourKm: number;
  availableSeats: number;
  estimatedFareJod: number;
  score: number;
};

interface MatchingService {
  findMatches(requestId: string): Promise<MatchCandidate[]>;
}
```

## 8. Pricing decision for the prototype

The document's example uses a 12 JOD base trip divided by occupied passenger units. That is useful for demonstrating affordability, but it creates a product decision: a passenger's fare could change when another passenger joins.

Recommended MVP policy:

- Calculate a provisional fare when the request is created.
- Lock the passenger's fare when the captain accepts the request.
- Use fixed tiers for the prototype: 12 / 6 / 4 / 3 JOD for 1 / 2 / 3 / 4 occupied units.
- Clearly label the amount as an estimated prototype fare until payment is implemented.
- Keep the pricing service behind an interface so route-specific formulas can replace it later.

## 9. Trip state machine

The backend owns all transitions:

```text
SEARCHING
  → REQUESTED
  → ACCEPTED
  → CAPTAIN_ARRIVING
  → PICKED_UP
  → IN_PROGRESS
  → COMPLETED

Cancellation is allowed only from explicitly configured states.
```

Recommended transition rules:

- Passenger creates a request: `SEARCHING` → `REQUESTED`
- Captain accepts: `REQUESTED` → `ACCEPTED`
- Captain starts navigation: `ACCEPTED` → `CAPTAIN_ARRIVING`
- Captain confirms pickup: `CAPTAIN_ARRIVING` → `PICKED_UP`
- Captain starts trip: `PICKED_UP` → `IN_PROGRESS`
- Captain completes trip: `IN_PROGRESS` → `COMPLETED`
- Cancellation creates a terminal `CANCELLED` state and releases reserved seats where applicable.

Return a conflict error for invalid transitions. Clients should render the backend state, not infer it locally.

## 10. API and real-time contract

All endpoints are versioned under `/api/v1`.

### REST endpoints

```text
POST   /auth/request-otp
POST   /auth/verify-otp
POST   /auth/refresh
GET    /users/me

GET    /routes
POST   /captains/profile
PUT    /captains/route-config
POST   /captains/online
POST   /captains/offline

POST   /ride-requests
GET    /ride-requests/:id/matches
POST   /ride-requests/:id/accept
POST   /ride-requests/:id/reject
POST   /ride-requests/:id/cancel

POST   /trips/:id/arriving
POST   /trips/:id/pickup
POST   /trips/:id/start
POST   /trips/:id/complete
POST   /trips/:id/cancel
GET    /trips
GET    /trips/:id

POST   /ratings
POST   /devices
```

Use a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "NO_AVAILABLE_SEATS",
    "message": "No seats are available for this request.",
    "requestId": "..."
  }
}
```

### Socket.IO rooms and events

Rooms:

- `user:{userId}`
- `trip:{tripId}`
- `captain:{captainId}` for private captain events

Events:

```text
ride.request.created
ride.accepted
ride.rejected
ride.cancelled
captain.location.updated
trip.status.updated
trip.seats.updated
notification.created
```

Socket authentication uses the same access token as REST. The server authorizes room membership on every connection and subscription.

## 11. Mobile application design

Use Flutter feature-based Clean Architecture:

```text
lib/
├── core/
│   ├── config/
│   ├── networking/
│   ├── localization/
│   ├── routing/
│   ├── theme/
│   └── widgets/
└── features/
    ├── auth/
    ├── passenger_home/
    ├── captain_dashboard/
    ├── location_picker/
    ├── matching/
    ├── ride_requests/
    ├── trips/
    ├── notifications/
    └── profile/
```

Recommended state approach: Riverpod or Bloc, selected once at project setup and used consistently. Keep repositories behind interfaces so API mocks can drive UI development.

### Passenger journey

```text
Splash → Onboarding → Phone/OTP → Home
→ Pickup → Destination → Search
→ Matches → Confirmation → Waiting
→ Captain arriving → In trip → Completed → Rating
```

### Captain journey

```text
Phone/OTP → Verification status → Dashboard
→ Route/vehicle setup → Online
→ Request details → Accept
→ Arriving → Picked up → Start
→ Complete → History
```

### UX requirements

- Arabic-first copy and RTL layouts, with English available.
- All strings externalized from day one.
- Map plus bottom sheets rather than map-only interaction.
- Clear loading, empty, error, offline, and permission states.
- Do not request location or notifications before explaining why they are needed.
- Show only the captain details needed for the current ride.

## 12. External services

Hide every provider behind an internal adapter:

```text
MapsProvider
  geocode()
  searchPlaces()
  getRoute()
  getEta()

OtpProvider
  sendOtp()
  verifyOtp()

PushProvider
  sendNotification()
```

The adapter makes it possible to change providers without rewriting the domain modules. For local development, provide fake adapters and seeded data.

## 13. Security and privacy

- HTTPS only outside local development.
- Short-lived JWT access tokens plus rotated refresh tokens.
- OTP endpoints rate-limited by phone, IP, and device where practical.
- DTO validation for every public request.
- Role and ownership checks on every request/trip resource.
- Never expose a captain's exact location before the passenger is associated with an accepted trip.
- Retain high-frequency location points for a short operational window; keep only what is needed for support and audit.
- Do not store raw OTP values or plaintext passwords.
- Keep provider keys in environment secrets, never in Git or mobile source.
- Add an audit log for admin actions and state changes.

## 14. Implementation sequence

### Phase 0 — Decisions and skeleton

Deliver:

- Repository and workspace setup
- Backend, mobile, and admin shells
- PostgreSQL/PostGIS development environment
- Environment configuration and `.env.example`
- API conventions, error codes, and OpenAPI skeleton
- Seeded Jerash ↔ Amman routes

Exit criterion: a clean local start command brings up the API and database, and a health check passes.

### Phase 1 — Matching proof

Build this before polishing the full app:

- Seed one approved captain and vehicle
- Create a passenger test account
- Pick pickup/destination points
- Implement route corridor and direction checks
- Implement seat filtering and score output
- Display match candidates in a minimal Flutter screen

Exit criterion: the same test cases produce predictable MATCH / NO_MATCH results, including wrong direction, outside radius, incompatible destination, and insufficient seats.

### Phase 2 — Identity and profiles

- Phone/OTP abstraction with a fake local provider
- JWT access/refresh flow
- Passenger profile
- Captain verification state
- Vehicle and route configuration
- Role-specific navigation

Exit criterion: passenger and captain can authenticate and reach only their permitted flows.

### Phase 3 — Request and acceptance

- Create ride request
- Show ranked matches
- Captain request inbox
- Accept/reject/cancel
- Transactional seat reservation
- Create trip and passenger membership

Exit criterion: two test users can complete passenger request → captain acceptance without double-booking.

### Phase 4 — Trip lifecycle

- Arriving, picked up, started, completed actions
- Server-side state machine
- Passenger/captain trip screens
- History
- Rating
- Fare locking at acceptance

Exit criterion: an end-to-end trip can be completed and appears in both users' histories.

### Phase 5 — Real-time and notifications

- Socket.IO authentication and trip rooms
- Captain location updates every 3–5 seconds during active service
- Reconnection and stale-location handling
- FCM adapter
- Push events for acceptance, arrival, start, completion, and cancellation

Exit criterion: the passenger sees an updated captain marker and receives the relevant state transition after reconnecting.

### Phase 6 — Admin and operational safety

- Admin authentication and role guard
- Captain approval/rejection
- Route enable/disable
- Active trip/request view
- User suspension
- Basic counts and operational filters

Exit criterion: a non-developer admin can approve a captain, disable a route, and inspect active trips.

### Phase 7 — Hardening and pilot

- Arabic/English review
- Permission and offline testing
- API and mobile integration tests
- Rate limits and privacy review
- Error monitoring and structured logs
- Staging deployment
- Pilot run on Jerash ↔ Amman with seeded operational rules

Exit criterion: the Definition of Done in the product document can be completed without database edits or developer intervention.

## 15. Testing plan

### Unit tests

- Distance and corridor calculations
- Directed route order
- Match eligibility
- Match score normalization
- Fare calculation
- Seat reservation
- Every state transition
- Permission and ownership policies

### Integration tests

- Passenger request → matching → captain acceptance
- Concurrent acceptance and seat reservation
- Cancellation releases seats
- Trip completion enables rating
- Socket event authorization

### Mobile tests

- Passenger and captain happy paths
- Arabic RTL layouts
- GPS permission denied/limited
- Location unavailable
- Network loss and reconnect
- Small and large screens
- App resumed during an active trip

### Critical acceptance cases

1. Jerash → Amman passenger matches same-direction captain.
2. Jerash → Amman passenger does not match Amman → Jerash captain.
3. Pickup outside radius does not match.
4. Destination outside corridor does not match.
5. Zero seats does not match.
6. Requesting two seats with one available does not match.
7. Two accepted passengers reduce four seats to two.
8. Simultaneous requests never make available seats negative.
9. A passenger cannot view another trip's exact location.
10. Reconnecting clients converge on backend trip state.

## 16. Deployment

### Prototype environments

- Development: local Docker PostgreSQL/PostGIS and fake providers
- Staging: hosted API, managed PostgreSQL/PostGIS, test maps/OTP/push credentials
- Production/pilot: separate secrets and database, backups, logs, monitoring

Start with one backend instance. Add Redis only when multiple instances or higher location/event volume makes it necessary.

### Observability

Every request and state transition should include:

- request ID
- user ID where available
- route/trip/request ID
- duration
- outcome/error code

Track product events such as `ride_search_started`, `match_found`, `ride_accepted`, `trip_completed`, and `rating_submitted` to measure the matching loop.

## 17. Definition of Done for the first usable prototype

### Passenger

- Register and log in
- Select Jerash pickup and Amman destination
- See a compatible captain and estimated fare
- Submit a request and receive acceptance
- See captain details and live location during the active flow
- Complete the trip and submit a rating

### Captain

- Register and reach verification state
- Configure vehicle and direction
- Set radius and seats
- Go online
- Receive and accept a request
- Advance the trip through pickup, start, and completion

### Backend

- Persist all core entities
- Match by direction, corridor, destination, seats, and detour policy
- Enforce transactional seat reservations
- Enforce trip state transitions
- Broadcast authorized real-time updates
- Send notifications through an adapter
- Provide basic admin operations

## 18. First build recommendation

Do not start by building every screen. Start with **Phase 1: the matching proof**:

1. Seed the two directed route geometries.
2. Seed one approved captain with four seats.
3. Build the PostGIS eligibility query.
4. Add the pure matching score service.
5. Expose `GET /api/v1/ride-requests/:id/matches`.
6. Render the result in a minimal Flutter flow.

If this proves that real pickup and destination points can reliably match the correct directed route, the rest of the product is conventional platform work around a validated core.