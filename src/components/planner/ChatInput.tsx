'use client'

import { useState } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  loading: boolean
  disabled?: boolean
}

export default function ChatInput({ onSend, loading, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || loading || disabled) return
    onSend(message.trim())
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {disabled && (
        <p className="text-xs text-gray-400 text-center mb-2">
          먼저 목표를 입력하고 계획을 생성하세요
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-4xl mx-auto">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || disabled}
          placeholder={disabled ? '계획을 먼저 생성해주세요' : '계획을 수정하거나 질문하세요. (예: 3단계를 더 자세하게 해줘)'}
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-40 disabled:bg-gray-50"
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          type="submit"
          disabled={loading || disabled || !message.trim()}
          className="shrink-0 bg-black text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-1">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              처리 중
            </span>
          ) : (
            '전송'
          )}
        </button>
      </form>
      <p className="text-xs text-gray-400 text-center mt-1">Enter로 전송 · Shift+Enter로 줄바꿈</p>
    </div>
  )
}
