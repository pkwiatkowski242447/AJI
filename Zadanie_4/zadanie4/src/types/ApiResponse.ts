import { AxiosResponse } from 'axios'
export type ApiResponseType<T> = Promise<AxiosResponse<T>>