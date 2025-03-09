import { GraphData, Node, Link } from '../types';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

interface GitHubFile {
  path: string;
  type: string;
  size: number;
}

interface GitHubTreeResponse {
  tree: GitHubFile[];
  truncated: boolean;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
  files: {
    filename: string;
    status: string;
    additions: number;
    deletions: number;
  }[];
}

export async function fetchCommits(owner: string, repo: string): Promise<any[]> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`,
    {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch commits: ${response.statusText}`);
  }

  const commits = await response.json();
  
  // Fetch detailed commit info for each commit
  const detailedCommits = await Promise.all(
    commits.map(async (commit: any) => {
      const detailResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`,
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );
      
      if (!detailResponse.ok) {
        throw new Error(`Failed to fetch commit details: ${detailResponse.statusText}`);
      }
      
      const detail = await detailResponse.json();
      return {
        sha: detail.sha,
        message: detail.commit.message,
        author: {
          login: detail.author?.login || detail.commit.author.name,
          avatar_url: detail.author?.avatar_url || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
        },
        date: detail.commit.author.date,
        files: detail.files,
      };
    })
  );

  return detailedCommits;
}

export async function fetchRepositoryData(url: string): Promise<GraphData> {
  try {
    const { owner, repo } = parseGitHubUrl(url);
    
    // First, get the default branch
    const defaultBranch = await fetchDefaultBranch(owner, repo);
    
    // Then fetch the repository contents using the default branch
    const files = await fetchRepositoryContents(owner, repo, defaultBranch);
    return convertToGraphData(files);
  } catch (error) {
    console.error('Error fetching repository data:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch repository data');
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string } {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    
    if (parts.length < 2 || urlObj.hostname !== 'github.com') {
      throw new Error('Invalid GitHub URL format');
    }
    
    return { owner: parts[0], repo: parts[1].replace('.git', '') };
  } catch {
    throw new Error('Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)');
  }
}

async function fetchDefaultBranch(owner: string, repo: string): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found. Please check the URL and try again.');
    }
    if (response.status === 401) {
      throw new Error('Authentication failed. Please check your GitHub token.');
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.default_branch;
}

async function fetchRepositoryContents(owner: string, repo: string, branch: string): Promise<GitHubFile[]> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository contents not found. The repository might be empty.');
    }
    if (response.status === 401) {
      throw new Error('Authentication failed. Please check your GitHub token.');
    }
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const data: GitHubTreeResponse = await response.json();
  
  if (data.truncated) {
    throw new Error('Repository is too large to visualize completely. Please try a smaller repository.');
  }
  
  if (!Array.isArray(data.tree)) {
    throw new Error('Invalid response format from GitHub API');
  }

  return data.tree;
}

function convertToGraphData(files: GitHubFile[]): GraphData {
  if (!files.length) {
    throw new Error('No files found in the repository');
  }

  const nodes: Node[] = [];
  const links: Link[] = [];
  const directories = new Set<string>();

  // First pass: collect all directories
  files.forEach(file => {
    const parts = file.path.split('/');
    let currentPath = '';
    parts.slice(0, -1).forEach(part => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      directories.add(currentPath);
    });
  });

  // Create nodes for directories
  directories.forEach(dir => {
    nodes.push({
      id: dir,
      name: dir.split('/').pop()!,
      type: 'directory'
    });
  });

  // Create nodes for files
  files.forEach(file => {
    if (file.type === 'blob') {
      nodes.push({
        id: file.path,
        name: file.path.split('/').pop()!,
        type: 'file',
        size: file.size,
        language: getFileLanguage(file.path)
      });
    }
  });

  // Create links
  files.forEach(file => {
    const parts = file.path.split('/');
    for (let i = 0; i < parts.length - 1; i++) {
      const source = parts.slice(0, i + 1).join('/');
      const target = parts.slice(0, i + 2).join('/');
      links.push({
        source,
        target,
        value: 1
      });
    }
  });

  return { nodes, links };
}

function getFileLanguage(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  const languageMap: { [key: string]: string } = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'rb': 'Ruby',
    'java': 'Java',
    'go': 'Go',
    'rs': 'Rust',
    'cpp': 'C++',
    'c': 'C',
    'php': 'PHP',
    'css': 'CSS',
    'html': 'HTML',
    'json': 'JSON',
    'md': 'Markdown',
  };
  return extension ? (languageMap[extension] || 'Unknown') : 'Unknown';
}