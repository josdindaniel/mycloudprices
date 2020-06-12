const price = require('./priceFunction')

price.calculatePriceEC2('AmazonEC2', "m5.2xlarge", "Linux", (req, res, next) => {
  console.log(req);
  

});


var suma = parseFloat(valor) + 1;
console.log("SUMA: " + suma);
