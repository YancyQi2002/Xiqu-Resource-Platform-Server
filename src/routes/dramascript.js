const express = require('express');
const router = express.Router();
const mongoose = require('../db/mongodb')
const Common = require('../controllers/common')
const { Jingju } = require('../models/Jingju')
const { PeakingOpera } = require('../models/PeakingOpera')
const cors = require('cors')
const bcrypt = require('bcrypt')

// 获取京剧资源列表
router.get('/jingjulist', cors(), async (req, res, next) => {
  const page = req.query.page
  const rows = req.query.rows

  res.header("Access-Control-Allow-Origin", "*")

  const jingjulist = await Jingju.find().skip(page - 1).limit(rows)
  const total = await Jingju.find().count()

  console.log(jingjulist)
  console.log(total)

  res.send({
    code: 200,
    data: jingjulist,
    total: total
  })
})

// 查询指定京剧资源详细信息
router.get('/jingjuinfo/:_id', cors(), async (req, res, next) => {
  const errors = {}

  res.header("Access-Control-Allow-Origin", "*")

  Jingju.findOne({
      _id: req.params._id
    }).then(info => {
      if (!info || info._id != req.params._id) {
        errors.code = 404
        errors.message = "京剧资源不存在"
        return res.status(404).json(errors)
      }
      console.log(info)
      res.send({
        code: 200,
        data: info
      })
    }).catch(err => {
      res.status(404).json(err)
    })
})

// 根据京剧剧目查询京剧资源
router.post('/jingjuinfo', cors(), async (req, res, next) => {
  const errors = {}

  res.header("Access-Control-Allow-Origin", "*")

  Jingju.find({
    jingjuname: req.body.jingjuname
  }).then(info => {
    if (!info || info.length == 0) {
      errors.code = 404
      errors.message = "京剧资源不存在"
      return res.status(404).json(errors)
    }
    console.log(info)
    res.send({
      code: 200,
      data: info
    })
  }).catch(err => {
    res.status(404).json(err)
  })
})

// 编辑条目简介
router.post('/editItemSynopsis', cors(), async (req, res, next) => {
  const resObj = {}

  // console.log(req)

  res.header("Access-Control-Allow-Origin", "*")

  let tasks = {
    // 校验参数方法
    checkParams: (cb) => {
      // 调用公共方法里的校验参数方法
      Common.checkParams(req.body, ['jingjuId'], cb)
    },

    // 查询方法
    query: ['checkParams', (results, cb) => {
      // 通过 京剧 ID 去数据库中查询
      Jingju.findOne({
        where: {
          jingjuId: req.body.jingjuId
        }
      }).then(function (result) {
        // 查询处理结果
        if (result) {
          // 进行比对
          console.log('result.synopsis：' + result.synopsis)
          console.log('req.body.synopsis：' + req.body.synopsis)
          if (result.synopsis == req.body.synopsis) {
            cb({
              code: 1001,
              message: '本次操作无变化，不需要更新'
            })
          } else {
            cb(null, {
              synopsis: req.body.synopsis,
              jingjuId: result.jingjuId
            })
          }
        } else {
          cb({
            code: 101,
            message: '京剧 ID 错误'
          })
        }
      }).catch(function (err) {
        // 错误处理
        console.log(err)
        cb({
          code: 188,
          message: '系统错误'
        })
      })
    }],

    // 更新方法
    update: ['query', (results, cb) => {
      console.log(results.query)
      Jingju.updateOne({
        synopsis: results.query.synopsis,
        updateTime: Date.now()
      }, {
        where: {
          jingjuId: results.query.jingjuId
        }
      }).then(function (res) {
        console.log('res：')
        console.log(res)
        // 更新结果处理
        if (res[0]) {
          // 更新成功
          cb({
            code: 200,
            message: '更新成功'
          })
        } else {
          cb({
            code: 1001,
            message: '更新失败'
          })
        }
      }).catch(function (error) {
        // 错误处理
        console.log(error)
        cb({
          code: 188,
          message: '系统错误'
        })
      })
    }]
  }

  Common.autoFn(tasks, res, resObj)
})

// 添加京剧条目
router.post('/addJingjuItem', cors(), async (req, res, next) => {
  const resObj = {}

  res.header("Access-Control-Allow-Origin", "*")

  console.log(req.body)

  Jingju.insertOne({
    jingjuname: req.body.jingjuname,
    jingjuId: mongoose.Types.ObjectId(),
    tag: req.body.tag,
    faction: req.body.faction,
    actor: req.body.actor,
    synopsis: "",
    content: "",
    video: req.body.video,
    audio: req.body.audio,
    createTime: Date.now(),
    updateTime: Date.now()
  }).then((result) => {
    console.log("result：" + result)
    res.send({
      code: 200,
      message: '添加成功'
    })
  }).catch(err => {
    resObj.code = 188
    resObj.message = '系统错误'
    resObj.err = err
    res.send(resObj)
  })
})

// 修改京剧条目
router.post('/editJingjuItem', cors(), async (req, res, next) => {
  const resObj = {}

  res.header("Access-Control-Allow-Origin", "*")

  Jingju.findByIdAndUpdate(req.body.jingjuId, {
    $set: {
      jingjuname: req.body.jingjuname,
      actor: req.body.actor,
      tag: req.body.tag,
      faction: req.body.faction,
      synopsis: req.body.synopsis,
      video: req.body.video,
      content: req.body.content,
      updateTime: Date.now()
    }
  }).then(function (result) {
    // 查询处理结果
    if (result) {
      // 更新成功
      resObj.code = 200
      resObj.message = '更新成功'
      res.send(resObj)
    } else {
      resObj.code = 1001
      resObj.message = '更新失败'
      res.send(resObj)
    }
  }).catch((err) => {
    // 错误处理
    console.log(err)
    resObj.code = 188
    resObj.message = '系统错误'
    res.send(resObj)
  })
})

// 删除京剧条目
router.delete('/deleteJingjuItem', cors(), async (req, res, next) => {
  const resObj = {}

  res.header("Access-Control-Allow-Origin", "*")

  Jingju.findByIdAndRemove(req.body._id).then(() => {
    res.json({
      code: 200,
      message: '删除成功'
    })
    return
  }).catch((err) => {
    resObj.code = 188
    resObj.message = '系统错误'
    resObj.err = err
    res.send(resObj)
  })
})

// 获取北京歌剧资源列表
router.get('/peakingoperalist', cors(), async (req, res, next) => {
  const peakingoperalist = await PeakingOpera.find()

  console.log(peakingoperalist)

  res.header("Access-Control-Allow-Origin", "*")

  res.send({
    code: 200,
    data: peakingoperalist
  })
})

module.exports = router;