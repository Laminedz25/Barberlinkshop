const { Client } = require('ssh2');

const deploy = () => {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Client :: ready');
    conn.exec('cd /opt/Barberlinkshop && git status && git pull origin main && docker compose up -d --build', (err, stream) => {
      if (err) throw err;
      stream.on('close', (code, signal) => {
        console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
        conn.end();
      }).on('data', (data) => {
        process.stdout.write('STDOUT: ' + data);
      }).stderr.on('data', (data) => {
        process.stderr.write('STDERR: ' + data);
      });
    });
  }).on('error', (err) => {
    console.error('SSH Connection Error: ', err.message);
  }).connect({
    host: '72.61.71.63',
    port: 22,
    username: 'deploy', // Trying deploy
    password: '9:cEum68fY9AAUo6@q?5'
  });
};

deploy();
