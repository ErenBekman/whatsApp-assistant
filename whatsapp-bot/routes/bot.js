const express = require('express');
const puppeteer = require('puppeteer');
const bot = express.Router();

bot.get('/', async (req, res) => {
	try {
		// Configures puppeteer
		const browser = await puppeteer.launch({ headless: false });
		const page = await browser.newPage();
		await page.setUserAgent(
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36'
		);
		await page.goto('https://web.whatsapp.com/');
		await page.waitForSelector('._1MXsz');
		await page.waitFor(3000);

		const contactName = 'Eren';
		await page.click(`span[title='${contactName}']`);
		await page.waitForSelector('._3uMse');

		const editor = await page.$("div[data-tab='1']");
		await editor.focus();

		const amountOfMessages = 500;

		//Loops through cycle of sending message
		for (var i = 0; i < amountOfMessages; i++) {
			await page.evaluate(() => {
				const message = 'hello, test message';
				document.execCommand('insertText', false, message);
			});
			await page.click("span[data-testid='send']");
			await page.waitFor(3000);
		}
	} catch (e) {
		console.error('error mine', e);
	}
});

module.exports = bot;
