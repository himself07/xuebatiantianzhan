/**
 * 生成轻量 WAV 音效（8kHz 单声道），供微信小程序 InnerAudioContext 使用。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../src/assets/sfx')

/**
 * 写入简易正弦波 WAV 文件。
 * @param {string} filename - 输出文件名
 * @param {number} freq - 频率 Hz
 * @param {number} durationMs - 时长毫秒
 * @param {number} volume - 音量 0~1
 */
function writeWav(filename, freq, durationMs, volume = 0.25) {
  const sampleRate = 8000
  const numSamples = Math.floor((sampleRate * durationMs) / 1000)
  const dataSize = numSamples * 2
  const buffer = Buffer.alloc(44 + dataSize)

  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate
    const envelope = Math.min(1, i / 80, (numSamples - i) / 120)
    const sample = Math.sin(2 * Math.PI * freq * t) * volume * envelope
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), 44 + i * 2)
  }

  fs.writeFileSync(path.join(OUT_DIR, filename), buffer)
}

fs.mkdirSync(OUT_DIR, { recursive: true })
writeWav('hit.wav', 880, 120, 0.22)
writeWav('finisher.wav', 660, 280, 0.28)
writeWav('boss_enter.wav', 523, 200, 0.2)
console.log('Generated sfx wav files in src/assets/sfx/')
