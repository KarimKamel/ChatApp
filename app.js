// Require Stack
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var app = express();
var cookieSession = require("cookie-session");
var cors = require("cors");
var io = require("socket.io");

// App settings
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// App middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: "session",
    keys: "secretmonkey",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(express.static(path.join(__dirname, "public")));
//App routes
var index = require("./routes/index");
var indexRouter = index.router;
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports.app = app;
module.exports.io = io;
