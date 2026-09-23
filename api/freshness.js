function base(){return {generatedAt:"2026-09-23T00:00:00.000Z",tools:{make:"2026-09-23",pipedrive:"2026-09-23",hubspot:"2026-09-23",shopify:"2026-09-23",brevo:"2026-09-23",monday:"2026-09-23",getresponse:"2026-09-23",activecampaign:"2026-09-23",systeme:"2026-09-23",semrush:"2026-09-23",kit:"2026-09-23",close:"2026-09-23",zapier:"2026-09-23",asana:"2026-09-23",notion:"2026-09-23",clickup:"2026-09-23"}}}
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({success:false,error:"Method Not Allowed"});
 const fallback=base();const url=String(process.env.FRESHNESS_DATA_URL||"").trim();let remote=null;
 if(url&&/^https:\/\//i.test(url)){try{const r=await fetch(url,{cache:"no-store",headers:{Accept:"application/json"}});if(r.ok){const d=await r.json();if(d&&d.tools&&typeof d.tools==="object")remote=d}}catch(e){console.error("PROJECT-X freshness feed error",e)}}
 const data=remote||fallback;const stale=[];Object.keys(data.tools||{}).forEach(function(id){const days=Math.floor((Date.now()-new Date(data.tools[id]).getTime())/86400000);if(days>30)stale.push({id,verified:data.tools[id],days})});
 return res.status(200).json({success:true,source:remote?"external-feed":"registry",generatedAt:data.generatedAt||new Date().toISOString(),tools:data.tools||{},staleCount:stale.length,stale});
}