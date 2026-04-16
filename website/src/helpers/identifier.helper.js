

function generateClientIdentifier(req){
    let userAgent = req.headers['user-agent'] || 'no-agent';
    let clientIdentifier = `${userAgent}`;
    let encoded = Buffer.from(clientIdentifier).toString('base64');

    return encoded;
}

module.exports = {
    generateClientIdentifier
}