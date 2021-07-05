import Taro from '@tarojs/taro';

export default {
  namespace: 'common', // 这是模块名
  state: { // 初始化数据
    accessToken: Taro.getStorageSync('accessToken') || '',
    isSubscribe: !!Taro.getStorageSync('isSubscribe'),
  },

  effects: { 
    // 异步方法, 在这里可以用put调用同步的方法
    // generator  这里的方法第二个参数都是{call, put }, call调用异步方法, put 可以调用reducers中的方法
    * saveStorageSync({payload, cb }, {call, put }) {
      for (let index = 0; index <  Object.keys(payload).length; index++) {
        yield call(Taro.setStorage, {
          key: Object.keys(payload)[index],
          data: payload[Object.keys(payload)[index]]
        });
      }
      cb && cb();
      yield put({
        type: 'save', // 方法名
        payload,// 参数
      })
    },
  },

  reducers: { // 同步方法
    save(state, {payload }) {
      return {...state, ...payload };
    },
  },
};