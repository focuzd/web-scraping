import { CheerioCrawler } from "crawlee";

function parseVariant($option) {
  const [variantName, priceText] = $option
    .text()
    .trim()
    .split(" - ");
  const price = parseInt(
    priceText
      .replace("$", "")
      .replace(".", "")
      .replace(",", "")
  );
  return { variantName, price };
}

const crawler = new CheerioCrawler({
    async requestHandler({$, log, request, pushData, enqueueLinks}) {
        if (request.label === 'DETAIL') {
            log.info(`Product detail page: ${request.url}`);

            const $price = $(".product-form__info-content .price").contents().last();
            const priceRange = {minPrice: null, price: null};
            const priceText = $price
            .text()
            .trim()
            .replace("$", "")
            .replace(",", "")
            .replace(".", "");

            if(priceText.startsWith("From ")) {
                priceRange.minPrice = parseInt(priceText.replace("From ", ""));
            } else {
                priceRange.minPrice = parseInt(priceText);
                priceRange.price = priceRange.minPrice;
            }

            const item = {
                url: request.url,
                title: $('.product-meta__title').text().trim(),
                vendor: $('.product-meta__vendor').text().trim(),
                ...priceRange,
                variantName: null,
            };

            const $variants = $(".product-form__option.no-js option");
            if($variants.length === 0){
                log.info('Saving a product');
                pushData(item);
            } else {
                for (const element of $variants.toArray()) {
                    const variant = parseVariant($(element));
                    log.info('Saving a product variant');
                    pushData({...item, ...variant});
                }
            }

        } else {
            log.info('Looking for product details page')
            await enqueueLinks({ label: 'DETAIL', selector: '.product-list a.product-item__title' });
        }
    },
});

await crawler.run(['https://warehouse-theme-metal.myshopify.com/collections/sales']);
crawler.log.info('Exporting data');
await crawler.exportData('dataset.json');
await crawler.exportData('dataset.csv');