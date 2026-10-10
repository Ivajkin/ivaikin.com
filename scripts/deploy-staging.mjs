import { spawnSync } from 'node:child_process';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, createHash } from 'node:crypto';
import { validateConfig, packageSite, sshArgs, remoteUploadCommand } from './staging-lib.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const privateRoot=resolve(root,'.staging');
const configPath=resolve(privateRoot,'config.json');
function run(command,args,options={}) {
  const result=spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,...options});
  if(result.error) throw result.error;
  if(result.status!==0) throw new Error(`${command} failed: ${result.stderr || result.stdout || result.status}`);
  return result.stdout ? String(result.stdout).trim() : '';
}
async function checked(url) {
  const response=await fetch(url,{signal:AbortSignal.timeout(20000),redirect:'error'});
  if(response.status!==200) throw new Error(`Staging verification failed: HTTP ${response.status}`);
  if(!response.headers.get('x-robots-tag')?.includes('noindex')) throw new Error('Staging response is missing noindex');
  if(!response.headers.get('cache-control')?.includes('no-store')) throw new Error('Staging response may be cached');
  if(response.headers.get('referrer-policy')!=='no-referrer') throw new Error('Staging may leak its capability in referrers');
  return response;
}

try {
  let config;
  try {config=validateConfig(JSON.parse(await readFile(configPath,'utf8')));}
  catch(error) {throw new Error(`Configure .staging/config.json before deployment. ${error.message}`);}
  if(run('git',['status','--porcelain'])) throw new Error('Commit the scoped website changes before staging; deployment requires a clean tree.');
  run(process.execPath,['scripts/build.mjs']);
  run(process.execPath,['scripts/build-home.mjs']);
  const tests=(await readdir(resolve(root,'tests'))).filter(p=>p.endsWith('.test.mjs')).map(p=>'tests/'+p);
  console.log(run(process.execPath,['--test',...tests]));
  if(run('git',['status','--porcelain'])) throw new Error('Build changed tracked output; commit generated pages before staging.');
  const sourceCommit=run('git',['rev-parse','HEAD']);
  const release=new Date().toISOString().replace(/[-:.]/g,'').replace(/\d{3}Z$/,'Z')+'-'+sourceCommit.slice(0,10)+'-'+randomBytes(3).toString('hex');
  const artifact=resolve(privateRoot,'releases',release);
  await packageSite(root,artifact,config,release,sourceCommit);
  const archive=resolve(privateRoot,release+'.tar');
  run('tar',['-cf',archive,'-C',artifact,'.'],{env:{...process.env,COPYFILE_DISABLE:'1'}});
  const productionBefore=await fetch('https://ivaikin.com/',{signal:AbortSignal.timeout(20000)});
  if(!productionBefore.ok) throw new Error('Cannot establish production baseline');
  const baseline=createHash('sha256').update(await productionBefore.text()).digest('hex');
  run('ssh',sshArgs(config,remoteUploadCommand(release)),{input:await readFile(archive),encoding:null});
  const installer=await readFile(resolve(root,'scripts/staging-install.py'),'utf8');
  const result=JSON.parse(run('ssh',sshArgs(config,`python3 - ${config.token} ${release}`),{input:installer}));
  if(result.status!=='deployed' || result.revision!==release) throw new Error('Remote installer did not confirm the requested release');
  const base=config.origin+config.prefix;
  for(const path of ['','about/','ru/about/','es/about/','zh/about/','ru/','es/','zh/','en/interviews/tai-chi-business/','ru/interviews/tai-chi-business/','assets/front/home.css','assets/front/home.js','assets/front/portrait.webp','assets/front/systems.webp','assets/front/social.jpg','assets/home/home.css','assets/home/home.js']) await checked(base+path);
  const live=await (await checked(base+'release.json')).json();
  if(live.release!==release || live.sourceCommit!==sourceCommit) throw new Error('Running staging revision differs from uploaded release');
  const hidden=await fetch(config.origin+'/previews/ivaikin/not-a-valid-preview/ru/',{signal:AbortSignal.timeout(20000)});
  if(hidden.status!==404) throw new Error('Unknown preview paths must return 404');
  const productionAfter=await fetch('https://ivaikin.com/',{signal:AbortSignal.timeout(20000)});
  const after=createHash('sha256').update(await productionAfter.text()).digest('hex');
  if(!productionAfter.ok || after!==baseline) throw new Error('Production baseline changed during staging; inspect before reporting completion');
  const report={release,sourceCommit,url:base+'ru/',verifiedAt:new Date().toISOString(),productionUnchanged:true};
  await mkdir(privateRoot,{recursive:true});
  await writeFile(resolve(privateRoot,'latest.json'),JSON.stringify(report,null,2)+'\n',{mode:0o600});
  console.log(JSON.stringify(report,null,2));
} catch(error) {
  console.error(error.message);
  process.exitCode=1;
}
