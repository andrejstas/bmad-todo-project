import { Box, Button, Container, Heading, Spinner, Text, VStack } from '@chakra-ui/react'
import { useTasks, useToggleTask, useDeleteTask, useUpdateText } from './api/tasks'
import { ProgressCounter } from './components/ProgressCounter'
import { TaskInput } from './components/TaskInput'
import { TaskList } from './components/TaskList'

function App() {
  const { data: tasks = [], isPending, isError, refetch } = useTasks()
  const toggleTask = useToggleTask()
  const deleteTask = useDeleteTask()
  const updateText = useUpdateText()

  const handleToggle = (id: string, completed: boolean) => {
    toggleTask.mutate({ id, completed })
  }

  const handleDelete = (id: string) => {
    deleteTask.mutate(id)
  }

  const handleEdit = (id: string, text: string) => {
    updateText.mutate({ id, text })
  }

  return (
    <Box as="main" bg="#FAFAFA" minH="100vh">
      <Container maxW={{ base: '100%', md: '600px' }} px={{ base: '0', md: '4' }} pt={{ base: '32px', md: '80px' }}>
        <Box
          bg="white"
          borderRadius={{ base: '0', md: '12px' }}
          boxShadow={{ base: 'none', md: '0 1px 3px rgba(0,0,0,0.08)' }}
          px={{ base: '16px', md: '24px' }}
          py="24px"
        >
          <VStack gap="24px" align="stretch">
            <Heading
              as="h1"
              fontSize="20px"
              fontWeight="600"
              color="#1D1D1F"
              lineHeight="1.5"
            >
              Tasks
            </Heading>
            {!isPending && !isError && <ProgressCounter tasks={tasks} />}
            {!isError && <TaskInput />}
            {isPending ? (
              <Box textAlign="center" py="24px">
                <Spinner size="sm" color="#007AFF" aria-label="Loading tasks" />
              </Box>
            ) : isError ? (
              <VStack py="24px" gap="12px">
                <Text color="#FF3B30" fontSize="16px">Failed to load tasks</Text>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Try again</Button>
              </VStack>
            ) : (
              <TaskList tasks={tasks} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} />
            )}
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default App
