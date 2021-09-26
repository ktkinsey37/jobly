const { sqlForPartialUpdate, sqlForFilterGetCompanies } = require("./sql");

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

  describe("sqlForFilterGetCompanies", function () {
    test("works", function () {
      const testData = {name:"cat", maxEmployees:"1000", minEmployees: "0"}
  
      const res = sqlForFilterGetCompanies(testData)
      expect(res).toEqual({"sqlQuery": "LOWER( name ) LIKE $1 AND num_employees < $2 AND num_employees > $3", "values": ["%cat%", "1000", "0"]})
      });
    });
