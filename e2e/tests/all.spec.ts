import { test, expect } from '@playwright/test';
import { Sequelize, Dialect } from 'sequelize';
import config from '../config';
import path from 'path';

test.describe('Don\'t require database setup', () => {
  test('unauthenticated user should not access upload page', async ({ page }) => {
    await page.goto(`http://localhost:${config.port}/memes/upload`);
    await expect(page.locator('#toast-container')).toContainText('Unauthorized');
  });
});

test.describe('Require database setup', () => {

  test.beforeEach(async () => {
    
    const sequelize = new Sequelize(config.dbConnectionUri, {
      dialect: config.dialect as Dialect
    });
    await sequelize.authenticate();
    
    await sequelize.query("INSERT OR IGNORE INTO Users (username, password, createdAt, updatedAt) VALUES (?, ?, ?, ?)", {
      replacements: ['asdrubale', '311b82e80ae15bc82556444ef48d121152404c8265ebce215abc4748edcdf4fc', new Date(), new Date()]
    });

    await sequelize.close();
  });

  test('it should login successfully', async ({ page }) => {
    
    await page.goto(`http://localhost:${config.port}/login`);

    await page.fill('#user', 'asdrubale');
    await page.fill('#pass', 'asdrubale');
    await page.click('#loginButton');

    await expect(page).toHaveURL(`http://localhost:${config.port}/homepage`);
    await expect(page.locator('#userMenuDropdown > button > span')).toContainText('asdrubale');
  });

  test('it shouldn\'t login', async ({ page }) => {
    await page.goto(`http://localhost:${config.port}/login`);
    await page.fill('#user', 'asdrubale');
    await page.fill('#pass', 'wrongpassword');
    await page.click('#loginButton');

    await expect(page).toHaveURL(`http://localhost:${config.port}/login`);
    await expect(page.locator('#toast-container')).toContainText('Invalid credentials');
  });

  test('it shouldn\'t register using a username that already exists', async ({ page }) => {
    await page.goto(`http://localhost:${config.port}/signup`);

    await page.fill('#user', 'asdrubale');
    await page.fill('#pass', 'asdrubale');
    await page.fill('#confirmPass', 'asdrubale');
    await page.click('#signupButton');

    await expect(page.locator('#toast-container')).toContainText('Username already exists');
  });

  test.describe('Authenticated Meme Tests', () => {
    
    test.beforeEach(async ({ page }) => {
      await page.goto(`http://localhost:${config.port}/login`);
      await page.fill('#user', 'asdrubale');
      await page.fill('#pass', 'asdrubale');
      await page.click('#loginButton');
      await page.waitForSelector('app-homepage');
    });

    test('it should logout successfully', async ({ page }) => {
      // act
      await page.click('#userMenuDropdown');
      await expect(page.locator('#logoutButton')).toBeVisible();
      await page.click('#logoutButton');
      
      // assert
      await expect(page).toHaveURL(`http://localhost:${config.port}/homepage`);
      await expect(page.locator('#toast-container')).toContainText('You have been logged out');
    });
    
    
    test('it should create a meme successfully', async ({ page }) => {
      await page.goto(`http://localhost:${config.port}/memes/upload`);
      await page.fill('#title', 'Funny Meme');
      await page.setInputFiles('#meme', path.resolve(__dirname, '../assets/meme.png'));
      await page.locator(`#tags input`).fill('funny');
      await page.locator(`#tags input`).press('Enter');
      await page.waitForSelector(`#tags div[title=funny]`)
      await page.locator(`#tags input`).fill('meme');
      await page.locator(`#tags input`).press('Enter');
      await page.click('#uploadButton');
      await expect(page).toHaveURL(new RegExp(`http://localhost:${config.port}/memes/\\d+`));
      await expect(page.locator('#toast-container')).toContainText('Meme uploaded successfully');
      await page.waitForSelector('#memeTitle');
      await expect(page.locator('#memeTitle')).toContainText('Funny Meme');
      await expect(page.locator('#memeTags')).toContainText('funny');
      await expect(page.locator('#memeTags')).toContainText('meme');
      await expect(page.locator('#memeAuthor')).toContainText('asdrubale');
    });

    test('it should not create a meme with missing data', async ({ page }) => {
      await page.goto(`http://localhost:${config.port}/memes/upload`);
      await page.setInputFiles('#meme', path.resolve(__dirname, '../assets/meme.png'));
      await page.locator(`#tags input`).fill('funny');
      await page.locator(`#tags input`).press('Enter');
      await page.waitForSelector(`#tags div[title=funny]`)
      await page.locator(`#tags input`).fill('meme');
      await page.locator(`#tags input`).press('Enter');
      // Missing title
      await expect(page.locator('#uploadButton')).toBeDisabled();
    });


    test.describe("Tests that require at least one meme to exist", () => {
      test.beforeEach(async ({ page }) => {
          await page.goto(`http://localhost:${config.port}/memes/upload`);
          await page.fill('#title', 'Funny Meme');
          await page.setInputFiles('#meme', path.resolve(__dirname, '../assets/meme.png'));
          await page.locator(`#tags input`).fill('funny');
          await page.locator(`#tags input`).press('Enter');
          await page.waitForSelector(`#tags div[title=funny]`)
          await page.locator(`#tags input`).fill('meme');
          await page.locator(`#tags input`).press('Enter');
          await page.click('#uploadButton'); 
          await page.waitForSelector('#memeTitle');
      });

      test('it should like a meme in the memes list', async ({ page }) => {
        await page.goto(`http://localhost:${config.port}/memes`);
        const likeButton = page.locator('app-vote-buttons button:first-child').first();
        const likeCountBefore = await likeButton.textContent();
        await likeButton.click();
        await expect(likeButton).toContainClass('btn-success');
        const likeCountAfter = await likeButton.textContent();
        expect(likeCountAfter).not.toBe(likeCountBefore);
      });

      test('as unauthenticated user it should not like a meme in the memes list', async ({ page }) => {
        await page.goto(`http://localhost:${config.port}/logout`);

        await page.goto(`http://localhost:${config.port}/memes`);
        const likeButton = page.locator('app-vote-buttons button:first-child').first();
        await expect(likeButton).toBeDisabled();
      });

      test('it should comment a meme', async ({ page }) => {
        await page.fill('#comments textarea', 'This is a test comment');
        await page.click('#postCommentButton');
        await expect(page.locator('#comments .comments-list div:first-child').first()).toContainText('This is a test comment');
        await expect(page.locator('#comments .comments-list div:first-child').first()).toContainText('asdrubale');
      });

      test('as unauthenticated user it should not be able to comment on a meme', async ({ page }) => {
        const currentUrl = page.url(); 
        await page.goto(`http://localhost:${config.port}/logout`);
        await page.goto(currentUrl);
        await expect(page.locator('#comments')).toContainText('Login to post comments');
      });

    });
  });
});
