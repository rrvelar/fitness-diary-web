// pages/frame.tsx
export default function FramePage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <h1 className="text-2xl font-bold text-emerald-600">Fitness Diary Frame</h1>
        <p className="text-gray-600 mt-2">
          Этот эндпоинт используется для Warpcast Mini App.<br />
          Попробуй открыть его в Warpcast:  
          <code className="block mt-2 text-emerald-700">/api/frame</code>
        </p>
      </div>
    </div>
  )
}
