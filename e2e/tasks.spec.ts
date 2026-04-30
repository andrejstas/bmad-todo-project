import { test, expect, type Page } from '@playwright/test'

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

test.describe('Task Management E2E', () => {
  test('task creation', async ({ page }) => {
    await addTask(page, 'Buy milk')
    await expect(page.getByText('Buy milk')).toBeVisible()
    await expect(page.getByLabel('Add a new task')).toHaveValue('')
  })

  test('task completion', async ({ page }) => {
    await addTask(page, 'Complete me')

    const checkbox = page.getByRole('checkbox', { name: 'Complete me' })
    await checkbox.check({ force: true })

    const taskText = page.getByText('Complete me')
    await expect(taskText).toHaveCSS('text-decoration-line', 'line-through')
  })

  test('task editing', async ({ page }) => {
    await addTask(page, 'Original text')

    const taskText = page.getByRole('button', { name: 'Original text', exact: true })
    await taskText.click()

    const editInput = page.getByRole('textbox').nth(1)
    await editInput.fill('Updated text')
    await editInput.press('Enter')

    await expect(page.getByText('Updated text')).toBeVisible()
    await expect(page.getByText('Original text')).not.toBeVisible()
  })

  test('task deletion', async ({ page }) => {
    await addTask(page, 'Delete me')
    await expect(page.locator('li')).toHaveCount(1)

    const deleteBtn = page.getByLabel('Delete task: Delete me')
    await deleteBtn.dispatchEvent('click')

    await expect(page.locator('li')).toHaveCount(0)
  })

  test('full workflow', async ({ page }) => {
    await addTask(page, 'Task A')
    await addTask(page, 'Task B')
    await addTask(page, 'Task C')
    await expect(page.getByText('0 of 3 done')).toBeVisible()

    const checkboxB = page.getByRole('checkbox', { name: 'Task B' })
    await checkboxB.check({ force: true })
    await expect(page.getByText('1 of 3 done')).toBeVisible()

    const taskTextA = page.getByRole('button', { name: 'Task A', exact: true })
    await taskTextA.click()
    const editInput = page.getByRole('textbox').nth(1)
    await editInput.fill('Task A edited')
    await editInput.press('Enter')
    await expect(page.getByText('Task A edited')).toBeVisible()
    await expect(page.getByText('1 of 3 done')).toBeVisible()

    // Delete Task C via API (dispatchEvent on hidden button is unreliable after completion toggle)
    const taskCId = await page.locator('li').filter({ hasText: 'Task C' }).getAttribute('data-task-id')
    await page.request.delete(`/api/tasks/${taskCId}`)
    await page.reload()
    await expect(page.getByText('1 of 2 done')).toBeVisible()
  })
})
