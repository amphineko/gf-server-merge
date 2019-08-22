import express from 'express'
import yargs from 'yargs'

import { generate } from './index'
import { Configuration } from './config'

const app = express()

const configPath = yargs.option('f', {
    alias: 'config',
    default: '../config.json',
    describe: 'configuration json to use, see config.ts for help',
    type: 'string',
}).argv.f

const config = require(configPath) as Configuration

app.get('/index.php', (req, res) => {
    generate(config.urls, config.slice).then((response) => {
        res.setHeader('Content-Type', 'application/xml')
        res.end(response)
    }, (error) => {
        res.status(500).json({ error: error }).end()
    })
})

app.listen(config.port)
