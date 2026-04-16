const backgroundMaster = document.getElementById('background')
const backgroundContainer = document.getElementById('backgroundContainer')
const backgroundMainImage = document.getElementById('backgroundMainImage')
const backgroundSmokeImage1 = document.getElementById('backgroundSmokeImage1')
const backgroundSmokeImage2 = document.getElementById('backgroundSmokeImage2')
const backgroundNoiseImage = document.getElementById('backgroundNoiseImage')

const mainImageSrc = '/assets/background.png'
const smokeImageSrc = '/assets/smoke.png'
const noiseImageSrc = '/assets/noise.png'

let loaded = 0
let loadedReq = 3

function checkLoaded(){
    loaded += 1
    if(!(loadedReq <= loaded))return

    backgroundContainer.style.opacity = '1'
}

let mainImage = new Image()
mainImage.onload = ()=>{ console.log('HERE'); backgroundMainImage.src = mainImageSrc; checkLoaded(); console.log(backgroundMainImage) }
mainImage.src = mainImageSrc

let smokeImage = new Image()
smokeImage.onload = ()=>{ backgroundSmokeImage1.src = smokeImage.src; backgroundSmokeImage2.src = smokeImage.src; checkLoaded() }
smokeImage.src = smokeImageSrc

let noiseImage = new Image()
noiseImage.onload = ()=>{ console.log('HERE3'); backgroundNoiseImage.src = noiseImage.src; checkLoaded() }
noiseImage.src = noiseImageSrc

let smoke1Adjust = 0
let smoke2Adjust = 100

let debug = true
let adjustInc = 0.025
if(debug){
    adjustInc = 0.6
}

function smokeMove(){
    smoke1Adjust = smoke1Adjust - adjustInc
    smoke2Adjust = smoke2Adjust - adjustInc

    if(smoke1Adjust < -100){
        smoke1Adjust = 0
        smoke2Adjust = 100
    }

    backgroundSmokeImage1.style.left = `${smoke1Adjust}vw`
    backgroundSmokeImage2.style.left = `${smoke2Adjust}vw`

    setTimeout(smokeMove, 10)
}

//smokeMove()