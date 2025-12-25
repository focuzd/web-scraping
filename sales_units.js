import * as cheerio from 'cheerio';

const url = "https://warehouse-theme-metal.myshopify.com/collections/sales";
const response = await fetch(url);

if (!response.ok) {
    throw new Error(`HTTP: ${response.status}`);
}

const html = await response.text();
const $ = cheerio.load(html);

for (let element of $(".product-item").toArray()) {
    const $product = $(element);
    const $title = $product.find(".product-item__title");
    const titleText = $title.text().trim();

    const $stock = $product.find(".product-item__inventory");
    const stockText = $stock.text();
    const regex = /\d+/;
    const qtyArray = regex.exec(stockText);
    const quantity = (qtyArray) ? (parseInt(qtyArray[0])) : (0);
    
    console.log(`${titleText} | ${quantity}`);
}