# CodeSahayatri

CodeSahayatri helps developers understand unfamiliar codebases faster.

A user can paste a GitHub repository URL, and the system fetches the repository structure and recent commit history through the GitHub API. It then builds an interactive visualization of the project layout and provides an assistant that explains how the codebase is organized.

The goal is simple: make it easier to go from “this repo looks overwhelming” to “I understand where things live and how the project is structured.”

---

## Features

- Accepts a public GitHub repository URL as input  
- Fetches repository tree and recent commit history using the GitHub API  
- Builds an interactive graph of files and directories  
- Lets users explore repository structure visually  
- Provides repository-aware explanations through an interactive assistant  

---

## Why I built it

I built CodeSahayatri because understanding a new codebase is one of the hardest parts of joining a project. Even when documentation exists, it often takes time to figure out how directories are organized, where important logic lives, and how different parts of the repository connect.

I wanted to build a tool that gives developers a faster starting point by combining repository structure, recent activity, and interactive explanations in one place.

---

## How it works

1. The user enters a GitHub repository URL  
2. The backend fetches repository metadata, tree structure, and recent commit history from the GitHub API  
3. The app transforms that data into a graph-friendly structure  
4. The frontend renders an interactive visualization of the repository layout  
5. The assistant uses repository context to explain the project structure and help users navigate the codebase  

---

## Tech Stack

- Frontend: React, TypeScript, Vite  
- Visualization: D3.js  
- Backend: Node.js / Express  
- APIs: GitHub REST API  

---

## What I focused on

- Designing a workflow that helps users understand real repositories quickly  
- Turning raw GitHub API data into a structure that is easy to visualize  
- Making the UI useful rather than just technically correct  
- Building an assistant that uses actual repository context instead of generic responses  

---

## Challenges

- Handling large repositories without making the visualization overwhelming  
- Deciding how much repository information to show before the graph becomes noisy  
- Structuring GitHub API calls efficiently  
- Making the assistant grounded in repository structure rather than vague explanations  

---

## What I learned

The biggest lesson from this project was that useful developer tools need more than correct output. Early on, it was possible to fetch data and display a graph, but that alone did not make the project helpful.

I had to think more carefully about what information users actually need when they are trying to understand a new codebase.

I also learned how to break down a system into stages like ingestion, transformation, visualization, and explanation, which helped me think more like a systems engineer.

---

## Running the project locally

### Prerequisites

- Node.js  
- npm  
- GitHub API token (if required)  

### Setup and run

```bash
npm install
npm run dev