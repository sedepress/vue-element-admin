import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/official_account',
    method: 'get',
    params: query
  })
}

export function fetchAuthorize() {
  return request({
    url: '/api/official_account/authorize',
    method: 'get'
  })
}

export function deleteOfficial(id) {
  return request({
    url: `/api/official_account/${id}`,
    method: 'delete'
  })
}

export function createOfficial(data) {
  return request({
    url: '/api/official_account',
    method: 'post',
    data
  })
}

export function updateOfficial(id, data) {
  return request({
    url: `/api/official_account/${id}`,
    method: 'put',
    data
  })
}

export function fetchStat(query) {
  return request({
    url: '/api/official_user_daily_stat',
    method: 'get',
    params: query
  })
}

export function fetchFans(query) {
  return request({
    url: '/api/fans',
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

export function fetchOfficialOperationList(query) {
  return request({
    url: '/api/official_account/operation',
    method: 'get',
    params: query
  })
}

export function updateStatus(id, data) {
  return request({
    url: `/api/official_account/${id}/status`,
    method: 'patch',
    data
  })
}

export function fetchArticleSummary(query) {
  return request({
    url: '/api/article_summary',
    method: 'get',
    params: query
  })
}

export function exportFansData(query) {
  return request({
    url: '/api/official_user_daily_stat/export',
    method: 'get',
    params: query
  })
}

export function exportArticleSummary(query) {
  return request({
    url: '/api/article_summary/export',
    method: 'get',
    params: query
  })
}

export function updateFansRemark(data) {
  return request({
    url: '/api/fans',
    method: 'post',
    data
  })
}

export function fetchFansSexStat(query) {
  return request({
    url: '/api/fans/sex_stat',
    method: 'get',
    params: query
  })
}
