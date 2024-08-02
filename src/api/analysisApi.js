import request from '@/utils/request';

/**
 * 查询日k线
 * @returns {Promise<Response>}
 */
export function _queryTaLibList() {
  return request.post('/analysis/get_ta_lib_indicator');
}

export function _taLibCompute(data){
  //分时
  return request.post('/analysis/get_ta_lib_compute', data)
}

export default {};