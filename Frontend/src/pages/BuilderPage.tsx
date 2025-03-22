import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Code, Eye, MessageSquare, File, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface FileStructure {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileStructure[];
  isOpen?: boolean;
}

const BuilderPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [messages, setMessages] = useState<string[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileStructure, setFileStructure] = useState<FileStructure[]>([
    {
      name: 'src',
      type: 'folder',
      isOpen: true,
      children: [
        {
          name: 'components',
          type: 'folder',
          isOpen: false,
          children: [
            { 
              name: 'Header.tsx',
              type: 'file',
              content: `import React from 'react';

interface HeaderProps {
  title: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ title, description }) => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {description && <p className="text-lg opacity-90">{description}</p>}
      </div>
    </header>
  );
};

export default Header;`
            },
            { 
              name: 'Footer.tsx',
              type: 'file',
              content: `import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p>&copy; {year} Your Company. All rights reserved.</p>
          <div className="space-x-4">
            <a href="#" className="hover:text-blue-400">Terms</a>
            <a href="#" className="hover:text-blue-400">Privacy</a>
            <a href="#" className="hover:text-blue-400">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;`
            },
          ]
        },
        { 
          name: 'App.tsx',
          type: 'file',
          content: `import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        title="Welcome to Our Platform"
        description="Build amazing web applications with ease"
      />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Featured Content</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add your content here */}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;`
        },
        { 
          name: 'main.tsx',
          type: 'file',
          content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root element');

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`
        },
      ]
    }
  ]);

  // On mount, if an initial prompt exists in location.state, send it directly to the server.
  useEffect(() => {
    if (location.state?.prompt) {
      const initialPrompt = location.state.prompt;
      // Append user's initial prompt to messages
      setMessages(prev => [...prev, `You: ${initialPrompt}`]);
      setIsLoading(true);
      fetch('http://localhost:3001/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: initialPrompt }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.choices?.[0]?.message?.content) {
          setMessages(prev => [...prev, `Server: ${data.choices[0].message.content}`]);
        } else {
          setMessages(prev => [...prev, 'Server: No valid response.']);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setMessages(prev => [...prev, 'Server: Error sending prompt.']);
      })
      .finally(() => {
        setIsLoading(false);
      });
    }
  }, [location.state]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setIsLoading(true);
      // Append user's message
      setMessages(prev => [...prev, `You: ${newMessage}`]);
      try {
        const response = await fetch('http://localhost:3001/template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: newMessage }),
        });
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          setMessages(prev => [...prev, `Server: ${data.choices[0].message.content}`]);
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, 'Server: Error sending message.']);
      } finally {
        setIsLoading(false);
        setNewMessage('');
      }
    }
  };

  const getFileContent = (path: string): string => {
    const findContent = (items: FileStructure[], pathParts: string[]): string => {
      for (const item of items) {
        if (item.name === pathParts[0]) {
          if (pathParts.length === 1) {
            return item.content || '';
          }
          if (item.children) {
            return findContent(item.children, pathParts.slice(1));
          }
        }
      }
      return '';
    };
    return findContent(fileStructure, path.split('/'));
  };

  const toggleFolder = (path: string[]) => {
    const updateStructure = (items: FileStructure[], currentPath: string[]): FileStructure[] => {
      return items.map(item => {
        if (item.name === currentPath[0]) {
          if (currentPath.length === 1) {
            return { ...item, isOpen: !item.isOpen };
          }
          return {
            ...item,
            children: item.children ? updateStructure(item.children, currentPath.slice(1)) : []
          };
        }
        return item;
      });
    };
    setFileStructure(updateStructure(fileStructure, path));
  };

  const renderFileTree = (items: FileStructure[], path: string[] = []) => {
    return items.map((item, index) => (
      <div key={index} className="ml-4 animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
        <div
          className={`flex items-center py-1.5 px-2 rounded-md transition-all duration-200
                     hover:bg-gray-800/70 cursor-pointer ${
            selectedFile === [...path, item.name].join('/') ? 'bg-gray-800/90' : ''
          }`}
          onClick={() => {
            if (item.type === 'folder') {
              toggleFolder([...path, item.name]);
            } else {
              setSelectedFile([...path, item.name].join('/'));
            }
          }}
        >
          {item.type === 'folder' ? (
            <>
              {item.isOpen ? (
                <ChevronDown className="w-4 h-4 mr-1 transition-transform duration-200" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1 transition-transform duration-200" />
              )}
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
            </>
          ) : (
            <File className="w-4 h-4 mr-2 text-gray-400" />
          )}
          <span className="text-sm">{item.name}</span>
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          <div className="ml-2 transition-all duration-300">
            {renderFileTree(item.children, [...path, item.name])}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark/95 to-dark/90 text-white flex animate-fade-in">
      {/* Left Panel - Build Process & Chat */}
      <div className="w-1/3 p-6 border-r border-gray-700/50 flex flex-col glass-effect">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Building your website...
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-dark-gray/30 rounded-lg glass-effect transition-all duration-300 hover:bg-dark-gray/40">
              <p className="text-green-400 flex items-center">
                <span className="mr-2">✓</span> Analyzing prompt
              </p>
              <p className="text-sm text-gray-400">Understanding requirements and constraints</p>
            </div>
            <div className="p-4 bg-dark-gray/30 rounded-lg glass-effect transition-all duration-300 hover:bg-dark-gray/40">
              <p className="text-green-400 flex items-center">
                <span className="mr-2">✓</span> Generating components
              </p>
              <p className="text-sm text-gray-400">Creating React components and styling</p>
            </div>
            <div className="p-4 bg-dark-gray/30 rounded-lg glass-effect transition-all duration-300 hover:bg-dark-gray/40">
              <p className="text-blue-400 flex items-center animate-pulse">
                <span className="mr-2">⟳</span> Optimizing code
              </p>
              <p className="text-sm text-gray-400">Applying best practices and performance improvements</p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className="p-4 bg-dark-gray/30 rounded-lg glass-effect animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {msg}
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your follow-up prompt..."
              className="flex-1 px-4 py-2 bg-dark-gray/30 rounded-lg border border-gray-700/50 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 
                       transition-all duration-300 glass-effect"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 
                       transition-all duration-300 button-glow ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              <MessageSquare className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel with File Explorer, Code & Preview */}
      <div className="flex-1 flex">
        {/* File Explorer */}
        <div className="w-64 border-r border-gray-700/50 bg-dark-gray/30 overflow-y-auto glass-effect">
          <div className="p-4">
            {renderFileTree(fileStructure)}
          </div>
        </div>

        {/* Code and Preview Panel */}
        <div className="flex-1 p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 button-glow
                ${activeTab === 'code' ? 'bg-blue-600' : 'bg-dark-gray/30 glass-effect'}`}
            >
              <Code className="w-5 h-5" />
              Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 button-glow
                ${activeTab === 'preview' ? 'bg-blue-600' : 'bg-dark-gray/30 glass-effect'}`}
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
          </div>

          {activeTab === 'code' ? (
            <div className="bg-dark-gray/30 rounded-lg overflow-hidden glass-effect animate-fade-in">
              <SyntaxHighlighter
                language="typescript"
                style={atomOneDark}
                customStyle={{
                  padding: '1.5rem',
                  background: 'transparent',
                  margin: 0,
                  transition: 'all 0.3s ease',
                }}
              >
                {selectedFile ? getFileContent(selectedFile) : '// Select a file to view its contents'}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="bg-white rounded-lg h-[calc(100vh-200px)] p-4 animate-fade-in glass-effect">
              <iframe
                title="Preview"
                className="w-full h-full border-0 rounded-lg"
                src="about:blank"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
