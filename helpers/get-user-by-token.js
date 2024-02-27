const jwt = require('jsonwebtoken')
const User = require('../model/User')
var SECRET = 'GhetyAsP347tui';

const getUserByToken = async (token) =>{

    if(!token){
        return res.status(401).json({
            message: "Acesso Negado!"
        })
    }

    const decoded = jwt.verify(token, SECRET)
    const userid = decoded.id
    const user = await User.findOne ({ _id: userid})
    return user
}
module.exports = getUserByToken