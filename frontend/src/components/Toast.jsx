export default function Toast({ msg, visible, error }) {
  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center gap-3
      px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium
      transition-all duration-500 max-w-xs
      ${error ? 'bg-red-500' : 'bg-primary'}
      ${visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
    `}>
      <span className="text-lg">{error ? '⚠️' : '✅'}</span>
      <span>{msg}</span>
    </div>
  )
}
