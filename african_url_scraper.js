import * as cheerio from 'cheerio';
import { AsyncParser } from '@json2csv/node'
import {writeFile} from 'fs/promises'

async function download(url) {
    const response = await fetch(url);
    
    if(!response.ok){
        throw new Error(`HTTP: ${response.status}`);
    }

    const html = await response.text();
    return cheerio.load(html);
}

function parseCountry($country, baseURL) {
    const $name = $country.find("td:nth-child(3) a");
    const name = $name.text().trim();
    
    const url = new URL($name.attr("href"), baseURL).href;
    
    return {url, name};
}

function exportJSON (data) {
    return JSON.stringify(data, null, 2);
}

function exportCSV(data) {
    const parser = new AsyncParser();
    return parser.parse(data).promise();
}

const url = "https://en.wikipedia.org/wiki/List_of_sovereign_states_and_dependent_territories_in_Africa";
const $ = await download(url);

const promises = $(".wikitable:first tbody tr").toArray().map( async (element) => {
    const $country = $(element);
    const item =  parseCountry($country, url);
    
    const $c = await download(item.url);
    const $label = $c("th.infobox-label")
    .filter( (i, element) => $(element).text().trim() === "Calling code")
    .first();

    item.callingCode = $label
    .parent()
    .find("td.infobox-data")
    .first()
    .text()
    .trim();

    

    return item;
});

const data = await Promise.all(promises);

await writeFile('countries.json', exportJSON(data));
await writeFile('countries.csv', await exportCSV(data));