const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")

const indexRouter = require("./src/routes/index")
const usersRouter = require("./src/routes/users")
const notionRouter = require("./src/routes/notion")
const dramascriptRouter = require("./src/routes/dramascript")

app.use(express.json())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(logger("dev"))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

require('dotenv').config()

const EXPRESS_PORT = process.env.EXPRESS_PORT

app.listen(EXPRESS_PORT, () => {
    console.log(`App listening on port : ${EXPRESS_PORT}`)
})

app.set('view engine', 'pug')
// app.set('views', './views')

app.use('/lib/bootstrap', express.static('node_modules/bootstrap/dist'))

app.use("/", indexRouter)
app.use("/api/users", usersRouter)
app.use("/api/notion", notionRouter)
app.use("/api/dramascript", dramascriptRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app