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
    },
    onlineNumber = 0;

const app = new koa();
const httpServer = http.Server(app.callback());
const httpsServer = https.Server(sslOptions,app.callback());
const io = socketIo(httpsServer);

app.use(sslify());
app.use(static(Public));

io.on('connection', function (socket) {
  const roomName = 'publicRoom';
  onlineNumber++;

  socket.emit('User', {
    time: Date.now(),
    content: `当前在线人数：${onlineNumber}`,
    onlineNumber: onlineNumber,
    id: '系统消息'
  })

  socket.join(roomName, () => {
    let rooms = Object.keys(socket.rooms);

    socket.to(roomName).emit('User', {
      time: Date.now(),
      content: `(id:${socket.id})-用户加入了房间！当前在线人数：${onlineNumber}`,
      onlineNumber: onlineNumber,
      id: '系统消息'
    });
    
  });

  socket.on('say', (data) => {
    socket.to(roomName).emit('say',{
      time: Date.now(),
      content: data.content,
      id: socket.id
    });
  });

  socket.on('disconnect', reason => {
    onlineNumber--;
    socket.to(roomName).emit('User', {
      time: Date.now(),
      content: `(id:${socket.id})-用户离开了房间！当前在线人数：${onlineNumber}`,
      onlineNumber: onlineNumber,
      id: '系统消息'
    });
  })

});

httpServer.listen(80, () => {
  console.log('http server run')
});

httpsServer.listen(443, () => {
  console.log('https server run')
});