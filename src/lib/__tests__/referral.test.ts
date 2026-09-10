import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/db";
import { trackReferralClick, hashIp } from "@/lib/referral";

// These tests hit a real (local/test) Postgres instance to exercise the
// actual UNIQUE(worker_id, ip_hash) database constraint — the part of the
// spec (sections 18-22, 47, 57) that must not be faked with an in-memory
// mock, since the whole point is that the DB enforces it under concurrency.

describe("referral click deduplication", () => {
  let activeWorkerId: string;
  let disabledCode: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        name: "Test Worker",
        email: `test-worker-${Date.now()}@example.com`,
        passwordHash: "x",
        role: "WORKER",
      },
    });
    const worker = await prisma.worker.create({
      data: { userId: user.id, referralCode: `TEST${Date.now()}` },
    });
    activeWorkerId = worker.id;

    const disabledUser = await prisma.user.create({
      data: {
        name: "Disabled Worker",
        email: `disabled-worker-${Date.now()}@example.com`,
        passwordHash: "x",
        role: "WORKER",
      },
    });
    const disabledWorker = await prisma.worker.create({
      data: {
        userId: disabledUser.id,
        referralCode: `DIS${Date.now()}`,
        status: "DISABLED",
      },
    });
    disabledCode = disabledWorker.referralCode;
  });

  afterAll(async () => {
    // Scoped to test-created users/workers only — must never touch real
    // (e.g. seeded demo) data that happens to exist in the same database.
    const testUsers = await prisma.user.findMany({
      where: { email: { contains: "@example.com" } },
      select: { id: true },
    });
    const testUserIds = testUsers.map((u) => u.id);
    await prisma.referralClick.deleteMany({ where: { worker: { userId: { in: testUserIds } } } });
    await prisma.worker.deleteMany({ where: { userId: { in: testUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: testUserIds } } });
    await prisma.$disconnect();
  });

  it("Test 1: first visit from an IP is counted", async () => {
    const worker = await prisma.worker.findUnique({ where: { id: activeWorkerId } });
    const result = await trackReferralClick({
      referralCode: worker!.referralCode,
      ip: "10.0.0.1",
      landingPage: "/",
    });
    expect(result.status).toBe("counted");

    const count = await prisma.referralClick.count({ where: { workerId: activeWorkerId } });
    expect(count).toBe(1);
  });

  it("Test 2: repeat visit from the same IP does not increment the count", async () => {
    const worker = await prisma.worker.findUnique({ where: { id: activeWorkerId } });
    const result = await trackReferralClick({
      referralCode: worker!.referralCode,
      ip: "10.0.0.1",
      landingPage: "/shangi-seeds",
    });
    expect(result.status).toBe("duplicate");

    const count = await prisma.referralClick.count({ where: { workerId: activeWorkerId } });
    expect(count).toBe(1);
  });

  it("Test 3: a different IP visiting the same code is counted separately", async () => {
    const worker = await prisma.worker.findUnique({ where: { id: activeWorkerId } });
    const result = await trackReferralClick({
      referralCode: worker!.referralCode,
      ip: "10.0.0.2",
      landingPage: "/",
    });
    expect(result.status).toBe("counted");

    const count = await prisma.referralClick.count({ where: { workerId: activeWorkerId } });
    expect(count).toBe(2);
  });

  it("Test 6: an invalid referral code records nothing", async () => {
    const result = await trackReferralClick({
      referralCode: "TOTALLY-INVALID-CODE",
      ip: "10.0.0.9",
      landingPage: "/",
    });
    expect(result.status).toBe("invalid");
  });

  it("Test 7: a disabled worker's code does not get new clicks counted", async () => {
    const result = await trackReferralClick({
      referralCode: disabledCode,
      ip: "10.0.0.9",
      landingPage: "/",
    });
    expect(result.status).toBe("disabled");

    const count = await prisma.referralClick.count({ where: { referralCode: disabledCode } });
    expect(count).toBe(0);
  });

  it("Test 8: concurrent requests from the same IP produce only one counted click", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Concurrency Test Worker",
        email: `concurrency-${Date.now()}@example.com`,
        passwordHash: "x",
        role: "WORKER",
      },
    });
    const worker = await prisma.worker.create({
      data: { userId: user.id, referralCode: `CONC${Date.now()}` },
    });

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        trackReferralClick({
          referralCode: worker.referralCode,
          ip: "10.0.0.50",
          landingPage: "/",
        })
      )
    );

    const counted = results.filter((r) => r.status === "counted");
    const duplicates = results.filter((r) => r.status === "duplicate");

    expect(counted.length).toBe(1);
    expect(duplicates.length).toBe(9);

    const dbCount = await prisma.referralClick.count({ where: { workerId: worker.id } });
    expect(dbCount).toBe(1);
  });

  it("hashIp never returns the raw IP", () => {
    const hash = hashIp("192.168.1.1");
    expect(hash).not.toContain("192.168.1.1");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
