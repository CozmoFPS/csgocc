const fs = require('fs')
const path = require('path');
const { cwd } = require('process');

class LocaleText {
    static texts = {};
    static languages = [];

    constructor(id, embedded=false){
        this.id = id;
        this.languages = {}
        this.embedded = embedded
        LocaleText.texts[id] = this
    }

    static compile(){
        const localeDir = path.join(cwd(), "public", "locale")
        const existing = fs.readdirSync(localeDir)
        existing.forEach(file=>{
            if(file.endsWith('.locale.json')){
                fs.rmSync(path.join(localeDir, file))
            }
        })

        LocaleText.languages.forEach(langId=>{
            let fileName = `${langId}.locale.json`
            let saveTo = path.join(localeDir, fileName)
            let compiled = {}

            for(let [textId, textData] of Object.entries(LocaleText.texts)){
                let text = textData.languages[langId]
                if(!text)continue;
                compiled[textId] = text;
            }
            
            fs.writeFileSync(saveTo, JSON.stringify(compiled, null, 4))
        })
    }

    addLanguage(id, text){
        if(!LocaleText.languages.includes(id))LocaleText.languages.push(id)
        this.languages[id] = text
        return this;
    }
}

new LocaleText('NavPlay')
.addLanguage('en', 'Play')
.addLanguage('ru', 'Играть')

new LocaleText('NavLoadout')
.addLanguage('en', 'Loadout')
.addLanguage('ru', 'Снаряжение')

new LocaleText('NavUsers')
.addLanguage('en', 'Users')
.addLanguage('ru', 'Пользователи')

new LocaleText('NavPremium')
.addLanguage('en', 'Premium')

new LocaleText('NavDonate')
.addLanguage('en', 'Donate')
.addLanguage('ru', 'Пожертвовать')

new LocaleText('NavSettings')
.addLanguage('en', 'Account Settings')
.addLanguage('ru', 'Настройки учетной записи')

new LocaleText('NavLogout')
.addLanguage('en', 'Log Out')
.addLanguage('ru', 'Выйти')

new LocaleText('LegalDisclaimer', true)
.addLanguage('en', '© CSGO Community Competitive 2026. All rights reserved. Not affiliated with Counter-Strike or Valve Corporation. Counter-Strike is the sole property of Valve Corporation.')
.addLanguage('ru', '© CSGO Community Competitive 2026. Все права защищены. Не связано с Counter-Strike или Valve Corporation. Counter-Strike является исключительной собственностью Valve Corporation.')

new LocaleText('TermsGeneric', true)
.addLanguage('en', 'Terms of Service')
.addLanguage('ru', 'Условия использования')

new LocaleText('PrivacyGeneric', true)
.addLanguage('en', 'Privacy Policy')
.addLanguage('ru', 'политика конфиденциальности')

new LocaleText('LoadingGeneric', true)
.addLanguage('en', 'Loading...')
.addLanguage('ru', 'Загрузка...')

new LocaleText('ConnectingGeneric', true)
.addLanguage('en', 'Connecting...')
.addLanguage('ru', 'Подключение...')

new LocaleText('SignInGeneric', true)
.addLanguage('en', 'Sign In')
.addLanguage('ru', 'Войти')

new LocaleText('UserInfoLoggedOut', true)
.addLanguage('en', 'Sign in with Steam to play 5v5 CS:GO matches and earn a skill rank for FREE!')
.addLanguage('ru', 'Войдите через Steam, чтобы играть в соревновательные матчи CS:GO (5 на 5) и получить ранг мастерства — БЕСПЛАТНО!')

new LocaleText('RankLoggedOut')
.addLanguage('en', 'Not logged in')
.addLanguage('ru', 'Вы не вошли в систему')

new LocaleText('RankWinsLeft')
.addLanguage('en', 'Win %gamesleft% more game')
.addLanguage('ru', 'Выиграйте ещё %gamesleft% игр')

new LocaleText('AgreementHeader')
.addLanguage('en', 'Policy Agreement')
.addLanguage('ru', 'Соглашение о политике')

new LocaleText('AgreementBody')
.addLanguage('en', `<p>Welcome to CS:GO Community Competitive! We're happy to have you here.</p>
<p>Please observe these general guidelines:</p>
<ol>
    <li>Never cheat, exploit, or otherwise give yourself or others an unfair advantage.</li>
    <li>Never display an extreme degree of toxicity or engage in harassment against others.</li>
    <li>Always play with integrity and a commitment to do your best to win the game. No throwing or losing intentionally.</li>
</ol>
<p>By clicking 'ACCEPT' you agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a> as well as these general guidelines. You must agree to these policies before you can access the platform and its services.</p>`)
.addLanguage('ru', `<p>Добро пожаловать в CS:GO Community Competitive! Мы рады видеть вас здесь.</p>
<p>Пожалуйста, соблюдайте следующие общие правила:</p>
<ol>
<li>Никогда не используйте читы или эксплойты и иным образом не создавайте несправедливое преимущество для себя или других игроков.</li>
<li>Никогда не проявляйте чрезмерную токсичность и не допускайте притеснения других игроков.</li>
<li>Всегда играйте честно и стремитесь сделать всё возможное для победы. Запрещается намеренно «сливать» игры или проигрывать специально.</li>
</ol>
<p>Нажимая кнопку «ПРИНЯТЬ», вы соглашаетесь с <a href="/terms" target="_blank">Условиями использования</a> и <a href="/privacy" target="_blank">Политикой конфиденциальности</a>, а также с данными общими правилами. Вы должны принять эти документы, чтобы получить доступ к платформе и её сервисам.</p>`)

new LocaleText('ConnectionFailure')
.addLanguage('en', 'Connection Failure')
.addLanguage('ru', 'Сбой подключения')

new LocaleText('ConnectionFailureBody')
.addLanguage('en', `
Connection was lost with the CS:GO Community Competitive servers. Possible causes include:
<ul>
    <li>You were inactive for several hours</li>
    <li>Our servers are temporarily overwhelmed or down</li>
    <li>You have too many tabs on CSGOCC open</li>
    <li>A rare technical glitch occurred</li>
</ul>
Unfortunately, you must reload the page to continue. If you cannot regain connection, please consider trying a different browser or waiting a few minutes. We apologize for any inconvenience.`)
.addLanguage('ru', `Соединение с серверами CS:GO Community Competitive было потеряно. Возможные причины:
<ul>
<li>Вы оставались неактивны в течение нескольких часов</li>
<li>Наши серверы временно перегружены или недоступны</li>
<li>У вас открыто слишком много вкладок CSGOCC</li>
<li>Произошел редкий технический сбой</li>
</ul>
К сожалению, для продолжения вам необходимо перезагрузить страницу. Если восстановить соединение не удается, попробуйте воспользоваться другим браузером или подождать несколько минут. Приносим извинения за возможные неудобства.`)

new LocaleText('AgreeGeneric')
.addLanguage('en', 'Agree')
.addLanguage('ru', 'ПРИНЯТЬ')

new LocaleText('ReloadGeneric')
.addLanguage('en', 'Reload')
.addLanguage('ru', 'Перезагрузить')

new LocaleText('Restriction_Header_VACBan')
.addLanguage('en', 'VAC Banned')

new LocaleText('Restriction_Body_VACBan')
.addLanguage('en', 'You have an active VAC or game ban on your Steam account. You cannot queue for competitive matches.')

new LocaleText('Restriction_Header_DeviceBan')
.addLanguage('en', 'Device Banned')
.addLanguage('ru', 'Устройство заблокировано')

new LocaleText('Restriction_Body_DeviceBan')
.addLanguage('en', "Your device has been permanently banned. This ban is permanent and non-negotiable.")
.addLanguage('ru', 'Ваше устройство было заблокировано навсегда. Эта блокировка является окончательной и не подлежит обсуждению.')

new LocaleText('Restriction_Header_CheatingBan')
.addLanguage('en', 'Banned for Cheating')
.addLanguage('ru', 'Забанен за читерство')

new LocaleText('Restriction_Body_CheatingBan')
.addLanguage('en', "You've been banned for cheating or exploiting. This ban is permanent and non-negotiable.")
.addLanguage('ru', 'Вы были заблокированы за использование читов или эксплойтов. Эта блокировка является бессрочной и не подлежит обсуждению.')

new LocaleText('Restriction_Header_MOSSReportPending')
.addLanguage('en', 'MOSS Capture Pending')

new LocaleText('Restriction_Body_MOSSReportPending')
.addLanguage('en', "We've received your MOSS capture and are reviewing it. A decision will be available soon.")

new LocaleText('Restriction_Header_MOSSReportNeeded')
.addLanguage('en', 'MOSS Capture Needed')

new LocaleText('Restriction_Body_MOSSReportNeeded')
.addLanguage('en', "We've detected unusual behavior during gameplay and you must submit a MOSS capture to continue playing.")

new LocaleText('Restriction_Header_GriefingBan')
.addLanguage('en', 'Banned for Griefing')

new LocaleText('Restriction_Body_GriefingBan')
.addLanguage('en', "You've been banned from matchmaking for griefing.")

new LocaleText('Restriction_Header_ToxicityBan')
.addLanguage('en', 'Banned for Toxicity')

new LocaleText('Restriction_Body_ToxicityBan')
.addLanguage('en', "You've been banned for toxic behavior. Please maintain a respectful attitude.")

new LocaleText('Restriction_Header_AbandonCooldown')
.addLanguage('en', 'Abandon Cooldown')

new LocaleText('Restriction_Body_AbandonCooldown')
.addLanguage('en', "You've received a cooldown for abandoning a match. Abandoning another match will result in a longer penalty.")

new LocaleText('Restriction_Header_TeamDamageCooldown')
.addLanguage('en', 'Team Damage Cooldown')

new LocaleText('Restriction_Body_TeamDamageCooldown')
.addLanguage('en', "You've received a cooldown for excessive team damage. Avoid attacking teammates in the future.")

new LocaleText('NoQueue_ActiveRestriction')
.addLanguage('en', 'You cannot play with an active restriction')

new LocaleText('NoQueue_NoLogin')
.addLanguage('en', 'You must be logged in to play')

LocaleText.compile()

module.exports = {
    LocaleText
}