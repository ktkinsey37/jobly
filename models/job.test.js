"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "software engineer",
        salary: 35000,
        equity: 0,
        companyHandle: "c1"
      };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
          `SELECT *
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
        {
            id: 4,
            title: "software engineer",
            salary: 35000,
            equity: 0,
            companyHandle: "baker-santos"
          },
    ]);
  });

//   test("bad request with dupe", async function () {
//     try {
//       await Job.create(newJob);
//       await Job.create(newJob);
//       fail();
//     } catch (err) {
//       expect(err instanceof BadRequestError).toBeTruthy();
//     }
//   });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "soft",
        salary: "35000",
        equity: "0",
        companyHandle: "c1"},
      {
        title: "soft",
        salary: "35000",
        equity: "0",
        companyHandle: "c2"},
      {
        title: "cook",
        salary: "35000",
        equity: "0.026",
        companyHandle: "c2"}
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("1");
    expect(job).toEqual(      {
        title: "soft",
        salary: "35000",
        equity: "0",
        companyHandle: "c1"});
  });

  test("not found if no such company", async function () {
    try {
      await Job.get("99");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    salary:45000
  };

  test("works", async function () {
    let job = await Job.update("c1", updateData);
    expect(job).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT *
           FROM jobs
           WHERE id = '1'`);
    expect(result.rows).toEqual([{
        title: "soft",
        salary: "45000",
        equity: "0",
        companyHandle: "c1"}]);
  });


  test("not found if no such company", async function () {
    try {
      await Company.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Company.update("1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Company.remove("1");
    const res = await db.query(
        "SELECT * FROM jobs WHERE id='1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Company.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
