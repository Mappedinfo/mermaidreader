import './style.css';
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import type { MermaidError, PreviewState } from './types';
import {
  DEFAULT_PREVIEW_HEIGHT,
  MIN_PREVIEW_HEIGHT,
  MAX_PREVIEW_HEIGHT,
} from './types';

// Mermaid initialization
mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'default',
  fontFamily: 'Arial, sans-serif',
});

// DOM Elements
const inputEl = document.getElementById('input') as HTMLTextAreaElement;
const previewEl = document.getElementById('preview') as HTMLDivElement;
const diagramEl = document.getElementById('diagram') as HTMLDivElement;
const placeholderEl = document.getElementById('placeholder') as HTMLSpanElement;
const resizeHandleEl = document.getElementById('resizeHandle') as HTMLDivElement;
const errorPanelEl = document.getElementById('errorPanel') as HTMLDivElement;
const errorContentEl = document.getElementById('errorContent') as HTMLPreElement;
const errorLocationEl = document.getElementById('errorLocation') as HTMLDivElement;
const copyTextBtn = document.getElementById('copyText') as HTMLButtonElement;
const copyImageBtn = document.getElementById('copyImage') as HTMLButtonElement;
const toastEl = document.getElementById('toast') as HTMLDivElement;

// Preview state
const previewState: PreviewState = {
  height: DEFAULT_PREVIEW_HEIGHT,
  isResizing: false,
  startY: 0,
  startHeight: 0,
};

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout>;

// Toast timeout
let toastTimer: ReturnType<typeof setTimeout>;

// Initialize preview height
previewEl.style.height = `${previewState.height}px`;

// Render diagram
async function render(): Promise<void> {
  const code = inputEl.value.trim();

  if (!code) {
    diagramEl.innerHTML = '';
    diagramEl.classList.remove('diagram');
    placeholderEl.style.display = 'block';
    placeholderEl.textContent = 'Diagram preview will appear here';
    previewEl.classList.remove('error');
    errorPanelEl.classList.remove('visible');
    return;
  }

  placeholderEl.style.display = 'none';
  diagramEl.classList.add('diagram');
  errorPanelEl.classList.remove('visible');
  previewEl.classList.remove('error');

  try {
    const id = `mermaid-${Date.now()}`;
    const { svg } = await mermaid.render(id, code);
    diagramEl.innerHTML = svg;
  } catch (error) {
    diagramEl.innerHTML = '';
    diagramEl.classList.remove('diagram');
    previewEl.classList.add('error');
    handleMermaidError(error as MermaidError);
  }
}

// Handle Mermaid errors with detailed display
function handleMermaidError(error: MermaidError): void {
  placeholderEl.style.display = 'none';
  errorPanelEl.classList.add('visible');

  let errorMessage = error.message || 'Unknown error';

  // Extract cleaner error message
  if (error.message) {
    // Handle common error patterns
    if (error.message.includes('Syntax error')) {
      const match = error.message.match(/Syntax error in text \((\d+)-(\d+)\): (.+)/);
      if (match) {
        errorMessage = match[3];
      }
    }
  }

  // Build error content
  let content = `Error: ${errorMessage}`;

  // Add additional context if available
  if (error.hash) {
    if (error.hash.text) {
      content += `\n\nProblematic text:\n"${error.hash.text.substring(0, 100)}${error.hash.text.length > 100 ? '...' : ''}"`;
    }
    if (error.hash.loc) {
      const { first_line, first_col, last_line, last_col } = error.hash.loc;
      if (first_line === last_line) {
        content += `\n\nLocation: Line ${first_line}, Column ${first_col}-${last_col}`;
      } else {
        content += `\n\nLocation: Lines ${first_line}-${last_line}`;
      }
    }
  }

  // Add original error for debugging
  if (error.str) {
    content += `\n\nOriginal: ${error.str}`;
  }

  errorContentEl.textContent = content;

  // Add line-specific location if available
  if (error.hash?.loc) {
    const { first_line, first_col } = error.hash.loc;
    errorLocationEl.textContent = `Line ${first_line}, Column ${first_col}`;
    errorLocationEl.style.display = 'block';
  } else {
    errorLocationEl.style.display = 'none';
  }
}

// Debounced render
inputEl.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(render, 300);
});

// Resize handle functionality
resizeHandleEl.addEventListener('mousedown', (e: MouseEvent) => {
  previewState.isResizing = true;
  previewState.startY = e.clientY;
  previewState.startHeight = previewEl.offsetHeight;
  resizeHandleEl.classList.add('active');
  document.body.style.cursor = 'ns-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e: MouseEvent) => {
  if (!previewState.isResizing) return;

  const delta = e.clientY - previewState.startY;
  const newHeight = Math.max(
    MIN_PREVIEW_HEIGHT,
    Math.min(MAX_PREVIEW_HEIGHT, previewState.startHeight + delta)
  );

  previewEl.style.height = `${newHeight}px`;
  previewState.height = newHeight;
});

document.addEventListener('mouseup', () => {
  if (previewState.isResizing) {
    previewState.isResizing = false;
    resizeHandleEl.classList.remove('active');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }
});

// Touch support for mobile
resizeHandleEl.addEventListener('touchstart', (e: TouchEvent) => {
  e.preventDefault();
  const touch = e.touches[0];
  previewState.isResizing = true;
  previewState.startY = touch.clientY;
  previewState.startHeight = previewEl.offsetHeight;
  resizeHandleEl.classList.add('active');
});

document.addEventListener('touchmove', (e: TouchEvent) => {
  if (!previewState.isResizing) return;
  e.preventDefault();

  const touch = e.touches[0];
  const delta = touch.clientY - previewState.startY;
  const newHeight = Math.max(
    MIN_PREVIEW_HEIGHT,
    Math.min(MAX_PREVIEW_HEIGHT, previewState.startHeight + delta)
  );

  previewEl.style.height = `${newHeight}px`;
  previewState.height = newHeight;
}, { passive: false });

document.addEventListener('touchend', () => {
  if (previewState.isResizing) {
    previewState.isResizing = false;
    resizeHandleEl.classList.remove('active');
  }
});

// Copy text to clipboard
copyTextBtn.addEventListener('click', async () => {
  const text = inputEl.value;
  if (!text) {
    showToast('No text to copy', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    showToast('Text copied to clipboard', 'success');
  } catch {
    // Fallback for older browsers
    inputEl.select();
    document.execCommand('copy');
    inputEl.setSelectionRange(0, 0);
    showToast('Text copied to clipboard', 'success');
  }
});

// Copy image as high-resolution PNG (300 DPI)
copyImageBtn.addEventListener('click', async () => {
  const svgElement = diagramEl.querySelector('svg');
  if (!svgElement) {
    showToast('No diagram to copy. Please render a diagram first.', 'error');
    return;
  }

  copyImageBtn.disabled = true;
  copyImageBtn.textContent = 'Processing...';

  try {
    // Calculate scale for 300 DPI
    // Standard screen is 96 DPI, so we multiply by 300/96 ≈ 3.125
    // But html2canvas uses devicePixelRatio, so we calculate accordingly
    const svgRect = svgElement.getBoundingClientRect();
    const targetDpi = 300;
    const screenDpi = 96;

    // Calculate scale factor to achieve target DPI
    // We need to consider both the rendered size and target DPI
    const scale = (targetDpi / screenDpi) * (window.devicePixelRatio || 1);

    // Add extra padding for the canvas
    const padding = 40;
    const canvasWidth = svgRect.width + padding * 2;
    const canvasHeight = svgRect.height + padding * 2;

    const canvas = await html2canvas(diagramEl, {
      backgroundColor: '#ffffff',
      scale: scale,
      width: canvasWidth,
      height: canvasHeight,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
          showToast(`Image copied (${targetDpi} DPI)`, 'success');
        } catch {
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `diagram-${targetDpi}dpi.png`;
          a.click();
          URL.revokeObjectURL(url);
          showToast(`Image downloaded (${targetDpi} DPI)`, 'success');
        }
      } else {
        showToast('Failed to generate image', 'error');
      }

      resetCopyButton();
    }, 'image/png');
  } catch (err) {
    console.error('Failed to copy image:', err);
    showToast('Failed to copy image', 'error');
    resetCopyButton();
  }
});

function resetCopyButton(): void {
  copyImageBtn.textContent = 'Copy Image';
  copyImageBtn.disabled = false;
}

// Toast notification
function showToast(message: string, type: 'success' | 'error' = 'success'): void {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.className = `toast visible ${type}`;

  toastTimer = setTimeout(() => {
    toastEl.classList.remove('visible');
  }, 2500);
}

// Initial render
render();
