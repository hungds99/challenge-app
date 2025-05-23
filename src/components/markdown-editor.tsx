'use client';

import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange?: (value?: string) => void;
  height?: number;
  preview?: 'live' | 'preview' | 'edit';
  hideToolbar?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = 400,
  preview = "live",
  hideToolbar = false,
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        hideToolbar={hideToolbar}
      />
    </div>
  );
} 