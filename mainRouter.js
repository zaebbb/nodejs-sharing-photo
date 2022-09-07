const {check} = require("express-validator")
const Router = require('express')
const router = new Router()
const mainController = require('./mainController')
const authMiddleware = require('./middleware/authMiddleware')


// not token
router.post('/signup', [
    check('first_name')
        .notEmpty()
        .withMessage('Поле обязательно к заполнению'),
    check('surname')
        .notEmpty()
        .withMessage('Поле обязательно к заполнению'),
    check('phone')
        .notEmpty()
        .withMessage('Поле обязательно к заполнению'),
    check('password')
        .notEmpty()
        .withMessage('Поле обязательно к заполнению'),
], mainController.reg)

router.post('/login', [
    check('phone')
        .notEmpty()
        .withMessage('Поле обязательно к заполнению'),
    check('password')
        .notEmpty()
        .withMessage('Поле обязательно к заполнению')
], mainController.login)

// token
router.post('/logout', authMiddleware, mainController.logout)

router.post('/photo', authMiddleware, mainController.photoCreate)

router.post('/photo/:id', authMiddleware, mainController.photoUpdate)

router.get('/photo', authMiddleware, mainController.allPhoto)

router.get('/photo/:id', authMiddleware, mainController.onePhoto)

router.post('/photo/del/:id', authMiddleware, mainController.deletePhoto)

router.post('/user/:id/share', authMiddleware, mainController.sharingPhoto)

router.get('/user', authMiddleware, mainController.userSearch)

module.exports = router