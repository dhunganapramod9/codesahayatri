import React, { useState, useMemo } from 'react';
import { GraphVisualization } from './components/GraphVisualization';
import { RepositoryInput } from './components/RepositoryInput';
import { ChatBox } from './components/ChatBox';
import { AuthorPanel } from './components/AuthorPanel';
import { GraphData } from './types';
import { Code2, Brain, Github as Git, Users, Search } from 'lucide-react';
import { fetchRepositoryData, fetchCommits } from './utils/github';

function App() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAuthorPanel, setShowAuthorPanel] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [directorySearch, setDirectorySearch] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const authors = useMemo(() => {
    if (!commits.length) return [];
    
    const authorMap = new Map();
    
    commits.forEach(commit => {
      const author = commit.author;
      if (!authorMap.has(author.login)) {
        authorMap.set(author.login, {
          login: author.login,
          avatar_url: author.avatar_url,
          commits: []
        });
      }
      
      authorMap.get(author.login).commits.push({
        sha: commit.sha,
        message: commit.message,
        date: commit.date,
        files: commit.files
      });
    });
    
    return Array.from(authorMap.values());
  }, [commits]);

  const filteredAuthors = useMemo(() => {
    if (!directorySearch) return authors;

    return authors.map(author => ({
      ...author,
      commits: author.commits.filter(commit => 
        commit.files.some(file => 
          file.filename.toLowerCase().includes(directorySearch.toLowerCase())
        )
      )
    })).filter(author => author.commits.length > 0);
  }, [authors, directorySearch]);

  const handleDirectorySearch = (value: string) => {
    setDirectorySearch(value);
    if (value && graphData) {
      const suggestions = Array.from(new Set(
        graphData.nodes
          .filter(node => 
            node.id.toLowerCase().includes(value.toLowerCase())
          )
          .map(node => node.id)
      )).slice(0, 5);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDirectorySearch(suggestion);
    setSearchSuggestions([]);
  };

  const handleRepositorySubmit = async (url: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { owner, repo } = (() => {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        return { owner: parts[0], repo: parts[1].replace('.git', '') };
      })();

      const [data, commitData] = await Promise.all([
        fetchRepositoryData(url),
        fetchCommits(owner, repo)
      ]);

      setGraphData(data);
      setCommits(commitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Tech Background */}
      <div className="tech-background">
        <div className="tech-lines"></div>
      </div>

      {/* Header */}
      <header className="relative bg-opacity-90 bg-black/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3">
            <Code2 className="text-teal-400" size={32} />
            <h1 className="text-2xl font-bold text-white pixel-font">CodeSahayatri</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative px-4 py-6 h-[calc(100vh-5rem)]">
        <div className="h-full flex flex-col">
          {/* Repository Input */}
          <div className="flex justify-center">
            <RepositoryInput onSubmit={handleRepositorySubmit} />
          </div>

          {!graphData && !loading && (
            <div className="flex items-center justify-center flex-1">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl text-white mb-8">Codebase Navigator for Interns & New Grad Developers</h2>
                <div className="relative">
                  <div className="absolute inset-0 border-2 border-teal-500/30 rounded-xl transform rotate-1"></div>
                  <div className="grid grid-cols-3 gap-8 relative bg-black/20 p-8 rounded-xl">
                    <div className="bg-white/5 p-6 rounded-lg border border-teal-500/30">
                      <Brain className="w-16 h-16 text-teal-400 mx-auto mb-3" />
                      <h3 className="text-white text-lg">Code Structure</h3>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg border border-teal-500/30">
                      <Git className="w-16 h-16 text-pink-400 mx-auto mb-3" />
                      <h3 className="text-white text-lg">Development Flow</h3>
                    </div>
                    <div className="bg-white/5 p-6 rounded-lg border border-teal-500/30">
                      <Users className="w-16 h-16 text-purple-400 mx-auto mb-3" />
                      <h3 className="text-white text-lg">Team Commits</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/80 border border-red-700 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
            </div>
          )}

          {/* Main Layout */}
          {graphData && !loading && (
            <div className="flex gap-6 flex-1 min-h-0">
              {/* Left Container - Graph (Larger) */}
              <div className="w-2/3 bg-white/5 rounded-lg border border-teal-500/30 flex flex-col">
                <div className="flex-1 min-h-0">
                  <GraphVisualization data={graphData} onNodeSelect={setSelectedNode} />
                </div>
              </div>

              {/* Right Container - Split View */}
              <div className="w-1/3 flex flex-col gap-6">
                {/* Developer Commits Section */}
                <div className="h-1/2 bg-white/5 rounded-lg border border-teal-500/30 p-4">
                  <div className="mb-4">
                    <h2 className="text-lg text-white mb-2">Developer Commits</h2>
                    <div className="relative">
                      <input
                        type="text"
                        value={directorySearch}
                        onChange={(e) => handleDirectorySearch(e.target.value)}
                        placeholder="Search directories..."
                        className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={16} />
                      
                      {searchSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-sm rounded-lg border border-teal-500/30 overflow-hidden">
                          {searchSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="h-[calc(100%-5rem)] overflow-y-auto">
                    {filteredAuthors.map((author) => (
                      <div
                        key={author.login}
                        onClick={() => {
                          setSelectedAuthor(author);
                          setShowAuthorPanel(true);
                        }}
                        className="bg-white/5 rounded-lg border border-teal-500/30 p-3 mb-3 cursor-pointer hover:bg-white/10 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={author.avatar_url}
                            alt={author.login}
                            className="w-8 h-8 rounded-full border border-teal-500/30"
                          />
                          <div className="flex-1">
                            <h3 className="text-sm text-white">{author.login}</h3>
                            <p className="text-xs text-teal-400">{author.commits.length} commits</p>
                          </div>
                          <div className="text-white/50 hover:text-white/70 transition-colors">
                            <Code2 size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sahayatri Code Assistant */}
                <div className="h-1/2">
                  <ChatBox selectedNode={selectedNode} graphData={graphData} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Author Panel */}
      {showAuthorPanel && selectedAuthor && (
        <AuthorPanel
          authors={[selectedAuthor]}
          onClose={() => {
            setShowAuthorPanel(false);
            setSelectedAuthor(null);
          }}
        />
      )}
    </div>
  );
}

export default App;