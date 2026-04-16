require("dotenv").config();
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const compression = require('compression');
const helmet = require('helmet');
const configApp = require("../configs/app.config");

app.set("trust proxy", true);
app.disable('x-powered-by');
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://avatars.steamstatic.com', "https://imagedelivery.net", "https://steamcdn-a.akamaihd.net"]
    }
}))
app.use(compression())
app.use(express.static(path.join(__dirname, "../../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || configApp.corsWhitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(require("../middlewares/availability.middleware"))
app.use(require("../middlewares/sitebans.middleware"))
app.use(require("../middlewares/authentication.middleware"));
app.use(require("../middlewares/policycompliance.middleware"))
app.use(require('../middlewares/nonce.middleware'))

// use ejs, set views folder
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

/*
if(configApp.localSecure === true){
    const https = require('https');
    const fs = require('fs')

    const privateKey = fs.readFileSync(path.join(__dirname, '../misc', 'key.pem'));
    const certificate = fs.readFileSync(path.join(__dirname, '../misc', 'cert.pem'));

    https.createServer({
        key: privateKey,
        cert: certificate
    }, app).listen(process.env.PORT || 5000);

    console.log("csgocompetitive.com is online");
} else {
    app.listen(
        process.env.PORT || 5000,
        () => {
            console.log("csgocompetitive.com is online");
        }
    )
}
*/

const server = app.listen(
    process.env.PORT || 3000,
    () => {
        console.log("csgocompetitive.com is online");
    }
)

module.exports = {
    app,
    server
}