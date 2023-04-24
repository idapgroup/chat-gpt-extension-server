import {PuppeteerWebBaseLoader} from "langchain/document_loaders";

export const customWebLoaderByUrl = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url,
    {
      launchOptions: {headless: true, ignoreHTTPSErrors: true},
      gotoOptions: {waitUntil: 'domcontentloaded',  timeout: 5000},
      async  evaluate (page) {
        const body = await page.evaluate(() => document.body.innerText);
        const title = await page.evaluate(() => document.title)
        return `${title} \n ${body.replace(/\n+/g, ' ')}`
      }
    });

 return  await loader.load();
}
