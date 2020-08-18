// interfaces for 
export interface IAggregatePagination {
  data: any[]
  pages: number
  total: number
}
export interface IPaginationQueryParams<F> {
  limitTo?: number
  startAt?: number
  searchFields?: Array<keyof F>
  searchText?: string
  sortBy?: ISortBy | ISortBy[]
}
interface ISortBy {
  fieldName: string
  status: number
}
export interface IGeneralGateway<T> {
  findAll (queryParams: any): T[]
  aggregateWithPagination (pipeline: any[], queryParams?: IPaginationQueryParams<T>): IAggregatePagination
  insertOne (data: T): T
  updateById (id: string, data: Partial<T>): T
  findById (id: string): any
  updateMany (query: Record<keyof T, any>, data: T): T
  removeById (id: string): T
  initialize (data: T): T
}