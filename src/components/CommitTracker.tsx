import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { GitCommit, User, Calendar, FileText, Filter, ChevronRight, ChevronDown } from 'lucide-react';

interface Commit {
  sha: string;
  message: string;
  author: {
    login: string;
    avatar_url: string;
  };
  date: string;
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }[];
}

interface CommitTrackerProps {
  commits: Commit[];
}

export function CommitTracker({ commits = [] }: CommitTrackerProps) {
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    author: '',
    dateRange: 'all',
    fileType: ''
  });

  const filteredCommits = commits.filter(commit => {
    const matchesAuthor = !filters.author || commit.author.login.includes(filters.author);
    const matchesFile = !filters.fileType || commit.files.some(file => 
      file.filename.toLowerCase().endsWith(filters.fileType.toLowerCase())
    );
    return matchesAuthor && matchesFile;
  });

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-teal-500/30 p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <GitCommit className="text-teal-400" />
          Commit History
        </h2>
        
        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by author"
              className="bg-white/5 border border-teal-500/30 rounded-lg px-3 py-1 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
            />
            <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400/50" size={16} />
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Filter by file type"
              className="bg-white/5 border border-teal-500/30 rounded-lg px-3 py-1 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={filters.fileType}
              onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
            />
            <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 text-teal-400/50" size={16} />
          </div>
        </div>
      </div>

      {/* Commits Timeline */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {filteredCommits.map((commit) => (
            <motion.div
              key={commit.sha}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-teal-500/30" />
              
              {/* Commit card */}
              <div className="ml-12 bg-white/5 rounded-lg p-4 border border-teal-500/30 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedCommit(selectedCommit === commit.sha ? null : commit.sha)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={commit.author.avatar_url}
                      alt={commit.author.login}
                      className="w-8 h-8 rounded-full border-2 border-teal-500/30"
                    />
                    <div>
                      <h3 className="text-white font-medium">{commit.author.login}</h3>
                      <p className="text-white/70 text-sm">{commit.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-white/50 text-sm">
                    <Calendar size={14} />
                    {format(parseISO(commit.date), 'MMM d, yyyy HH:mm')}
                    {selectedCommit === commit.sha ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {selectedCommit === commit.sha && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-teal-500/30"
                    >
                      <h4 className="text-white/70 text-sm font-medium mb-2">Changed Files:</h4>
                      <div className="space-y-2">
                        {commit.files.map((file) => (
                          <div key={file.filename} className="flex items-center justify-between text-sm">
                            <span className="text-white/90">{file.filename}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">+{file.additions}</span>
                              <span className="text-red-400">-{file.deletions}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}