import { VStack, Separator } from '@chakra-ui/react'
import type { Task } from '../api/tasks'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string, completed: boolean) => void
}

export function TaskList({ tasks, onToggle }: TaskListProps) {
  if (tasks.length === 0) return null

  const active = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  return (
    <VStack as="ul" role="list" gap="0" align="stretch" p="0" m="0" listStyleType="none">
      {active.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} />
      ))}
      {active.length > 0 && completed.length > 0 && <Separator />}
      {completed.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} />
      ))}
    </VStack>
  )
}
