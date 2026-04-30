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
      data-task-id={task.id}
      gap="12px"
      py="8px"
      px="4px"
      css={{
        animation: 'fadeSlideIn 0.2s ease-out',
        '@keyframes fadeSlideIn': {
          from: { opacity: 0, transform: 'translateY(-8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
          '& .delete-btn': { transition: 'none' },
        },
        '& .delete-btn': { transition: 'opacity 0.15s' },
        '@media (min-width: 48em)': {
          '& .delete-btn': { opacity: 0 },
          '&:hover .delete-btn, &:focus-within .delete-btn, & .delete-btn:focus-visible': { opacity: 1 },
        },
      }}
    >
      <Checkbox.Root
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id, !task.completed)}
        minH="44px"
        minW="44px"
        display="flex"
        alignItems="center"
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
          role="button"
          flex="1"
          fontSize="16px"
          color={task.completed ? '#6E6E73' : '#1D1D1F'}
          lineHeight="1.5"
          textDecoration={task.completed ? 'line-through' : 'none'}
          cursor="text"
          tabIndex={0}
          onClick={startEditing}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              startEditing()
            }
          }}
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
        minH="44px"
        minW="44px"
        onClick={() => onDelete(task.id)}
      >
        ✕
      </IconButton>
    </HStack>
  )
}
