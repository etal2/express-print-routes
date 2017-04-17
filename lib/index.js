'use strict'

let _ = require('lodash')
let { routes2text, print2file } = require('./routes2text.js')
//let advanced = require('./advanced.js')

module.exports = (expressApp, filename, options = { format: 'json', lineNumbers: false }) => {

    function getFileLine(handler) {
        try {
            handler() //not sure if its a great idea to call the handler, might change app state
        } catch(e) {
            return e.stack.split('\n')[1].split('at')[1].trim()
        }
    }

    function getRoutes(layer, lineNumbers) {

        //preserve name
        let name = layer.name

        //handle apps & routers
        if(layer._router || layer.router){
            layer = layer._router || layer.router
        }

        let path = ''
        if(layer._print_routes_data){
            path += layer._print_routes_data.path
        } else if (layer.path) {
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

        if(lineNumbers && name === "<anonymous>") {
            let file = getFileLine(layer.handle)
            name = file.replace(process.cwd(), ".")
        }

        let route = {
            name: name,
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
            route.routes.push(getRoutes(subroute, lineNumbers))
        }

        return route
    }

    //handle args & options
    if(filename && typeof filename == 'object'){
        options = Object.assign(options, filename)
        filename = null
    }

    let appRoutes = getRoutes(expressApp, options.lineNumbers)
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

//module.exports.enableAdvanced = advanced.enableAdvanced
//module.exports.disableAdvanced = advanced.disableAdvanced