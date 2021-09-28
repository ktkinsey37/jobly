"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "software engineer",
    salary: 35000,
    equity: 0,
    companyHandle: "baker-santos"
  };

  test("fails for unauthorized users", async function () {
    const resp = await request(app)
    .post("/jobs")
    .set("authorization", `Bearer ${u1Token}`);
expect(resp.statusCode).toEqual(401);
expect(resp.body).toEqual({
  "error": {
        "message": "Unauthorized",
        "status": 401
      }
    });
  });


  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
        newJob,
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "job",
          salary: 30000
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({});
  });

  test("successful filter test", async function () {
    const resp = await request(app).get("/jobs").send({name: "C"})
    expect(resp.body).toEqual({
      companies:
          [
            {
              handle: "c1",
              name: "C1",
              description: "Desc1",
              num_employees: 1,
              logo_url: "http://c1.img",
            },
            {
              handle: "c2",
              name: "C2",
              description: "Desc2",
              num_employees: 2,
              logo_url: "http://c2.img",
            },
            {
              handle: "c3",
              name: "C3",
              description: "Desc3",
              num_employees: 3,
              logo_url: "http://c3.img",
            },
          ],
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
        id: "1",
        title: "soft",
        salary: "35000",
        equity: "0",
        companyHandle: "c1"
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/jobs/99`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("fails for unauthorized users", async function () {
    const resp = await request(app)
    .patch("/jobs/1")
    .send({
      title: "C1-new",
    })
    .set("authorization", `Bearer ${u1Token}`);
expect(resp.statusCode).toEqual(401);
expect(resp.body).toEqual({
  "error": {
        "message": "Unauthorized",
        "status": 401
      }
    });
  });

  test("works for users", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          title: "C1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
        id: "1",
        title: "c1-new",
        salary: "35000",
        equity: "0",
        companyHandle: "c1"
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found, no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/99`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/1`)
        .send({
          companyHandle: "whatever"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("fails for unauthorized users", async function () {
    const resp = await request(app)
    .delete("/jobs/1")
    .set("authorization", `Bearer ${u1Token}`);
expect(resp.statusCode).toEqual(401);
expect(resp.body).toEqual({
  "error": {
        "message": "Unauthorized",
        "status": 401
      }
    });
  });
  

  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/jobs/99`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
