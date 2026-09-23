import { URLSearchParams } from "url";
async function stripe(secret,path,method="GET",body=""){const r=await fetch("https://api.stripe.com/v1"+path,{method,headers:{Authorization:"Basic "+Buffer.from(secret+":").toString("base64"),...(body?{"Content-Type":"application/x-www-form-urlencoded"}:{})},body:body||undefined});const d=await r.json();return{r,d}}
export default async function handler(req,res){
 if(req.method!=="GET")return res.status(405).json({success:false,error:"Method Not Allowed"});
 const secret=String(process.env.STRIPE_SECRET_KEY||"").trim();
 const price=String(process.env.STRIPE_SUBSCRIPTION_PRICE_ID||"").trim();
 if(!secret||!/^sk_(test|live)_/i.test(secret)||!price)return res.redirect(302,"/pro.html?subscription=missing");
 const origin=/^https?:\/\//i.test(process.env.APP_URL||"")?String(process.env.APP_URL).replace(/\/$/,""):"https://project-x-phi-steel.vercel.app";
 try{
  const p=new URLSearchParams();p.set("mode","subscription");p.set("line_items[0][price]",price);p.set("line_items[0][quantity]","1");p.set("success_url",origin+"/pro-success.html?subscription=1&session_id={CHECKOUT_SESSION_ID}");p.set("cancel_url",origin+"/pro-plus.html?checkout=cancelled");p.set("metadata[product]","project-x-pro-subscription");
  const x=await stripe(secret,"/checkout/sessions","POST",p.toString());
  if(x.r.ok&&x.d&&x.d.url)return res.redirect(303,x.d.url);
  console.error("PROJECT-X subscription checkout error",x.d);
 }catch(e){console.error("PROJECT-X subscription checkout exception",e)}
 return res.redirect(302,"/pro-plus.html?subscription=error");
}