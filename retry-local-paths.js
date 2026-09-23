(async () => {
  const rootElement=document.getElementById('root');
  if(!rootElement)return {ready:false,reason:'no-root'};
  const root=rootElement[Object.keys(rootElement).find(k=>k.startsWith('__reactContainer'))];
  if(!root)return {ready:false,reason:'no-react-root'};
  const clients=new Set(),seen=new Set(),stack=[root.stateNode?.current??root];
  const inspect=(v,depth=0)=>{
    if(!v||typeof v!=='object'||depth>3)return;
    if(v.queryClient?.getQueryCache)clients.add(v.queryClient);
    if(typeof v.getQueryCache==='function')clients.add(v);
    if(Array.isArray(v))for(const x of v)inspect(x,depth+1);
  };
  while(stack.length){const f=stack.pop();if(!f||seen.has(f))continue;seen.add(f);
    if(f.child)stack.push(f.child);if(f.sibling)stack.push(f.sibling);
    let context=f.dependencies?.firstContext;while(context){inspect(context.memoizedValue);context=context.next;}
    if(f.type?.name==='zht'){
      inspect(f.updateQueue?.memoCache?.data);
      let h=f.memoizedState,n=0;while(h&&n++<8000){inspect(h.memoizedState);h=h.next;}
    }
  }
  const selected=[];
  for(const client of clients)for(const query of client.getQueryCache().getAll()){
    const k=query.queryKey;
    if(k[0]==='vscode'&&k[1]==='codex-home'&&(k.length===2||k[2]==='{"hostId":"local"}'))selected.push({client,query});
  }
  if(!selected.length)return {ready:false,reason:'no-local-path-query'};
  const before=selected.map(({query:q})=>({key:q.queryKey,status:q.state.status,fetchStatus:q.state.fetchStatus}));
  let retried=0;
  for(const {client,query} of selected){
    if(query.state.status!=='pending')continue;
    await client.cancelQueries({queryKey:query.queryKey,exact:true});
    await client.refetchQueries({queryKey:query.queryKey,exact:true,type:'all'});
    retried++;
  }
  const after=selected.map(({query:q})=>({key:q.queryKey,status:q.state.status,fetchStatus:q.state.fetchStatus}));
  return {ready:after.every(q=>q.status==='success'),retried,before,after};
})()
