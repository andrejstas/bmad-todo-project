import { HStack, Text } from '@chakra-ui/react'
import { Checkbox } from '@chakra-ui/react'
import type { Task } from '../api/tasks'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <HStack as="li" gap="12px" py="8px" px="4px">
      <Checkbox.Root
        checked={task.completed}
        onCheckedChange={() => {}}
        aria-label={task.text}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
      </Checkbox.Root>
      <Text fontSize="16px" color="#1D1D1F" lineHeight="1.5">
        {task.text}
      </Text>
    </HStack>
  )
}
