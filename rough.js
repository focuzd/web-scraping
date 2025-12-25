import { writeFile } from 'fs/promises';

 const response = await fetch("https://arxiv.org/search/?searchtype=abstract&query=distributed+systems&abstracts=show&size=200&order=");
if(!response.ok) {
    throw new Error(`HTTP: ${response.status}`);
}

await writeFile('arxiv.html', await response.text());