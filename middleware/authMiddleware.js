const jwt = require('jsonwebtoken')
const {key} = require('./../config')

module.exports = (req, res, next) => {
    if(req.method === 'OPTIONS'){
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if(!token){
            return res.status(403).json({
                Code: "403 Forbidden",
                Content: {
                    message: "You need authorization"
                }
            })
        }

        const decodedData = jwt.verify(token, key)
        req.user = decodedData
        next()
    } catch (e) {
        return res.status(403).json({
            Code: "403 Forbidden",
            Content: {
                message: "You need authorization"
            }
        })
    }
}