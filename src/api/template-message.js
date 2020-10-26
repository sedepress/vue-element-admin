import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/template_message',
    method: 'get',
    params: query
  })
}

export function fetchTemp(appid) {
  return request({
    url: `/api/template_message/${appid}/create`,
    method: 'get'
  })
}

export function createTemp(data) {
  return request({
    url: '/api/template_message/send_template',
    method: 'post',
    data
  })
}

export function fetchTempDetail(query) {
  return request({
    url: '/api/template_message/show',
    method: 'get',
    params: query
  })
}

export function updateStatus(id) {
  return request({
    url: `/api/template_message/${id}`,
    method: 'patch'
  })
}
