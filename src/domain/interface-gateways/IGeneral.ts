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
export interface IStateChangeData<T> {
  newData: T
  previousData?: T
  localStreamId?: string
}
export interface IStateCallback<T> {
  (state: string|number, data: IStateChangeData<T>, key?: string) : void
}
export interface IStateDidChangedListener {
  state?: string|null,
  callback: IStateCallback<any>,
}
interface ISortBy {
  fieldName: string
  status: number
}
type IEntityData<T>  = Omit<Partial<T>, '_id' | 'id' | 'createdAt'>
export interface IGeneralGateway<T> {
  findAll (queryParams: any): T[]
  aggregateWithPagination (pipeline: any[], queryParams?: IPaginationQueryParams<T>): IAggregatePagination
  insertOne (data: T): T
  updateById (id: string, data: IEntityData<T>): T
  findById (id: string): any
  updateMany (query: Record<keyof T, any>, data: IEntityData<T>): T
  removeById (id: string): T
  initialize (data: T): T
}
export interface IEventStreamer<T> {
  registerEvent(event: T, data: any): void
  watchTransactionStream(streamId: string, message: any): Promise<boolean|{status: boolean, messages: any[], completed: boolean}>
  waitTransactionResponse(data: any, states: Array<number|string>, timeoutMilis: number): Promise<any>
}
export interface IStateListener<T> {
  stateDidChanged(state: number|string, data: IStateChangeData<T>): void
  stateWillChange(state: number|string, data: IStateChangeData<T>): void
  // stateDidChangedListener(state: string, callback: IStateCallback<T>): void
}