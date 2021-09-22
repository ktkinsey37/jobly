const { BadRequestError } = require("../expressError");

// This function takes in a partial amount of data in an object form for js
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

function sqlForFilterGet(dataToFilterBy) {
  
  // Makes an array of keys from the keys in the data to update
  let sqlQuery = []

  let i = 1
  for (let key in dataToFilterBy){
    if (dataToFilterBy.hasOwnProperty(key)){
      if (key == "name") {
        sqlQuery.push(`name LIKE $${i}`)
        i++
        dataToFilterBy[key] = "%" + dataToFilterBy[key] + "%"
      } else if (key == "maxEmployees") {
        sqlQuery.push(`num_employees < $${i}`)
        i++
      } else if (key == "minEmployees") {
        sqlQuery.push(`num_employees > $${i}`)
        i++
      }
      console.log(key + dataToFilterBy[key])
    }
  }
  i = 1

  sqlQuery = sqlQuery.join(" AND ")

  const values = Object.values(dataToFilterBy)
  
 console.log(sqlQuery, values, "FINISHED SQLQUERY")
 return { "sqlQuery":sqlQuery, "values":values }

}

module.exports = { sqlForPartialUpdate, sqlForFilterGet };
