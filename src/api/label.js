import request from '@/utils/request'


export function sendLabel(data) {
    return request({
        url: '/label/sendLabel',
        method: 'post',
        data
    })
}

export function getLabel(params) {
    return request({
        url: '/label/',
        method: 'get',
        params
    })
}

export function deleteLabel(params) {
    return request({
        url: '/label/deleteLabel',
        method: 'get',
        params
    })
}

export function editLabel(data) {
    return request({
      url: '/label/editLabel',
      method: 'post',
      data
    })
  }