const express = require('express');
const fs = require('fs');
const csvToJSON = require('csvtojson');
require('./constant'); // dot env configured
const {scrapeEkantipurHighlight} = require('./scrape')
const PORT = process.env.PORT || 3000;


const app = express();

app.use('/', express.static('public'));

app.get('/getScrapedData', async (req,res) => {
    await scrapeEkantipurHighlight();
    csvToJSON().fromFile('./news-highlight.csv')
        .then(newsData => {
            let newNewsData = newsData.map((data) => {
                return{
                    Title: data.Title.replace(/comma/g,','),
                    Description: data.Description.replace(/comma/g,',').replace(/nextpara/g,`\n`),
                    Date: data.Date.replace(/comma/g, ',')
                }
            })
            res.json(newNewsData);
        })
        .catch(err=>{
            console.log(err);
        })
})

app.listen(PORT, (err) => {
    if(err) throw err;
    console.log(`Server running in port: ${PORT}`);
})