import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.scss'


import { connect } from 'react-redux'

@connect(({ home, cart, loading }) => ({
  ...home,
  ...cart,
  ...loading,
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
