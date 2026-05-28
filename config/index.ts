const config = {
  projectName: 'xuebatiantianzhan',
  date: '2026-5-4',
  designWidth: 375,
  deviceRatio: {
    '640': 2.34 / 2,
    '750': 1,
    '828': 0.905,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [
    '@tarojs/plugin-framework-react',
    '@tarojs/plugin-platform-weapp',
  ],
  framework: 'react',
  compiler: 'webpack5',
  entry: './src/app.tsx',
  /** Boss 立绘等静态资源：固定复制到 dist 根目录，供 /assets/... 引用 */
  copy: {
    patterns: [
      { from: 'src/assets/bosses', to: 'dist/assets/bosses' },
      { from: 'src/assets/sfx', to: 'dist/assets/sfx' },
    ],
    options: {},
  },
}

module.exports = config
