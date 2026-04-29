import { VStack } from '@chakra-ui/react'
import type { Task } from '../api/tasks'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) return null

  return (
    <VStack as="ul" role="list" gap="0" align="stretch" p="0" m="0" listStyleType="none">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </VStack>
  )
}
