import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { X, Calendar } from 'lucide-react';

interface Author {
  login: string;
  avatar_url: string;
  commits: Array<{
    sha: string;
    message: string;
    date: string;
    files: Array<{
      filename: string;
      additions: number;
      deletions: number;
    }>;
  }>;
}

interface AuthorPanelProps {
  authors: Author[];
  onClose: () => void;
}

export function AuthorPanel({ authors, onClose }: AuthorPanelProps) {
  const author = authors[0]; // We know we only have one author now

  const renderCommitTree = (commits: Author['commits']) => {
    return (
      <div className="relative pl-8">
        {commits.map((commit, index) => (
          <div key={commit.sha} className="relative">
            {/* Vertical line */}
            {index < commits.length - 1 && (
              <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-teal-500/30" />
            )}
            {/* Horizontal line */}
            <div className="absolute left-3 top-6 w-5 h-0.5 bg-teal-500/30" />
            
            <div className="pt-2 pb-6">
              <div className="relative">
                {/* Node point */}
                <div className="absolute left-2 top-4 w-2 h-2 rounded-full bg-teal-500" />
                
                <div className="ml-12 bg-white/5 rounded-lg p-4 border border-teal-500/30">
                  <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                    <Calendar size={14} />
                    {format(parseISO(commit.date), 'MMM d, yyyy HH:mm')}
                  </div>
                  
                  <p className="text-white text-sm mb-3">{commit.message}</p>
                  
                  <div className="space-y-2">
                    {commit.files.map((file) => (
                      <div
                        key={file.filename}
                        className="flex items-center justify-between text-xs p-2 rounded bg-black/20"
                      >
                        <span className="text-white/70 truncate max-w-[200px]">
                          {file.filename.split('/').pop()}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-400">+{file.additions}</span>
                          <span className="text-red-400">-{file.deletions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl border border-teal-500/30 w-[90vw] h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-teal-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={author.avatar_url}
              alt={author.login}
              className="w-10 h-10 rounded-full border-2 border-teal-500/30"
            />
            <div>
              <h2 className="text-lg text-white">{author.login}</h2>
              <p className="text-sm text-teal-400">{author.commits.length} contributions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Commit Tree */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderCommitTree(author.commits)}
        </div>
      </motion.div>
    </motion.div>
  );
}