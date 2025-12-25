import * as cheerio from 'cheerio'

async function download(url) {
    const response = await fetch(url, {
        headers: {
            // This is the "ID Card" that tells the server you are a browser
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
    });

    if(!response.ok) {
        throw new Error(`HTTP: ${response.status}`);
    }

    const html = await response.text();
    return cheerio.load(html);
}

function includePackage($lastPublish) {
    const currentTime = Date.now();
    const lastPublishTime = Date.parse($lastPublish.attr("datetime"));
    const elapsedTime = lastPublishTime - currentTime;

    return elapsedTime < 94670856000;
}

const listingURL = "https://www.npmjs.com/search?page=0&q=keywords%3Allm&sortBy=dependent_count";
const $ = await download(listingURL);

const promises = $("main section").toArray().map(async (element) => {
    const $package = $(element);

    const $packageURL = $package.find("a").first();
    const packageURL = new URL($packageURL.attr("href"), listingURL).href;

    const $p = await download(packageURL);
    const $lastPublish = $p("aside time").first();
    
    if(!includePackage($lastPublish)) {
        return {};
    }

    const $name = $p("h1 span").first();
    const name = $name.text().trim();

    const $description = $package.find("p").first();
    const description = $description.text().trim();

    return {packageURL, name, description};
});

const data = await Promise.all(promises);
console.log(data);