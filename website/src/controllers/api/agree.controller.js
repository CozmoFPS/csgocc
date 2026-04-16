const { apiResponse } = require("../../services/api.service");
const { submitPolicyAgreement } = require("../../services/profiles.service");

module.exports = async (req, res)=>{
    try {
        if(!req.user){
            apiResponse({
                HTTPCode: 400,
                message: "Log in required for this request",
                res,
                success: false
            })
            return;
        }

        let agreement = await submitPolicyAgreement(req.user.sub);
        if(agreement == null){
            apiResponse({
                HTTPCode: 400,
                message: "An active policy agreement for this account already exists",
                res,
                success: false
            })
            return;
        } 

        apiResponse({
            message: "Policy agreement submission was successful",
            res
        });
    } catch (e) {
        console.log(e)
        console.log("^^^ Failed to create policy agreement! ^^^");
        apiResponse({
            HTTPCode: 500,
            message: "Failed to create policy agreement",
            res,
            success: false
        })
    }
    
}