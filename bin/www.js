var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var app = express();
var cookieSession = require("cookie-session");
var io = require("socket.io");
const debug = require("../util/chatUtils").createDebug("chatapp:server");

var http = require("http");
var mainChat = require("../io/main");
let parentDir = path.resolve(__dirname, "..");
require("log-timestamp");
var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);
app.set("views", path.join(parentDir, "views"));
app.set("view engine", "ejs");
// App middleware

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: "secretmonkey",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(express.static(path.join(parentDir, "public")));
var index = require("../routes/index");
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

var server = http.createServer(app);
const socketOptions = {
  pingTimeout: 5000 * 100,
  pingInterval: 25000,
};
io = io(server, socketOptions);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, () => {
  console.log(`listening to ${port}`);
});
server.on("error", onError);
server.on("listening", onListening);

mainChat(io);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
