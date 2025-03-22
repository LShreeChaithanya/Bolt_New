import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

const HomePage = () => {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate('/builder', { state: { prompt } });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-dark/90 text-white">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            What do you want to build?
          </h1>
          <p className="text-gray-400 mb-8 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Prompt, run, write and deploy full-stack web apps.
          </p>
          
          <form onSubmit={handleSubmit} className="mb-12 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="relative group">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="How can this help you build?"
                className="w-full px-6 py-4 bg-dark-gray/50 rounded-lg border border-gray-700 
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 text-lg
                         transition-all duration-300 glass-effect"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3
                         bg-blue-600 hover:bg-blue-700 rounded-md transition-all
                         duration-300 button-glow"
              >
                <Wand2 className="w-6 h-6" />
              </button>
            </div>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 animate-slide-up"
               style={{ animationDelay: '0.6s' }}>
            {[
              'Build a mobile app with React Native',
              'Create a docs site with Typescript',
              'Build a portfolio with Next.js',
              'Create a blog with Remix'
            ].map((text, index) => (
              <div
                key={index}
                className="p-4 bg-dark-gray/30 rounded-lg hover:bg-gray-800/50 
                         cursor-pointer transition-all duration-300 hover-scale
                         glass-effect"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;