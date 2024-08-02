import request from '@/utils/request';

/**
 * 查询列表
 * @returns {Promise<Response>}
 */
export function _queryStockStageies() {
  return request.post('select_stocks/strategy_list');
}


export function _queryListDataByIndex(params){
  return request.post('select_stocks/get_selected_stock_data_by_index', params)
}

/**
 * 查询列表
 * @returns {Promise<Response>}
 */
export function _queryStockMarket() {
    return request.post('select_stocks/market_list');
}

/**
 * 通过历史数据筛选股票
 * @returns {Promise<Response>}
 */
export function _selectByHistory(param) {
  return request.post('select_stocks/get_selected_stock_data_by_history', param);
}

/**
 * 查询策略列表
 * @returns {Promise<Response>}
 */
export function _queryStockStageiesHistory() {
  return request.post('select_stocks/strategy_list_hisory');
}


/**
 * 查询列表
 * @returns {Promise<Response>}
 */
export function _queryListData(data) {
  return request.post(`select_stocks/get_selected_stock_data`, data);
}



  export default {};
