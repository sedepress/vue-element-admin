import request from '@/utils/request'

export function createAdSche(data) {
  return request({
    url: '/api/ad',
    method: 'post',
    data
  })
}

export function fetchMonthAd(query) {
  return request({
    url: '/api/ad',
    method: 'get',
    params: query
  })
}

export function updateAdSchedulingDetail(id, data) {
  return request({
    url: `/api/ad/${id}`,
    method: 'put',
    data
  })
}

export function deleteAdSchedulingDetail(id) {
  return request({
    url: `/api/ad/${id}`,
    method: 'delete'
  })
}

export function createGif(data, speed) {
  return request({
    url: '/api/tools?speed=' + speed,
    method: 'post',
    data
  })
}

export function deleteAd(query) {
  return request({
    url: '/api/ad',
    method: 'delete',
    params: query
  })
}
