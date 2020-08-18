/// api call here
interface IHTTPRequest {
  
}
interface IAPI {
  http: IHTTPRequest
}
export default ({http} : IAPI) => {
  return class SampleAPI {
    /**
     * class
     */
    constructor () {
      //
    }

    public fetchData () {
      // return http({})
    }
  }
}
