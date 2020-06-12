// Load the SDK and UUID
var AWS = require('aws-sdk');
var code1, code2, unitPrice;
var pricing = new AWS.Pricing({
    apiVersion: 'latest',
    endpoint: 'https://api.pricing.us-east-1.amazonaws.com',
    region: 'us-east-1'
});
var data = ["AmazonEC2", "m5.2xlarge", "Linux"];

var paramsEC2 = {
    FormatVersion: "aws_v1",
    MaxResults: 100,
    ServiceCode: "AmazonEC2",
    Filters: [
        {
            Field: 'ServiceCode',
            Type: 'TERM_MATCH',
            Value: data[0]
        },
        {
            Field: 'licenseModel',
            Type: 'TERM_MATCH',
            Value: 'No License required'
        },
        {
            Field: "instanceType",
            Type: "TERM_MATCH",
            Value: data[1]
        },
        {
            Field: "location",
            Type: "TERM_MATCH",
            Value: "US EAST (N. Virginia)"
        },
        {
            Field: "operatingSystem",
            Type: "TERM_MATCH",
            Value: data[2]
        },
        {
            Field: "preInstalledSw",
            Type: "TERM_MATCH",
            Value: "NA"
        },
        {
            Field: "tenancy",
            Type: "TERM_MATCH",
            Value: "Shared"
        },
        {
            Field: "usagetype",
            Type: "TERM_MATCH",
            Value: "BoxUsage:" + data[1]
        }

    ]
};

pricing.getProducts(paramsEC2, function (err, data) {
    if (err) {
        console.log(err, err.stack); // an error occurred
    }
 

}).on('success', function(response) {
    Object.keys(response.data.PriceList[0].terms.OnDemand).map(e => {
        code1 = e;
    });
    //console.log(code1);
    Object.keys(response.data.PriceList[0].terms.OnDemand[code1].priceDimensions).map(e => {
        code2 = e;
    });
    //console.log(code2);
    unitPrice = response.data.PriceList[0].terms.OnDemand[code1].priceDimensions[code2].pricePerUnit.USD
    //console.log("PRICE: " + unitPrice)
    console.log("Success!" + unitPrice);
  });


console.log("testing:" + unitPrice);


//exports.calculatePriceEC2 = calculatePriceEC2;
