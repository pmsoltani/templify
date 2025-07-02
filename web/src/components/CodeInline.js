export default function CodeInline({ children }) {
  return (
    <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-orange-600 text-sm">
      {children}
    </code>
  );
}
