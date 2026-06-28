const fs = require('fs');
const path = require('path');
const dir = './src/api';
fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const p = path.join(dir, file);
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/\/admin\//g, '/refu-control/');
    c = c.replace(/\/admin'/g, '/refu-control\'');
    c = c.replace(/\/admin`/g, '/refu-control`');
    fs.writeFileSync(p, c);
  }
});
