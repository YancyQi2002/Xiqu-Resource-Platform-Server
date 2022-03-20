const express = require('express')
const router = express.Router()
const cors = require('cors')

/* GET home page. */
router.get('/', cors(), (req, res, next) => {
    const options = {
        author: 'Yancy Qi'
    }
    res.render('index', options)
})

module.exports = router
