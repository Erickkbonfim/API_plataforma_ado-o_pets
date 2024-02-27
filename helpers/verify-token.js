const jwt = require('jsonwebtoken')
const getToken = require('./get-token')
var SECRET = 'GhetyAsP347tui';

const checkToken = (req, res, next) =>{
    if(!req.headers.authorization){
        res.status(401).json({
            message: "Acesso Negado!"
        })
    }

    const Token = getToken(req)
    if(!Token){
        res.status(401).json({
            message: "Acesso Negado!"
        })
        return
    }
    try{
        const verified = jwt.verify(Token, SECRET)
        req.user = verified
        next();
    }
    catch(err){
        return res.status(400).json({
            message: "Token Invalido"
        })
    }

}
module.exports = checkToken