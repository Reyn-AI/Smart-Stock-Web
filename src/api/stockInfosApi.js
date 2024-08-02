import request from '@/utils/request';

/**
 * 查询日k线
 * @returns {Promise<Response>}
 */
export function _get_stock_base_info(param) {
  //获取基本面信息
  return request.post('/stock_infos/get_base_infos', param);
}

export default {};