import process from 'node:process';
import {writeFile} from 'node:fs'

const url = "https://warehouse-theme-metal.myshopify.com/cdn/shop/products/sonyxbr55front_f72cc8ff-fcd6-4141-b9cc-e1320f867785.jpg";
const response = await fetch(url);

if(!response.ok){
    throw new Error(`HTTP: ${response.status}`);
}

const buffer = Buffer.from(await response.arrayBuffer());

writeFile('img.png', buffer, (err) => {throw err;});

