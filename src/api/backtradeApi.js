import request from '@/utils/request';

/**
 * 查询日回测默认参数
 * @returns {Promise<Response>}
 */
export function _get_default_params(data){
  //分时
  return request.post('/backtrade/get_default_params', data)
}

/**
 * 保存回测记录
 * @returns {Promise<Response>}
 */
export function _save_record(data){
  //分时
  return request.post('/backtrade/save_record', data)
}

/**
 * 查询回测记录
 * @returns {Promise<Response>}
 */
export function _get_record(data){
  return request.post('/backtrade/get_record_list', data)
}

/**
 * 查询回测记录
 * @returns {Promise<Response>}
 */
export function _get_record_by_id(data){
  return request.post('/backtrade/get_record_by_id', data)
}

/**
 * 获取策略列表
 * @returns {Promise<Response>}
 */
export function _get_strategy_list(){
  return request.post('/backtrade/get_strategys')
}

/**
 * 获取仓位策略列表
 * @returns {Promise<Response>}
 */
export function _get_size_strategy_list(){
  return request.post('/backtrade/get_size_strategys')
}

/**
 * 通过id删除回测记录
 * @returns {Promise<Response>}
 */
export function _delete_record_by_id(params){
  return request.post('/backtrade/delete_record_by_id', params)
}


export default {};