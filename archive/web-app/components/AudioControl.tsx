import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { AudioManager } from '../utils/audio';

export function AudioControl() {
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [seEnabled, setSeEnabled] = useState(true);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const bgm = localStorage.getItem('bgmEnabled');
    const se = localStorage.getItem('seEnabled');
    if (bgm === 'false') setBgmEnabled(false);
    if (se === 'false') setSeEnabled(false);
  }, []);

  const toggleBgm = () => {
    const newVal = !bgmEnabled;
    setBgmEnabled(newVal);
    localStorage.setItem('bgmEnabled', String(newVal));
    AudioManager.setBgmEnabled(newVal);
    if (newVal) AudioManager.playBGM();
  };

  const toggleSe = () => {
    const newVal = !seEnabled;
    setSeEnabled(newVal);
    localStorage.setItem('seEnabled', String(newVal));
    AudioManager.setSeEnabled(newVal);
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        {bgmEnabled ? <Music className="size-5 text-purple-500" /> : <VolumeX className="size-5 text-gray-400" />}
      </button>

      {showPanel && (
        <div className="fixed top-16 right-4 z-50 bg-white rounded-2xl shadow-2xl p-4 min-w-48 animate-in fade-in slide-in-from-top-2 duration-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Volume2 className="size-5 text-purple-500" />
            声音设置
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">背景音乐</span>
              <button
                onClick={toggleBgm}
                className={`w-12 h-6 rounded-full transition-colors relative ${bgmEnabled ? 'bg-purple-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${bgmEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">音效</span>
              <button
                onClick={toggleSe}
                className={`w-12 h-6 rounded-full transition-colors relative ${seEnabled ? 'bg-purple-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${seEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}