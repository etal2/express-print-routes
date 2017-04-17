'use strict'

let fs = require('fs')

let routes2text = (routes) => {

    const COLUMN_WIDTH_TREE = 51
    const COLUMN_WIDTH_PATH = 59
    const TREE_INDENT_SIZE = 5

    let text = []

    function fillWithSpaces(str, len) {
        while (str.length < len) {
            str += ' '
        }
        return str
    }

    function brushIndentation(indentation) {
        return indentation.replace(/─/g, ' ').replace(/├/g, '│').replace(/└/g, ' ')
    }

    function makeText(route, indentation) {

        let methods = route.methods.join(', ').toUpperCase()
        let name = route.srcline ? route.srcline : route.name
        text.push(`${ fillWithSpaces(indentation + name, COLUMN_WIDTH_TREE) }${ fillWithSpaces(route.path, COLUMN_WIDTH_PATH) } ${ methods }`)

        if (!route.routes || route.routes.length === 0) {
            return
        }

        indentation = `${ brushIndentation(indentation) } ├── `

        for ( let i = 0; i < route.routes.length; i+=1 ) {
            if (i === route.routes.length - 1) {
                indentation = `${ indentation.substr(0, indentation.length - TREE_INDENT_SIZE) } └── `
            }
            makeText(route.routes[i], indentation)
        }

        text.push(indentation.substr(0, indentation.length - TREE_INDENT_SIZE))
    }

    text = []
    makeText(routes, '')
    return text.join('\n')
}

let print2file = (text, filename) => {
    fs.writeFile(filename, text, (err) => {
        /* istanbul ignore if */
        if (err) {
            console.error(`Failed to print routes to ${ filename }`)
        } else {
            console.log(`Printed routes to ${ filename }`)
        }
    })
}

module.exports = {
    routes2text,
    print2file
}
