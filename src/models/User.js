// 引入 mongodb
const mongoose = require('../db/mongodb')
require('mongoose-long')(mongoose)
const { Types: { Long } } = mongoose
const bcrypt = require('bcrypt')

// 建立用户表
const UserSchema = new mongoose.Schema({
    // 用户名
    username: {
        type: String,
        unique: true
    },
    // 密码
    password: {
        type: String,
        set(val) {
            return bcrypt.hashSync(val, 10)
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId
    },
    // 权限
    jurisdiction: {
        type: String
    },
    // 手机号
    phone: {
        type: String,
        set(val) {
            return bcrypt.hashSync(val, 10)
        }
    },
    // 联系人
    phonename: {
        type: String
    },
    // 邮箱
    email: {
        type: String
    },
    // 头像
    avatar: {
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

// 建立用户数据库模型
const User = mongoose.model('User', UserSchema)
module.exports = { User }