function n(r){if(r<1e3)return String(r);const t=r/1e3;return t>=10||Math.round(t*10)/10>=10?`${Math.round(t)}K`:`${t.toFixed(1)}K`}export{n as f};
