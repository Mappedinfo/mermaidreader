# Mermaid Parser

A minimal online Mermaid diagram parser for creating, previewing, and exporting diagrams.

**Live Demo**: https://mappedinfo.github.io/mermaidreader/

## Features

- **Real-time Preview** - Diagrams render instantly as you type
- **Zoom Controls** - Zoom in/out (25%-400%) with reset option
- **Resizable Preview** - Drag to resize the preview area
- **Copy Text** - Copy Mermaid syntax to clipboard
- **Export Image** - Export diagrams as 300 DPI PNG
- **Error Display** - Detailed syntax error messages with location

## Usage

1. Paste or type Mermaid syntax in the text area
2. View the rendered diagram in the preview
3. Use zoom controls (+/-) to adjust size
4. Click "Copy Text" or "Copy Image" to export

## Supported Diagram Types

- Flowchart
- Sequence Diagram
- Class Diagram
- State Diagram
- Entity Relationship Diagram
- Gantt Chart
- Pie Chart
- Git Graph
- Mind Map
- Timeline
- And more...

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- Vite
- TypeScript
- Mermaid.js
- GitHub Pages
