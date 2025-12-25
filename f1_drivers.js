import { CheerioCrawler } from "crawlee";
import { debugHighlight } from "./debug-utils.js";

function parseDate(date) {
    const dateArr = date.split("/");
    return dateArr.reverse().join("-");
}

const crawler = new CheerioCrawler ({
    async requestHandler({$, log, request, pushData, enqueueLinks}) {
        if(request.label === 'DRIVER') {
            log.info(`Driver details page: ${request.url}`);

            const $details = $(".common-driver-info li");
            
            // const $instagram = $(".common-social-share li a")
            // .filter((i, element) => $(element).text() === "Instagram ")
            // .first(); 

            const info  = {};
            for (const element of $details.toArray()) {
                const key = $(element).find("span.col-left").text().trim();
                const value = $(element).find("h4.col-right").text().trim();
                info[key] = value;
            }

            const driver = {
                url: request.url,
                name: $("h1").text().trim(),
                teamName: $("span.team-name").text().trim(),
                // nationality: $details.eq(1).find("h4").text().trim(),
                // dob: parseDate($details.first().find("h4").text().trim()), // scraping based on indexing is not robust
                nationality: info['NATIONALITY'],
                dob: parseDate(info['DOB']),
                instagram_url: $(".common-social-share a[href*='instagram']").attr('href'), //can be used to get links what contain 'instagram'
            }

            pushData(driver);

        } else {
            log.info('Looking for driver details page')
            await enqueueLinks({label: 'DRIVER', selector: '.teams-and-drivers .teams-driver-item a'})
        }
    }
});

await crawler.run(['https://www.f1academy.com/Racing-Series/Drivers']);
await crawler.exportData('drivers.json');