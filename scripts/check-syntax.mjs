import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

function check(path) {
 for(const entry of readdirSync(path,{withFileTypes:true})) {
  const file=join(path,entry.name);
  if(entry.isDirectory())check(file);
  else if(/\.m?js$/.test(file))execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
 }
}
execFileSync(process.execPath,['--check','server.js'],{stdio:'inherit'});
check('public/assets');check('scripts');
console.log('Server, scene assets, and scripts passed syntax checks.');
