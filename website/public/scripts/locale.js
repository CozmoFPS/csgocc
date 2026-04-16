let localeSetting = getCookie('locale')
/*
let languages = [
    'en',
    'br',
    'ru',
    'es',
    'cn',
    'pl'
];
*/

let languages = [
    'en',
    'ru'
];

if(!localeSetting){
    localeSetting = 'en'
    let navlang = navigator.language.split('-')[0];
    if(languages.includes(navlang)){
        localeSetting = navlang
    }
    setCookie('locale', localeSetting, 9999);
}

const xhr = new XMLHttpRequest();
xhr.open('GET', `/locale/${localeSetting}.locale.json`, false); // synchronous
xhr.send();
window.localeData = xhr.status === 200 ? JSON.parse(xhr.responseText) : {};

function applyLocale(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = node.textContent.replace(
            /%%(\w+)%%/g,
            (match, key) => window.localeData[key] ?? match
        );
    } else {
        node.childNodes.forEach(applyLocale);
    }
}

let htmlLocaleSelect = document.getElementById('localeSelect')
if(htmlLocaleSelect){
    document.getElementById('localeSelectedFlag').src = `/assets/flags/${localeSetting}.png`

    languages.forEach(lang=>{
        let flag = `/assets/flags/${lang}.png`
        let button = document.createElement('button')
        let image = document.createElement('img')
        image.src = flag
        button.classList.add('localeSelect')
        button.appendChild(image)
        htmlLocaleSelect.appendChild(button)
        button.onclick = ()=>{
            htmlLocaleSelect.style.display = 'none'
            setCookie('locale', lang)
            window.location.reload()
        }
    })

    let htmlLocaleSelectOpen = document.getElementById('localeSelectOpen')
    htmlLocaleSelectOpen.addEventListener('click', ()=>{
        if (htmlLocaleSelect.style.display !== 'flex') {
            htmlLocaleSelect.style.display = 'flex';

            const clickListener = (event) => {
                if (!htmlLocaleSelectOpen.contains(event.target)) {
                    htmlLocaleSelect.style.display = 'none';
                    document.removeEventListener('click', clickListener);
                }
            };

            document.addEventListener('click', clickListener);
        } else {
            htmlLocaleSelect.style.display = 'none'
        }
    })
}

applyLocale(document.body);

function getString(id){
    return window.localeData[id];
}