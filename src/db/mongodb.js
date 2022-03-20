// 引入 mongoose
const mongoose = require('mongoose')

// 连接数据库
// mongodb://localhost:27017/xiqu 不起作用，换成 mongodb://127.0.0.1:27017/xiqu 解决
const mongoURI = 'mongodb://127.0.0.1:27017/xiqu'
try {
    mongoose.connect(mongoURI, err => {
        if (err) {
            console.log(err)
            console.log("数据库连接失败")
        } else {
            console.log("数据库连接成功")
        }
    })
} catch (err) {
    console.log(err)
    console.log("数据库连接异常")
}

module.exports = mongoose