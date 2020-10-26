import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/api/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/api/user',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/api/authorizations/current',
    method: 'delete'
  })
}

export function fetchList(query) {
  return request({
    url: '/api/user/list',
    method: 'get',
    params: query
  })
}

export function deleteUser(id) {
  return request({
    url: `/api/user/${id}`,
    method: 'delete'
  })
}

export function createUser(data) {
  return request({
    url: '/api/user',
    method: 'post',
    data
  })
}

export function updateUser(id, data) {
  return request({
    url: `/api/user/${id}`,
    method: 'put',
    data
  })
}
