/**
 * generate query string for internal request
 * @param queryString 
 * @param queryData
 * @param fieldName optional, object properties or index of array
 */
export const generateQueryString = (queryString: string, queryData: any, fieldName?: string) => {
  var x = 0
  for (let query in queryData) {
    const andSign = queryString ? '&' : '?'
    // check if fieldName is not empty, if not, add query inside of the '[]' eg: filterBy[value] = testValue
    const queryField = fieldName ? `${fieldName}[${query}]` : query
    try {
      // console.log('queryData[query]: ', queryData[query])
      // check if the value is object
      if (typeof(queryData[query]) === 'object') {
        // recursion call
        queryString = generateQueryString(queryString, queryData[query], query)
      } else {
        queryString = queryString.concat(andSign).concat(`${queryField}=${queryData[query]}`)
      }
    } catch (err) {
      queryString = queryString.concat(andSign).concat(`${queryField}=${queryData[query]}`)
    }
  }
  return queryString
}