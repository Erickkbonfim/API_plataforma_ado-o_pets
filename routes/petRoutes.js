const router = require('express').Router()

const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')
const petController = require('../controller/petController')

router.post('/create', verifyToken,imageUpload.array('images'), petController.create)
router.get('/', petController.getAll)
router.get('/mypets',verifyToken, petController.getAllUsetPets)
router.get('/myadoptions', verifyToken, petController.getAllUserAdoptions)
router.get('/:id',petController.getPetById)
router.delete('/:id', verifyToken ,petController.removePetById)
router.patch('/:id', verifyToken, imageUpload.array('images'), petController.updatePet)
router.patch('/schedule/:id', verifyToken, petController.schedule)
router.patch('/conclude/:id', verifyToken, petController.concludeAdoption)

module.exports = router