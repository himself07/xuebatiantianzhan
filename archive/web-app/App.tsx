import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { IntroVideo } from './components/IntroVideo';
import { AudioManager } from './utils/audio';
import { AudioControl } from './components/AudioControl';

export default function App() {
  const [showIntro, setShowIntro] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    const lastIntroDate = localStorage.getItem('lastIntroDate');
    const today = new Date().toDateString();

    if (lastIntroDate !== today) {
      setShowIntro(true);
    } else {
      setIntroCompleted(true);
      AudioManager.playBGM();
    }

    const bgmEnabled = localStorage.getItem('bgmEnabled');
    if (bgmEnabled === 'false') {
      AudioManager.setBgmEnabled(false);
    }
  }, []);

  const handleIntroComplete = () => {
    localStorage.setItem('lastIntroDate', new Date().toDateString());
    setShowIntro(false);
    setIntroCompleted(true);
    AudioManager.playBGM();
  };

  if (showIntro) {
    return <IntroVideo onComplete={handleIntroComplete} />;
  }

  if (!introCompleted) {
    return null;
  }

  return (
    <>
      <AudioControl />
      <RouterProvider router={router} />
    </>
  );
}
