import Taro from '@tarojs/taro'

const SFX_ENABLED_KEY = 'sfxEnabled'

/** 音效资源路径（相对 page 目录，与 Boss 立绘一致） */
const SFX_SRC = {
  hit: '../../assets/sfx/hit.wav',
  finisher: '../../assets/sfx/finisher.wav',
  bossEnter: '../../assets/sfx/boss_enter.wav',
} as const

export type SfxKey = keyof typeof SFX_SRC

/**
 * 音效管理：默认静音，用户可在 Boss 战页开启。
 */
export class SfxManager {
  private static pool: Partial<Record<SfxKey, Taro.InnerAudioContext>> = {}

  /**
   * 是否已开启音效（默认 false，适配课堂场景）。
   */
  static isEnabled(): boolean {
    try {
      return Taro.getStorageSync(SFX_ENABLED_KEY) === true
    } catch {
      return false
    }
  }

  /**
   * 切换音效开关并持久化。
   */
  static setEnabled(enabled: boolean): void {
    Taro.setStorageSync(SFX_ENABLED_KEY, enabled)
  }

  /**
   * 播放指定音效；静音或未加载资源时静默跳过。
   */
  static play(key: SfxKey): void {
    if (!this.isEnabled()) {
      return
    }
    try {
      let audio = this.pool[key]
      if (!audio) {
        audio = Taro.createInnerAudioContext()
        audio.src = SFX_SRC[key]
        audio.volume = 0.85
        this.pool[key] = audio
      }
      audio.stop()
      audio.seek(0)
      audio.play()
    } catch {
      // 音效非关键路径，失败不阻断主流程
    }
  }

  /**
   * 销毁音频实例（页面卸载时可选调用）。
   */
  static destroy(): void {
    Object.values(this.pool).forEach((audio) => {
      try {
        audio?.destroy()
      } catch {
        // ignore
      }
    })
    this.pool = {}
  }
}
