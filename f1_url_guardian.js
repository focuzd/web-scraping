import * as cheerio from 'cheerio';

async function download(url) {
    const response = await fetch(url);

    if(!response.ok){
        throw new Error(`HTTP: ${response.status}`);
    }

    const html = await response.text();
    return cheerio.load(html);
}


const baseURL = "https://www.theguardian.com/sport/formulaone";
const $ = await download(baseURL);

const promises = $("main li").toArray().map( async (element) => {
    const $card = $(element);
 
    const $articleURL = $card.find("a").first();
    const articleURL = new URL($articleURL.attr("href"), baseURL).href;

    const $title = $card.find(".headline-text");
    const title = $title.text().trim().replace(" – video", "").replace(" – gallery", "");

    const $a = await download(articleURL);
    /*
    const $author = $a("main a")
    .filter((i, element) => $(element).attr("rel") === "author")
    .first();

    const author = $author.text().trim();
   
    let outString = `${author}: ${title}`;
    if(!author) {
        const $agency = $a("address span");
        const agency = $agency.text().trim();
        outString = `${agency}: ${title}`;
    }

    console.log(outString);
    */

    const author = $a('a[rel="author"]').text().trim();
    const address = $a('aside address').text().trim();

    console.log(`${author || address || null}: ${title}`);
});

await Promise.all(promises);

