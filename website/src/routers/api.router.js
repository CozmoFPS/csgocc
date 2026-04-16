const { apiResponse } = require("../services/api.service");
const router = require("express").Router();
const middlewareRateLimits = require("../middlewares/ratelimits.middleware");

router.get(
    "/api", 
    (_, res) => {
        apiResponse({
            res,
            'message': 'OK'
        })
    }
);

router.post(
    "/api/agree",
    middlewareRateLimits,
    require("../controllers/api/agree.controller")
)

router.use("/api/{*splat}", (_, res) => {
    apiResponse({
        res,
        message: "The endpoint that you tried to reach does not exist.",
        HTTPCode: 404,
        success: false
    })
});

module.exports = router;