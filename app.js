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
    console.log("Copyright (C) 2022  Yancy Qi")
    console.log("This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of theLicense, or (at your option) any later version.")
    console.log("This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more details.")
    console.log("You should have received a copy of the GNU Affero General Public License along with this program.  If not, see <https://www.gnu.org/licenses/>.")
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