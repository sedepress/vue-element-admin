import request from '@/utils/request'

export function fetchVio(query) {
  return request({
    url: '/api/vio',
    method: 'get',
    params: query
  })
}

export function createVioRecord(data) {
  return request({
    url: '/api/vio',
    method: 'post',
    data
  })
}

export function updateVioRecord(id, data) {
  return request({
    url: `/api/vio/${id}`,
    method: 'put',
    data
  })
}

export function deleteVioRecord(id) {
  return request({
    url: `/api/vio/${id}`,
    method: 'delete'
  })
}
