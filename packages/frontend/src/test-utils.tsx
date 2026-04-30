import { render, type RenderOptions } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { system } from './theme'
import type { ReactElement } from 'react'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createTestQueryClient()
  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          {children}
        </ChakraProvider>
      </QueryClientProvider>
    ),
    ...options,
  })
}
