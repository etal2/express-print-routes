'use strict'

let _ = require('lodash')
let { routes2text, print2file } = require('./routes2text.js')

module.exports = (expressApp, filename, options = { format: 'json' }) => {

    function getRoutes(layer) {

        let path = ''
        if (layer.path) {
            path += layer.path
        } else if (layer.route && layer.route.path) {
            path += layer.route.path
        } else if (layer.regexp) {
            if (layer.regexp.source === '^\\/?$') {
                path += '/'
            } else if (layer.regexp.source === '^\\/?(?=\\/|$)') {
                path += '*'
            } else {
                path += `/${ layer.regexp.source }/`
            }
        }

        let methods = []
        if (layer.method) {
            methods.push(layer.method)
        } else if (layer.route) {
            if (layer.route.methods) {
                methods = _.keys(layer.route.methods)
            } else if (layer.route.method) {
                methods.push(layer.route.method)
            }
        }
        
        let route = {
            name: layer.name,
            path,
            methods,
            routes: []
        }

        let stack = []
        if (!layer.stack && !(layer.route && layer.route.stack)) {
            if (layer.handle.stack) {
                stack = layer.handle.stack
            } else {
                return route
            }
        } else {
            stack = layer.stack || layer.route.stack
        }

        for ( let subroute of stack ) {
            route.routes.push(getRoutes(subroute))
        }

        return route
    }

    //handle args & options
    if(filename && typeof filename == 'object'){
        options = Object.assign(options, filename)
        filename = null
    }

    let appRoutes = getRoutes(expressApp._router)
    let text = ''
    if(filename || options.format === 'text'){
        text = routes2text(appRoutes)
    }

    if(filename){
        print2file(text, filename)
    }
    
    if(options.format === 'text'){
       return text
    }

    return appRoutes
}
