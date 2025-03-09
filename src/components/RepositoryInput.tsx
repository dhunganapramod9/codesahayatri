import React, { useState } from 'react';
import { GitBranch } from 'lucide-react';

interface RepositoryInputProps {
  onSubmit: (url: string) => void;
}

export function RepositoryInput({ onSubmit }: RepositoryInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative flex items-center">
        <GitBranch className="absolute left-6 text-teal-400" size={20} />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter GitHub repository URL"
          className="w-full pl-16 pr-4 py-3 rounded-lg bg-white/10 border border-teal-500/30 text-white placeholder-teal-300/50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="ml-4 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition-colors duration-200"
        >
          Visualize
        </button>
      </div>
    </form>
  );
}