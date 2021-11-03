import request from '@/utils/request'

export function sendArticle(data) {
  return request({
    url: '/article/sendArticle',
    method: 'post',
    data
  })
}

export function getArticle() {
    return request({
      url: '/article/',
      method: 'get',
    })
  }

export function getArticleDetail(params) {
  return request({
    url: '/article/getArticle/',
    method: 'get',
    params
  })
}
