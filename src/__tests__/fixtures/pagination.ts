import { HttpRequest, Pagination } from '../../types'
import makeFakeUser from './user'

const defaultPagination: Pagination = {
  page: 0,
  pageSize: 100,
}

export default defaultPagination
