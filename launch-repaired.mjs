import {spawn,execFileSync} from 'node:child_process';
import {readFile,appendFile,access} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=dirname(fileURLToPath(import.meta.url));
const logPath=join(folder,'launcher.log');
const port=49372;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const log=async value=>appendFile(logPath,new Date().toISOString()+' '+JSON.stringify(value)+'\n');
let ws,sequence=0,ownedInspector=false;const pending=new Map();
const rpc=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++sequence;const timer=setTimeout(()=>{pending.delete(id);reject(Error('Diagnostic timeout: '+method))},60000);
  pending.set(id,a=>{clearTimeout(timer);a.error?reject(Error(JSON.stringify(a.error))):resolve(a.result)});
  ws.send(JSON.stringify({id,method,params}));
});
const evaluate=async expression=>{
  const result=await rpc('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description??result.exceptionDetails.text);
  return result.result?.value;
};
const inView=source=>evaluate(`(async()=>{const E=process.mainModule.require('electron');const w=E.BrowserWindow.getAllWindows().find(w=>w.webContents.getURL()==='app://-/index.html');if(!w)return {ready:false,reason:'no-primary-window'};return await w.webContents.executeJavaScript(${JSON.stringify(source)},true);})()`);
try{
  const packageDir=execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command','Get-AppxPackage -Name OpenAI.Codex | Select-Object -First 1 -ExpandProperty InstallLocation'],{encoding:'utf8',windowsHide:true}).trim();
  if(!packageDir)throw Error('Paquet OpenAI.Codex introuvable.');
  const executable=join(packageDir,'app','ChatGPT.exe');await access(executable);
  const child=spawn(executable,[`--inspect=127.0.0.1:${port}`],{detached:true,stdio:'ignore',windowsHide:true});child.unref();
  await log({event:'launch',pid:child.pid});
  let target;
  for(let attempt=0;attempt<80;attempt++){
    try{const list=await(await fetch(`http://127.0.0.1:${port}/json/list`,{signal:AbortSignal.timeout(500)})).json();target=list.find(t=>t.type==='node');if(target)break;}catch{}
    await sleep(250);
  }
  if(!target)throw Error('Fermez complètement Codex Windows puis relancez ce raccourci. Aucun réglage Windows n’a été changé.');
  ws=new WebSocket(target.webSocketDebuggerUrl);
  ws.addEventListener('message',e=>{const a=JSON.parse(e.data);if(pending.has(a.id)){pending.get(a.id)(a);pending.delete(a.id);}});
  await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
  const identity=await evaluate('({pid:process.pid,executable:process.execPath})');
  if(identity.executable.toLowerCase()!==executable.toLowerCase()||identity.pid!==child.pid)throw Error('Le port local appartient à un autre processus.');
  ownedInspector=true;
  await evaluate("setTimeout(()=>process.mainModule.require('node:inspector').close(),90000); 'watchdog-installed'");
  await sleep(8000);
  const repair=await readFile(join(folder,'retry-local-paths.js'),'utf8');
  let outcome;
  for(let attempt=0;attempt<60;attempt++){
    outcome=await inView(repair);
    if(outcome?.ready)break;
    await sleep(500);
  }
  await log({event:'local-path-query-retry',outcome});
  if(!outcome?.ready)throw Error('Le chargement local n’a pas pu être rétabli. Voir launcher.log.');
  await log({event:'ready',pid:identity.pid});
}catch(error){
  await log({event:'error',message:String(error)});process.exitCode=1;
}finally{
  if(ownedInspector&&ws?.readyState===WebSocket.OPEN){
    try{await evaluate("setTimeout(()=>process.mainModule.require('node:inspector').close(),100); 'diagnostic-close-scheduled'");}catch{}
    ws.close();
  }
  else if(ws?.readyState===WebSocket.OPEN)ws.close();
}

