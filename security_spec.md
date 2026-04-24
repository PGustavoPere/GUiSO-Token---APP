# Security Specification for GUISO

## Data Invariants
1. A Payment must have a non-negative amount.
2. A Payment status can only transition forward (e.g., awaiting_payment -> confirming -> completed).
3. Projects are read-only for most users, only admins can update (for this demo, we'll allow updates to 'raised' if a transaction completes).

## Dirty Dozen Payloads (to be rejected)
1. Payment with negative fiatAmount.
2. Payment with status 'completed' on creation.
3. Updating a 'completed' payment back to 'pending'.
4. Creating a payment without a merchantName.
5. Updating a project's goal to something smaller than raised.
6. Injecting a 1MB string into an ID.
7. Spoofing ownerId (if we used auth).
8. etc.

## Test Runner (firestore.rules.test.ts)
(To be implemented if environment supports it, otherwise simulated in logic)
