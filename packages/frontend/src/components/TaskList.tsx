import { useRef } from 'react'
import { VStack, Box, Text } from '@chakra-ui/react'
import type { Task } from '../api/tasks'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (id: string, text: string) => void
}

export function TaskList({ tasks, onToggle, onDelete, onEdit }: TaskListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  if (tasks.length === 0) {
    return (
      <Text role="status" fontSize="16px" color="#6E6E73" textAlign="center" py="24px">
        No tasks yet
      </Text>
    )
  }

  const active = tasks.filter((t) => !t.completed)
  const completed = tasks.filter((t) => t.completed)

  const handleDeleteWithFocus = (id: string) => {
    const listEl = listRef.current
    if (!listEl) { onDelete(id); return }

    const items = Array.from(listEl.querySelectorAll<HTMLElement>('[data-task-id]'))
    const index = items.findIndex(el => el.dataset.taskId === id)

    onDelete(id)

    requestAnimationFrame(() => {
      const newItems = Array.from(listEl.querySelectorAll<HTMLElement>('[data-task-id]'))
      if (newItems.length === 0) {
        document.querySelector<HTMLElement>('[aria-label="Add a new task"]')?.focus()
        return
      }
      const targetIndex = index < 0 ? 0 : Math.min(index, newItems.length - 1)
      const focusable = newItems[targetIndex]?.querySelector<HTMLElement>('input, button, [tabindex="0"]')
      focusable?.focus()
    })
  }

  return (
    <VStack ref={listRef} as="ul" role="list" aria-live="polite" aria-relevant="additions removals" gap="0" align="stretch" p="0" m="0" listStyleType="none">
      {active.map((task) => (
        <TaskItem key={`active-${task.id}`} task={task} onToggle={onToggle} onDelete={handleDeleteWithFocus} onEdit={onEdit} />
      ))}
      {active.length > 0 && completed.length > 0 && (
        <li role="presentation" style={{ listStyle: 'none' }}>
          <Box borderTopWidth="1px" borderColor="#E5E5EA" aria-hidden="true" />
        </li>
      )}
      {completed.map((task) => (
        <TaskItem key={`completed-${task.id}`} task={task} onToggle={onToggle} onDelete={handleDeleteWithFocus} onEdit={onEdit} />
      ))}
    </VStack>
  )
}
