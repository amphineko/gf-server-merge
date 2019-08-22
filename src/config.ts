export interface UrlEntry {
    suffix: string
    url: string
}

export interface Configuration {
    port: number
    slice: number
    urls: Array<UrlEntry>
}
