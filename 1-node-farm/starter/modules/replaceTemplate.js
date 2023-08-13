module.exports = {
    replaceTemplate,
    header
}

function replaceTemplate(template, product) {
    let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRODUCTPRICE%}/g, product.price);
    output = output.replace(/{%PRODUCTLOCATION%}/g, product.from);
    output = output.replace(/{%PRODUCTNUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%PRODUCTQUANTITY%}/g, product.quantity);
    output = output.replace(/{%PRODUCTDESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);
    output = output.replace(/{%SLUG%}/g, product.slug);

    if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

    return output;
}

function header(res) {
    return res.writeHead(
        200, {
            'Content-type': 'text/html',
            'my-own-header': 'node-farm'
        }
    );
}