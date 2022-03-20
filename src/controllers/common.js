const async = require('async')

const exportObj = {
    checkParams,
    autoFn
}

/**
 * 校验参数全局方法
 * @param params 请求的参数集
 * @param checkArr 需要验证的参数
 * @param cb 回调 
 */
function checkParams (params, checkArr, cb) {
    let flag = true

    // 遍历
    checkArr.forEach(v => {
        if (!params[v]) {
            flag = false
        }
    })

    if (flag) {
        cb(null)
    } else {
        cb({
            code: 199,
            message: '缺少必要参数'
        })
    }
}

/**
 * 统一返回方法
 * @param tasks 当前 controller 执行 tasks
 * @param res 当前 controller res
 * @param resObj 当前 controller 返回 json 对象 
 */
function autoFn(tasks, res, resObj) {
    async.auto(tasks, function (err) {
        if (!!err) {
            console.log(JSON.stringify(err))
            res.json({
                code: err.code || 188,
                message: err.message || JSON.stringify(err)
            })
        } else {
            res.json(resObj)
        }
    })
}

module.exports = exportObj