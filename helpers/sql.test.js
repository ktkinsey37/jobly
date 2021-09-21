const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", function () {
  test("works", function () {
    const testData = {description:"a company", numEmployees:"4"}
    const jsToSql =         {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      }

    const res = sqlForPartialUpdate(testData, jsToSql)
    expect(res).toEqual({"setCols": "\"description\"=$1, \"num_employees\"=$2", "values": ["a company", "4"]})
    });
  });
