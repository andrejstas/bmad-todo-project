import { Text } from '@chakra-ui/react'
import type { Task } from '../api/tasks'

interface ProgressCounterProps {
  tasks: Task[]
}

export function ProgressCounter({ tasks }: ProgressCounterProps) {
  if (tasks.length === 0) return null

  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length

  return (
    <Text
      fontSize="14px"
      fontWeight="500"
      color="#6E6E73"
      aria-live="polite"
    >
      {completed} of {total} done
    </Text>
  )
}
