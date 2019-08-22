import fetch from 'node-fetch'
import { DOMImplementation, DOMParser, XMLSerializer } from 'xmldom'
import { UrlEntry } from './config'

async function fetchServerDocument(url: string) {
    const response = await fetch(url)
    if (!response.ok)
        throw `Failed to retrieve ${url}`
    return new DOMParser().parseFromString(await response.text())
}

async function getServers(url: UrlEntry, slice: number): Promise<[Array<Element>, Element]> {
    const document = await fetchServerDocument(url.url)
    const root = document.getElementsByTagName('servers')[0]
    const servers = root.getElementsByTagName('server')

    const result = [], count = servers.length < slice ? servers.length : slice
    for (let i = 0; i < count; i++) {
        const server = servers[i]
        const name = server.getElementsByTagName('name')[0]
        name.textContent = `${name.textContent} ${url.suffix}`
        result.push(server)
    }
    return [result, root.getElementsByTagName('config')[0]]
}

async function collectServers(pending: Array<Element>, config: Element) {
    const root = new DOMImplementation().createDocument(null, null, null)
    const servers = root.createElement('servers')
    root.appendChild(servers)
    pending.forEach(server => servers.appendChild(server))
    servers.appendChild(config)
    return root
}

export async function generate(urls: Array<UrlEntry>, slice: number) {
    let appendConfig: Element | undefined
    const serverArray = await Promise.all(urls.map(url => {
        return getServers(url, slice).then(([result, config]) => {
            if (!appendConfig)
                appendConfig = config
            return result
        })
    }))

    if (!appendConfig)
        throw 'Server config is undefined'
    const document = await collectServers(serverArray.flat(), appendConfig)

    return new XMLSerializer().serializeToString(document)
}
