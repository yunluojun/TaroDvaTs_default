# taro + taro-ui
### cli工具安装
```
# 使用 npm 安装 CLI
$ npm install -g @tarojs/cli

# OR 使用 yarn 安装 CLI
$ yarn global add @tarojs/cli

# OR 安装了 cnpm，使用 cnpm 安装 CLI
$ cnpm install -g @tarojs/cli
```
### 查看taro版本信息
```
npm info @tarojs/cli
```

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c8aa17b4caa42ee9deb15603bb05f56~tplv-k3u1fbpfcp-watermark.image)

## 项目初始化
```
$ taro init myApp
```
npm 5.2+ 也可在不全局安装的情况下使用 npx 创建模板项目：
```
$ npx @tarojs/cli init myApp
```

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b3bdc6fb675c4e1b8da094f4fbba18f8~tplv-k3u1fbpfcp-watermark.image)

## 运行项目
```
# 进入项目根目录
$ cd myApp

#运行项目

# yarn
$ yarn dev:weapp
$ yarn build:weapp

# npm script
$ npm run dev:weapp
$ npm run build:weapp

# 仅限全局安装
$ taro build --type weapp --watch
$ taro build --type weapp

# npx 用户也可以使用
$ npx taro build --type weapp --watch
$ npx taro build --type weapp

# watch 同时开启压缩
$ set NODE_ENV=production && taro build --type weapp --watch # Windows
$ NODE_ENV=production taro build --type weapp --watch # Mac
```

# dva
dva 首先是一个基于 redux 和 redux-saga 的数据流方案，然后为了简化开发体验，dva 还额外内置了 react-router 和 fetch，所以也可以理解为一个轻量级的应用框架。
## 安装redux、 react-redux 等依赖包
```
npm install --save react-redux
npm install --save redux @tarojs/redux @tarojs/redux-h5 redux-thunk redux-logger
# 推荐使用cnpm或者其他的方式安装
```
## 安装dva
```
npm install --save dva-core dva-loading
dva-core：封装了 redux 和 redux-saga 的一个插件
dva-loading：管理页面的 loading 状态
# 推荐使用cnpm或者其他的方式安装
```
## 在项目中配置dva
### 1、对src/app.ts文件重命名为src/app.tsx并修改其中内容如下：
```
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import dva from './utils/dva';
import models from './models';
import './app.scss'
const dvaApp = dva.createApp({
    initialState: {},
    models,
});
const store = dvaApp.getStore();
class App extends Component {
    componentDidMount() { }
    componentDidShow() { }
    componentDidHide() { }
    componentDidCatchError() { }
    // this.props.children 是将要会渲染的页面
    render() {
        return (
            <Provider store={store}>
                {this.props.children}
            </Provider>
        )
    }
}
export default App

```
### 2、在项目src目录下创建utils文件夹，并在utils中创建dva.ts和request.ts
dva.ts文件中的内容如下:
```
import { create } from "dva-core";
import { createLogger } from "redux-logger";
import createLoading from "dva-loading";
let app: any;
let store: any;
let dispatch: any;
let registered: any;
function createApp(opt) {
   // redux日志
   opt.onAction = []
   if (opt.enableLog) {
       opt.onAction.push(createLogger())
   }
   app = create(opt)
   app.use(createLoading())
   // 注入model
   if (!registered) {
       opt.models.forEach(model => app.model(model));
   }
   registered = true;
   app.start()
   // 设置store
   store = app._store;
   app.getStore = () => store;
   app.use({
       onError(err: any) {
           console.log(err);
       }
   })
   // 设置dispatch
   dispatch = store.dispatch;
   app.dispatch = dispatch;
   return app;
}

export default {
   createApp,
   getDispatch() {
       return app.dispatch
   }
};
```
request.ts文件中的内容如下:
```
import Taro from '@tarojs/taro';
import { baseUrl, noConsole } from '../config';

const request_data = {
  platform: 'wap',
  rent_mode: 2,
};

export default (options = { method: 'GET', data: {} }) => {
  if (!noConsole) {
    console.log(
      `${new Date().toLocaleString()}【 M=${options.url} 】P=${JSON.stringify(
        options.data
      )}`
    );
  }
  return Taro.request({
    url: baseUrl + options.url,
    data: {
      ...request_data,
      ...options.data,
    },
    header: {
      'Content-Type': 'application/json',
    },
    method: options.method.toUpperCase(),
  }).then(res => {
    const { statusCode, data } = res;
    if (statusCode >= 200 && statusCode < 300) {
      if (!noConsole) {
        console.log(
          `${new Date().toLocaleString()}【 M=${options.url} 】【接口响应：】`,
          res.data
        );
      }
      if (data.status !== 'ok') {
        Taro.showToast({
          title: `${res.data.error.message}~` || res.data.error.code,
          icon: 'none',
          mask: true,
        });
      }
      return data;
    } else {
      throw new Error(`网络请求错误，状态码${statusCode}`);
    }
  });
};
```
### 3、在项目src目录下创建config文件夹，并创建index.ts文件内容如下
```
// 请求连接前缀
export const baseUrl = 'https://ms-api.caibowen.net';

// 输出日志信息
export const noConsole = false;
```
### 4、在src目录下创建models文件夹，在models文件夹下创建index.ts
该文件的作用是用来注册当前项目中所有页面组件的mode的
index.ts文件中的内容如下:
```
import index from '../pages/index/model'

export default [index]
```

### 5、在src/page/index目录下创建model.ts文件
后期开发项目是每一个页面组件都需要含有一个mode.ts文件用来做当前页面的异步数据请求和数据流管理
model.ts文件内容如下:
```
import * as homeApi from './service';

export default {
  namespace: 'home',
  state: {
    banner: [],
    brands: [],
    products_list: [],
    page: 1,
  },
  effects: {
    *load(_, { call, put }) {
      const { status, data } = yield call(homeApi.homepage, {});
      if (status === 'ok') {
        yield put({
          type: 'save',
          payload: {
            banner: data.banner,
            brands: data.brands,
          },
        });
      }
    }
  },
  reducers: {
    save(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};

```
### 6、在src/page/index目录下创建service.ts文件
文件内容如下:
```
import Request from '../../utils/request';

export const homepage = data =>
  Request({
    url: '/homepage-v3',
    method: 'GET',
    data,
  });
```
### 7、在src/page/index目录下修改index.tsx内容如下
```
import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.scss'


import { connect } from 'react-redux'

@connect(({ home}) => ({
  ...home
}))
export default class Index extends Component {

componentWillMount() { }

componentDidMount() { 
  debugger
  this.props.dispatch({
    type: 'home/load',
  });
}

componentWillUnmount() {
}

componentDidShow() { }

componentDidHide() { }

render() {
  return (
    <View className='index'>
      <Text>Hello world!</Text>
      <AtButton type='primary'>I need Taro UI</AtButton>
      <Text>Taro UI 支持 Vue 了吗？</Text>
      <AtButton type='primary' circle>支持</AtButton>
      <Text>共建？</Text>
      <AtButton type='secondary' circle>来</AtButton>
    </View>
  )
}
}

```
# 结束
学习react记录，如有错误欢迎指正
## 完整项目结构
```
├── babel.config.js             # Babel 配置
├── .eslintrc.js                # ESLint 配置
├── config                      # 编译配置目录
│   ├── dev.js                  # 开发模式配置
│   ├── index.js                # 默认配置
│   └── prod.js                 # 生产模式配置
├── package.json                # Node.js manifest
├── dist                        # 打包目录
├── project.config.json         # 小程序项目配置
├── src # 源码目录
│   ├── config/index.ts         # (新增)接口参数配置
│   ├── models/index.ts         # (新增)全局models配置
│   ├── utils                   # (新增)
│   │   ├── dva.ts              # (新增)dva配置
│   │   └── request.ts          # (新增)接口配置
│   ├── app.config.js           # 全局配置
│   ├── app.scss                # 全局 CSS
│   ├── app.tsx                 # 入口组件
│   ├── index.html              # H5 入口 HTML
│   └── pages                   # 页面组件
│       └── index
│           ├── index.config.js # 页面配置
│           ├── service.ts      # (新增)页面 接口
│           ├── model.ts        # (新增)页面 数据层操作
│           ├── index.sacc      # 页面 SCSS
│           └── index.tsx       # 页面组件
```
## github 地址：
https://github.com/yunluojun/TaroDvaTs_default.git
## 掘金文章地址：
https://juejin.cn/post/6981396644390993933