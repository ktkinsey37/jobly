const { BadRequestError, ExpressError } = require("../expressError");

// Takes in a partial amount of data in an object form for js
// and returns it so that it's compatible with the current SQL database

// Takes as args the input data to update, and the relationship between the SQL col name
// and the JS object
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  
  // Makes an array of keys from the keys in the data to update
  const keys = Object.keys(dataToUpdate);

  // Throws an error if no data has been passed in
  if (keys.length === 0) throw new BadRequestError("No data");

  // cols is an array of strings (the keys in keys array and the SQL value number) created from the keys array.
  // The keys array is mapped with either the jsToSQL or the column name in the data
  // This is then paired with the index number translated to the SQL query
  // See an example below
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']

  // Returns and object with two key:values
  // setCols is a string of the column names/SQL numbers in the SQL databases where data is to be changed
  // values is an array of the values to be updated
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function sqlForFilterGetCompanies(dataToFilterBy) {
  
  // Inits final SQL query array
  let sqlQuery = []

  // Sets increment to run through data object
  let i = 1

  // Iterates through the data object, with specific responses per possible keys
  // (this also serves to filter out any req.body possibilities)
  for (let key in dataToFilterBy){
    if (dataToFilterBy.hasOwnProperty(key)){

      // If the key is name, write a SQL query LIKE search (toLowerCases the name), push into sqlQuery array
      if (key == "name") {
        sqlQuery.push(`LOWER( name ) LIKE $${i}`)
        i++
        dataToFilterBy[key] = "%" + dataToFilterBy[key] + "%"

        // If the key is maxEmployees, write SQL query for that, push into sqlQuery array
      } else if (key == "maxEmployees") {
        sqlQuery.push(`num_employees < $${i}`)
        i++

        // If the key is minEmployees, write SQL query for that, push into sqlQuery array
      } else if (key == "minEmployees") {
        sqlQuery.push(`num_employees > $${i}`)
        i++
      } else {
        throw new ExpressError("Incorrect filter data provided", 400)
      }
    }
  }
  i = 1

  // Joins all the SQL queries that are in sqlQuery array into a final statement
  sqlQuery = sqlQuery.join(" AND ")

  // Gets the values to be searched for from the data, filters them to lower case (for the name)
  let values = Object.values(dataToFilterBy)
  values = values.map((x) => x.toString().toLowerCase())
  
// Returns the SQL query and the values
 return { "sqlQuery":sqlQuery, "values":values }

}

function sqlForFilterGetJobs(dataToFilterBy) {
  
  // Inits final SQL query array
  let sqlQuery = []

  // Sets increment to run through data object
  let i = 1

  // Iterates through the data object, with specific responses per possible keys
  // (this also serves to filter out any req.body possibilities)
  for (let key in dataToFilterBy){
    if (dataToFilterBy.hasOwnProperty(key)){

      // If the key is name, write a SQL query LIKE search (toLowerCases the name), push into sqlQuery array
      if (key == "title") {
        sqlQuery.push(`LOWER( title ) LIKE $${i}`)
        i++
        dataToFilterBy[key] = "%" + dataToFilterBy[key] + "%"

        // If the key is maxEmployees, write SQL query for that, push into sqlQuery array
      } else if (key == "minSalary") {
        sqlQuery.push(`salary > $${i}`)
        i++

        // If the key is minEmployees, write SQL query for that, push into sqlQuery array
      } else if (key == "hasEquity" && dataToFilterBy[key] == true) {
        sqlQuery.push(`equity > $${i}`)
        i++

      } else if (key == "hasEquity" && dataToFilterBy[key] == false) {
        sqlQuery.push(`equity = $${i}`)
        i++

      } else {
        throw new ExpressError("Incorrect filter data provided", 400)
      }
    }
  }
  i = 1

  // Joins all the SQL queries that are in sqlQuery array into a final statement
  sqlQuery = sqlQuery.join(" AND ")

  // Gets the values to be searched for from the data, filters them to lower case (for the name)
  let values = Object.values(dataToFilterBy)
  values = values.map((x) => x.toString().toLowerCase())


  if (values[values.length-1] == 'true' || 'false'){
    values.pop()
    values.push(0)
  }

  console.log(sqlQuery, values, "SQLQUERY AND VALUESs")
  
// Returns the SQL query and the values
 return { "sqlQuery":sqlQuery, "values":values }

}

module.exports = { sqlForPartialUpdate, sqlForFilterGetCompanies, sqlForFilterGetJobs };
