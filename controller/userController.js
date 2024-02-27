const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class userController{

    static async register(req,res){
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confimPassword = req.body.confimPassword

        if(!name){
            res.status(422).json({message: "o nome é obrigatório!"})
            return
        }
        if(!email){
            res.status(422).json({message: "o email é obrigatório!"})
            return
        }
        if(!phone){
            res.status(422).json({message: "o número de celular é obrigatório!"})
            return
        }
        if(!password){
            res.status(422).json({message: "A senha é obrigatória!"})
            return
        }
        if(!confimPassword){
            res.status(422).json({message: "A confirmação de senha é obrigatória!"})
            return
        }
        if(password !== confimPassword){
            res.status(422).json({
                message: "A senha e a confirmação precisam ser iguais",
            })
            return
        }

        const userExists = await User.findOne({email: email})
        if(userExists){
            res.status(422).json({
                message: "Por favor, utilize outro email, este ja encontra-se cadastrado!"
            })
            return
        }

        var salt = await bcrypt.genSaltSync(15)
        const passwordHashed = await bcrypt.hash(password,salt)

        const user = new User({
            name,
            email,
            phone,
            password: passwordHashed,
        })
        try{
            const newUser = await user.save()
            await createUserToken(newUser, req, res)
            return
        }catch(error){
            res.status(500).json({message: error})
        }

    }

    static async login(req, res){
        const {email, password} = req.body
        if(!email){
            res.status(422).json({message: "o email é obrigatório!"})
            return
        }
        if(!password){
            res.status(422).json({message: "A senha é obrigatória!"})
            return
        }


        const user = await User.findOne({email: email})
        if(!user){
            res.status(422).json({
                message: "Não há usuário cadastrado com este email!"
            })
            return
        }

        const checkPassword = await bcrypt.compare(password, user.password)
        if(!checkPassword){
            res.status(422).json({
                message: "Senha inválida!"
            })
            return
        }
        await createUserToken(user, req, res)
    }

    static async checkUser(req,res){
        let currentUser
        
        console.log(req.headers.authorization)

        if(req.headers.authorization){

            var SECRET = 'GhetyAsP347tui';

            const token = getToken(req)
            const decoded = await jwt.verify(token, SECRET)
            currentUser = await User.findById(decoded.id)
            currentUser.password = undefined

        } else {
            currentUser = null
        }
        res.status(200).send(currentUser)
    }

    static async getUserById(req, res){
        const id = req.params.id

        const user = await User.findById(id).select('-password')


        if (!user) {
            res.status(422).json({ 
                message: 'Usuário não encontrado!' 
            })
            return
        }

        res.status(200).json({
            user
        })
    }

    static async editUser(req,res){
        const id = req.params.id

        const token = getToken(req)
        const user = await getUserByToken(token)

        const {name, email, phone, password, confirmPassword } = req.body
        
        if(req.file){
            user.imagem = req.file.filename;
        }


        user.id = id;

        if (!user) {
            res.status(422).json({ 
                message: 'Usuário não encontrado!' 
            })
            return
        }

        if(!name){
            res.status(422).json({message: "o nome é obrigatório!"})
            return
        }
        user.name = name;
        if(!email){
            res.status(422).json({message: "o email é obrigatório!"})
            return
        }
        const userExist = await User.findOne({email: email})
        if(user.email !== email && userExist){
            res.status(422).json({
                message: "Por favor, utilize outro email!"
            })
            return
        }
        user.email = email;
        if(!phone){
            res.status(422).json({
                message: "o número de celular é obrigatório!"
            })
            return
        }
        user.phone = phone;
        
        if(password != confirmPassword){
            return res.status(422).json({  
                message: "As senhas não conferem!"
            })
        } else if(password == confirmPassword && password != null){
            const salt = await bcrypt.genSalt(15)
            const passwordHash = await bcrypt.hash(password, salt)

            user.password = passwordHash
        }
        try{

            const updatedUser = await User.findOneAndUpdate(
                { _id: user.id },
                { $set: user },
                { new: true }
            )
            res.status(200).json({
                message: "usuário atualizado com sucesso!",
            })
        }
        catch(error){
            res.status(500).json({
                message: "Errro ao atualizar o usuário, internal server error",
                error
            })
            return
        }

        console.log(user)
    } 
} 