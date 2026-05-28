export default {
  pages: [
    'pages/DailyGatePage/index',
    'pages/MainWorldPage/index',
    'pages/DailyChallengePage/index',
    'pages/FunQuizPage/index',
    'pages/ErrorBookPage/index',
    'pages/PetHousePage/index',
    'pages/CardCenterPage/index',
    'pages/ProfilePage/index',
    'pages/ClassroomPage/index',
    'pages/ArenaPage/index',
    'pages/PrincipalOfficePage/index',
    'pages/CardWarehousePage/index',
    'pages/QuestCenterPage/index'
  ],
  permission: {
    'scope.userLocation': {
      desc: '你的位置信息将用于提供更好的学习体验'
    }
  },
  tabBar: {
    color: '#8b95a7',
    selectedColor: '#ff5d73',
    backgroundColor: '#fffdf7',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/MainWorldPage/index',
        text: '首页'
      },
      {
        pagePath: 'pages/QuestCenterPage/index',
        text: '任务'
      },
      {
        pagePath: 'pages/CardCenterPage/index',
        text: '卡牌'
      },
      {
        pagePath: 'pages/ProfilePage/index',
        text: '我的'
      }
    ]
  }
}
