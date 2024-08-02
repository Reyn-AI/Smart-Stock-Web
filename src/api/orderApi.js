import request from '@/utils/request';

/**
 * 查询交割单
 * @returns {Promise<Response>}
 */
export function _queryOrder(data) {
  return request.post('order/select_order', data);
}

/**
 * 查询交割单(分页查询)
 * @returns {Promise<Response>}
 */
export function _queryOrderByIndex(data) {
  return request.post('order/select_order_by_index', data);
}

/**
 * 新增交割单
 * @returns {Promise<Response>}
 */
export function addOrder(data) {
  return request.post('/order/add_order', data);
}

/**
 * 修改交割单
 * @returns {Promise<Response>}
 */
export function updateOrder(data) {
    return request.post('/order/update_order', data);
}

/**
 * 删除交割单
 * @returns {Promise<Response>}
 */
export function deleteOrder(data) {
    return request.post('/order/delete_order', data);
}

export default {};