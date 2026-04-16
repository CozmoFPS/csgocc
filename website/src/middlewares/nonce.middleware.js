const crypto = require('crypto')

module.exports = (req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader(
        'Content-Security-Policy',
        `script-src 'nonce-${res.locals.nonce}' 'strict-dynamic'; object-src 'none';`
    );
    next();
}