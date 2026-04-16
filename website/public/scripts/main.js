let ws;

const restrictionPriority = {
    1: 'DeviceBan',
    2: 'CheatingBan',
    3: 'MOSSReportPending',
    4: 'MOSSReportNeeded',
    5: 'GriefingBan',
    6: 'ToxicityBan',
    7: 'AbandonCooldown',
    8: 'TeamDamageCooldown'
}

const rankNames = {
    1: 'Silver I',
    2: 'Silver II',
    3: 'Silver III',
    4: 'Silver Elite',
    5: 'Gold I',
    6: 'Gold II',
    7: 'Gold III',
    8: 'Golden Elite',
    9: 'Master Veteran I',
    10: 'Master Veteran II',
    11: 'Master Veteran III',
    12: 'Legendary Master Veteran',
    13: 'Supreme Major Elite',
    14: 'The Global Elite'
}

const userid = document.getElementById('user-id').value

if(userid !== ''){
    document.getElementById('userinfoContainer').style.display = 'flex'
    document.getElementById('userinfoLogin').style.display = 'none'
}

let initParams = new URLSearchParams(window.location.search)
let autoPageId = document.getElementById('autoPageId').value

let restrictions = JSON.parse(document.getElementById('restrictions').value) || [];
console.log(document.getElementById('restrictions').value)

const htmlRestrictionContainer = document.getElementById('warningContainer')
const htmlRestriction = document.getElementById('warning')
const htmlRestrictionHeaderText = document.getElementById('warningHeaderText')
const htmlRestrictionIcon = document.getElementById('warningIcon')
const htmlRestrictionBodyText = document.getElementById('warningBodyText')
const htmlRestrictionPrev = document.getElementById('warningPrev')
const htmlRestrictionNext = document.getElementById('warningNext')
const htmlRestrictionTimeLeft = document.getElementById('warningHeaderTimeleft')

let currentRestrictionExpires;
let selectedRestriction;

function renderRestriction(index){
    selectedRestriction = index;

    let multiple = restrictions.length > 1
    htmlRestrictionNext.style.display = multiple ? 'block' : 'none'
    htmlRestrictionPrev.style.display = multiple ? 'block' : 'none' 
    htmlRestrictionNext.disabled = index == restrictions.length - 1
    htmlRestrictionPrev.disabled = index == 0

    if(restrictions.length == 0){
        htmlRestrictionContainer.style.display = 'none'
        return;
    }

    htmlRestrictionContainer.style.display = 'flex';

    let restriction = restrictions[index]

    let headerString = getString(`Restriction_Header_${restriction.type}`)
    let bodyString = getString(`Restriction_Body_${restriction.type}`)

    htmlRestrictionHeaderText.innerHTML = headerString
    htmlRestrictionBodyText.innerHTML = bodyString

    if(restriction.expires == null){
        htmlRestriction.classList.add('severe')
        htmlRestrictionIcon.src = '/assets/info.png'
    } else {
        htmlRestriction.classList.remove('severe')
        htmlRestrictionIcon.src = '/assets/warning.png'
    }

    htmlRestrictionTimeLeft.innerHTML = ''
}

async function restrictionExpireChecks(){
    if(selectedRestriction != undefined){
        let restriction = restrictions[selectedRestriction];
        if(restriction){
            let expires = restriction.expires;

            if(expires == null){
                htmlRestrictionTimeLeft.innerHTML = ''
            } else {
                let timeLeft = expires - Date.now();
                if (timeLeft > 0) {
                    let days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                    let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                    let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                    let timeString = '';
                    if (days > 0) timeString += `${days}d `;
                    if (hours > 0) timeString += `${hours}h `;
                    if (minutes > 0) timeString += `${minutes}m `;
                    if (seconds > 0) timeString += `${seconds}s`;

                    htmlRestrictionTimeLeft.innerHTML = timeString.trim();
                }
            }
        }
    }

    restrictions.forEach(restriction=>{
        if(restriction.expires < Date.now() && restriction.expires != null){
            removeRestriction(restriction.id)
        }
    })

    setTimeout(restrictionExpireChecks, 500)
}

restrictionExpireChecks()

htmlRestrictionNext.addEventListener('click', ()=>{
    renderRestriction(Math.min(selectedRestriction + 1, restrictions.length - 1))
})

htmlRestrictionPrev.addEventListener('click', ()=>{
    renderRestriction(Math.max(selectedRestriction - 1, 0))
})

function addRestriction(restriction){
    restrictions.push(restriction);
    let index = restrictions.indexOf(restriction);
    renderRestriction(index);

    document.getElementById('restrictions').value = JSON.stringify(restrictions)
}

function removeRestriction(restrictionId){
    let index;
    for(let restrictionIndex in restrictions){
        if(restrictions[restrictionIndex].id == restrictionId){
            index = restrictionIndex;
            break;
        }
    }
    if(index){
        restrictions.splice(index, 1);
        renderRestriction(0)
    }

    document.getElementById('restrictions').value = JSON.stringify(restrictions)
}

renderRestriction(0)

class NavigationLink {
    static pageElements = {}
    static selected = null
    static navContainer = document.getElementById('navlinks')
    static pageContainer = document.getElementById('page')
    static navs = {}
    static ready = false;

    constructor(pageId, title, loginRequired=false, isDefault=false, customBehavior){
        if(loginRequired && !userid)return;

        this.pageId = pageId
        this.title = title
        this.loginRequired = loginRequired
        this.isDefault = isDefault
        this.customBehavior = customBehavior

        this.htmlButton = document.createElement('button')
        this.htmlButton.classList.add('nav')
        this.htmlButton.addEventListener('click', ()=>{
            if(this.customBehavior){
                this.customBehavior()
            } else {
                this.select()
            }
        })
        NavigationLink.navContainer.appendChild(this.htmlButton)

        this.htmlText = document.createElement('span')
        this.htmlText.innerHTML = title
        this.htmlButton.appendChild(this.htmlText)

        if(isDefault && autoPageId == ''){
            this.select()
        }

        NavigationLink.navs[this.pageId] = this
    }

    async select(force){
        let selected = NavigationLink.selected
        if(selected !== null){
            if(selected.pageId == this.pageId && !force)return;
            
            selected.htmlButton.classList.remove('selected')
            let pageElementData = NavigationLink.pageElements[selected.pageId]
            if(pageElementData)pageElementData.htmlPage.style.display = 'none'
        }

        history.pushState({}, '', `/${this.pageId}`)

        this.htmlButton.classList.add('selected')

        if(!NavigationLink.ready){
            NavigationLink.selected = this
            return;
        }

        let pageData = NavigationLink.pageElements[this.pageId]
        if(!pageData){
            pageData = {}
            pageData.htmlPage = document.createElement('div')
            pageData.htmlPage.classList.add('navpage')
            NavigationLink.pageContainer.appendChild(pageData.htmlPage)
            
            let pageLoad = await fetch(`/pages/${this.pageId}`)
            let pageHtml = await pageLoad.text()
            pageData.htmlPage.innerHTML = pageHtml

            const inertTags = pageData.htmlPage.querySelectorAll('script, style, link')
            for (const tag of inertTags) {
                const fresh = document.createElement(tag.tagName)
                for (const attr of tag.attributes) {
                    fresh.setAttribute(attr.name, attr.value)
                }
                if (tag.tagName === 'SCRIPT' || tag.tagName === 'STYLE') {
                    fresh.textContent = tag.textContent
                }
                tag.replaceWith(fresh)
            }

            NavigationLink.pageElements[this.pageId] = pageData
        }

        pageData.htmlPage.style.display = 'block'

        NavigationLink.selected = this
    }

    static readynow(){
        NavigationLink.ready = true;
        if(NavigationLink.selected){
            NavigationLink.selected.select(true)
        }
    }
}

new NavigationLink('play', getString('NavPlay'), false, true)
new NavigationLink('loadout', getString('NavLoadout'), true)
new NavigationLink('users', getString('NavUsers'))
new NavigationLink('premium', getString('NavPremium'), true)
new NavigationLink('donate', getString('NavDonate'))
new NavigationLink('settings', getString('NavSettings'), true)
//if(document.getElementById('admin').value == 1)new NavigationLink('admin', 'Admin')
new NavigationLink(undefined, getString('NavLogout'), true, false, ()=>{ window.location.href = '/logout' })

if(autoPageId != ''){
    let autoPageNav = NavigationLink.navs[autoPageId]
    console.log(autoPageNav)
    if(autoPageNav){
        autoPageNav.select()
    } else {
        NavigationLink.navs.play.select()
    }
}

let wins = document.getElementById('wins').value
let rank = document.getElementById('rank').value

function renderStats(){
    let rankImage = document.getElementById('userinfoRankImg')
    let rankImageLoader = new Image()
    let rankImageSrc = `/assets/ranks/${rank}.png`
    rankImageLoader.onload = ()=>{ document.getElementById('userinfoRankImgLoader').style.display = 'none'; rankImage.src = rankImageSrc; rankImage.style.display = 'block' }
    rankImageLoader.src = rankImageSrc

    let rankName = document.getElementById('userinfoRankName')

    if(rank == 'none'){
        if(userid == ''){
            rankName.innerHTML = getString('RankLoggedOut')
        } else {
            // rankName.innerHTML = `Win ${5 - wins} more game${wins == 4 ? '' : 's'}`
            let winsLeftString = getString('RankWinsLeft')
            winsLeftString = winsLeftString.replace('%gamesleft%', 5 - wins)
            if(localeSetting == 'en' && wins != 4){
                winsLeftString = winsLeftString + 's'
            }
            rankName.innerHTML = winsLeftString
        }
    } else {
        rankName.innerHTML = rankNames[rank];
    }

    document.getElementById('userinfoWinsCount').innerHTML = wins
}

renderStats()

let avatar = document.getElementById('avatar').value || '/assets/avatar.png'
let nickname = document.getElementById('nickname').value 
let avatarImg = document.getElementById('userinfoAvatarImg')

let avatarLoader = new Image()
avatarLoader.onload = ()=>{ document.getElementById('userinfoAvatarImgLoaderContainer').style.display = 'none'; avatarImg.src = avatar; avatarImg.style.display = 'block' }
avatarLoader.src = avatar
document.getElementById('userinfoNickname').innerHTML = nickname

// if you want you can uncomment this and see all the comp ranks :>
/*
let debugrank = 0
if(rank != 'none'){
    debugrank = rank
}
addEventListener('keydown', input=>{
    if(input.key == 'ArrowUp'){
        debugrank += 1
    } else if(input.key == 'ArrowDown'){
        debugrank -= 1
    }

    if(input.key == 'ArrowUp' || input.key == 'ArrowDown'){
        debugrank = Math.min(Math.max(debugrank, 0), 14)

        if(debugrank == 0){
            rank = 'none'
        } else {
            rank = debugrank
        }
       
        renderStats()
    }
})
*/

class NotificationOption {
    constructor(text, onclick){
        this.onclick = onclick
        this.htmlButton = document.createElement('button')
        this.htmlButton.innerHTML = text
    }

    setDisabled(isDisabled){
        this.htmlButton.disabled = isDisabled
    }
}

class NotificationMessage {
    static active = false;
    static htmlMaster = document.getElementById('notifmessageMaster')
    static htmlContainer = document.getElementById('notifmessageContainer')
    static htmlHeader = document.getElementById('notifmessageHeader')
    static htmlHeaderText = document.getElementById('notifmessageHeaderText')
    static htmlBody = document.getElementById('notifmessageBody')
    static htmlOptions = document.getElementById('notifmessageOptions')

    constructor(headerText, bodyHTML, options){
        if(NotificationMessage.active === true)return;
        NotificationMessage.active = true

        if(!options){
            options = [
                new NotificationOption('DISMISS', ()=>{
                    this.dismiss()
                })
            ];
        }

        NotificationMessage.htmlHeaderText.innerHTML = headerText
        NotificationMessage.htmlBody.innerHTML = bodyHTML
        NotificationMessage.htmlOptions.innerHTML = ''
        options.forEach(option=>{
            option.htmlButton.addEventListener('click', ()=>{
                if(option.htmlButton.disabled)return;
                option.onclick(this)
            })
            NotificationMessage.htmlOptions.appendChild(option.htmlButton)
        })

        this.options = options

        NotificationMessage.htmlMaster.style.display = 'flex'
        setTimeout(()=>{
            NotificationMessage.htmlMaster.style.opacity = '1'
        }, 500)
    }

    setLoadingState(state){
        this.options.forEach(option=>{
            option.setDisabled(state)
        })
    }

    dismiss(){
        NotificationMessage.active = false
        NotificationMessage.htmlMaster.style.opacity = '0'
        setTimeout(()=>{
            NotificationMessage.htmlMaster.style.display = 'none'
        }, 500)
    }
}

let agreementNeeded = document.getElementById('agreementNeeded').value

if(agreementNeeded == '1'){
    new NotificationMessage(
        getString('AgreementHeader'),
        getString('AgreementBody'),
        [
            new NotificationOption(
                getString('AgreeGeneric'),
                notif=>{
                    notif.setLoadingState(true)
                    fetch("/api/agree", {
                        method: 'POST'
                    })
                    .then(()=>{
                        notif.dismiss()
                    })
                    .catch(_=>{
                        window.location.reload()
                    })
                }
            ),

            new NotificationOption(
                getString('NavLogout'),
                ()=>{
                    window.location.href = '/logout'
                }
            )
        ]
    )
}

const connload = document.getElementById('connload')

function websocketFailure(){
    connload.style.display = 'none'
    new NotificationMessage(
        getString('ConnectionFailure'),
        getString('ConnectionFailureBody'),
        [
            new NotificationOption(
                getString('ReloadGeneric'),
                ()=>{ window.location.reload() }
            ),

            new NotificationOption(
                getString('NavLogout'),
                ()=>{
                    window.location.href = '/logout'
                }
            )
        ]
    )
}

if(userid != ''){
    try {
        connload.style.display = 'flex'

        ws = new WebSocket(`${window.location.protocol}//${window.location.hostname}${window.location.hostname == 'localhost' ? ':4000' : ''}/`)

        ws.addEventListener('open', ()=>{
            ws.send(JSON.stringify({
                action: 'register',
                role: 'user',
                key: document.getElementById('wskey').value
            }))
        })

        ws.addEventListener('message', event=>{
            let data = JSON.parse(event.data)

            if(data.action == 'confirmRegistered'){
                connload.style.display = 'none'
                NavigationLink.readynow()
            }
        })

        ws.addEventListener('close', websocketFailure)
        ws.addEventListener('error', e=>{
            console.log('WebSocket error: ', e)
            websocketFailure()
        })
    } catch(e){
        console.log('WebSocket error: ', e)
        websocketFailure()
    }
} else {
    NavigationLink.readynow()
}

