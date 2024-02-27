const jwt = require('jsonwebtoken')
var SECRET = 'GhetyAsP347tui';

const createUserToken = async (user, req, res,) =>{

    const token = jwt.sign({
            name: user.name,
            id: user._id,
        }, SECRET,)

    res.status(200).json({
        message: "Você está autenticado",
        token: token,
        userId: user._id,
    })

}
 
module.exports = createUserToken