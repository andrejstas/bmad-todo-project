import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  const response = await page.request.get('/api/tasks')
  const tasks = await response.json()
  for (const task of tasks as { id: string }[]) {
    await page.request.delete(`/api/tasks/${task.id}`)
  }
})

test.describe('Performance', () => {
  test('page loads under 1 second (NFR1)', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    await page.waitForSelector('[aria-label="Add a new task"]')
    const loadTime = Date.now() - start
    expect(loadTime).toBeLessThan(1000)
  })

  test('API responds under 100ms (NFR2)', async ({ page }) => {
    const start = Date.now()
    const response = await page.request.post('/api/tasks', {
      data: { text: 'Performance test task' },
    })
    const elapsed = Date.now() - start
    expect(response.status()).toBe(201)
    expect(elapsed).toBeLessThan(100)
  })

  test('first task added under 3 seconds from page load (NFR3)', async ({ page }) => {
    const start = Date.now()
    await page.goto('/')
    const input = page.getByLabel('Add a new task')
    await input.fill('Quick task')
    await input.press('Enter')
    await expect(page.getByText('Quick task')).toBeVisible()
    const totalTime = Date.now() - start
    expect(totalTime).toBeLessThan(3000)
  })
})
