// File: app/page.tsx
"use client";

import { useState, useEffect,useRef  } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Bell, Moon, Music, Shield, ThermometerIcon, RotateCcw, Play, Pause, Phone, Video, Volume2, Power } from 'lucide-react';

export default function Home() {
  const [isRocking, setIsRocking] = useState(false);
  const [playingLullaby, setPlayingLullaby] = useState(false);
  const [volume, setVolume] = useState(50);
  const [temperature, setTemperature] = useState(24);
  const [humidity, setHumidity] = useState(45);
  const [isCrying, setIsCrying] = useState(false);
  const [nightLight, setNightLight] = useState(false);

  // Mock data for the sleep pattern chart
  const lullabyRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!lullabyRef.current) return; // ⛑️ very important safe check

    if (playingLullaby) {
      lullabyRef.current.play().catch((error) => {
        console.error('Playback failed:', error);
      });
    } else {
      lullabyRef.current.pause();
      lullabyRef.current.currentTime = 0;
    }
  }, [playingLullaby]);


  useEffect(() => {
    if (isCrying) {
      setPlayingLullaby(true);
    } else {
      setPlayingLullaby(false);
    }
  }, [isCrying]);
  

  
  useEffect(() => {
    let audioContext;
    let analyser;
    let microphone;
    let javascriptNode;
  
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
  
        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;
  
        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);
  
        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;
  
          const length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }
  
          const average = values / length;
  
          // Example threshold (adjust as needed)
          if (average > 30) { 
            setIsCrying(true);
          } else {
            setIsCrying(false);
          }
        };
      })
      .catch(err => {   // <-- moved catch here
        console.error('Microphone permission denied:', err);
      });
  
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);
  

useEffect(() => {
  const generateRandomValues = () => {
    const randomTemp = Math.floor(Math.random() * (35 - 20 + 1)) + 20; // 20°C to 35°C
    const randomHumidity = Math.floor(Math.random() * (80 - 30 + 1)) + 30; // 30% to 80%
    setTemperature(randomTemp);
    setHumidity(randomHumidity);
  };

  // Generate values initially
  generateRandomValues();

  // Update values every 5 seconds (5000ms)
  const interval = setInterval(generateRandomValues, 5000);

  // Cleanup interval on component unmount
  return () => clearInterval(interval);
}, []);
  const sleepData = [
    { time: '8 PM', status: 'Awake' },
    { time: '9 PM', status: 'Asleep' },
    { time: '10 PM', status: 'Asleep' },
    { time: '11 PM', status: 'Asleep' },
    { time: '12 AM', status: 'Asleep' },
    { time: '1 AM', status: 'Briefly Awake' },
    { time: '2 AM', status: 'Asleep' },
    { time: '3 AM', status: 'Asleep' },
    { time: '4 AM', status: 'Asleep' },
    { time: '5 AM', status: 'Awake' },
    { time: '6 AM', status: 'Asleep' },
  ];

  // Transform sleep data for chart
  const chartData = sleepData.map(item => ({
    time: item.time,
    value: item.status === 'Asleep' ? 1 : item.status === 'Briefly Awake' ? 0.5 : 0,
  }));

  // Simulate a cry detection
  useEffect(() => {
    const cryTimer = setTimeout(() => {
      setIsCrying(true);
      
      // Auto-start rocking and lullaby when crying is detected
      if (!isRocking) setIsRocking(true);
      if (!playingLullaby) setPlayingLullaby(true);
      
      // Reset crying after 30 seconds
      setTimeout(() => setIsCrying(false), 30000);
    }, 15000);
    
    return () => clearTimeout(cryTimer);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Smart Cradle</h1>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isCrying ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {isCrying ? 'Baby is crying!' : 'Baby is calm'}
            </span>
            <button className="p-2 rounded-full bg-gray-200 hover:bg-gray-300">
              <Bell size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert banner when crying */}
        {isCrying && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Your baby started crying at 9:45 PM. Automatic rocking and lullaby activated.
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100">
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status and controls grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Video monitor */}
          <div className="bg-white shadow rounded-lg p-6 col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Live Monitor</h2>
              <div className="flex space-x-2">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <Video size={18} />
                </button>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                  <Phone size={18} />
                </button>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative">
              {/* Placeholder for video feed */}
              <video 
  src="/video.mp4" 
  className="rounded-lg" 
  autoPlay 
  loop 
  muted 
  playsInline
/>
 <div className="absolute bottom-4 right-4 flex space-x-2">
                <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white">
                  <Volume2 size={16} />
                </button>
                <button className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white">
                  <Power size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Current environmental status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Current Status</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Temperature</span>
                  <span className="text-sm font-medium text-gray-900">{temperature}°C</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(temperature / 40) * 100}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Humidity</span>
                  <span className="text-sm font-medium text-gray-900">{humidity}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: `${humidity}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Noise Level</span>
                  <span className="text-sm font-medium text-gray-900">{isCrying ? 'High' : 'Low'}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className={`h-2 rounded-full ${isCrying ? 'bg-red-500 w-4/5' : 'bg-gray-400 w-1/5'}`}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Movement Detection</span>
                  <span className="text-sm font-medium text-gray-900">Normal</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls and Sleep Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Cradle Controls</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                className={`p-4 rounded-lg flex flex-col items-center justify-center ${isRocking ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                onClick={() => setIsRocking(!isRocking)}
              >
                <RotateCcw size={24} className="mb-2" />
                <span className="text-sm font-medium">{isRocking ? 'Stop Rocking' : 'Start Rocking'}</span>
              </button>
              
              <button 
                className={`p-4 rounded-lg flex flex-col items-center justify-center ${playingLullaby ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                onClick={() => setPlayingLullaby(!playingLullaby)}
              >
                <Music size={24} className="mb-2" />
                <span className="text-sm font-medium">{playingLullaby ? 'Stop Lullaby' : 'Play Lullaby'}</span>
              </button>
              
              <button 
                className={`p-4 rounded-lg flex flex-col items-center justify-center ${nightLight ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                onClick={() => setNightLight(!nightLight)}
              >
                <Moon size={24} className="mb-2" />
                <span className="text-sm font-medium">{nightLight ? 'Turn Off Light' : 'Night Light'}</span>
              </button>
              
              <button className="p-4 rounded-lg flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700">
                <Shield size={24} className="mb-2" />
                <span className="text-sm font-medium">Safety Check</span>
              </button>
            </div>
            
            {/* Volume control */}
            {playingLullaby && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-500">Lullaby Volume</span>
                  <span className="text-sm font-medium text-gray-900">{volume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume} 
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
          <audio ref={lullabyRef} src="/lullaby.mp3" loop preload="auto" />
  
          {/* Sleep analytics */}
          <div className="bg-white shadow rounded-lg p-6 col-span-2">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sleep Analytics</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} tickFormatter={(value) => {
                    if (value === 1) return 'Asleep';
                    if (value === 0.5) return 'Drowsy';
                    return 'Awake';
                  }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="stepAfter" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2} 
                    name="Sleep State" 
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Total Sleep</p>
                <p className="text-xl font-semibold text-purple-700">7.5 hrs</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Deep Sleep</p>
                <p className="text-xl font-semibold text-blue-700">4.2 hrs</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Sleep Quality</p>
                <p className="text-xl font-semibold text-green-700">Good</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}