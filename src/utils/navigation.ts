import Taro from '@tarojs/taro'

/**
 * 全局导航锁，避免用户连续点击触发并发路由导致 timeout。
 */
let navigating = false

export const TAB_PAGE_ROUTES = new Set([
  '/pages/MainWorldPage/index',
  '/pages/QuestCenterPage/index',
  '/pages/CardCenterPage/index',
  '/pages/ProfilePage/index',
])

/**
 * 安全导航：自动识别 tab 页，统一处理并发与失败兜底。
 */
export async function safeNavigate(route: string): Promise<void> {
  if (navigating) {
    return
  }
  navigating = true
  try {
    if (TAB_PAGE_ROUTES.has(route)) {
      await Taro.switchTab({ url: route })
    } else {
      await Taro.navigateTo({ url: route })
    }
  } catch (error) {
    if (TAB_PAGE_ROUTES.has(route)) {
      try {
        await Taro.reLaunch({ url: route })
      } catch {
        Taro.showToast({ title: '页面打开失败，请重试', icon: 'none' })
      }
    } else {
      try {
        await Taro.redirectTo({ url: route })
      } catch {
        try {
          await Taro.reLaunch({ url: route })
        } catch {
          const errMsg = (error as { errMsg?: string })?.errMsg || 'unknown'
          Taro.showToast({ title: '页面打开失败，请重试', icon: 'none' })
          console.error('[safeNavigate] open page failed:', route, errMsg)
        }
      }
    }
  } finally {
    setTimeout(() => {
      navigating = false
    }, 350)
  }
}
