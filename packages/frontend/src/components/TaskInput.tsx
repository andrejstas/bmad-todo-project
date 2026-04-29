import { useState, useRef, useEffect } from 'react'
import { Input } from '@chakra-ui/react'
import { useCreateTask } from '../api/tasks'

export function TaskInput() {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const createTask = useCreateTask()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return

    const trimmed = text.trim()
    if (!trimmed) return

    createTask.mutate(trimmed)
    setText('')
    inputRef.current?.focus()
  }

  return (
    <Input
      ref={inputRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="What are you working on?"
      aria-label="Add a new task"
      bg="#F2F2F7"
      boxShadow="inset 0 1px 2px rgba(0,0,0,0.05)"
      borderColor="#E5E5EA"
      fontSize="16px"
      p="16px"
      borderRadius="12px"
      _placeholder={{ color: '#6E6E73' }}
    />
  )
}
