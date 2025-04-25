import React, { useState, useEffect, useRef } from 'react';
import { Code, Server, TestTube2, FileSearch, Play, Pause, RotateCcw, Settings, Layers } from 'lucide-react';
import voiceover from './voiceover.wav';

const AIInfographic = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(80); // Total duration in seconds
  const [showControls, setShowControls] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  
  // Audio ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // Refs for scrolling
  const headerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const requirementRef = useRef<HTMLDivElement>(null);
  const implementationRef = useRef<HTMLDivElement>(null);
  const testingRef = useRef<HTMLDivElement>(null);
  const deployRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const callToActionRef = useRef<HTMLDivElement>(null);
  
  // Animation timeline - elements appear at these time points (in seconds)
  const timeline = {
    header: 0,
    intro: 0, // Hiện ngay từ đầu cùng header
    requirement: 15, // 1s sau khi kết thúc phần giới thiệu (14s)
    implementation: 30, // 1s sau khi kết thúc phần requirement (29s)
    testing: 44, // 1s sau khi kết thúc phần implementation (43s)
    deploy: 53, // 1s sau khi kết thúc phần testing (52s)
    summary: 63, // 1s sau khi kết thúc phần deploy (62s)
    callToAction: 72 // 1s sau khi kết thúc phần tổng quan (71s)
  };
  
  // Control playback
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isPlaying) {
      // Play audio if not already playing
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play();
      }
      interval = setInterval(() => {
        setCurrentTime(prevTime => {
          if (prevTime >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prevTime + 0.1;
        });
      }, 100);
    } else {
      // Pause audio if playing
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration]);
  
  // Sync audio currentTime with timeline
  useEffect(() => {
    if (audioRef.current) {
      if (Math.abs(audioRef.current.currentTime - currentTime) > 0.2) {
        audioRef.current.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  // When user seeks timeline, update audio position
  useEffect(() => {
    if (!isPlaying && audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime, isPlaying]);

  // When audio ends, stop playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Auto-scrolling effect
  useEffect(() => {
    const sectionRefs = {
      header: headerRef,
      intro: introRef,
      requirement: requirementRef,
      implementation: implementationRef,
      testing: testingRef,
      deploy: deployRef,
      summary: summaryRef,
      callToAction: callToActionRef
    };
    
    // Find which section should be visible based on current time
    const currentSection = Object.entries(timeline).reduce<string | null>((latest, [section, time]) => {
      if (currentTime >= time && (!latest || (latest && time > timeline[latest as keyof typeof timeline]))) {
        return section;
      }
      return latest;
    }, null);
    
    // Scroll to that section if it exists
    const ref = currentSection ? sectionRefs[currentSection as keyof typeof sectionRefs] : null;
    if (ref && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime]);
  
  // Auto-hide controls when playing
  useEffect(() => {
    const handleInteraction = () => {
      setShowControls(true);
      setLastInteraction(Date.now());
    };
    
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    const checkIdleTime = setInterval(() => {
      if (isPlaying && Date.now() - lastInteraction > 2000) {
        setShowControls(false);
      }
    }, 500);
    
    return () => {
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      clearInterval(checkIdleTime);
    };
  }, [isPlaying, lastInteraction]);
  
  // Reset function
  const resetTimeline = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Set total duration based on timeline
  useEffect(() => {
    const maxTime = Math.max(...Object.values(timeline)) + 5; // Add 5 seconds buffer
    setDuration(maxTime);
  }, []);
  
  // Function to check if an element should be visible
  const isVisible = (timepoint: number) => currentTime >= timepoint;
  
  // Function for smooth fade-in animation
  const getOpacityStyle = (timepoint: number) => {
    if (!isVisible(timepoint)) return { opacity: 0, transform: 'translateY(20px)' };
    
    // Calculate fade-in progress (over 1 second)
    const fadeProgress = Math.min(currentTime - timepoint, 1);
    return { 
      opacity: fadeProgress, 
      transform: `translateY(${20 - (fadeProgress * 20)}px)`
    };
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-4 md:p-8 font-sans relative">
      {/* Audio element for voiceover */}
      <audio
        ref={audioRef}
        src={voiceover}
        preload="auto"
        style={{ display: 'none' }}
      />
      <div className="max-w-6xl mx-auto">
        {/* Timeline Controls - will be hidden during slideshow */}
        <div 
          className={`fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 z-50 shadow-lg border-t border-blue-200 transition-all duration-500 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4">
            <div className="flex gap-4">
              <button 
                className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full transition-all"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              <button 
                className="bg-teal-500 hover:bg-teal-600 text-white p-2 rounded-full transition-all"
                onClick={resetTimeline}
              >
                <RotateCcw size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center gap-2">
              <input 
                type="range" 
                min="0" 
                max={duration} 
                step="0.1"
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <span className="text-sm font-mono w-16 text-gray-700">{currentTime.toFixed(1)}s</span>
            </div>
            
            <div className="flex gap-2 text-xs md:text-sm flex-wrap justify-center">
              {Object.entries(timeline).map(([key, time]) => (
                <button 
                  key={key}
                  onClick={() => setCurrentTime(time)}
                  className={`px-2 py-1 rounded-full transition-all ${currentTime >= time 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Float control button when controls are hidden */}
        {isPlaying && !showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="fixed bottom-4 right-4 bg-sky-500 text-white p-3 rounded-full shadow-lg z-50 opacity-70 hover:opacity-100 transition-opacity"
          >
            <Settings size={24} />
          </button>
        )}

        {/* Header Section */}
        <header 
          ref={headerRef}
          className="text-center mb-12 pt-8 transition-all duration-700"
          style={getOpacityStyle(timeline.header)}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-teal-700">
            AI – Siêu Năng Lực Mới Của Dev Thời 4.0
          </h1>
          <div
            ref={introRef}
            className="bg-white/70 rounded-lg p-6 mt-6 max-w-3xl mx-auto transition-all duration-700 shadow-md border border-teal-200"
            style={getOpacityStyle(timeline.intro)}
          >
            <p className="text-2xl md:text-3xl italic text-teal-800">
              "AI đã len lỏi vào mọi ngóc ngách của phát triển phần mềm"
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* 1. Requirement Gathering */}
          <div
            ref={requirementRef}
            className="bg-white/80 rounded-xl p-6 backdrop-blur-sm border border-teal-200 hover:shadow-lg transition-all duration-500 shadow-md"
            style={getOpacityStyle(timeline.requirement)}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full shadow-md">
                <FileSearch size={56} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-teal-700">1. Thu Thập Yêu Cầu</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-cyan-600">AI làm được gì?</h3>
              <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
                <li>Brainstorm ý tưởng cực cháy 🔥</li>
                <li>Phân tích yêu cầu chặt chẽ</li>
                <li>Research nhanh x10 Google thường</li>
                <li>Prompt vài giây = UML vẽ cả buổi</li>
              </ul>
            </div>
          </div>

          {/* 2. Implementation */}
          <div
            ref={implementationRef}
            className="bg-white/80 rounded-xl p-6 backdrop-blur-sm border border-sky-200 hover:shadow-lg transition-all duration-500 shadow-md"
            style={getOpacityStyle(timeline.implementation)}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full shadow-md">
                <Code size={56} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-sky-700">2. Code Như Hack Não</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-sky-600">Trước kia:</h3>
                <p className="text-lg text-gray-700">Copy-paste code từ StackOverflow như điên 🤪</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-sky-600">Giờ đây:</h3>
                <p className="text-lg text-gray-700">GitHub Copilot viết code ngon-bổ-rẻ, cứ như có team senior ngồi cạnh 🚀</p>
              </div>
            </div>
          </div>

          {/* 3. Testing */}
          <div
            ref={testingRef}
            className="bg-white/80 rounded-xl p-6 backdrop-blur-sm border border-amber-200 hover:shadow-lg transition-all duration-500 shadow-md"
            style={getOpacityStyle(timeline.testing)}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-md">
                <TestTube2 size={56} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-amber-700">3. Testing Siêu Tốc</h2>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-amber-600">AI flex gì?</h3>
              <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
                <li>Tự thêm log, giám sát code 24/7</li>
                <li>Viết test case như máy, chưa bao giờ ngáp 😴</li>
                <li>Filter test thông minh → Dev rảnh tay đi cà phê ☕</li>
              </ul>
            </div>
          </div>

          {/* 4. Deploy */}
          <div
            ref={deployRef}
            className="bg-white/80 rounded-xl p-6 backdrop-blur-sm border border-rose-200 hover:shadow-lg transition-all duration-500 shadow-md"
            style={getOpacityStyle(timeline.deploy)}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-md">
                <Server size={56} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-rose-700">4. Deploy Không Lo</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-semibold text-rose-600">Thời cổ đại:</h3>
                <p className="text-lg text-gray-700">Thức trắng đêm canh hệ thống như canh người yêu cũ 👀</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-rose-600">Thời 4.0:</h3>
                <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
                  <li>AI tự phát hiện lỗi trước cả khi sếp biết 🕵️</li>
                  <li>Cảnh báo quá tải trước khi server "về với tổ tiên" 💀</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Summary Section (All 4 points in one slide) */}
        <div
          ref={summaryRef}
          className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-8 backdrop-blur-sm border border-purple-200 shadow-md mb-12 transition-all duration-700"
          style={getOpacityStyle(timeline.summary)}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-purple-700">
            AI & DEV 4.0: TỔNG QUAN
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-lg p-4 shadow-md border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full shadow-sm">
                  <FileSearch size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-teal-700">1. Thu Thập Yêu Cầu</h3>
              </div>
              <p className="text-gray-700">Brainstorm ý tưởng cực nhanh, phân tích yêu cầu và tạo UML chính xác</p>
            </div>
            
            <div className="bg-white/80 rounded-lg p-4 shadow-md border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full shadow-sm">
                  <Code size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-sky-700">2. Code Như Hack Não</h3>
              </div>
              <p className="text-gray-700">Từ copy-paste Stack Overflow đến GitHub Copilot tự động hóa coding</p>
            </div>
            
            <div className="bg-white/80 rounded-lg p-4 shadow-md border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-sm">
                  <TestTube2 size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-amber-700">3. Testing Siêu Tốc</h3>
              </div>
              <p className="text-gray-700">Tự giám sát code 24/7, viết test case siêu nhanh, filter thông minh</p>
            </div>
            
            <div className="bg-white/80 rounded-lg p-4 shadow-md border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-sm">
                  <Server size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-rose-700">4. Deploy Không Lo</h3>
              </div>
              <p className="text-gray-700">AI tự phát hiện lỗi, cảnh báo quá tải trước khi xảy ra sự cố</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/80 rounded-lg shadow-md border border-purple-200">
            <div className="flex items-center gap-3 mb-2 justify-center">
              <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full shadow-sm">
                <Layers size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-700">Lợi Ích Tổng Thể</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-gray-700">
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Tăng năng suất x10
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Giảm lỗi code x5
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Tối ưu thời gian
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Tự động hóa công việc
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Hỗ trợ brainstorm
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">✓</span> Cá nhân hóa workflow
              </li>
            </ul>
          </div>
        </div>

        {/* Conclusion & Call to Action */}
        <div
          ref={callToActionRef}
          className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-8 text-center mb-8 backdrop-blur-sm border border-blue-200 shadow-md transition-all duration-700"
          style={getOpacityStyle(timeline.callToAction)}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-blue-600">KẾT LUẬN</h2>
          <p className="text-xl md:text-2xl font-semibold text-indigo-700 mb-6">
            AI Giờ Đây Quan Trọng Với Dev Như Caffeine Và Wifi 🔌☕
          </p>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-teal-600 mt-8">BẠN READY CHƯA?</h2>
          <p className="text-xl mb-2 text-gray-700">Ứng Dụng AI Vào Cuộc Sống Dev Như Thế Nào?</p>
          <p className="text-2xl font-bold text-blue-600">👉 Follow Ngay Để Không Bỏ Lỡ! 👈</p>
        </div>
      </div>
    </div>
  );
};

export default AIInfographic;

import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<AIInfographic />);
}
