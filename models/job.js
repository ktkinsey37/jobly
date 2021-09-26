"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilterGet } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, jobHandle }) {

    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, job_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, job_handle AS "jobHandle"`,
        [title, salary, equity, jobHandle],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT id, title, salary, equity, job_handle AS "jobHandle"
           FROM jobs
           GROUP BY title
           ORDER BY title`);
    return jobsRes.rows;
  }

  /** Given a job handle, return data about job.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, jobHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  job_handle AS "jobHandle",
           FROM job
           WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, title, salary, equity, job_handle AS "jobHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM job
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }

  // Accepts an object of {filterparams:filters} passed into the get route
  static async filterGet(data) {

    // Uses helper function to produce a customized SQL query and list of values
    const { sqlQuery, values } = sqlForFilterGet(data)

    // Uses the query and values to get a filtered search result from db
    const result = await db.query(`SELECT * FROM companies WHERE ${sqlQuery}`, [ ...values])

    return result.rows
  }
}


module.exports = Job;
