import {writeFile} from 'node:fs/promises'
import * as cheerio from 'cheerio'
import { AsyncParser } from '@json2csv/node';
import { url } from 'node:inspector';

async function download(url) {
    const response = await fetch(url);

    if(!response.ok) {
        throw new Error(`HTTP: ${response.status}`);
    }

    const html = await response.text();
    return cheerio.load(html);
}

function parseProduct($productItem, baseURL) {
    const $title = $productItem.find(".product-item__title");
    const title = $title.text().trim();

    const url = new URL($title.attr('href'), baseURL).href;

    const $price = $productItem.find(".price--highlight").contents().last();
    const priceRange = {minPrice: null, price:null};
    const priceText = $price
    .text()
    .trim()
    .replace("$", "")
    .replace(",", "")
    .replace(".", ""); 

    if(priceText.startsWith("From ")){
        priceRange.minPrice = parseInt(priceText.replace("From ", ""));
    } else {
        priceRange.minPrice = parseInt(priceText);
        priceRange.price = priceRange.minPrice;
    }

    return {url, title, ...priceRange};
}

function parseVariant($option) {
    const [variantName, priceText] = $option
    .text()
    .trim()
    .split(" - ");

    const price = parseInt(
    priceText
    .trim()
    .replace("$", "")
    .replace(",", "")
    .replace(".", ""));

    return {variantName, price};
}

function exportJSON(data) {
    return JSON.stringify(data, null, 2);
}

function exportCSV(data) {
    const parser = new AsyncParser();
    return parser.parse(data).promise();
}

const listingURL = "https://warehouse-theme-metal.myshopify.com/collections/sales";
const $ = await download(listingURL);

const promises = $(".product-item").toArray().map(async element => {
    const $productItem = $(element);
    const item = parseProduct($productItem, listingURL);
    
    const $p = await download(item.url);
    item.vendor = $p(".product-meta__vendor").text().trim();

    const items = $p(".product-form__option.no-js option").toArray().map(optionElement => {
        const $option = $(optionElement);
        const variant = parseVariant($option);
        return {...item, ...variant};
    });

    return (items.length > 0) ? items : [{...item, variantName: null}];
});

const itemsList = await Promise.all(promises);
const data = itemsList.flat();

await writeFile('products.json', exportJSON(data));
await writeFile('products.csv', await exportCSV(data));

/*
const data = $(".product-item").toArray().map( (element) => {
    const $productItem = $(element);

    const $title = $productItem.find(".product-item__title");
    const title = $title.text().trim();

    const $price = $productItem.find(".price--highlight").contents().last();
    const priceRange = {minPrice: null, price: null};
    const priceText = $price
    .text()
    .trim()
    .replace("$", "")
    .replace(",", "")
    .replace(".", "");

    if(priceText.startsWith("From ")){
        priceRange.minPrice = parseInt(priceText.replace("From ", ""));
    } else {
        priceRange.minPrice = parseInt(priceText);
        priceRange.price = priceRange.minPrice;
    }

    return {title, ...priceRange};
});

const jsonData = JSON.stringify(data, null, 2);
await writeFile('products.json', jsonData);

const parser = new AsyncParser();
const csvData = await parser.parse(data).promise();
await writeFile('products.csv', csvData);
*/