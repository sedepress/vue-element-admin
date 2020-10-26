import request from '@/utils/request'

export function getIndex() {
  return request({
    url: 'api/index',
    method: 'get'
  })
}
