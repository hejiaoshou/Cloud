const http = require("http");
const https = require("https");
const fs = require("fs");
const koa = require("koa");
const static = require('koa-static');
const sslify = require('koa-sslify').default;
const socketIo = require("socket.io");

var Public = 'public',
    sslOptions = {
      key: fs.readFileSync('./ssl/2176064_www.ichats.cc.key'),
      cert: fs.readFileSync('./ssl/2176064_www.ichats.cc.pem')
    }

const app = new koa();
const httpServer = http.Server(app.callback());
const httpsServer = https.Server(sslOptions,app.callback());
const io = socketIo(httpsServer);

app.use(sslify());
app.use(static(Public));

io.on('connection', function (socket) {
  const roomName = 'publicRoom';

  socket.join(roomName, () => {
    let rooms = Object.keys(socket.rooms);
    socket.to(roomName).emit('addUser', {content: `一位新用户加入了房间！(id:${socket.id})`});
  });

  socket.on('say', (data) => {
    socket.to(roomName).emit('say',{content: data.content, id: socket.id});
  });

});

httpServer.listen(80, () => {
  console.log('http server run')
});

httpsServer.listen(443, () => {
  console.log('https server run')
});