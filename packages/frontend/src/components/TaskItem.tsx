import { HStack, Text, IconButton } from '@chakra-ui/react'
import { Checkbox } from '@chakra-ui/react'
import type { Task } from '../api/tasks'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
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
      <Text
        flex="1"
        fontSize="16px"
        color={task.completed ? '#6E6E73' : '#1D1D1F'}
        lineHeight="1.5"
        textDecoration={task.completed ? 'line-through' : 'none'}
      >
        {task.text}
      </Text>
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
