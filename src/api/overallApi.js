import request from '@/utils/request'

/**
 * 查询大盘指数
 * @returns {Promise<Response>}
 */
export function _queryZS() {
  return request.post('overall/zs')
}

/**
 * 查询涨停股票
 * @returns {Promise<Response>}
 */
export function _queryZT(data) {
  return request.post('overall/zt', data)
}

/**
 * 查询跌停股票
 * @returns {Promise<Response>}
 */
export function _queryDT(data) {
  return request.post('overall/dt', data)
}

/**
 * 查询赚钱效应分析
 * @returns {Promise<Response>}
 */
export function _queryHQ() {
  return request.post('overall/hq')
}
/**
 * 开盘情况分析
 * @returns {Promise<Response>}
 */
export function _queryMarket() {
  return request.post('overall/market')
}

/**
 * 涨跌额分布统计
 * @returns {Promise<Response>}
 */
export function _queryMarketZDF() {
  return request.post('overall/market_zdf_group')
}

export default {}
