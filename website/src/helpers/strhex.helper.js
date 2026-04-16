

function strToHex(string){
    let hex = '';
    for (let i = 0; i < string.length; i++) {
        hex += string.charCodeAt(i).toString(16);
    }
    return hex;
}

function hexToString(hex){
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}

module.exports = {
    strToHex,
    hexToString
}