import {readFile} from 'fs/promises'

const jsonData = await readFile('products.json');
const data = JSON.parse(jsonData)

/*
for (let product of data) {
    if(product.minPrice > 50000) {
        console.log(`${product.title} | ${product.minPrice} | ${product.price}`);
    }
}
*/

data
    .filter(row => row.minPrice > 50000)
    .forEach((row) => console.log(row));