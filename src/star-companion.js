// Site-scoped profile selection only. No silent login, signing or vault listing.
if (!document.querySelector('#star-companion')) {
  const launcher=document.createElement('button');
  launcher.id='star-companion';launcher.className='star-launcher';
  launcher.textContent='✧ Your Star';launcher.setAttribute('aria-haspopup','dialog');
  const panel=document.createElement('dialog');panel.className='star-companion';
  panel.setAttribute('aria-labelledby','star-panel-title');
  panel.innerHTML='<button class="star-close" aria-label="Close Your Star">×</button><p class="eyebrow">STAR KEY · THIS SITE</p><h2 id="star-panel-title">Connect your key.</h2><p>Choose the persona this game knows you by. Your extension manages that choice.</p><p class="star-connection" role="status" aria-live="polite"></p><p class="star-persona"></p><button class="star-connect">Choose persona in extension</button><button class="star-refresh">Check extension again</button><p class="star-sync">Game tasks are saved in this browser. Signing and saving them into Star Hold are not connected yet.</p><a href="https://soulbis.com/star-experiment/" target="_blank" rel="noopener noreferrer">Star Key setup and experiment ↗</a>';
  document.body.append(launcher,panel);
  let pending=false, persona=null;
  const status=panel.querySelector('[role=status]'), connect=panel.querySelector('.star-connect');
  function refresh() {
    const available=typeof window.vtaWallet?.walletProfile==='function';
    connect.disabled=!available||pending;
    status.textContent=pending?'Waiting for the extension…':persona?'Persona returned by extension · site session not verified':available?'Extension profile interface available · not signed in':'No compatible extension interface found. Enable Star Key for this site in the browser where it is installed, then reload.';
    panel.querySelector('.star-persona').textContent=persona?'Selected persona: '+persona:'';
  }
  launcher.onclick=()=>{refresh();panel.showModal();};
  panel.querySelector('.star-close').onclick=()=>panel.close();
  panel.addEventListener('close',()=>launcher.focus());
  panel.querySelector('.star-refresh').onclick=refresh;
  connect.onclick=async()=>{
    if(pending)return;
    const provider=window.vtaWallet;
    if(typeof provider?.walletProfile!=='function'){refresh();return;}
    pending=true;refresh();
    try {
      const result=await provider.walletProfile({});
      if(typeof result?.did!=='string'||!result.did.startsWith('did:')||result.did.length>2048)throw Error('Unsupported profile response');
      // Deliberately do not retain the vault entry ID or export identity metadata.
      persona=result.did;pending=false;refresh();
    } catch {
      pending=false;refresh();status.textContent='Persona selection did not complete. You can continue practising or try again in the extension.';
    }
  };
}
