import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'

export default function App({ children }: { children?: any }) {
  return (
    <View>
      {children}
    </View>
  )
}