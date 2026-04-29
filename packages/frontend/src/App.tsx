import { Box, Container, Heading, VStack } from '@chakra-ui/react'

function App() {
  return (
    <Box as="main" bg="#FAFAFA" minH="100vh">
      <Container maxW="600px" pt={{ base: '32px', md: '80px' }}>
        <Box
          bg="white"
          borderRadius="12px"
          boxShadow="0 1px 3px rgba(0,0,0,0.08)"
          p="24px"
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
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default App
