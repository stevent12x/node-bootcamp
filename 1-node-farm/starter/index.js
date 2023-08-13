const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const helpers = require('./modules/replaceTemplate')

////////////////////
//FILES
// Blocking synchronous code
// const textIn = fs.readFileSync('starter/txt/input.txt', 'utf-8');
// console.log(textIn);
//
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('starter/txt/output.txt', textOut);
// console.log('File written');

// Asynchronous example - callback hell
// fs.readFile('starter/txt/start.txt', 'utf-8', (err, data1) => {
//     if (err) return console.log('SOME ERROR');
//     fs.readFile(`starter/txt/${data1}.txt`, 'utf-8', (err, data2) => {
//         console.log(data2);
//         fs.readFile('starter/txt/append.txt', 'utf-8', (err, data3) => {
//             console.log(data3);
//
//             fs.writeFile('starter/txt/final.txt', `${data2}\n${data3}`, 'utf-8', err => {
//                 console.log('WRITTEN!')
//              })
//         });
//     });
// });
// console.log('Reading file...');

////////////////////////
// SERVER - basic routing

const templateOverview = fs.readFileSync(`${__dirname}/templates/template_overview.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/templates/template_card.html`, 'utf-8');
const templateProduct = fs.readFileSync(`${__dirname}/templates/template_product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);
dataObject.map(product => {
    product['slug'] = slugify(product.productName.toLowerCase());
});

const server = http.createServer((req, res) => {
    const {query, pathname} = url.parse(req.url, true);
    //Overview Page
    if (pathname === '/' || pathname === '/overview') {
        helpers.header(res);

        const cardsHTML = dataObject.map(el => helpers.replaceTemplate(templateCard, el)).join('');
        const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHTML);

        res.end(output);

    //Product Page
    } else if (pathname.includes('/product')) {
        helpers.header(res);

        const product = dataObject.find(product => {
            return product.slug === pathname.replace('/product/', '')
        });

        const output = helpers.replaceTemplate(templateProduct, product);
        res.end(output);

    //API
    } else if (pathname === '/api') {
        res.writeHead(200, {'Content-type': 'application/json'});
        res.end(data);

    //Not Found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello-world'
        });
        res.end('<h1>Page NOT FOUND</h1>');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to request on port 8000');
});