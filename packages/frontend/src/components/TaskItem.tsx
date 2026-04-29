import { useState, useRef, useEffect } from 'react'
import { HStack, Text, IconButton, Input } from '@chakra-ui/react'
import { Checkbox } from '@chakra-ui/react'
import type { Task } from '../api/tasks'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

export function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const editRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      editRef.current?.focus()
    }
  }, [isEditing])

  const startEditing = () => {
    setIsEditing(true)
    setEditText(task.text)
  }

  const handleSave = () => {
    if (!isEditing) return
    setIsEditing(false)
    const trimmed = editText.trim()
    if (!trimmed || trimmed === task.text) return
    onEdit(task.id, trimmed)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditText(task.text)
    }
  }

  return (
    <HStack
      as="li"
      gap="12px"
      py="8px"
      px="4px"
      css={{
        '& .delete-btn': { opacity: 0, transition: 'opacity 0.15s' },
        '&:hover .delete-btn, &:focus-within .delete-btn, & .delete-btn:focus-visible': { opacity: 1 },
      }}
    >
      <Checkbox.Root
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id, !task.completed)}
      >
        <Checkbox.HiddenInput aria-label={task.text} />
        <Checkbox.Control />
      </Checkbox.Root>
      {isEditing ? (
        <Input
          ref={editRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={handleEditKeyDown}
          onBlur={handleSave}
          variant="flushed"
          border="none"
          bg="transparent"
          boxShadow="none"
          fontSize="16px"
          color={task.completed ? '#6E6E73' : '#1D1D1F'}
          textDecoration={task.completed ? 'line-through' : 'none'}
          lineHeight="1.5"
          flex="1"
          p="0"
          h="auto"
          _focus={{ border: 'none', boxShadow: 'none' }}
        />
      ) : (
        <Text
          flex="1"
          fontSize="16px"
          color={task.completed ? '#6E6E73' : '#1D1D1F'}
          lineHeight="1.5"
          textDecoration={task.completed ? 'line-through' : 'none'}
          cursor="text"
          onClick={startEditing}
        >
          {task.text}
        </Text>
      )}
      <IconButton
        className="delete-btn"
        aria-label={`Delete task: ${task.text}`}
        size="sm"
        variant="ghost"
        color="#FF3B30"
        onClick={() => onDelete(task.id)}
      >
        ✕
      </IconButton>
    </HStack>
  )
}
