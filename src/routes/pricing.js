const express = require('express');
const pdf = require('html-pdf');
var fs = require('fs');
const router = express.Router();
const Pricing = require('../models/pricing');
var AWS = require('aws-sdk');
var code1, code2, unitPrice;
var pricing = new AWS.Pricing({
    apiVersion: 'latest',
    endpoint: 'https://api.pricing.us-east-1.amazonaws.com',
    region: 'us-east-1'
});

router.get('/pricing', isAuthenticated, async (req, res, next) => {
    const price = await Pricing.find();
    res.render('pricing', { price });
});

router.get('/new-pricing', isAuthenticated, (req, res, next) => {
    res.render('new-pricing');
});

router.get('/edit-pricing/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/pricing');
    } else {
        const price = await Pricing.findById(req.params.id);
        res.render('edit-pricing', { price });
    }
});

router.put('/edit-pricing/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/pricing');
    } else {
        await Pricing.findByIdAndUpdate(req.params.id, { title: req.body.title, company: req.body.company, template: req.body.template, name: req.body.name, os: req.body.os, instance: req.body.instance, storage: req.body.storage, s3: req.body.s3 });
        req.flash('updatePricingMessage', 'The pricing has been updated correctly.');
        res.redirect("/pricing");
    }
});

router.post('/new-pricing', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/pricing');
    } else {
        const newPricing = new Pricing();
        newPricing.title = req.body.title;
        newPricing.company = req.body.company;
        newPricing.template = req.body.template;
        newPricing.region = req.body.region;
        newPricing.user = req.body.user;
        newPricing.name = req.body.name;
        newPricing.os = req.body.os;
        newPricing.instance = req.body.instance;
        newPricing.storage = req.body.storage;
        newPricing.s3 = req.body.s3;
        await newPricing.save();
        req.flash('newPricingMessage', 'The pricing "' + req.body.title + '" has been created correctly.');
        res.redirect('/pricing');
    }
});

router.delete('/delete-pricing/:id', isAuthenticated, async (req, res, next) => {
    if (req.user.role == 3) {
        req.flash('RoleMessageWarning', 'You do not have sufficient permissions to execute this action.');
        res.redirect('/pricing');
    } else {
        await Pricing.findByIdAndDelete(req.params.id);
        req.flash('deletePricingMessage', 'The tax has been successfully deleted.');
        res.redirect("/pricing");
    }
});

router.get('/view-pricing/:id', isAuthenticated, async (req, res, next) => {
    const price = await Pricing.findById(req.params.id);
    var systemop, colortemplate;
    if (price.os == 1) {
        systemop = "Linux"
    }
    if (price.os == 2) {
        systemop = "Windows"
    }
    if (price.template == 1){ colortemplate = "white" }
    if (price.template == 2){ colortemplate = "blue" }
    if (price.template == 3){ colortemplate = "green" }
    if (price.template == 4){ colortemplate = "red" }
    if (price.template == 5){ colortemplate = "black" }
    if (price.template == 6){ colortemplate = "orange" }
    if (price.template == 7){ colortemplate = "yellow" }
    if (price.template == 8){ colortemplate = "purple" }
    console.log("Template:"+colortemplate);
    var data = ["AmazonEC2", price.instance, systemop];
    console.log(data);

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
        var x;
        var y = (0.023 * price.s3).toFixed(3);
        var z = (0.1 * price.storage).toFixed(3);
        var t;
        if (err) {
            console.log(err, err.stack); // an error occurred
        }
        else {
            Object.keys(data.PriceList[0].terms.OnDemand).map(e => {
                code1 = e;
            });
            //console.log(code1);
            Object.keys(data.PriceList[0].terms.OnDemand[code1].priceDimensions).map(e => {
                code2 = e;
            });
            //console.log(code2);
            x = parseFloat(data.PriceList[0].terms.OnDemand[code1].priceDimensions[code2].pricePerUnit.USD) * 730;
            unitPrice = x.toFixed(3);
            console.log("PRICE: " + parseFloat(data.PriceList[0].terms.OnDemand[code1].priceDimensions[code2].pricePerUnit.USD))
            t = parseFloat(y) + parseFloat(z) + parseFloat(x)
            t = t.toFixed(3);
            console.log(y);
            console.log(z);
            console.log(x);
            console.log(t);
            fs.stat('./src/assets/docs/' + req.params.id + '.pdf', function (err2, stats) {
                if (err2) {
                    //El archivo no existe o esta corrupto
                    //console.log(err);
                    console.log('No exist. Creating pdf.. ');
                    // Aquí va la creación del pdf
                    const content = `
                <!DOCTYPE html>
                <html>
              
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
                    <title>Table</title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.0/css/bootstrap.min.css">
                    <link rel="stylesheet" href="assets/css/styles.css">
                </head>
              
                <body>
                    <div class="text-center">
                        <h1 class="text-center" style="margin-top: 80px;margin-bottom: 30px;width: 772px;">AWS Services Proposal</h1>
                        <h3 class="text-center" style="margin-top: 10px;margin-bottom: 10px;width: 772px;">`+ price.title + `</h3>
                        <p class="text-center"
                            style="padding-right: 100px;padding-left: 100px;font-size: 20px;padding-bottom: 30px;width: 772px;">Thank <b>`+ price.company + `</b>
                            you for using MyCloudPrices, here is a table showing the costs associated with the selected AWS
                            infrastructure services. Please note that these services are based in the US East (N. Virginia) region.</p>
                        <div class="table-responsive"
                            style="width: 772px;margin-right: 0;margin-left: 0;padding-right: 100px;padding-left: 100px;">
                            <table class="table" style="border: `+ colortemplate + ` 3px solid;">
                                <thead>
                                    <tr style="border: `+ colortemplate + ` 3px solid;">
                                        <th>Nombre</th>
                                        <th>Servicio</th>
                                        <th>Tipo</th>
                                        <th>S.O/Value</th>
                                        <th>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style="border: `+ colortemplate + ` 3px solid;">
                                        <td>`+ price.name + `</td>
                                        <td>EC2</td>
                                        <td>`+ price.instance + `</td>
                                        <td>`+ systemop + `</td>
                                        <td><strong>$ `+ unitPrice + `</strong></td>
                                    </tr>
                                    <tr style="border: `+ colortemplate + ` 3px solid;">
                                        <td>Storage</td>
                                        <td>S3</td>
                                        <td>Standard</td>
                                        <td>`+ price.s3 + `</td>
                                        <td><strong>$ `+ y + `</strong></td>
                                    </tr>
                                    <tr style="border: `+ colortemplate + ` 3px solid;">
                                        <td>Storage EBS</td>
                                        <td>EBS</td>
                                        <td>SSD</td>
                                        <td>`+ price.storage + `</td>
                                        <td><strong>$ `+ z + `</strong></td>
                                    </tr>
                                    <tr style="border: `+ colortemplate + ` 3px solid;">
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                        <td><strong>$ `+ t + `</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p style="margin-top: 40px;font-size: 20px;padding-right: 100px;padding-left: 100px;width: 772px;">If you have
                            any question, doubt or suggestion, do not hesitate to contact us, it is a pleasure for us to serve you and
                            make your projects a reality.</p>
                    </div>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.0/js/bootstrap.bundle.min.js"></script>
                </body>
              
                </html>
                `;

                    pdf.create(content).toFile('./src/assets/docs/' + req.params.id + '.pdf', function (err, res2) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(res2);
                        }
                        res.sendFile(process.cwd() + '\\src\\assets\\docs\\' + req.params.id + '.pdf');
                    });
                    // Aquí finaliza la creación del pdf


                } else {
                    //El archivo si existe, entonces se elimina para actualizarlo
                    fs.unlink('./src/assets/docs/' + req.params.id + '.pdf', function (err) {
                        if (err) {
                            return console.log(err);
                        } else {
                            console.log('File deleted successfully');
                        }

                        // Aquí va la creación del pdf
                        const content = `
                    <!DOCTYPE html>
                    <html>
                  
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
                        <title>Table</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.0/css/bootstrap.min.css">
                        <link rel="stylesheet" href="assets/css/styles.css">
                    </head>
                  
                    <body>
                        <div class="text-center">
                            <h1 class="text-center" style="margin-top: 80px;margin-bottom: 30px;width: 772px;">AWS Services Proposal</h1>
                            <h3 class="text-center" style="margin-top: 10px;margin-bottom: 10px;width: 772px;">`+ price.title + `</h3>
                            <p class="text-center"
                                style="padding-right: 100px;padding-left: 100px;font-size: 20px;padding-bottom: 30px;width: 772px;">Thank <b>`+ price.company + `</b>
                                you for using MyCloudPrices, here is a table showing the costs associated with the selected AWS
                                infrastructure services. Please note that these services are based in the US East (N. Virginia) region.</p>
                            <div class="table-responsive"
                                style="width: 772px;margin-right: 0;margin-left: 0;padding-right: 100px;padding-left: 100px;">
                                <table class="table" style="border: `+ colortemplate + ` 3px solid;">
                                    <thead>
                                        <tr style="border: `+ colortemplate + ` 3px solid;">
                                            <th>Nombre</th>
                                            <th>Servicio</th>
                                            <th>Tipo</th>
                                            <th>S.O/Value</th>
                                            <th>TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr style="border: `+ colortemplate + ` 3px solid;">
                                            <td>`+ price.name + `</td>
                                            <td>EC2</td>
                                            <td>`+ price.instance + `</td>
                                            <td>`+ systemop + `</td>
                                            <td><strong>$ `+ unitPrice + `</strong></td>
                                        </tr>
                                        <tr style="border: `+ colortemplate + ` 3px solid;">
                                            <td>Storage</td>
                                            <td>S3</td>
                                            <td>Standard</td>
                                            <td>`+ price.s3 + `</td>
                                            <td><strong>$ `+ y + `</strong></td>
                                        </tr>
                                        <tr style="border: `+ colortemplate + ` 3px solid;">
                                            <td>Storage EBS</td>
                                            <td>EBS</td>
                                            <td>SSD</td>
                                            <td>`+ price.storage + `</td>
                                            <td><strong>$ `+ z + `</strong></td>
                                        </tr>
                                        <tr style="border: `+ colortemplate + ` 3px solid;">
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                            <td><strong>$ `+ t + `</strong></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p style="margin-top: 40px;font-size: 20px;padding-right: 100px;padding-left: 100px;width: 772px;">If you have
                                any question, doubt or suggestion, do not hesitate to contact us, it is a pleasure for us to serve you and
                                make your projects a reality.</p>
                        </div>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.0/js/bootstrap.bundle.min.js"></script>
                    </body>
                  
                    </html>
                    `;

                        pdf.create(content).toFile('./src/assets/docs/' + req.params.id + '.pdf', function (err, res2) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(res2);
                            }
                            res.sendFile(process.cwd() + '\\src\\assets\\docs\\' + req.params.id + '.pdf');
                        });
                        // Aquí finaliza la creación del pdf
                    })
                }
            });
        }
    });
});

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/signin');
};

module.exports = router;