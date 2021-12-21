import request from '@/utils/request'

export function sendArticle(data) {
  return request({
    url: '/article/sendArticle',
    method: 'post',
    data
  })
}

export function editArticle(data) {
  return request({
    url: '/article/editArticle',
    method: 'post',
    data
  })
}

export function sendImage(data) {
  return request({
    url: '/github/updateImage',
    method: 'post',
    data
  })
}

export function getArticle(params) {
  return request({
    url: '/article/forId',
    method: 'get',
    params
  })
}

export function getArticleDetail(params) {
  return request({
    url: '/article/getArticle',
    method: 'get',
    params
  })
}
export function deleteArticle(params) {
  return request({
    url: '/article/deleteArticle',
    method: 'get',
    params
  })
}
