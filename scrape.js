const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const curlHighlightNewsPage = async (newsData, writeStream) => {
    console.log('In curn highlight')
    let i = 0;
    async function next() {
        if(i < newsData.length){
            const options = {
                url: `${newsData[i].link}`,
                transform: body => cheerio.load(body)
            };
            await rp(options)
                .then($ => {
                    const description = $('main > article').first().find('p');
                    let descriptions = '';
                    description.each((index, el) => {
                        const article = $(el);
                        descriptions = descriptions !== '' ? descriptions + 'nextpara' + article.text() : article.text(); 
                    })
                    descriptions = descriptions.replace(/,/g, 'comma')
                    writeStream.write(`${newsData[i].heading.replace(/,/g, 'comma')}, ${descriptions}, ${$('main > article').first().find($('.published-at')).text().replace(/,/g,'comma')}\n`)
                    ++i;
                    process.stdout.write('.');
                    return next();
                })
        }
    }
    await next();
}
module.exports = {
    scrapeEkantipurHighlight: async function(){
        const writeStream = fs.createWriteStream('news-highlight.csv');

        // write headers
        writeStream.write(`Title, Description, Date\n`);

        const options = {
            url: `https://ekantipur.com/`,
            transform: body => cheerio.load(body)
        }

        await rp(options)
            .then(async($) => {
                let newsData = [];
                $('.main-news > article').each((i, el) => { // all article element that are direct child of .main-news
                    const heading = $(el)
                        .find('h1')
                        .text();
                    const link = $(el)
                        .find('h1 a');
                    newsData.push({heading, link: link.attr('href')});
                })
                process.stdout.write('writting');
                await curlHighlightNewsPage(newsData, writeStream)
            })
            .catch(err => {
                console.log('err:', err);
            });
        process.stdout.write(`\nCompleted`)
    }
}

