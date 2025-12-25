import fs from 'fs';

/**
 * Highlights elements matching the selector and saves the HTML to a file.
 * * @param {Function} $ - The cheerio instance (loaded with HTML)
 * @param {String} selector - The CSS selector you want to test
 * @param {String} filename - The output file name (default: debug.html)
 */
export function debugHighlight($, selector, filename = 'debug.html') {
    // 1. count matches
    const matches = $(selector);
    console.log(`\n--- DEBUG: Selector "${selector}" ---`);
    console.log(`Found ${matches.length} matching element(s).`);

    if (matches.length === 0) {
        console.warn("WARNING: No elements found. Check your selector logic.");
        return;
    }

    // 2. clone the cheerio object so we don't mess up your actual data processing
    // Note: Cheerio doesn't have a deep clone, so we re-load the HTML.
    const $debug = $.load($.html());

    // 3. Inject nasty, high-visibility CSS styles
    $debug(selector).attr('style', `
        border: 10px solid #ff0000 !important; 
        background-color: #ffff00 !important; 
        color: #000000 !important;
        outline: 10px solid #ff0000 !important;
        z-index: 99999 !important;
    `);

    // 4. Add a summary banner at the top of the body
    $debug('body').prepend(`
        <div style="position:fixed; top:0; left:0; width:100%; background:black; color:white; padding:10px; z-index:999999; font-size:20px; font-family:sans-serif; opacity: 0.9;">
            DEBUG MODE: Highlighting <strong>${matches.length}</strong> elements for selector: <code style="color:lime">${selector}</code>
        </div>
    `);

    // 5. Write to file
    fs.writeFileSync(filename, $debug.html());
    console.log(`✅ Visual debug saved to: ./${filename}`);
    console.log(`   (Open this file in Chrome to see what you selected)`);
    console.log("-------------------------------------------\n");
}