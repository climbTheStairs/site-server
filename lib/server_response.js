"use strict"

const fs = require("fs")
const fsp = fs.promises
const http = require("http")
const path = require("path")
const { logErr } = require("./log.js")
const contentTypes = require("../etc/content_types.json")

const getContentType = (ext) => {
    const UNKNOWN_CONTENT_TYPE = "application/octet-stream"
    const contentType = contentTypes[ext] || UNKNOWN_CONTENT_TYPE
    return contentType + "; charset=utf-8"
}

const statuses = {
    200: "OK",
    301: "Moved Permanently",
    304: "Not Modified",
    400: "Bad Request",
    403: "Forbidden",
    404: "Not Found",
    418: "I'm a teapot",
    429: "Too Many Requests",
    500: "Internal Server Error",
}
const ServerResponse = class extends http.ServerResponse {
    async respondFile(pathname, dl = false) {
        const absPath = "/srv/site" + pathname
        const data = await fsp.readFile(absPath).catch((err) => {
            if (err.code !== "ENOENT")
                return this.err(500, err.code)
            return this.err(404, pathname)
        })
        if (data === this)
            return this
        this.setHeader("Content-Length", Buffer.byteLength(data))
        if (dl)
            this.setHeader("Content-Disposition", `attachment; filename="${path.basename(pathname)}"`)
        const ext = path.extname(pathname)
        this.writeHead(200, { "Content-Type": getContentType(ext) })
        this.write(data)
        return this.end()
    }
    err(status, err) {
        this.writeHead(status, { "Content-Type": getContentType(".txt") })
        status = status + " " + statuses[status].toUpperCase()
        this.write(`${status}: ${err}`)
        return this.end()
    }
    redirect(url) {
        this.writeHead(301, { Location: url })
        return this.end()
    }
}

module.exports = ServerResponse
