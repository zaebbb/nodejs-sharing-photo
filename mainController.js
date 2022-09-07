const {key} = require('./config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Photos = require('./models/Photos')
const FileService = require('./FileService')
const {validationResult} = require('express-validator')
const path = require('path')

const generateAccessToken = (id) => {
    const payload = {
        id
    }

    return jwt.sign(payload, key, {expiresIn: "12h"})
}

class mainController{
    async reg(req, res){
        try {
            const errorValid = validationResult(req)

            if(!errorValid.isEmpty()){
                return res.status(422).json({
                    Code: "422 Unprocessable entity",
                    Content: {
                        errorValid
                    }
                })
            }

            const {first_name, surname, phone, password} = req.body

            const userCheck = await User.findOne({phone})
            if(userCheck !== null){
                if(userCheck.phone === phone){
                    return res.status(422).json({
                        Code: "422 Unprocessable entity",
                        Content: {
                            phone: "Пользователь с данным номером телефона уже зарегистрирован"
                        }
                    })
                }
            }


            const hashPassword = bcrypt.hashSync(password, 7)
            const user = new User({first_name, surname, phone, password: hashPassword})
            await user.save();

            const userSearch = await User.findOne({phone})

            return res.status(201).json({
                Code: "201 Created",
                Content: {
                    id: userSearch._id
                }
            })
        } catch (e) {
            console.log(e)
        }

    }

    async login(req, res) {
        try {
            const errorValid = validationResult(req)

            if(!errorValid.isEmpty()){
                return res.status(422).json({
                    Code: "422 Unprocessable entity",
                    Content: {
                        errorValid
                    }
                })
            }

            const {phone, password} = req.body
            const user = await User.findOne({phone})

            if(!user){
                return res.status(404).json({
                    Code: "404 Not Found",
                    Content: {
                        login: "Incorrect login or password"
                    }
                })
            }

            const validPassword = bcrypt.compareSync(password, user.password)
            if(!validPassword){
                return res.status(404).json({
                    Code: "404 Not Found",
                    Content: {
                        login: "Incorrect login or password"
                    }
                })
            }

            const token = generateAccessToken(user._id)
            return res.status(200).json({
                Code: "200 OK",
                Content: {
                    token: token
                }
            })
        } catch (e) {
            console.log(e)
        }
    }

    async logout(req, res){
        return res.status(200).json({
            Code: "200 OK"
        })
    }

    async photoCreate(req, res){
        const image = req.files.images;

        const extension = (path.extname(image.name)).toLowerCase();

        switch(extension){
            case '.jpg':
                break;
            case '.png':
                break;
            case '.jpeg':
                break;
            default:
                return res.status(422).json({
                    Code: "422 Unprocessable entity",
                    Content: {
                        photo: "Файл должен быть расширением .png, .jpg, .jpeg"
                    }
                })
        }

        const token = req.headers.authorization.split(' ')[1]
        const decodedData = jwt.verify(token, key)

        const fileName = FileService.saveFile(image)

        const imageCreate = new Photos({name: fileName, url: 'http://localhost:5000/' + fileName, author_id: decodedData.id})
        await imageCreate.save()

        const imageId = await Photos.findOne({name: fileName})
        return res.status(201).json({
            Code: "201 Created",
            Content: {
                id: imageId._id,
                name: imageId.name,
                url: imageId.url
            }
        })
    }

    async photoUpdate(req, res){
        const method = req.body.method;
        if(method != "PATCH"){
            return res.status(422).json({mess: "error method PATCH"})
        }

        const id = req.params.id
        const photo = await Photos.findOne({_id: id})
        if(!photo){
            return res.status(422).json({
                Code: "422 Unprocessable entity",
                Content: {
                    404: "Фотография не обнаружена"
                }
            })
        }

        const token = req.headers.authorization.split(' ')[1]
        const decodedData = jwt.verify(token, key)

        if(decodedData.id !== photo.author_id){
            return res.status(403).json({
                Code: "403 Forbidden"
            })
        }

        const image = req.files.images;

        const extension = (path.extname(image.name)).toLowerCase();

        switch(extension){
            case '.jpg':
                break;
            case '.png':
                break;
            case '.jpeg':
                break;
            default:
                return res.status(422).json({
                    Code: "422 Unprocessable entity",
                    Content: {
                        photo: "Файл должен быть расширением .png, .jpg, .jpeg"
                    }
                })
        }

        const fileName = FileService.saveFile(image)

        const imageUpdate = await Photos.findByIdAndUpdate(photo._id, {name: fileName, url: 'http://localhost:5000/' + fileName})
        await imageUpdate.save()

        const imageId = await Photos.findOne({name: fileName})
        return res.status(200).json({
            Code: "200 OK",
            Content: {
                id: imageId._id,
                name: imageId.name,
                url: imageId.url
            }
        })
    }

    async allPhoto(req, res){
        const allPhoto = await Photos.find();

        return res.status(200).json({
            Code: "200 OK",
            Content: [
                allPhoto
            ]
        })
    }

    async onePhoto(req, res){
        const photoId = req.params.id;

        const photo = await Photos.findOne({_id: photoId})

        return res.status(200).json({
            Code: "200 OK",
            Content: {
                photo
            }
        })
    }

    async deletePhoto(req, res){
        const method = req.body.method;
        if(method != "DELETE"){
            return res.status(422).json({mess: "error method DELETE"})
        }
        const photoId = req.params.id;

        const token = req.headers.authorization.split(' ')[1]
        const decodedData = jwt.verify(token, key)

        const photo = await Photos.findOne({_id: photoId})

        console.log(decodedData.id)
        console.log(photo.author_id)

        if(decodedData.id !== photo.author_id){
            return res.status(403).json({
                Code: "403 Forbidden"
            })
        }

        photo.deleteOne({_id: photoId})
        await res.json({
            Code: "204 Deleted"
        })
        return res.status(204)
    }

    async sharingPhoto(req, res){
        const authorId = req.params.id;

        const userId = await Photos.find({author_id: authorId})

        return res.status(201).json({
            Code: "201 Created",
            Content: {
                existing_photos: userId
            }
        })
    }

    async userSearch(req, res){
        const userSearch = String(req.body.search)

        let searchArr = []

        const checkUsers = await User.find()

        checkUsers.forEach(user => {
            let phoneStr = String(user.phone)
            if(phoneStr.includes(userSearch)){
                searchArr.push(user)
            }
        })

        return res.status(200).json({
            Code: "200 OK",
            Content: searchArr
        })
    }
}

module.exports = new mainController()