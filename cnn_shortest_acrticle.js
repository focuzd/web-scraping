import * as cheerio from 'cheerio';

async function download(url) {
    const response = await fetch(url);
    
    if(!response.ok) {
        throw new Error(`HTTP: ${response.status}`);
    }

    const html = await response.text();
    return cheerio.load(html);
}

function isArticle(url) {
    const arr = url.split("/");
    return !(arr[5] === "video" || arr[5] === "gallery");
}

const homePageURL = "https://edition.cnn.com/sport";
const $ = await download(homePageURL);


for (let element of $("section.layout__main li").toArray()) {
    const $card = $(element);

    const $articleURL = $card.find("a").first();
    if(!isArticle($articleURL.attr("href"))){
        continue;
    }

    const articleURL = new URL($articleURL.attr("href"), homePageURL).href;
    console.log(articleURL);
    

    const $a = await download(articleURL);

    const $article = $a(".article__content");
    const articleLength = $article.text().trim().length;

    console.log(articleLength);

    // console.log(`${title} | ${articleLength}`);
}