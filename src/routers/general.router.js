require('dotenv').config()
const router = require("express").Router();
const middlewarePagedata = require('../middlewares/pagedata.middleware')

function loadIndex(res){
    res.render('pages/index')
}

if(process.env.MODE == 'PROD'){
    router.get('/', (req, res)=>{
        res.render('pages/comingsoon')
    })
} else {
    router.get("/", middlewarePagedata, (req, res)=>{
        loadIndex(res)
    })

    router.get('/play', middlewarePagedata, (req, res)=>{
        loadIndex(res)
    })

    router.get('/loadout', middlewarePagedata, (req, res)=>{
        loadIndex(res)
    })

    router.get('/users', middlewarePagedata, (req, res)=>{
        loadIndex(res)
    })

    router.get('/donate', middlewarePagedata, (req, res)=>{
        loadIndex(res)
    })

    router.get('/settings', middlewarePagedata, (req, res)=>{
        loadIndex(res)
    })

    router.get('/pages/play', middlewarePagedata, (req, res)=>{
        res.render("pages/pagePlay")
    })
}



module.exports = router;