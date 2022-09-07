const express = require('express')
const mongoose = require('mongoose')
const mainRouter = require('./mainRouter');
const fileUpload = require('express-fileupload')

const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(express.static('images'))
app.use(fileUpload({}))
app.use('/service', mainRouter)

app.get('/', (req, res) => {
    res.redirect('/service')
})

const runServer = async () => {
    try {
        await mongoose.connect('mongodb+srv://root:root@cluster0.jlvtc.mongodb.net/sharingPhotos?retryWrites=true&w=majority\n' +
            '\n', {

        })

        app.listen(PORT, () => {
            console.log('Сервер запущен на порте ' + PORT)
        })
    } catch (e) {
        console.log(e)
    }
}

runServer().then(r => {})