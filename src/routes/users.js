const express = require('express');
const router = express.Router();
const mongoose = require('../db/mongodb')
const bcrypt = require('bcrypt')
const { User } = require('../models/User')
const Common = require('../controllers/common')
const cors = require('cors')
const jwt = require('jsonwebtoken')

// 获取用户列表
router.get('/list', cors(), async (req, res, next) => {
  const user = await User.find()
  
  res.header("Access-Control-Allow-Origin", "*")

  res.send({
    data: user
  })
})

// 获取用户信息
router.get('/info/:userId', cors(), async (req, res, next) => {
  const errors = {}

  res.header("Access-Control-Allow-Origin", "*")

  User.findOne({ userId: req.params.userId })
    .then(info => {
      if (!info || info.userId != req.params.userId) {
        errors.code = 404
        errors.message = "用户信息不存在"
        return res.status(404).json(errors)
      }
      res.json(info)
    })
    .catch(err => { res.status(404).json(err) })
})

// 获取个人信息
const auth = async (req, res, next) => {
  cors()
  const raw = String(req.headers.authorization).split(' ').pop()
  const { id } = jwt.verify(raw, process.env.SECRET_OR_PRIVATEKEY)
  req.user = await User.findById(id)
  console.log(req.user)
  next()
}

router.get('/profile', auth, async (req, res, next) => {
  res.send(req.user)
})

// 用户登录
router.post('/login', async (req, res, next) => {
  const resObj = {}

  res.header("Access-Control-Allow-Origin", "*")

  const user = await User.findOne({
    username: req.body.username
  })

  console.log(req.body)

  if (!user) {
    return res.send({
      code: 101,
      message: '用户名不存在'
    })
  }

  const isPasswordValid = bcrypt.compareSync(
    req.body.password,
    user.password
  )

  if (!isPasswordValid) {
    let realpwd = bcrypt.hashSync(req.body.password, 10)
    console.log(realpwd )
    return res.send({
      code: 101,
      message: '密码无效'
    })
  }

  // 生成 token
  const token = jwt.sign({
    id: String(user._id)
  }, process.env.SECRET_OR_PRIVATEKEY)

  const data = {}

  data.info = user
  data.token = token

  resObj.code = 200
  resObj.msg = "登录成功"
  resObj.data = data

  res.send(resObj)
})

// 用户注册
router.post('/register', async (req, res, next) => {
  const resObj = {}

  console.log(req)

  let tasks = {
    // 校验参数方法
    checkParams: (cb) => {
      // 调用公共方法里的校验参数方法
      Common.checkParams(req.body, ['username', 'password', 'phone', 'phonename', 'email'], cb)
    },

    // 查询方法
    query: ['checkParams', (results, cb) => {
      // 通过用户名去数据库中查询
      User.findOne({
        where: {
          username: req.body.username
        }
      }).then((data) => {
        
        console.log(data)
        // console.log(data.username)
        // console.log(data.userId)
        // console.log(req.body.username)
        // console.log(data.username == req.body.username)

        if (data == {}|| !data || data.username != req.body.username) {
          const date = Date.now()
          // 组装数据
          resObj.code = 200
          resObj.data = {
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 10),
            jurisdiction: '0',
            phone: bcrypt.hashSync(req.body.phone, 10),
            phonename: req.body.phonename,
            avatar: "",
            createTime: date,
            updateTime: date,
            userId: mongoose.Types.ObjectId()
          }
          console.log(resObj)
          User.create(resObj.data).then(() => {
            resObj.message = '注册成功'
            console.log(resObj)
          }).catch((err) => {
            cb({
              code: 000,
              message: err
            })
          })
        } else if (data.username == req.body.username) {
          resObj.code = 200
          resObj.data = {
            success: false,
            message: '注册失败，用户名已存在'
          }
          cb(null, req.body.username)
        }
      }).catch((err) => {
        // 错误处理
        // console.log(err)
        // console.log(resObj)
        cb({
          code: 188,
          message: '系统错误'
        })
      })
    }]
  }

  Common.autoFn(tasks, res, resObj)
})

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

module.exports = router;
