import { test, expect } from '@playwright/test';

const BASE_URL = 'https://company-chat-lilac.vercel.app';

test.describe('Company Chat E2E テスト', () => {
  test.describe('ログインページ', () => {
    test('TEST-1: ログインページにタイトルとGoogleログインボタンが表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // 「Company 秘書室」タイトルの確認
      const heading = page.locator('h1');
      await expect(heading).toBeVisible();
      await expect(heading).toContainText('Company 秘書室');

      // Googleログインボタンの確認
      const loginButton = page.locator('button', { hasText: 'Google でログイン' });
      await expect(loginButton).toBeVisible();

      await page.screenshot({ path: 'e2e-screenshots/test1-login-page.png', fullPage: true });
    });

    test('TEST-2: ページタイトル（メタデータ）が正しく設定されている', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      await expect(page).toHaveTitle(/Company 秘書室/);

      await page.screenshot({ path: 'e2e-screenshots/test2-page-title.png' });
    });

    test('TEST-3: 秘書アイコン（「秘」の漢字）が表示される', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // 「秘」の文字が含まれるアイコン要素の確認
      const iconDiv = page.locator('div').filter({ hasText: /^秘$/ }).first();
      await expect(iconDiv).toBeVisible();

      // サブタイトルの確認
      const subtitle = page.locator('p').filter({ hasText: 'ひなたが何でもお手伝いします' });
      await expect(subtitle).toBeVisible();
    });
  });

  test.describe('未認証リダイレクト', () => {
    test('TEST-4: /chat に未認証でアクセスすると /login にリダイレクトされる', async ({ page }) => {
      await page.goto(`${BASE_URL}/chat`);

      // リダイレクト後のURL確認（/login または認証関連のURL）
      await expect(page).toHaveURL(/login|signin|auth/);

      // ログインページのコンテンツが表示されていることを確認
      const loginButton = page.locator('button', { hasText: 'Google でログイン' });
      await expect(loginButton).toBeVisible();

      await page.screenshot({ path: 'e2e-screenshots/test4-chat-redirect.png', fullPage: true });
    });

    test('TEST-5: /calendar に未認証でアクセスすると /login にリダイレクトされる', async ({ page }) => {
      await page.goto(`${BASE_URL}/calendar`);

      await expect(page).toHaveURL(/login|signin|auth/);

      const loginButton = page.locator('button', { hasText: 'Google でログイン' });
      await expect(loginButton).toBeVisible();

      await page.screenshot({ path: 'e2e-screenshots/test5-calendar-redirect.png', fullPage: true });
    });

    test('TEST-6: /todos に未認証でアクセスすると /login にリダイレクトされる', async ({ page }) => {
      await page.goto(`${BASE_URL}/todos`);

      await expect(page).toHaveURL(/login|signin|auth/);

      const loginButton = page.locator('button', { hasText: 'Google でログイン' });
      await expect(loginButton).toBeVisible();

      await page.screenshot({ path: 'e2e-screenshots/test6-todos-redirect.png', fullPage: true });
    });

    test('TEST-7: ルートURL(/) に未認証でアクセスすると /login にリダイレクトされる', async ({ page }) => {
      await page.goto(`${BASE_URL}/`);

      // ルートは認証状態に応じて /chat か /login にリダイレクト
      // 未認証の場合は /login へ
      await expect(page).toHaveURL(/login|signin|auth/);

      await page.screenshot({ path: 'e2e-screenshots/test7-root-redirect.png', fullPage: true });
    });
  });

  test.describe('ログインページ UI/UX', () => {
    test('TEST-8: ログインページがモバイルビューポートで正しく表示される', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}/login`);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      await page.screenshot({ path: 'e2e-screenshots/test8-login-mobile.png', fullPage: true });
    });

    test('TEST-9: ログインページがデスクトップビューポートで正しく表示される', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`${BASE_URL}/login`);

      const heading = page.locator('h1');
      await expect(heading).toBeVisible();

      const loginButton = page.locator('button', { hasText: 'Google でログイン' });
      await expect(loginButton).toBeVisible();

      await page.screenshot({ path: 'e2e-screenshots/test9-login-desktop.png', fullPage: true });
    });
  });
});
