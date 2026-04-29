import { HStack, Text } from '@chakra-ui/react'
import { Checkbox } from '@chakra-ui/react'
import type { Task } from '../api/tasks'

interface TaskItemProps {
  task: Task
  onToggle: (id: string, completed: boolean) => void
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <HStack as="li" gap="12px" py="8px" px="4px">
      <Checkbox.Root
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id, !task.completed)}
      >
        <Checkbox.HiddenInput aria-label={task.text} />
        <Checkbox.Control />
      </Checkbox.Root>
      <Text
        fontSize="16px"
        color={task.completed ? '#6E6E73' : '#1D1D1F'}
        lineHeight="1.5"
        textDecoration={task.completed ? 'line-through' : 'none'}
      >
        {task.text}
      </Text>
    </HStack>
  )
}
