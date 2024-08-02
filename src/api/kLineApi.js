import request from '@/utils/request';

/**
 * 查询日k线
 * @returns {Promise<Response>}
 */
export function _queryDayKLine(data) {
  return request.post('kline/day', data);
}

export function _queryFSKLine(data){
  //分时
  return request.post('kline/fenshi', data)
}

export function getDayKLineByCode(startDate, endDate, code){
  var params = {'code':code,
                'startDate':startDate,
                'endDate': endDate}
  return request.post('kline/day', params)
}

export function _getKLineByFreq(param){

  return request.post('kline/kline_by_freq', param)
}

export default {};