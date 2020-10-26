import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/official_balance_detail',
    method: 'get',
    params: query
  })
}

export function fetchSummaryList(query) {
  return request({
    url: '/api/official_balance_stat/summary',
    method: 'get',
    params: query
  })
}

export function fetchMonthStatList(query) {
  return request({
    url: '/api/official_balance_stat',
    method: 'get',
    params: query
  })
}

export function fetchOfficialList() {
  return request({
    url: '/api/official_balance_detail/official_list',
    method: 'get'
  })
}

export function deleteOfficialBalanceDetail(id) {
  return request({
    url: `/api/official_balance_detail/${id}`,
    method: 'delete'
  })
}

export function createOfficialBalanceDetail(data) {
  return request({
    url: '/api/official_balance_detail',
    method: 'post',
    data
  })
}

export function updateOfficialBalanceDetail(id, data) {
  return request({
    url: `/api/official_balance_detail/${id}`,
    method: 'put',
    data
  })
}
