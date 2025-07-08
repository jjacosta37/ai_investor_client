import { FC, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
});

interface Props {
  code: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export const MarkdownBlock: FC<Props> = ({
  code,
  editable = false,
  onChange = () => {},
}) => {
  const [copyText, setCopyText] = useState<string>('Copy');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopyText('Copy');
    }, 2000);

    return () => clearTimeout(timeout);
  }, [copyText]);

  return (
    <div className="relative">
      <button
        className="absolute right-2 top-2 z-10 rounded bg-gray-800 hover:bg-gray-700 active:bg-gray-700 px-3 py-1 text-xs text-white transition-colors"
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopyText('Copied!');
        }}
      >
        {copyText}
      </button>

      <div className="p-4 h-[500px] bg-gray-900 text-white overflow-auto rounded-md">
        <ReactMarkdown
          className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white prose-a:text-blue-400 prose-strong:text-white prose-code:text-white"
          components={{
            // Custom renderers for better styling in dark theme
            h1: ({ node, ...props }) => (
              <h1 className="text-2xl font-bold mb-4 text-white" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-xl font-semibold mb-3 text-white"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-lg font-semibold mb-2 text-white"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-3 text-white" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc ml-6 mb-3 text-white" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal ml-6 mb-3 text-white" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-1 text-white" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300"
                {...props}
              />
            ),
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code
                  className="bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-100"
                  {...props}
                />
              ) : (
                <code className="text-white" {...props} />
              ),
            pre: ({ node, ...props }) => (
              <pre
                className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-4"
                {...props}
              />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-blue-400 hover:text-blue-300 underline"
                {...props}
              />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-white" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-white" {...props} />
            ),
            table: ({ node, ...props }) => (
              <table
                className="border-collapse border border-gray-600 w-full my-4"
                {...props}
              />
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-gray-600 px-3 py-2 bg-gray-800 font-semibold text-white"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="border border-gray-600 px-3 py-2 text-white"
                {...props}
              />
            ),
          }}
        >
          {code}
        </ReactMarkdown>
      </div>
    </div>
  );
};
