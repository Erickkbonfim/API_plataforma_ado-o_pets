const Pet = require('../model/Pet')
const GetToken = require('../helpers/get-token')
const GetUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class petController{

    static async create(req, res){
        const {name, age, weight,color} = req.body
        var available = true
        var images = req.files

        if(!name){
            res.status(422).json({
                message: "O nome do pet é obrigatório"
            })
            return
        }
        if(!age){
            res.status(422).json({
                message: "A idade do pet é obrigatória"
            })
            return
        }
        if(!weight){
            res.status(422).json({
                message: "O Peso do pet é obrigatório"
            })
            return
        }
        if(!color){
            res.status(422).json({
                message: "A cor do pet é obrigatorio"
            })
            return
        }
        if(images.length === 0){
            res.status(422).json({
                message: "A imagem é obrigatoria"
            })
            return
        }
        
        const token = GetToken(req)
        const user = await GetUserByToken(token)

        const pet = new Pet({
            name: name,
            age: age,
            weight: weight,
            color: color,
            available: available,
            images: [],
            user: {
              _id: user._id,
              name: user.name,
              imagem: user.imagem,
              phone: user.phone,
            }, 
          })

        images.map((image) =>{
            pet.images.push(image.filename)
        })
 

        try{
            const newPet = await pet.save()
            res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                newPet: newPet,
              })
        } catch(error){
            res.status(500).json({
                message: error
            })
        }

    }
    static async getAll(req,res) {

        const pets = await Pet.find().sort('-createdAt')
        res.status(200).json({
            pets: pets,
        })

    }
    static async getAllUsetPets(req,res){
        const token = GetToken(req)
        const user = await GetUserByToken(token)

        const pets = await Pet.find({'user._id': user._id}).sort('-createdAt')
        res.status(200).json({
            pets,
        })
    }
    static async getAllUserAdoptions(req,res){
        const token = GetToken(req)
        const user = await GetUserByToken(token)

        const pets = await Pet.find({'adopter._id': user._id}).sort('-createdAt')
        res.status(200).json({
            pets,
        })
    }
    static async getPetById(req,res){
        const id = req.params.id

        if(!ObjectId.isValid(id)){
            res.status(422).json({
                message: "id invalido"
            })
            return
        }
        const pet = await Pet.findOne({_id: id})
        if(!pet){
            res.status(404).json({
                message: "Pet não encontrado!"
            })
            return
        }
        res.status(200).json({
            pet: pet
        })
    }
    static async removePetById(req, res){
        const id = req.params.id
        if(!ObjectId.isValid(id)){
            res.status(422).json({
                message: "id invalido"
            })
            return
        }
        const pet = await Pet.findOne({_id: id})
        if(!pet){
            res.status(404).json({
                message: "Pet não encontrado!"
            })
            return
        }
        const token = GetToken(req)
        const user = await GetUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
            res.status(422).json({
                message: "Houve um problema em processar a sua solicitação, tente novamente mais tarde!"
            })
            return
        }
        
        await Pet.findByIdAndDelete(id)
        res.status(200).json({
            message: "pet removido com sucesso!"
        })
    }
    static async updatePet(req, res){
        const id = req.params.id
        const {name, age, weight,color, avaliable} = req.body
        const images = req.files
        const updatedData = {}
        
        const pet = await Pet.findOne({_id: id})
        if(!pet){
            res.status(404).json({
                message: "Pet não encontrado!"
            })
            return
        }
        const token = GetToken(req)
        const user = await GetUserByToken(token)

        if(pet.user._id.toString() !== user._id.toString()){
            res.status(422).json({
                message: "Houve um problema em processar a sua solicitação, tente novamente mais tarde!"
            })
            return
        }
        
        if(!name){
            res.status(422).json({
                message: "O nome do pet é obrigatório"
            })
            return
        } else {
            updatedData.name = name
        }

        if(!age){
            res.status(422).json({
                message: "A idade do pet é obrigatória"
            })
            return
        } else {
            updatedData.age = age
        }
        if(!weight){
            res.status(422).json({
                message: "O Peso do pet é obrigatório"
            })
            return
        } else {
            updatedData.weight = weight
        }
        if(!color){
            res.status(422).json({
                message: "A cor do pet é obrigatorio"
            })
            return
        } else {
            updatedData.color = color
        }
        if(images.length === 0){
            res.status(422).json({
                message: "A imagem é obrigatoria"
            })
            return
        } else {
            updatedData.images = []
            images.map((image) => {
                updatedData.images.push(image.filename)
            })
        }

        await Pet.findByIdAndUpdate(id, updatedData)

        res.status(200).json({
            message: "Pet atualizado com sucesso!"
        })

    }
    static async schedule(req, res){
        const id = req.params.id
        
        const pet = await Pet.findOne({ _id: id })
        if(!pet){
            res.status(400).json({
                message: "Pet não encontrado!"
            })
            return
        }

        const token = GetToken(req)
        const user = await GetUserByToken(token)

        if(pet.user._id.equals(user._id)){
            res.status(422).json({
                message:
                    "Você não pode agendar uma visita com seu próprio pet"
            })
            return
        }

        if(pet.adopter){
            if(pet.adopter._id.equals(user._id)){
                res.status(422).json({
                    message:
                        "Você já agendou uma visita para esse pet"
                })
                return
            }
            return
        }
        pet.adopter = {
            _id: user._id,
            name: user.name,
            image: user.image
        }

        await Pet.findByIdAndUpdate(id, pet)
        res.status(200).json({
            message: `A visita foi agendada com sucesso!, entre em contato com ${pet.user.name} pelo telefone ${pet.user.phone}`
        })
        return
    }
    static async concludeAdoption(req,res){
        const id = req.params.id
            const pet = await Pet.findOne({ _id: id })
            if(!pet){
                res.status(404).json({
                    messag: "pet não encontrado"
                })
                return
            }
            const token = GetToken(req)
            const user = await GetUserByToken(token)
                if(pet.user._id.toString() !== user._id.toString()){
                    res.status(422).json({
                        message: "Houve um problema em processar a sua solicitação, tente novamente mais tarde!"
                    })
                    return
                }

            pet.avliable = false
            await Pet.findByIdAndUpdate(id, pet)
            res.status(200).json({
                message: "Parabens o ciclo de adoção foi finalizado com sucesso!"
            })
    }
}