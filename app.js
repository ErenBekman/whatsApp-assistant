const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const dotenv = require("dotenv");
dotenv.config();

async function initBrowser() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(process.env.LOGIN_URL);
  page.waitForNavigation({ waitUntil: "networkidle0" });
  console.log("initBrowser()");
  return page;
}

async function login(page) {
  try {
    // let cookies = readCookieFile();
    // if (cookies === undefined) {
    await page.waitForTimeout(3000);
    await page.waitForSelector("#login-email");
    await page.type('input[name="login email"]', process.env.USER_EMAIL, {
      delay: 100,
    });

    await page.waitForSelector("input[type=password]");
    await page.type("input[type=password]", process.env.USER_PASSWORD, {
      delay: 100,
    });
    await page.click("button[type=submit]", { delay: 100 });

    page.waitForNavigation({ waitUntil: "networkidle0" }); // Wait for page to finish loading

    let cookies = await page.cookies();
    await page.setCookie(...cookies);
    // await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
    // } else {
    // 	await page.setCookie(...cookies);
    // }
    console.log("login()");
    await login_check(page);
  } catch (error) {
    console.log("login error :>> ", error);
  }
}
async function addToCard(page) {
  try {
    await page.waitForTimeout(3000);
    await page.goto(process.env.PROUDUCT_URL);
    await size_check(page);
    // await page.click(".add-to-basket");
    console.log("addToCard()");
  } catch (error) {
    console.log("addToCard error :>> ", error);
  }
}
async function buy(page) {
  try {
    await page.goto(process.env.BASKET_URL);
    await page.evaluate(() =>
      document.querySelectorAll(".p-checkbox-wrapper > input")[3].click()
    );
    // document.querySelectorAll("label[class='p-checkbox-wrapper']")[4].click();
    // document.getElementsByClassName('p-checkbox-wrapper')[3].click();

    await page.click(".approve-button-wrapper > button");
    page.screenshot({
      path: screenshot_path + "buy-" + Math.floor(new Date() / 1000) + ".png",
    });

    console.log("buy()");
  } catch (error) {
    console.log("buy error :>> ", error);
  }
}

async function login_check(page) {
  const login_check = await page.evaluate(() => {
    let login_title = document.querySelector(".link-text").innerText;
    console.log("login_title :>> ", login_title);
    let isLogged = false;
    if (login_title === "Giriş Yap") {
      console.log("not login !");
      isLogged = true;
    }
    if (!isLogged) {
      throw new Error("not login !");
    }
    return isLogged;
  });

  console.log("login_check :>> ", login_check);
}

async function size_check(page) {
  const size_check = await page.evaluate(() => {
    if (document.querySelector(".size-variant-attr-value")) {
      let size = document.querySelector(".size-variant-attr-value").innerText;
      return size;
    }
    return null;
  });
  console.log("size_check :>> ", size_check);
}

async function property_check(page) {
  let properties = await page.evaluate(() => {
    let results = [];
    let items = document.querySelectorAll(".detail-attr-container");
    items.forEach((item) => {
      results.push({
        url: item.getAttribute("href"),
        text: item.innerText,
      });
    });
    return results;
  });
  console.log("property_check :>> ", properties);
}

// async function readCookieFile() {
// 	try {
// 		let fileContent = fs.readFileSync('./cookies.json', 'utf-8');
// 		return JSON.parse(fileContent);
// 	} catch {
// 		return undefined;
// 	}
// }

async function test() {
  const page = await initBrowser();
  await login(page);
  await addToCard(page);
  await buy(page);
  await property_check(page);
}

test();
