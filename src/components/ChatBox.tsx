import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import OpenAI from 'openai';

interface ChatBoxProps {
  selectedNode: any;
  graphData: any;
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export function ChatBox({ selectedNode, graphData }: ChatBoxProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; isTyping?: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mentionStart, setMentionStart] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1) {
      const searchTerm = value.slice(lastAtSymbol + 1).toLowerCase();
      const matches = graphData.nodes
        .filter((node: any) => 
          node.name.toLowerCase().includes(searchTerm) ||
          node.id.toLowerCase().includes(searchTerm)
        )
        .map((node: any) => node.name)
        .slice(0, 5);

      setSuggestions(matches);
      setMentionStart(lastAtSymbol);
    } else {
      setSuggestions([]);
      setMentionStart(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (mentionStart !== -1) {
      const before = input.slice(0, mentionStart);
      const after = input.slice(input.lastIndexOf('@') + suggestion.length + 1);
      setInput(`${before}@${suggestion}${after}`);
    }
    setSuggestions([]);
  };

  const getNodeRelationships = (nodeId: string) => {
    const relationships = {
      parents: [] as string[],
      children: [] as string[],
      siblings: [] as string[]
    };

    graphData.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      if (sourceId === nodeId) {
        relationships.children.push(targetId);
      }
      if (targetId === nodeId) {
        relationships.parents.push(sourceId);
      }
    });

    if (relationships.parents.length > 0) {
      graphData.links.forEach((link: any) => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
        if (relationships.parents.includes(sourceId) && targetId !== nodeId) {
          relationships.siblings.push(targetId);
        }
      });
    }

    return relationships;
  };

  const buildRepositoryContext = () => {
    let context = `Repository Structure:\n`;
    
    const fileHierarchy = new Map();
    graphData.nodes.forEach((node: any) => {
      const path = node.id.split('/');
      let current = fileHierarchy;
      path.forEach((part: string, index: number) => {
        if (!current.has(part)) {
          current.set(part, new Map());
        }
        current = current.get(part);
      });
    });

    graphData.links.forEach((link: any) => {
      const source = typeof link.source === 'object' ? link.source.id : link.source;
      const target = typeof link.target === 'object' ? link.target.id : link.target;
      context += `${source} → ${target}\n`;
    });

    if (selectedNode) {
      const relationships = getNodeRelationships(selectedNode.id);
      context += `\nSelected File: ${selectedNode.id}
Type: ${selectedNode.type}
Parents: ${relationships.parents.join(', ')}
Children: ${relationships.children.join(', ')}
Siblings: ${relationships.siblings.join(', ')}`;
    }

    return context;
  };

  const typeMessage = async (message: string, delay = 25) => {
    let displayedContent = '';
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      displayedContent += (i > 0 ? ' ' : '') + words[i];
      setMessages(prev => prev.map((msg, idx) => 
        idx === prev.length - 1 
          ? { ...msg, content: displayedContent, isTyping: true }
          : msg
      ));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    setMessages(prev => prev.map((msg, idx) => 
      idx === prev.length - 1 
        ? { ...msg, isTyping: false }
        : msg
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const context = buildRepositoryContext();
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a code repository expert. Analyze the repository structure and provide technical insights with these rules:
1. Responses must be 40-70 words
2. Be specific and technical
3. Focus on architecture and relationships
4. Use clear, precise language
5. Never use uncertain terms
6. State facts confidently based on the code structure
7. Reference specific files and their connections`
          },
          {
            role: "user",
            content: `Repository Context:\n${context}\n\nQuestion: ${userMessage}`
          }
        ]
      });

      const answer = response.choices[0]?.message?.content || "Unable to analyze the repository structure.";
      setMessages(prev => [...prev, { role: 'assistant', content: '', isTyping: true }]);
      await typeMessage(answer);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error analyzing the repository structure.',
        isTyping: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-teal-500/30 flex flex-col h-full">
      <div className="p-4 border-b border-teal-500/30">
        <h2 className="text-lg text-white">Sahayatri</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-teal-500 text-white'
                  : 'bg-white/20 text-white'
              }`}
            >
              {message.content}
              {message.isTyping && (
                <span className="inline-block ml-1 animate-pulse">▋</span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-teal-500/30">
        <div className="relative flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about the code (use @ to mention files)..."
              className="w-full bg-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute bottom-full mb-2 w-full bg-white/10 backdrop-blur-sm rounded-lg border border-teal-500/30 overflow-hidden"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/20 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-teal-500 text-white p-2 rounded-lg hover:bg-teal-400 transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}