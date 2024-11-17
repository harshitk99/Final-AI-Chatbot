import React, { useEffect, useState } from 'react';
import { MagicCard } from './components/ui/magic-card';
import { BorderBeam } from './components/ui/border-beam';
import SparklesText from './components/ui/sparkles-text';
import ShinyButton from './components/ui/shiny-button';

const VoiceDots: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [dotSizes, setDotSizes] = useState([15, 15, 15, 15]);
  const [transcript, setTranscript] = useState('');
  const [backendResponse, setBackendResponse] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const currentTranscript = event.results[event.results.length - 1][0].transcript.trim();
        setTranscript(currentTranscript);
        sendMessageToBackend(currentTranscript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionEvent) => {
        console.error('Speech recognition error: ', event);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Backend Response Text-to-Speech
  useEffect(() => {
    if (backendResponse) {
      speakText(backendResponse);
    }
  }, [backendResponse]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('SpeechSynthesis API is not supported in this browser.');
    }
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
      animateDots();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
      setDotSizes([15, 15, 15, 15]);
    }
  };

  const animateDots = () => {
    if (isListening) {
      const interval = setInterval(() => {
        setDotSizes((sizes) => sizes.map(() => 15 + Math.floor(Math.random() * 10)));
      }, 300);
      return () => clearInterval(interval);
    }
  };

  const sendMessageToBackend = async (message: string) => {
    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userPrompt: message }),
      });
      const data = await response.json();
      setBackendResponse(data.obj.reply);
    } catch (error) {
      console.error('Error connecting to backend:', error);
    }
  };

  const renderBackendResponse = () => {
    return (
      <div
        className={`mt-6 p-6 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
        } animate-fade-in`}
      >
        <p>{backendResponse}</p>
        <pre
          className={`mt-4 p-4 rounded-lg border ${
            isDarkMode ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-300 bg-gray-200 text-gray-700'
          }`}
        >
          {backendResponse}
        </pre>
      </div>
    );
  };

  return (
    <MagicCard
      className={`flex flex-col items-center w-screen justify-center min-h-screen ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white'
          : 'bg-gradient-to-br from-yellow-100 via-blue-100 to-indigo-100 text-gray-900'
      }`}
    >
      {/* Header Section */}
      <div className="w-full max-w-4xl relative flex justify-between items-center px-6 py-4 border-b border-zinc-600">
        <SparklesText className="text-xl md:text-3xl font-bold animate-slide-down" text="AI CHATBOT" />
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={!isDarkMode}
            onChange={() => setIsDarkMode(!isDarkMode)}
            className="sr-only"
          />
          <div
            className={`flex-col flex justify-center relative w-12 h-6 rounded-full ${
              isDarkMode ? 'bg-gray-600' : 'bg-yellow-400'
            } transition-colors duration-300`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform transform ${
                isDarkMode ? 'bg-white translate-x-0' : 'bg-black translate-x-6'
              }`}
            />
          </div>
        </label>
      </div>

      {/* Main Content Section */}
      <div className="w-full max-w-4xl relative border rounded-lg p-6 md:px-12">
        <BorderBeam borderWidth={3} size={600} duration={12} delay={9} />
        <div className="mt-6 flex justify-center space-x-2">
          {dotSizes.map((size, index) => (
            <div
              key={index}
              className={`rounded-full transition-all duration-200 ${
                isDarkMode ? 'bg-white' : 'bg-gray-900'
              } animate-pulse`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
              }}
            />
          ))}
        </div>
        <div className="flex flex-col w-full justify-center items-center p-2 space-y-4">
          <input
            type="text"
            placeholder="Your speech will appear here"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className={`px-4 py-3 border rounded-lg w-full max-w-lg bg-transparent placeholder-gray-400 
              ${isDarkMode ? 'text-white border-gray-700' : 'text-black border-gray-300'} 
              focus:outline-none focus:ring-2 focus:ring-blue-500 animate-fade-in`}
          />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
          <ShinyButton
            disabled={isListening}
            onClick={startListening}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
              isListening
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 border-blue-500'
            }`}
          >
            Start Listening
          </ShinyButton>
          <ShinyButton
            disabled={!isListening}
            onClick={stopListening}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-2 ${
              !isListening
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 border-red-500'
            }`}
          >
            Stop Listening
          </ShinyButton>
        </div>
        <p
          className={`mt-4 text-center text-base md:text-xl ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {isListening ? 'Listening...' : 'Not Listening'}
        </p>
      </div>

      {/* Render Backend Response */}
      {backendResponse && renderBackendResponse()}
    </MagicCard>
  );
};

export default VoiceDots;
