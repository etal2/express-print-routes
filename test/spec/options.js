'use strict'

let path = require('path')
let fs = require('fs')

let express = require('express')
let printRoutes = require('../../lib/index.js')


describe('The express-print-routes middleware', () => {

    let app = express()

    app.all('*', function __starAll() {})
    app.get('/', function __rootGet() {})
    app.get('/test', function __testGet() {})
    //app.param('testId', function __testIdParam() {})
    app.post('/test/:testId', function __testParamPost() {})
    app.get(/^\/spa($|\/)/, function __spaRegexGet() {})
    app.get('/chained', function __chainedGet1() {}, function __chainedGet2() {})
    app.use('/use', function __useUse() {})

    let router = express.Router()
    app.use('/routedWithRouter', router)
    router.all('*', function __routedStarAll() {})
    router.get('/', function __routedRootGet() {})
    router.get('/test', function __routedTestGet() {})
    //router.param('testId', function __routedTestIdParam() {})
    router.post('/test/:testId', function __routedTestParamPost() {})
    router.get(/^\/spa($|\/)/, function __routedSpaRegexGet() {})
    router.get('/chained', function __routedChainedGet1() {}, function __routedChainedGet2() {})
    router.use('/use', function __routedUseUse() {})
    router.route('/routedWithDotRoute')
        .all(function __routedAll() {})
        .get(function __routedChainedGet1() {}, function __routedChainedGet2() {})

    app.route('/routedWithDotRoute')
        .all(function __routedAll() {})
        .get(function __routedChainedGet1() {}, function __routedChainedGet2() {})

    app.route(/^\/routedWithDotRouteAndRegex($|\/)/)
        .get(function __routedGet() {})
        .post(function __routedChainedPost1() {}, function __routedChainedPost2() {})

    //let routerCaseSensitive = express.Router({ caseSensitive: true })
    //app.use('/caseSensitive', routerCaseSensitive)

    it('should return all routes and middlewares in json', () => {
        let routes = printRoutes(app)
        let expected = require('../fixtures/routes.app.expected.json')
        expect(routes).to.eql(expected)
    })

    it('should return all routes and middlewares in text', (done) => {
        let textroutes = printRoutes(app, { format: 'text' })

        setTimeout(() => {

            function getNodeVersionMajor() {
                return process.versions.node.split('.')[0]
            }

            let nodever = getNodeVersionMajor() > 4 ? 4 : 6

            let expected = fs.readFileSync(path.join(__dirname, `../fixtures/routes.app.expected.node${ nodever }.txt`), 'utf8')
            
            expect(textroutes).to.eql(expected)

            done()

        }, 100)
    })
    

})
