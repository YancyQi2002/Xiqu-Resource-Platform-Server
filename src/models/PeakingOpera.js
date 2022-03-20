// 引入 mongodb
const mongoose = require('../db/mongodb')
require('mongoose-long')(mongoose)
const { Types: { Long } } = mongoose
const bcrypt = require('bcrypt')

const PeakingOperaSchema = new mongoose.Schema({
    
    // 北京歌剧 ID
    PeakingOperaId: {
        type: mongoose.Schema.Types.ObjectId
    },

    // 北京歌剧剧目
    PeakingOperaName: {
        type: String
    },

    // 编剧
    screenWriter: {
        type: String
    },

    // 演员
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
const PeakingOpera = mongoose.model('PeakingOpera', PeakingOperaSchema)
module.exports = { PeakingOpera }