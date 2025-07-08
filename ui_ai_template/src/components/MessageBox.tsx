import { useColorModeValue } from '@chakra-ui/react';
import Card from '@/components/card/Card';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), {
  ssr: false,
});

export default function MessageBox(props: { output: string }) {
  const { output } = props;
  const textColor = useColorModeValue('navy.700', 'white');
  return (
    <Card
      display={output ? 'flex' : 'none'}
      px="22px !important"
      pl="22px !important"
      color={textColor}
      w="100%"
      fontSize={{ base: 'sm', md: 'md' }}
      lineHeight={{ base: '24px', md: '26px' }}
      fontWeight="500"
    >
      <ReactMarkdown
        className="prose prose-sm max-w-none prose-headings:text-inherit prose-p:text-inherit prose-a:text-blue-600 prose-strong:text-inherit prose-code:text-inherit prose-pre:bg-gray-900 prose-pre:text-white"
        components={{
          // Custom renderers for better styling
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold mb-4 text-inherit" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-semibold mb-3 text-inherit"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg font-semibold mb-2 text-inherit"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 text-inherit" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc ml-6 mb-3 text-inherit" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ml-6 mb-3 text-inherit" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="mb-1 text-inherit" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 pl-4 italic my-4 text-inherit"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code
                className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono text-inherit"
                {...props}
              />
            ) : (
              <code className="text-inherit" {...props} />
            ),
          pre: ({ node, ...props }) => (
            <pre
              className="bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-4"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 hover:text-blue-800 underline"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-inherit" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-inherit" {...props} />
          ),
          table: ({ node, ...props }) => (
            <table
              className="border-collapse border border-gray-300 w-full my-4"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-inherit"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-gray-300 px-3 py-2 text-inherit"
              {...props}
            />
          ),
        }}
      >
        {output ? output : ''}
      </ReactMarkdown>
    </Card>
  );
}
