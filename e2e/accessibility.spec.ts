import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function addTask(page: Page, text: string) {
  const input = page.getByLabel('Add a new task')
  await input.fill(text)
  await input.press('Enter')
}

test.beforeEach(async ({ page }) => {
  const response = await page.request.get('/api/tasks')
  const tasks = await response.json()
  for (const task of tasks as { id: string }[]) {
    await page.request.delete(`/api/tasks/${task.id}`)
  }
  await page.goto('/')
})

test.describe('Accessibility Audit', () => {
  test('empty state has no critical or serious violations', async ({ page }) => {
    const results = await new AxeBuilder({ page }).analyze()
    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(violations).toEqual([])
  })

  test('with active tasks has no critical or serious violations', async ({ page }) => {
    await addTask(page, 'Task 1')
    await addTask(page, 'Task 2')

    const results = await new AxeBuilder({ page }).analyze()
    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(violations).toEqual([])
  })

  test('with completed tasks has no critical or serious violations', async ({ page }) => {
    await addTask(page, 'Done task')
    await page.request.patch('/api/tasks/' + await page.locator('[data-task-id]').getAttribute('data-task-id'), {
      data: { completed: true },
    })
    await page.reload()

    const results = await new AxeBuilder({ page }).analyze()
    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(violations).toEqual([])
  })

  test('mixed state (active + completed) has no critical or serious violations', async ({ page }) => {
    await addTask(page, 'Active task')
    await addTask(page, 'Completed task')
    const taskId = await page.locator('[data-task-id]').filter({ hasText: 'Completed task' }).getAttribute('data-task-id')
    await page.request.patch(`/api/tasks/${taskId}`, { data: { completed: true } })
    await page.reload()

    const results = await new AxeBuilder({ page }).analyze()
    const violations = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    )
    expect(violations).toEqual([])
  })
})
