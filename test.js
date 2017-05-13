
process.env.NODE_ENV = 'test';
//Require the dev-dependencies
let request  = require("request");
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let should = chai.should();
let expect = require("chai").expect;

chai.use(chaiHttp);
var url1 = "www.facebook.com";
var url2 = "https://www.google.com";
var url3 = "http://www.bbc.co.uk/news/election-2017-39906815";

describe('I can use the shortener with any sort of URL.', () => {
    it('it should have status 200', (done) => {
        chai.request(server)
            .get('/')
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
    });
    it('I can enter a url that starts http:// or https://', (done) => {
        chai.request(server)
            .get('/http://' + url1)
            .end((err, res) => {
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                expect(resText.original_url).to.equal(url1);

            chai.request(server)
                .get('/https://' + url1)
                .end((err, res) => {
                    res.should.have.status(200);
                    resText = JSON.parse(res.text);
                    expect(resText.original_url).to.equal(url1);
                    done();
                });
            });
    });
    it('I can enter a url with many slashes in it.', (done) => {
        chai.request(server)
            .get('/' + url3)
            .end((err, res) => {
                res.should.have.status(200);

                resText = JSON.parse(res.text);
                expect(resText.original_url).to.equal(url3.substring(7));
                done();
            });
    });
    it('I can enter a url without ', (done) => {
        chai.request(server)
            .get('/' + url1)
            .end((err, res) => {
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                expect(resText.original_url).to.equal( url1);
                done();
            });
    });

});
describe('This will create a short url', () => {
    it('it should return a short url' , (done) => {
        chai.request(server)
            .get('/' + url2)
            .end((err, res) => {
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                expect(resText).to.have.property("short_url");
                done();
            });
    });
    it('if i create 2 short_codes for different urls, the short codes should be different' , (done) => {
        chai.request(server)
            .get('/' + url2)
            .end((err, res) => {
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                short_code_one = resText.short_url
                chai.request(server)
                    .get('/' + url3)
                    .end((err, res) => {
                        res.should.have.status(200);
                        resText = JSON.parse(res.text);
                        short_code_two = resText.short_url
                        expect(short_code_one).not.to.equal(short_code_two);
                        done();
                    })

            });
    })    
    it('if i create 2 short_codes for the same url, the short codes should be the same' , (done) => {
        chai.request(server)
            .get('/' + url2)
            .end((err, res) => {
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                short_code_one = resText.short_url
                chai.request(server)
                    .get('/' + url2)
                    .end((err, res) => {
                        res.should.have.status(200);
                        resText = JSON.parse(res.text);
                        short_code_two = resText.short_url
                        expect(short_code_one).to.equal(short_code_two);
                        done();
                    })

            });
    })    
    it('using the short_url, should take me to the original_url' , (done) => {
        chai.request(server)
            .get('/' + url2)
            .end((err, res) => {
                res.should.have.status(200);
                resText = JSON.parse(res.text);
                request(resText.short_url, function(err, res2, body){
                        if (err) throw err;
                        console.log(res2);
                        res2.statusCode.should.eq(200);
                        done();
                    });
            });
    })    
});
