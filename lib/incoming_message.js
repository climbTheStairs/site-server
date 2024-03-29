"use strict"

const http = require("http")
// const qs = require("querystring")
// const formidable = require("formidable")

const IncomingMessage = class extends http.IncomingMessage {
    getIp() {
        // https://stackoverflow.com/a/19524949/9281985
        const ips = []
        const xForwardedFor = this.headers['x-forwarded-for']
        const { remoteAddress } = this.socket
        if (typeof xForwardedFor === "string" && xForwardedFor !== "")
            ips.push(...xForwardedFor.split(","))
        if (typeof remoteAddress === "string")
            ips.push(remoteAddress)
        for (let i = 0, l = ips.length; i < l; i++)
            if (ips[i].startsWith("::ffff:"))
                ips[i] = ips[i].slice(7)
        return ips.join(",")
    }
    readData() {
        throw new Error("method is obsolete")
        /*
        return new Promise((resolve, reject) => {
            if (this.method !== "POST")
                reject("not POST request")
            let body = ""
            this.on("data", (data) => {
                if (body.length > 1e9) {
                    this.destroy()
                    reject("too much POST data")
                }
                body += data
            })
            this.on("end", () => resolve(body))
        })
        //*/
    }
    getFullUrl() {
        const { headers, url } = this
        const { host } = headers
        const protocol = this.socket.encrypted ? "https:" : "http:"
        return protocol + "//" + host + url
    }
}

module.exports = IncomingMessage

