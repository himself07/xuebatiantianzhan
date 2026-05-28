import { useEffect, useState } from 'react';
import { playSound } from '../utils/audio';

interface PageGreetingProps {
  pageName: string;
  pageGreetings: string[];
}

export function PageGreeting({ pageName, pageGreetings }: PageGreetingProps) {
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const greeting = pageGreetings[Math.floor(Math.random() * pageGreetings.length)];
    setGreeting(greeting);
    setShowGreeting(true);
    playSound('pageEnter');

    const timer = setTimeout(() => {
      setShowGreeting(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [pageName, pageGreetings]);

  if (!showGreeting) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-2xl px-6 py-3">
        <p className="text-white font-medium text-center">🐱 {greeting}</p>
      </div>
    </div>
  );
}