export const createTaskSchema = {
  body: {
    type: 'object',
    required: ['text'],
    properties: {
      text: { type: 'string', minLength: 1, maxLength: 500 },
    },
    additionalProperties: false,
  },
} as const

export const updateTaskSchema = {
  body: {
    type: 'object',
    properties: {
      text: { type: 'string', minLength: 1, maxLength: 500 },
      completed: { type: 'boolean' },
    },
    additionalProperties: false,
    minProperties: 1,
  },
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
} as const

export const taskParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
} as const
