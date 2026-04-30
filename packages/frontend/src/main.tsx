import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, Toaster, ToastCloseTrigger, ToastDescription, ToastRoot, ToastTitle } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { system } from './theme'
import { toaster } from './api/tasks'
import App from './App'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>
        <App />
        <Toaster toaster={toaster} width="360px">
          {(toast) => (
            <ToastRoot>
              <ToastTitle>{toast.title}</ToastTitle>
              {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
              <ToastCloseTrigger />
            </ToastRoot>
          )}
        </Toaster>
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>,
)
