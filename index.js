/**
 * convert cookie value to session record object.
 * the object should be stored in MySQL sessions table.
 * @param {cookie, secret} cookieValue 
 */
const convert = function({cookie, secret}) {
    const decoded = decodeURIComponent(cookie);
    const sessionId = require('cookie-parser').signedCookie(decoded, secret)
    return sessionId == false ? null : sessionId
}
/**
 * 
 * @param {*} cookies = string is like "A=tg63tdt2u3d;B=ceriycrq;"
 */
const findCookie = function({cookies, name}) {
    if (!cookies || !name) return null;
    const results = cookies.split(';')
        .map(cookie=>cookie.replace(" ", ""))
        .filter(cookie=>cookie.indexOf(name+"=") == 0)
        .map(cookie=>cookie.split("=")[1])
    return (results.length > 0) ? results[0] : null
}

let staticPool;

/**
 * 
 * @param {string, string, store} param0 
 */
module.exports = class Resolver {
    
    constructor({mysql, secret, name}) {
        if (!staticPool) {
            const prmoise_mysql = require('promise-mysql')
            staticPool = prmoise_mysql.createPool(mysql)
        }
        this.pool = staticPool
        this.secret = secret
        this.name = name
    }

    sessonsBy({cookie}) {
        const sessionId = convert({cookie: cookie, secret: this.secret})
        if (!sessionId) {
            return Promise.resolve([])
        }
        return this.pool.query(`select * from sessions where session_id=?;`, sessionId);
    }

    findSession(cookieStringFromHeader, validOnly) {

        const cookie = findCookie({cookies: cookieStringFromHeader, name: this.name})
        var promise =this.sessonsBy({cookie: cookie}).then(sessions=>{
            if (sessions.length > 0) return sessions[0]
            throw new Error('session id is not found.')
        })
        if (validOnly | true) {
            promise = promise.then(session=>{
                const expire = new Date(session.expires * 1000)
                if (new Date() < expire) {
                    return session
                }
                throw new Error("session id is found, but expired.")
            })
        }
        return  promise
    }

}