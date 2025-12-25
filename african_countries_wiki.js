import * as cheerio from 'cheerio';

const url = "https://en.wikipedia.org/wiki/List_of_sovereign_states_and_dependent_territories_in_Africa";
const response = await fetch(url);

if(!response.ok){
    throw new Error(`HTML: ${response.status}`);
}

const html = await response.text();
const $ = cheerio.load(html);

for (let element of $(".wikitable:first tr").toArray()) {
    const $country = $(element);
    const $name= $country.find("td:nth-child(3) a");
    const name = $name.text();
    console.log(name);
}