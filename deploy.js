// console.log(process.env);
const { readFileSync } = require('fs');
const { join } = require('path');
let Client = require('ssh2-sftp-client');
// const { NodeSSH } = require('node-ssh');

async function init() {
  const sftp = new Client();
  await sftp.connect({
    host: 'mashserver.rpsoftech.net',
    port: '22',
    username: 'root',
    password: 'mash',
  });
  const myDir = join(__dirname, 'dist', 'apps', 'my-mash-app-backend');
  const f = readFileSync(join(myDir, 'index.pro.js'));
  console.log('Build Ready');
  console.log(f.length);
  await sftp.put(f, '/root/server/index.pro.js', {});
  console.log('Build Uploaded');
  await sftp.end();
  // const ssh = new NodeSSH()̵
  // console.log(await sftp.cwd());;
}
init();
