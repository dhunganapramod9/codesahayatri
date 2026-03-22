# CodeSahayatri

CodeSahayatri is a repository-structure visualization and explanation tool designed to help interns and early-career developers understand large codebases faster.

It lets a user enter a GitHub repository URL, fetches the repository tree and recent commit history from the GitHub API, builds a client-side graph of directories and files, and provides an interactive chat assistant that explains architecture using the repository structure as context.

## What this project demonstrates

This project is a useful example of adjacent experience for long-context and complex-reasoning tooling work because it already combines:

- large-repository ingestion from external systems
- graph-based structural representations of codebases
- multi-file context assembly
- commit and contributor metadata analysis
- LLM-powered repository explanation grounded in code structure

While this project is not a benchmark dataset or an AST-based static analysis pipeline, it demonstrates practical work on repository understanding, architecture surfacing, and context construction for code reasoning workflows.

## Current architecture

The current application flow is:

1. **Repository URL input**
   - The user submits a GitHub repository URL through the frontend.
2. **Repository and commit retrieval**
   - The app fetches the repository tree and recent commit details from the GitHub API.
3. **Graph construction**
   - File and directory paths are converted into nodes and parent-child links.
4. **Interactive visualization**
   - The repository structure is rendered as an interactive force-directed graph.
5. **Context-aware explanation**
   - The chat assistant builds repository context from the graph and selected node relationships, then asks an LLM to explain the architecture.

## Why it is relevant to long-context evaluation work

If you are positioning this project in a proposal, the most credible framing is:

- it shows experience navigating large repositories programmatically
- it shows experience turning repository structure into machine-readable context
- it shows experience building developer-facing interfaces for code understanding
- it shows experience connecting structural code context to LLM reasoning

That makes it a strong **related-work example** for projects involving:

- repository curation
- long-context code understanding
- benchmark task design around multi-file reasoning
- analysis of how agents fail when context spans many files and subsystems

## Important limitations

To keep the project description accurate, this repository currently does **not** include:

- Python AST static analysis
- a Flask backend
- import or call-graph dependency extraction
- benchmark dataset generation or evaluation pipeline integration

## Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Add your API keys to `.env`:

- `VITE_GITHUB_TOKEN`: Your GitHub personal access token
- `VITE_OPENAI_API_KEY`: Your OpenAI API key

## Development

```bash
npm install
npm run dev
```
