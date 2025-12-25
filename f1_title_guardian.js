import * as cheerio from 'cheerio';
import {writeFile} from 'fs/promises';

const url = "https://www.theguardian.com/sport/formulaone";
const response = await fetch(url);

if(!response.ok){
    throw new Error(`HTTP: ${response.status}`);
}

const html = await response.text();
writeFile("f1_news.html", html);
const $ = cheerio.load(html);

for (let element of $("main li").toArray()) {
    const $newsCard = $(element);

    const $title = $newsCard.find("span.headline-text");
    const titleText = $title
    .text()
    .trim()
    .replace(" – gallery", "")
    .replace(" – video", "");
    
    const $date = $newsCard.find("footer time");
    const dateTime = $date.attr('datetime');
    const dateString = (dateTime) ? new Date(dateTime).toDateString() : (null);
    
    console.log(`${titleText} | ${dateString}`);
    
}   