const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const datastore = require('./datastore');
const game = require('./game');
const debug = require('debug')('server');

game.setSocketHandle(io);

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
  
  debug('A user connected');
  
  let interval = setInterval(() => updateServerTime(socket), 1000);
  
  socket.on('disconnect', () => {
    clearInterval(interval);
  });
  
  socket.on('C_S_LOGIN', async (user) => {
    try {
      // log in the user
      const loginResult = await datastore.login(user);
      // automatically add the user to the default room
      await game.addNewUser(user.id, socket, 'main');

      socket.emit('S_C_LOGIN', loginResult);

    } catch (error) {

      debug('Error Logging in - ', error);
      socket.disconnect();

    }
  });

});

const updateServerTime = (socket) => {
  socket.emit('UPD_SERVER_TIME', Date.now());
};

http.listen(3001, () => {
  debug('listening on *:3001');
});
