function URLCheck(urlish){
    try {
        let url = new URL(urlish);
        return url;
    } catch (_) {
        return false;
    }
}

module.exports = URLCheck;