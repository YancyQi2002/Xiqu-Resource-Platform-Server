// 引入 mongodb
const mongoose = require('../db/mongodb')
require('mongoose-long')(mongoose)
const { Types: { Long }} = mongoose
const bcrypt = require('bcrypt')

const JingjuSchema = new mongoose.Schema({
    
    // 京剧 ID
    jingjuId: {
        type: mongoose.Schema.Types.ObjectId
    },

    // 京剧剧目
    jingjuname: {
        type: String
    },

    // 行当派别
    faction: {
        type: String
    },

    // 京剧派别
    tag: {
        type: String
    },

    // 京剧演员
    actor: {
        type: String
    },

    // 简介
    synopsis: {
        type: String
    },

    // 剧本 、 唱词内容
    content: {
        type: String
    },

    // 音频资料
    audio: {
        type: String
    },

    // 视频资料
    video: {
        type: String
    },

    // 创建时间
    createTime: {
        type: Date,
        default: Date.now
    },

    // 更新时间
    updateTime: {
        type: Date,
        default: Date.now
    }
    
})

// 建立京剧数据库模型
const Jingju = mongoose.model('Jingju', JingjuSchema)
module.exports = { Jingju }