import { test, expect } from '@playwright/test';

test.describe('Gary Vee Network - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page with proper title', async ({ page }) => {
    await expect(page).toHaveTitle(/Gary Vee Network/);
    await expect(page.locator('h1')).toContainText('Gary Vee Network');
  });

  test('should display contact grid with sample data', async ({ page }) => {
    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-card"]', { timeout: 10000 });
    
    // Check if contact cards are displayed
    const contactCards = page.locator('[data-testid="contact-card"]');
    await expect(contactCards).toHaveCount.greaterThan(0);
  });

  test('should open add contact modal', async ({ page }) => {
    await page.click('[data-testid="add-contact-button"]');
    await expect(page.locator('[data-testid="add-contact-modal"]')).toBeVisible();
  });

  test('should add a new contact manually', async ({ page }) => {
    // Open add contact modal
    await page.click('[data-testid="add-contact-button"]');
    
    // Fill in contact details
    await page.fill('[data-testid="contact-name"]', 'John Doe');
    await page.fill('[data-testid="contact-email"]', 'john@example.com');
    await page.selectOption('[data-testid="contact-tier"]', 'tier1');
    await page.fill('[data-testid="contact-location"]', 'New York');
    await page.fill('[data-testid="contact-interests"]', 'Technology, Marketing');
    
    // Save contact
    await page.click('[data-testid="save-contact-button"]');
    
    // Verify contact was added
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should filter contacts by tier', async ({ page }) => {
    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-card"]');
    
    // Filter by tier 1
    await page.selectOption('[data-testid="tier-filter"]', 'tier1');
    
    // Check if only tier 1 contacts are shown
    const tier1Cards = page.locator('[data-testid="contact-card"][data-tier="tier1"]');
    await expect(tier1Cards).toHaveCount.greaterThan(0);
  });

  test('should search contacts by name', async ({ page }) => {
    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-card"]');
    
    // Search for a specific name
    await page.fill('[data-testid="search-input"]', 'Gary');
    
    // Check if search results are filtered
    const searchResults = page.locator('[data-testid="contact-card"]');
    await expect(searchResults).toHaveCount.greaterThan(0);
  });

  test('should export contacts to CSV', async ({ page }) => {
    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-card"]');
    
    // Click export button
    await page.click('[data-testid="export-button"]');
    
    // Verify download started
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-csv-button"]');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/contacts.*\.csv$/);
  });

  test('should toggle between grid and list view', async ({ page }) => {
    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-card"]');
    
    // Switch to list view
    await page.click('[data-testid="list-view-button"]');
    await expect(page.locator('[data-testid="contact-list"]')).toBeVisible();
    
    // Switch back to grid view
    await page.click('[data-testid="grid-view-button"]');
    await expect(page.locator('[data-testid="contact-grid"]')).toBeVisible();
  });

  test('should display analytics dashboard', async ({ page }) => {
    // Check if analytics components are visible
    await expect(page.locator('[data-testid="total-contacts"]')).toBeVisible();
    await expect(page.locator('[data-testid="tier-distribution"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-growth"]')).toBeVisible();
  });

  test('should handle dark mode toggle', async ({ page }) => {
    // Check if theme toggle is present
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    
    // Toggle dark mode
    await themeToggle.click();
    
    // Verify dark mode is applied
    await expect(page.locator('html')).toHaveAttribute('class', /dark/);
  });
});

test.describe('OCR Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="add-contact-button"]');
    await page.click('[data-testid="upload-screenshot-tab"]');
  });

  test('should upload and process Instagram screenshot', async ({ page }) => {
    // Upload a test image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="upload-button"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/instagram-profile.png');
    
    // Click extract button
    await page.click('[data-testid="extract-button"]');
    
    // Wait for extraction to complete
    await page.waitForSelector('[data-testid="extraction-results"]', { timeout: 30000 });
    
    // Verify extracted data is displayed
    await expect(page.locator('[data-testid="extracted-name"]')).toBeVisible();
  });

  test('should handle OCR extraction errors gracefully', async ({ page }) => {
    // Upload an invalid file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="upload-button"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('tests/fixtures/invalid-file.txt');
    
    // Click extract button
    await page.click('[data-testid="extract-button"]');
    
    // Verify error message is shown
    await expect(page.locator('[data-testid="ocr-error"]')).toBeVisible();
  });
});

test.describe('AI Chat Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="ai-chat-button"]');
  });

  test('should open AI chat interface', async ({ page }) => {
    await expect(page.locator('[data-testid="ai-chat-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
  });

  test('should send and receive AI responses', async ({ page }) => {
    // Type a query
    await page.fill('[data-testid="chat-input"]', 'Show me tier 1 contacts');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await page.waitForSelector('[data-testid="ai-response"]', { timeout: 10000 });
    
    // Verify response is displayed
    await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
  });
}); 