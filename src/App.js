import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════════════════════════
const CFG = {
  sitePw:        "qaihub26",
  adminPw:       "adqaihub26",
  vaultPw:       "vaqaihub26",
  gallery1Pw:    "qheveryday26",
  gallery2Pw:    "qhnighttime26",
  baseUrl:       "https://github.com/andybqai-oss",
  stripeKey:     "pk_test_51TCdN4AtQwxj03DvwwQ09jGxWCvyASNMm58IkjO8QyRP0zpmCXFvUCOgsWg8D2SzQJwsfNCX7Di5Ga7wOmrrlFqO00E9SOB7Fi",
  paypalClientId:"REPLACE_WITH_YOUR_PAYPAL_CLIENT_ID",
  currency:      "GBP",
  currencySymbol:"£",
};

const PLANS = {
  all:     { label:"Full Access",     g1:true,  g2:true,  monthly:12.99, annual:109.99 },
  general: { label:"General Gallery", g1:true,  g2:false, monthly:8.99,  annual:49.99  },
  adult:   { label:"Adult Gallery",   g1:false, g2:true,  monthly:10.99, annual:89.99  },
};

// ══════════════════════════════════════════════════════════════════
//  PALETTE
// ══════════════════════════════════════════════════════════════════
const G = {
  bg:"#08080a", surface:"#0f0f12", card:"#14141a", cardHi:"#1c1c24",
  border:"#252530", borderHi:"#3a3a4a",
  gold:"#c9a84c", goldLight:"#e8c97a", goldDim:"#7a6230",
  rose:"#c94c6a", roseDim:"#7a2030",
  smoke:"#7a7a8a", text:"#e0e0ea", dim:"#4a4a5a",
  danger:"#c94c4c", success:"#4caa70", info:"#4c8aaa",
  overlay:"rgba(8,8,10,0.92)",
};

// ══════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════
const uid    = () => Math.random().toString(36).slice(2,10);
const fmt    = (n) => `${CFG.currencySymbol}${Number(n).toFixed(2)}`;
const disc   = (n) => fmt(Number(n)*0.6);
const discN  = (n) => +(Number(n)*0.6).toFixed(2);
const STORE  = "ghg_v6";
const SESS   = "ghg_sess_v6";
const PURCH  = "ghg_purch_v6";
const BASKET = "ghg_basket_v6";

// affiliate = {id, name, img, url, gallery:"1"|"2"|"both"}
// featured  = {id, img, url, caption, label, activeFrom, gallery:"hub"|"1"|"2"|"both"}
const loadData   = () => { try { return JSON.parse(localStorage.getItem(STORE))  || {items:[],sets:[],friends:[],affiliates:[],featured:[],forum:[],messages:[],commissions:[]}; } catch { return {items:[],sets:[],friends:[],affiliates:[],featured:[],forum:[],messages:[],commissions:[]}; }};
const OWNER_EMAIL = "andyb.qai@gmail.com"; // ← change to your real email
const DEPOSIT_MIN = 25; // minimum deposit in £
const saveData   = (d) => localStorage.setItem(STORE,  JSON.stringify(d));
const loadSess   = () => { try { return JSON.parse(sessionStorage.getItem(SESS)  || "{}"); } catch { return {}; }};
const saveSess   = (s) => sessionStorage.setItem(SESS, JSON.stringify(s));
const loadPurch  = () => { try { return JSON.parse(localStorage.getItem(PURCH)  || "[]"); } catch { return []; }};
const loadBasket = () => { try { return JSON.parse(localStorage.getItem(BASKET) || "[]"); } catch { return []; }};
const saveBasket = (b) => localStorage.setItem(BASKET, JSON.stringify(b));

// ══════════════════════════════════════════════════════════════════
//  GLOBAL CSS
// ══════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  ::-webkit-scrollbar{width:5px;background:${G.bg}}
  ::-webkit-scrollbar-thumb{background:${G.border};border-radius:3px}
  input::placeholder,textarea::placeholder{color:${G.dim}}
  select option{background:${G.surface};color:${G.text}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
  @keyframes shimmer{0%,100%{opacity:.5}50%{opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fadeUp{animation:fadeUp .5s ease both}
  .fadeIn{animation:fadeIn .35s ease both}
  .slideIn{animation:slideIn .3s ease both}
  .card-hover{transition:border-color .25s,transform .25s,box-shadow .25s}
  .card-hover:hover{border-color:${G.gold}55!important;transform:translateY(-2px);box-shadow:0 14px 48px #0007}
  .spin{animation:spin .8s linear infinite}
`;

// ══════════════════════════════════════════════════════════════════
//  UI ATOMS
// ══════════════════════════════════════════════════════════════════
const Divider = ({color=G.gold})=>(
  <div style={{display:"flex",alignItems:"center",gap:12,margin:"28px 0"}}>
    <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,${color}44)`}}/>
    <div style={{width:5,height:5,background:color,transform:"rotate(45deg)"}}/>
    <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,${color}44)`}}/>
  </div>
);

const Label = ({children})=>(
  <div style={{color:G.smoke,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Cinzel',serif"}}>
    {children}
  </div>
);

const iStyle = {background:G.surface,border:`1px solid ${G.border}`,color:G.text,padding:"10px 14px",borderRadius:3,fontSize:14,fontFamily:"'EB Garamond',serif",outline:"none",width:"100%",transition:"border-color .2s"};

const Inp=({label,...p})=>(
  <div style={{display:"flex",flexDirection:"column"}}>
    {label&&<Label>{label}</Label>}
    <input {...p} style={{...iStyle,...p.style}}
      onFocus={e=>e.target.style.borderColor=G.gold+"88"}
      onBlur={e=>e.target.style.borderColor=G.border}/>
  </div>
);

const Sel=({label,children,...p})=>(
  <div style={{display:"flex",flexDirection:"column"}}>
    {label&&<Label>{label}</Label>}
    <select {...p} style={{...iStyle,cursor:"pointer",...p.style}}>{children}</select>
  </div>
);

const Btn=({children,onClick,variant="gold",size="md",style={},disabled,full})=>{
  const sz={sm:{fontSize:11,padding:"6px 14px"},md:{fontSize:13,padding:"10px 22px"},lg:{fontSize:15,padding:"13px 32px"}};
  const vr={
    gold:{background:`linear-gradient(135deg,${G.gold},${G.goldLight})`,color:"#08080a",border:"none"},
    rose:{background:`linear-gradient(135deg,${G.rose},#e06080)`,color:"#fff",border:"none"},
    ghost:{background:"transparent",color:G.gold,border:`1px solid ${G.gold}55`},
    ghostRose:{background:"transparent",color:G.rose,border:`1px solid ${G.rose}55`},
    dark:{background:G.surface,color:G.text,border:`1px solid ${G.border}`},
    danger:{background:"transparent",color:G.danger,border:`1px solid ${G.danger}44`},
    success:{background:G.success,color:"#fff",border:"none"},
    successGhost:{background:"transparent",color:G.success,border:`1px solid ${G.success}55`},
    stripe:{background:"#635bff",color:"#fff",border:"none"},
    paypal:{background:"#0070ba",color:"#fff",border:"none"},
  };
  return(
    <button onClick={onClick} disabled={disabled} style={{...vr[variant],...sz[size],width:full?"100%":undefined,fontFamily:"'Cinzel',serif",fontWeight:500,letterSpacing:"0.1em",borderRadius:2,cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1,transition:"all .2s",whiteSpace:"nowrap",...style}}
      onMouseEnter={e=>{if(!disabled)e.currentTarget.style.opacity="0.82"}}
      onMouseLeave={e=>{e.currentTarget.style.opacity="1"}}>
      {children}
    </button>
  );
};

const Badge=({children,color=G.gold})=>(
  <span style={{background:color+"18",border:`1px solid ${color}44`,color,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",padding:"2px 8px",borderRadius:2,fontFamily:"'Cinzel',serif",whiteSpace:"nowrap"}}>
    {children}
  </span>
);

const Spinner = ()=><div className="spin" style={{width:18,height:18,border:`2px solid ${G.border}`,borderTopColor:G.gold,borderRadius:"50%",display:"inline-block"}}/>;

// ══════════════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════════════
function useToast(){
  const[toast,setToast]=useState(null);
  const show=(msg,color=G.gold)=>{setToast({msg,color});setTimeout(()=>setToast(null),3500);};
  const ToastEl=toast?(
    <div style={{position:"fixed",bottom:24,right:24,zIndex:9999,background:toast.color,color:toast.color===G.gold?"#08080a":"#fff",padding:"13px 22px",borderRadius:3,fontSize:13,fontWeight:600,maxWidth:400,boxShadow:"0 8px 40px #0009",animation:"fadeUp .3s ease",fontFamily:"'Cinzel',serif",letterSpacing:"0.05em"}}>
      {toast.msg}
    </div>
  ):null;
  return{show,ToastEl};
}

// ══════════════════════════════════════════════════════════════════
//  LOCK SCREEN
// ══════════════════════════════════════════════════════════════════
function LockScreen({title,subtitle,icon="🔐",correctPw,onUnlock,accent=G.gold}){
  const[pw,setPw]=useState("");const[err,setErr]=useState(false);const[shake,setShk]=useState(false);
  const go=()=>{if(pw===correctPw)onUnlock();else{setErr(true);setShk(true);setTimeout(()=>setShk(false),600);}};
  return(
    <div className="fadeUp" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"65vh",gap:32}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:44,marginBottom:12}}>{icon}</div>
        <h2 style={{color:accent,fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:400}}>{title}</h2>
        {subtitle&&<p style={{color:G.smoke,fontSize:14,marginTop:10,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>{subtitle}</p>}
      </div>
      <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:"32px 36px",width:"min(380px,90vw)",display:"flex",flexDirection:"column",gap:16,animation:shake?"shake .5s ease":"none",boxShadow:"0 24px 64px #000a"}}>
        <Inp label="Passphrase" type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter passphrase…"/>
        {err&&<p style={{color:G.danger,fontSize:12}}>✗ Incorrect passphrase.</p>}
        <Btn onClick={go} variant={accent===G.rose?"rose":"gold"} full>Unlock</Btn>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SITE GATE
// ══════════════════════════════════════════════════════════════════
function SiteGate({onEnter}){
  const[step,setStep]=useState("age");
  const[agreed,setAgreed]=useState(false);
  const[pw,setPw]=useState("");const[err,setErr]=useState(false);const[shake,setShk]=useState(false);
  const go=()=>{if(pw===CFG.sitePw)onEnter();else{setErr(true);setShk(true);setTimeout(()=>setShk(false),600);}};
  return(
    <div style={{minHeight:"100vh",background:G.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,backgroundImage:`radial-gradient(ellipse at 50% 0%,${G.gold}09 0%,transparent 60%)`}}>
      <style>{CSS}</style>
      <div className="fadeUp" style={{textAlign:"center",marginBottom:40}}>
        <p style={{color:G.dim,fontSize:11,letterSpacing:"0.25em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:16}}>Private Collection</p>
        <h1 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:"clamp(30px,6vw,52px)",fontWeight:300,letterSpacing:"0.06em"}}>The Gallery</h1>
        <Divider/>
      </div>
      {step==="age"?(
        <div className="fadeUp" style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:"36px 40px",width:"min(440px,92vw)",textAlign:"center",boxShadow:"0 24px 64px #000b"}}>
          <p style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:21,marginBottom:10,fontStyle:"italic"}}>Age Verification</p>
          <p style={{color:G.smoke,fontSize:14,fontFamily:"'EB Garamond',serif",lineHeight:1.8,marginBottom:28}}>
            This site contains material restricted to adults. You must be <strong style={{color:G.text}}>18 years of age or older</strong> to enter.
          </p>
          <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:28,textAlign:"left"}}>
            <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)} style={{marginTop:3,accentColor:G.gold,width:16,height:16,flexShrink:0}}/>
            <span style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",lineHeight:1.7}}>I confirm I am <strong style={{color:G.text}}>18 years of age or older</strong> and consent to view adult material.</span>
          </label>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <Btn size="lg" disabled={!agreed} onClick={()=>setStep("pw")}>Confirm & Continue</Btn>
            <Btn variant="ghost" size="lg" onClick={()=>window.location.href="https://google.com"}>Exit</Btn>
          </div>
        </div>
      ):(
        <div className="fadeUp" style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:"32px 36px",width:"min(380px,92vw)",display:"flex",flexDirection:"column",gap:16,animation:shake?"shake .5s ease":"none",boxShadow:"0 24px 64px #000b"}}>
          <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",fontStyle:"italic",textAlign:"center"}}>Enter your access passphrase</p>
          <Inp label="Passphrase" type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Passphrase…"/>
          {err&&<p style={{color:G.danger,fontSize:12}}>✗ Incorrect passphrase.</p>}
          <Btn size="lg" onClick={go} full>Enter the Gallery</Btn>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  BASKET DRAWER
// ══════════════════════════════════════════════════════════════════
function BasketDrawer({basket,data,subPlan,onRemove,onClear,onClose,onCheckout}){
  const hasAccess = !!subPlan;
  const itemPrice = (item)=> hasAccess ? discN(item.price) : Number(item.price);
  const total = basket.reduce((s,id)=>{
    const item=data.items.find(i=>i.id===id);
    return item ? s+itemPrice(item) : s;
  },0);

  return(
    <div style={{position:"fixed",inset:0,zIndex:800,display:"flex"}}>
      <div style={{flex:1,background:G.overlay}} onClick={onClose}/>
      <div className="slideIn" style={{width:"min(400px,95vw)",background:G.card,borderLeft:`1px solid ${G.border}`,display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
        {/* Header */}
        <div style={{padding:"24px 24px 16px",borderBottom:`1px solid ${G.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:G.card,zIndex:1}}>
          <div>
            <h3 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:400}}>Your Basket</h3>
            <p style={{color:G.smoke,fontSize:12,fontFamily:"'Cinzel',serif",marginTop:4}}>{basket.length} item{basket.length!==1?"s":""}</p>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:G.smoke,fontSize:24,cursor:"pointer",lineHeight:1}}>×</button>
        </div>

        {/* Items */}
        <div style={{flex:1,padding:20,display:"flex",flexDirection:"column",gap:12}}>
          {basket.length===0&&(
            <div style={{textAlign:"center",padding:"48px 0",color:G.dim}}>
              <div style={{fontSize:32,marginBottom:12}}>🛒</div>
              <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>Your basket is empty.</p>
            </div>
          )}
          {basket.map(id=>{
            const item=data.items.find(i=>i.id===id);
            if(!item)return null;
            const price=itemPrice(item);
            return(
              <div key={id} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:3,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:20}}>{item.type==="video"?"🎬":"🖼️"}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:G.text,fontSize:14,fontFamily:"'EB Garamond',serif",fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.title}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                    <span style={{color:G.gold,fontSize:13,fontFamily:"'Cinzel',serif"}}>{fmt(price)}</span>
                    {hasAccess&&<span style={{color:G.dim,fontSize:11,textDecoration:"line-through"}}>{fmt(item.price)}</span>}
                    {hasAccess&&<Badge color={G.success}>-40%</Badge>}
                  </div>
                </div>
                <button onClick={()=>onRemove(id)} style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:18,flexShrink:0,transition:"color .2s"}}
                  onMouseEnter={e=>e.target.style.color=G.danger}
                  onMouseLeave={e=>e.target.style.color=G.dim}>×</button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {basket.length>0&&(
          <div style={{padding:"16px 24px 28px",borderTop:`1px solid ${G.border}`,display:"flex",flexDirection:"column",gap:12,position:"sticky",bottom:0,background:G.card}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{color:G.smoke,fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em"}}>TOTAL</span>
              <span style={{color:G.gold,fontSize:22,fontFamily:"'Cinzel',serif",fontWeight:600}}>{fmt(total)}</span>
            </div>
            {hasAccess&&<p style={{color:G.success,fontSize:11,fontFamily:"'EB Garamond',serif",fontStyle:"italic",textAlign:"right"}}>40% subscriber discount applied</p>}
            <Btn full size="lg" onClick={onCheckout}>Proceed to Checkout</Btn>
            <Btn full variant="ghost" size="sm" onClick={onClear}>Clear Basket</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CHECKOUT PAGE
// ══════════════════════════════════════════════════════════════════
function CheckoutPage({basket,data,subPlan,onBack,onComplete}){
  const[method,setMethod]=useState(null); // "stripe" | "paypal"
  const[loading,setLoading]=useState(false);
  const[done,setDone]=useState(false);
  const[cardNum,setCardNum]=useState("");
  const[cardExp,setCardExp]=useState("");
  const[cardCvc,setCardCvc]=useState("");
  const[cardName,setCardName]=useState("");
  const[email,setEmail]=useState("");
  const[errors,setErrors]=useState({});

  const hasAccess=!!subPlan;
  const itemPrice=(item)=>hasAccess?discN(item.price):Number(item.price);
  const items=basket.map(id=>data.items.find(i=>i.id===id)).filter(Boolean);
  const total=items.reduce((s,i)=>s+itemPrice(i),0);

  const validateStripe=()=>{
    const e={};
    if(!email||!email.includes("@"))e.email="Valid email required";
    if(!cardName.trim())e.cardName="Name on card required";
    if(cardNum.replace(/\s/g,"").length<16)e.cardNum="Enter full 16-digit card number";
    if(!cardExp.match(/^\d{2}\/\d{2}$/))e.cardExp="Format: MM/YY";
    if(cardCvc.length<3)e.cardCvc="3 or 4 digits";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleStripe=async()=>{
    if(!validateStripe())return;
    setLoading(true);
    // Simulate Stripe payment intent — replace with real Stripe.js call
    await new Promise(r=>setTimeout(r,2000));
    setLoading(false);
    setDone(true);
    onComplete(basket);
  };

  const handlePayPal=async()=>{
    setLoading(true);
    // Simulate PayPal redirect — replace with real PayPal Orders API call
    await new Promise(r=>setTimeout(r,1500));
    setLoading(false);
    setDone(true);
    onComplete(basket);
  };

  const fmtCard=(v)=>v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const fmtExp=(v)=>{const d=v.replace(/\D/g,"").slice(0,4);return d.length>2?d.slice(0,2)+"/"+d.slice(2):d;};

  if(done)return(
    <div className="fadeUp" style={{maxWidth:520,margin:"80px auto",textAlign:"center",padding:"0 24px"}}>
      <div style={{fontSize:56,marginBottom:20}}>✦</div>
      <h2 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:300,marginBottom:12}}>Thank You</h2>
      <p style={{color:G.smoke,fontSize:15,fontFamily:"'EB Garamond',serif",lineHeight:1.8,marginBottom:32}}>
        Your purchase is confirmed. Download links for your {items.length} item{items.length!==1?"s":""} have been sent to <strong style={{color:G.text}}>{email||"your email"}</strong>.
      </p>
      <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:24,marginBottom:28,textAlign:"left"}}>
        <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:12}}>Your Downloads</p>
        {items.map(item=>(
          <div key={item.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${G.border}`}}>
            <span>{item.type==="video"?"🎬":"🖼️"}</span>
            <span style={{flex:1,color:G.text,fontSize:14,fontFamily:"'EB Garamond',serif"}}>{item.title}</span>
            <a href={item.link} style={{color:G.gold,fontSize:12,fontFamily:"'Cinzel',serif",textDecoration:"none"}}>⬇ Download</a>
          </div>
        ))}
      </div>
      <Btn onClick={onBack}>Back to Gallery</Btn>
    </div>
  );

  return(
    <div style={{maxWidth:640,margin:"0 auto",padding:"32px 20px 80px"}} className="fadeUp">
      <button onClick={onBack} style={{background:"none",border:"none",color:G.smoke,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"0.1em",marginBottom:28}}>← Back to Basket</button>

      <div style={{marginBottom:32}}>
        <p style={{color:G.dim,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:6}}>Secure Checkout</p>
        <h2 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:400}}>Complete Your Purchase</h2>
      </div>

      {/* Order summary */}
      <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:20,marginBottom:24}}>
        <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>Order Summary</p>
        {items.map(item=>(
          <div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${G.border}`}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span>{item.type==="video"?"🎬":"🖼️"}</span>
              <span style={{color:G.text,fontSize:14,fontFamily:"'EB Garamond',serif"}}>{item.title}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {hasAccess&&<span style={{color:G.dim,fontSize:11,textDecoration:"line-through"}}>{fmt(item.price)}</span>}
              <span style={{color:G.gold,fontSize:14,fontFamily:"'Cinzel',serif"}}>{fmt(itemPrice(item))}</span>
            </div>
          </div>
        ))}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:14}}>
          <span style={{color:G.text,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:"0.1em"}}>TOTAL</span>
          <span style={{color:G.gold,fontSize:22,fontFamily:"'Cinzel',serif",fontWeight:600}}>{fmt(total)}</span>
        </div>
        {hasAccess&&<p style={{color:G.success,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic",textAlign:"right",marginTop:6}}>✓ 40% subscriber discount applied</p>}
      </div>

      {/* Payment method selection */}
      {!method&&(
        <div>
          <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:16}}>Choose Payment Method</p>
          <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
            <div className="card-hover" onClick={()=>setMethod("stripe")} style={{flex:1,minWidth:200,background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:"24px 20px",cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>💳</div>
              <div style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:18,fontStyle:"italic",marginBottom:6}}>Card Payment</div>
              <div style={{color:G.smoke,fontSize:12,fontFamily:"'EB Garamond',serif",marginBottom:16}}>Visa, Mastercard, Amex</div>
              <div style={{background:"#635bff",color:"#fff",borderRadius:2,padding:"6px 14px",fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em",display:"inline-block"}}>Pay with Stripe</div>
            </div>
            <div className="card-hover" onClick={()=>setMethod("paypal")} style={{flex:1,minWidth:200,background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:"24px 20px",cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:8}}>🅿️</div>
              <div style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:18,fontStyle:"italic",marginBottom:6}}>PayPal</div>
              <div style={{color:G.smoke,fontSize:12,fontFamily:"'EB Garamond',serif",marginBottom:16}}>Pay with your PayPal balance or card</div>
              <div style={{background:"#0070ba",color:"#fff",borderRadius:2,padding:"6px 14px",fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em",display:"inline-block"}}>Pay with PayPal</div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe form */}
      {method==="stripe"&&(
        <div className="fadeIn">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase"}}>Card Details</p>
            <button onClick={()=>setMethod(null)} style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>← Change method</button>
          </div>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:24,display:"flex",flexDirection:"column",gap:16}}>
            <Inp label="Email address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/>
            {errors.email&&<p style={{color:G.danger,fontSize:12,marginTop:-10}}>{errors.email}</p>}
            <Inp label="Name on card" value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="As it appears on the card"/>
            {errors.cardName&&<p style={{color:G.danger,fontSize:12,marginTop:-10}}>{errors.cardName}</p>}
            <Inp label="Card number" value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19}/>
            {errors.cardNum&&<p style={{color:G.danger,fontSize:12,marginTop:-10}}>{errors.cardNum}</p>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div>
                <Inp label="Expiry" value={cardExp} onChange={e=>setCardExp(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5}/>
                {errors.cardExp&&<p style={{color:G.danger,fontSize:12,marginTop:4}}>{errors.cardExp}</p>}
              </div>
              <div>
                <Inp label="CVC" value={cardCvc} onChange={e=>setCardCvc(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="123" maxLength={4}/>
                {errors.cardCvc&&<p style={{color:G.danger,fontSize:12,marginTop:4}}>{errors.cardCvc}</p>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
              <span style={{fontSize:16}}>🔒</span>
              <span style={{color:G.dim,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>Payments processed securely by Stripe. We never store card details.</span>
            </div>
          </div>
          <div style={{marginTop:20}}>
            <Btn full size="lg" variant="stripe" onClick={handleStripe} disabled={loading}>
              {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Spinner/> Processing…</span>:`Pay ${fmt(total)} with Stripe`}
            </Btn>
          </div>
        </div>
      )}

      {/* PayPal */}
      {method==="paypal"&&(
        <div className="fadeIn">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase"}}>PayPal Checkout</p>
            <button onClick={()=>setMethod(null)} style={{background:"none",border:"none",color:G.dim,cursor:"pointer",fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>← Change method</button>
          </div>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28,textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:12}}>🅿️</div>
            <p style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:18,fontStyle:"italic",marginBottom:8}}>Pay with PayPal</p>
            <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",lineHeight:1.7,marginBottom:24}}>
              You'll be redirected to PayPal to complete your payment of <strong style={{color:G.gold}}>{fmt(total)}</strong> securely. Then returned here automatically.
            </p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:24,color:G.dim,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>
              <span>🔒</span> Secured by PayPal
            </div>
            <Btn full size="lg" variant="paypal" onClick={handlePayPal} disabled={loading}>
              {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><Spinner/> Connecting to PayPal…</span>:`Pay ${fmt(total)} via PayPal`}
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ITEM CARD  (reusable)
// ══════════════════════════════════════════════════════════════════
function ItemCard({item,accent,hasAccess,purchased,basket,onBuyNow,onAddBasket}){
  const owned   = purchased.includes(item.id);
  const inCart  = basket.includes(item.id);
  const price   = hasAccess ? disc(item.price) : fmt(item.price);

  return(
    <div className="card-hover" style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:3,overflow:"hidden",display:"flex",flexDirection:"column"}}>
      {/* Thumbnail */}
      <div style={{aspectRatio:"4/3",background:`linear-gradient(135deg,${G.surface},${G.bg})`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8,position:"relative"}}>
        <span style={{fontSize:28,opacity:0.18}}>{item.type==="video"?"🎬":"🖼️"}</span>
        <div style={{position:"absolute",top:8,left:8,display:"flex",gap:4,flexWrap:"wrap"}}>
          {item.grouping==="fullset"&&<Badge color={accent}>Full Set</Badge>}
          {item.isAdult&&<Badge color={G.rose}>Adult</Badge>}
          {owned&&<Badge color={G.success}>Owned</Badge>}
        </div>
      </div>

      {/* Info */}
      <div style={{padding:"14px 14px 12px",flex:1,display:"flex",flexDirection:"column",gap:8}}>
        <div style={{color:G.text,fontSize:14,fontFamily:"'Playfair Display',serif",fontStyle:"italic",lineHeight:1.3,flex:1}}>{item.title}</div>

        {/* Price row */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{color:accent,fontSize:15,fontFamily:"'Cinzel',serif",fontWeight:600}}>{price}</span>
          {hasAccess&&<span style={{color:G.dim,fontSize:11,textDecoration:"line-through"}}>{fmt(item.price)}</span>}
          {hasAccess&&<Badge color={G.success}>-40%</Badge>}
        </div>

        {/* Action buttons */}
        {owned?(
          <a href={item.link} style={{textDecoration:"none"}}>
            <Btn variant="successGhost" size="sm" full>⬇ Download</Btn>
          </a>
        ):(
          <div style={{display:"flex",gap:6}}>
            {/* Quick buy */}
            <Btn variant="gold" size="sm" style={{flex:1}} onClick={()=>onBuyNow(item)}>Buy Now</Btn>
            {/* Add to basket */}
            <Btn variant={inCart?"dark":"ghost"} size="sm" style={{flex:1}} onClick={()=>onAddBasket(item)}>
              {inCart?"✓ In Basket":"+ Basket"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  REQUESTS — FORUM, PRIVATE MESSAGE, COMMISSION
// ══════════════════════════════════════════════════════════════════

// ── Helpers ────────────────────────────────────────────────────
const timeAgo = (ts) => {
  const s = Math.floor((Date.now()-ts)/1000);
  if(s<60)return"just now";
  if(s<3600)return`${Math.floor(s/60)}m ago`;
  if(s<86400)return`${Math.floor(s/3600)}h ago`;
  return`${Math.floor(s/86400)}d ago`;
};
const calcDeposit = (budget) => {
  const third = Math.ceil(Number(budget)/3);
  return Math.max(DEPOSIT_MIN, third);
};

// ── Public Forum ──────────────────────────────────────────────
function ForumPage({data,setData,subPlan}){
  const[name,setName]     = useState("");
  const[msg,setMsg]       = useState("");
  const[pmName,setPmName] = useState("");
  const[pmMsg,setPmMsg]   = useState("");
  const[pmOpen,setPmOpen] = useState(false);
  const[commOpen,setCommOpen] = useState(false);
  const[sent,setSent]     = useState(null);
  const{show:toast,ToastEl} = useToast();

  const posts = [...(data.forum||[])].reverse();

  const submitPost = () => {
    if(!name.trim()||!msg.trim())return;
    const post = {id:uid(),name:name.trim(),msg:msg.trim(),ts:Date.now(),pinned:false,teaserNote:"",replies:[]};
    const updated = {...data, forum:[...(data.forum||[]),post]};
    setData(updated); saveData(updated);
    setName(""); setMsg("");
    toast("✓ Your message is live on the forum!");
  };

  const submitPM = () => {
    if(!pmName.trim()||!pmMsg.trim())return;
    const pm = {id:uid(),name:pmName.trim(),msg:pmMsg.trim(),ts:Date.now(),read:false,type:"message"};
    const updated = {...data, messages:[...(data.messages||[]),pm]};
    setData(updated); saveData(updated);
    setPmName(""); setPmMsg(""); setPmOpen(false);
    setSent("pm");
    toast("✓ Private message sent — you'll receive a reply by email.");
  };

  return(
    <div style={{maxWidth:760,margin:"0 auto"}} className="fadeUp">
      {ToastEl}
      <div style={{textAlign:"center",padding:"40px 0 28px"}}>
        <p style={{color:G.dim,fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:10}}>Community</p>
        <h2 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:"clamp(22px,4vw,36px)",fontWeight:300}}>Requests & Discussion</h2>
        <p style={{color:G.smoke,fontSize:14,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginTop:10,lineHeight:1.7}}>
          Share ideas, suggest themes, or discuss what you'd like to see. Popular suggestions may become real content.
        </p>
        <Divider/>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          {subPlan ? (
            <Btn onClick={()=>{setPmOpen(true);setCommOpen(false);}}>✉ Private Message</Btn>
          ):(
            <div style={{background:G.card,border:`1px solid ${G.gold}33`,borderRadius:3,padding:"10px 20px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"center"}}>
              <span style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>Private messages & commissions are for subscribers</span>
            </div>
          )}
          {subPlan && <Btn variant="ghost" onClick={()=>{setCommOpen(true);setPmOpen(false);}}>🎨 Commission Request</Btn>}
        </div>
      </div>

      {/* Private message modal */}
      {pmOpen&&(
        <div style={{background:G.card,border:`1px solid ${G.gold}44`,borderRadius:4,padding:24,marginBottom:28}} className="fadeIn">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <h3 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,fontStyle:"italic"}}>Private Message</h3>
            <button onClick={()=>setPmOpen(false)} style={{background:"none",border:"none",color:G.smoke,fontSize:20,cursor:"pointer"}}>×</button>
          </div>
          <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",lineHeight:1.7,marginBottom:16}}>This goes directly to the creator's inbox only — not visible to anyone else. You'll receive a reply by email.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="Your name or handle" value={pmName} onChange={e=>setPmName(e.target.value)} placeholder="How should I address you?"/>
            <div>
              <Label>Your message</Label>
              <textarea value={pmMsg} onChange={e=>setPmMsg(e.target.value)} placeholder="Be as specific as you like — themes, style, any particular ideas…"
                style={{...iStyle,minHeight:120,resize:"vertical",lineHeight:1.6}}/>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <Btn variant="dark" onClick={()=>setPmOpen(false)}>Cancel</Btn>
              <Btn onClick={submitPM} disabled={!pmName.trim()||!pmMsg.trim()}>Send Privately</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Commission form — separate component below */}
      {commOpen&&<CommissionForm onClose={()=>setCommOpen(false)} data={data} setData={setData} subPlan={subPlan}/>}

      {/* New post form */}
      <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:22,marginBottom:28}}>
        <h3 style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:400,marginBottom:16}}>Post to the forum</h3>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp label="Your name or handle" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Anonymous, or your username"/>
          <div>
            <Label>Your suggestion or message</Label>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="What would you love to see? Themes, styles, ideas — all welcome…"
              style={{...iStyle,minHeight:100,resize:"vertical",lineHeight:1.6}}/>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <Btn onClick={submitPost} disabled={!name.trim()||!msg.trim()}>Post to Forum</Btn>
          </div>
        </div>
      </div>

      {/* Forum posts */}
      {posts.length===0&&(
        <div style={{textAlign:"center",padding:"48px 0",color:G.dim}}>
          <div style={{fontSize:28,marginBottom:10,animation:"shimmer 2s ease infinite",color:G.gold}}>✦</div>
          <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>No posts yet — be the first to suggest something!</p>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {posts.map(post=>(
          <div key={post.id} style={{background:post.pinned?G.gold+"0a":G.card,border:`1px solid ${post.pinned?G.gold+"55":G.border}`,borderRadius:4,padding:"18px 20px"}}>
            {post.pinned&&<div style={{marginBottom:8}}><Badge color={G.gold}>✦ Pinned</Badge></div>}
            <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:16,fontStyle:"italic",fontWeight:600}}>{post.name}</span>
              <span style={{color:G.dim,fontSize:11,fontFamily:"'Cinzel',serif"}}>{timeAgo(post.ts)}</span>
            </div>
            <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:15,lineHeight:1.7,marginBottom:post.teaserNote?12:0}}>{post.msg}</p>
            {post.teaserNote&&(
              <div style={{background:G.gold+"11",border:`1px solid ${G.gold}33`,borderRadius:3,padding:"10px 14px",marginTop:8}}>
                <p style={{color:G.dim,fontSize:10,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4}}>Creator's note</p>
                <p style={{color:G.goldLight,fontFamily:"'EB Garamond',serif",fontSize:14,fontStyle:"italic",lineHeight:1.6}}>{post.teaserNote}</p>
              </div>
            )}
            {/* Replies */}
            {(post.replies||[]).map((r,i)=>(
              <div key={i} style={{marginTop:10,paddingLeft:16,borderLeft:`2px solid ${G.border}`}}>
                <span style={{color:G.smoke,fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>{r.name} · {timeAgo(r.ts)}</span>
                <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:14,lineHeight:1.6,marginTop:4}}>{r.msg}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Commission Form ───────────────────────────────────────────
function CommissionForm({onClose,data,setData,subPlan}){
  const[step,setStep]     = useState(1); // 1=details, 2=quote, 3=deposit
  const[form,setForm]     = useState({name:"",email:"",idea:"",budget:"",type:"photo",adult:false});
  const[quote,setQuote]   = useState("");
  const[loading,setLoading]=useState(false);
  const[paid,setPaid]     = useState(false);
  const{show:toast,ToastEl}=useToast();

  const deposit = form.budget ? calcDeposit(form.budget) : DEPOSIT_MIN;

  const submitRequest = () => {
    if(!form.name||!form.email||!form.idea)return;
    const comm = {
      id:uid(), ...form, ts:Date.now(), status:"pending",
      deposit:0, stage:1, type:"commission",
      notes:"", stagesPaid:[],
    };
    const updated = {...data, commissions:[...(data.commissions||[]),comm]};
    setData(updated); saveData(updated);
    setStep(2);
  };

  const payDeposit = async() => {
    setLoading(true);
    await new Promise(r=>setTimeout(r,1800));
    setLoading(false);
    setPaid(true);
    // Update commission status
    const updated = {...data, commissions:(data.commissions||[]).map(c=>
      c.email===form.email&&c.idea===form.idea ? {...c,status:"confirmed",stagesPaid:[1],deposit} : c
    )};
    setData(updated); saveData(updated);
    toast("✓ Deposit paid — commission confirmed!");
  };

  if(paid) return(
    <div style={{background:G.card,border:`1px solid ${G.gold}44`,borderRadius:4,padding:28,marginBottom:28,textAlign:"center"}} className="fadeIn">
      {ToastEl}
      <div style={{fontSize:36,marginBottom:12}}>✦</div>
      <h3 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:300,marginBottom:10}}>Commission Confirmed!</h3>
      <p style={{color:G.smoke,fontFamily:"'EB Garamond',serif",fontSize:14,lineHeight:1.7,marginBottom:20}}>
        Your deposit of <strong style={{color:G.gold}}>{fmt(deposit)}</strong> has been received.
        You'll hear from the creator soon at <strong style={{color:G.text}}>{form.email}</strong>.
        When teasers are ready, Stage 2 payment will be requested, then Stage 3 on final delivery.
      </p>
      <Btn onClick={onClose}>Back to Forum</Btn>
    </div>
  );

  return(
    <div style={{background:G.card,border:`1px solid ${G.gold}44`,borderRadius:4,padding:24,marginBottom:28}} className="fadeIn">
      {ToastEl}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
        <h3 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,fontStyle:"italic"}}>Commission Request</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:G.smoke,fontSize:20,cursor:"pointer"}}>×</button>
      </div>

      {/* Stage indicators */}
      <div style={{display:"flex",gap:8,marginBottom:20,alignItems:"center"}}>
        {["Your Idea","Deposit","Confirmed"].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:step>i?G.gold:G.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:step>i?"#08080a":G.smoke,fontFamily:"'Cinzel',serif",fontWeight:600,flexShrink:0}}>{i+1}</div>
            <span style={{color:step===i+1?G.gold:G.dim,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>{s}</span>
            {i<2&&<div style={{width:24,height:1,background:G.border}}/>}
          </div>
        ))}
      </div>

      {step===1&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",lineHeight:1.7}}>
            Describe your commission. Minimum charge is <strong style={{color:G.gold}}>{fmt(DEPOSIT_MIN)}</strong> deposit, or 1/3 of agreed price — whichever is larger.
            Payment is in three stages: on agreement, on teaser delivery, and on final delivery.
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <Inp label="Your name" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Name or handle"/>
            <Inp label="Your email" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="For creator to reply"/>
            <Sel label="Content type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
              <option value="photo">Photos</option>
              <option value="video">Video</option>
              <option value="both">Both</option>
            </Sel>
            <Inp label="Your budget (£)" type="number" value={form.budget} onChange={e=>setForm(p=>({...p,budget:e.target.value}))} placeholder="e.g. 75"/>
          </div>
          <div>
            <Label>Describe your idea</Label>
            <textarea value={form.idea} onChange={e=>setForm(p=>({...p,idea:e.target.value}))}
              placeholder="Theme, mood, style, specific requests — the more detail the better. Adult content commissions are welcome."
              style={{...iStyle,minHeight:120,resize:"vertical",lineHeight:1.6}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <Label>Adult content commission?</Label>
            <button onClick={()=>setForm(p=>({...p,adult:!p.adult}))} style={{background:form.adult?G.rose+"22":"transparent",border:`1px solid ${form.adult?G.rose+"66":G.border}`,color:form.adult?G.rose:G.smoke,borderRadius:2,padding:"6px 14px",fontSize:12,fontFamily:"'Cinzel',serif",cursor:"pointer",transition:"all .2s"}}>
              {form.adult?"🔞 Adult":"✓ General"}
            </button>
          </div>
          {form.budget&&<p style={{color:G.gold,fontSize:13,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>
            Estimated Stage 1 deposit: <strong>{fmt(deposit)}</strong> (larger of £25 or 1/3 of your budget)
          </p>}
          <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
            <Btn variant="dark" onClick={onClose}>Cancel</Btn>
            <Btn onClick={submitRequest} disabled={!form.name||!form.email||!form.idea}>Submit Request →</Btn>
          </div>
        </div>
      )}

      {step===2&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}} className="fadeIn">
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:3,padding:20}}>
            <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:10}}>Your request has been received</p>
            <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:15,lineHeight:1.7}}>
              The creator will review your idea and may reach out to discuss details before you pay.
              To formally secure your commission, pay Stage 1 now.
            </p>
          </div>

          {/* Payment summary */}
          <div style={{background:G.card,border:`1px solid ${G.gold}33`,borderRadius:3,padding:20}}>
            <p style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>Commission Payment Plan</p>
            {[
              {stage:"Stage 1 — Now",desc:"Agreement deposit",amt:deposit,active:true},
              {stage:"Stage 2 — On teaser delivery",desc:"Thumbnails / preview clip",amt:"1/3 agreed price",active:false},
              {stage:"Stage 3 — On final delivery",desc:"Full content delivered",amt:"Remainder",active:false},
            ].map((row,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i<2?`1px solid ${G.border}`:"none",opacity:row.active?1:0.6}}>
                <div>
                  <div style={{color:row.active?G.gold:G.smoke,fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:"0.08em"}}>{row.stage}</div>
                  <div style={{color:G.dim,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginTop:2}}>{row.desc}</div>
                </div>
                <div style={{color:row.active?G.gold:G.smoke,fontSize:row.active?18:14,fontFamily:"'Cinzel',serif",fontWeight:row.active?600:400}}>{typeof row.amt==="number"?fmt(row.amt):row.amt}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <Btn full variant="stripe" onClick={payDeposit} disabled={loading}>
              {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Processing…</span>:`Pay ${fmt(deposit)} deposit — Stripe`}
            </Btn>
            <Btn full variant="paypal" onClick={payDeposit} disabled={loading}>
              {loading?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Spinner/> Connecting…</span>:`Pay ${fmt(deposit)} deposit — PayPal`}
            </Btn>
          </div>
          <p style={{color:G.dim,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic",textAlign:"center"}}>🔒 Secure payment. You will not be charged more until you approve teasers.</p>
        </div>
      )}
    </div>
  );
}

// ── Admin Requests Tab ────────────────────────────────────────
function RequestsAdmin({data,setData}){
  const[view,setView]       = useState("all"); // all|forum|messages|commissions
  const[replyId,setReplyId] = useState(null);
  const[replyText,setReplyText]=useState("");
  const[teaserNote,setTeaserNote]=useState("");
  const[teaserId,setTeaserId]=useState(null);
  const{show:toast,ToastEl}=useToast();

  const forum       = data.forum||[];
  const messages    = data.messages||[];
  const commissions = data.commissions||[];
  const unreadMsgs  = messages.filter(m=>!m.read).length;
  const pendingComm = commissions.filter(c=>c.status==="pending").length;

  const markRead=(id)=>{
    const updated={...data,messages:messages.map(m=>m.id===id?{...m,read:true}:m)};
    setData(updated);saveData(updated);
  };

  const addReply=(postId)=>{
    if(!replyText.trim())return;
    const updated={...data,forum:forum.map(p=>p.id===postId?{...p,replies:[...(p.replies||[]),{name:"Creator",msg:replyText.trim(),ts:Date.now()}]}:p)};
    setData(updated);saveData(updated);
    setReplyText("");setReplyId(null);
    toast("Reply posted!");
  };

  const pinPost=(id)=>{
    const updated={...data,forum:forum.map(p=>p.id===id?{...p,pinned:!p.pinned}:p)};
    setData(updated);saveData(updated);
  };

  const addTeaserNote=(postId)=>{
    if(!teaserNote.trim())return;
    const updated={...data,forum:forum.map(p=>p.id===postId?{...p,teaserNote:teaserNote.trim()}:p)};
    setData(updated);saveData(updated);
    setTeaserNote("");setTeaserId(null);
    toast("Teaser note published on forum post!");
  };

  const deletePost=(id)=>{
    const updated={...data,forum:forum.filter(p=>p.id!==id)};
    setData(updated);saveData(updated);
  };

  const updateCommStatus=(id,status)=>{
    const updated={...data,commissions:commissions.map(c=>c.id===id?{...c,status}:c)};
    setData(updated);saveData(updated);
    toast(`Commission marked as ${status}`);
  };

  const statusColor=(s)=>({pending:G.gold,confirmed:G.success,inprogress:G.info,complete:G.smoke,declined:G.danger}[s]||G.smoke);

  const VIEWS=[
    {id:"all",l:`All (${forum.length+messages.length+commissions.length})`},
    {id:"forum",l:`Forum (${forum.length})`},
    {id:"messages",l:`Messages${unreadMsgs?` · ${unreadMsgs} new`:""}`},
    {id:"commissions",l:`Commissions${pendingComm?` · ${pendingComm} pending`:""}`},
  ];

  return(
    <div className="fadeUp">
      {ToastEl}
      <div style={{display:"flex",gap:0,marginBottom:24,borderBottom:`1px solid ${G.border}`,overflowX:"auto"}}>
        {VIEWS.map(v=>(
          <button key={v.id} onClick={()=>setView(v.id)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${view===v.id?G.gold:"transparent"}`,color:view===v.id?G.gold:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.1em",padding:"10px 16px",cursor:"pointer",transition:"all .2s",marginBottom:-1,whiteSpace:"nowrap"}}>{v.l}</button>
        ))}
      </div>

      {/* FORUM tab */}
      {(view==="all"||view==="forum")&&(
        <div style={{marginBottom:32}}>
          {(view==="all")&&<h4 style={{color:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:16}}>Forum Posts</h4>}
          {forum.length===0&&<p style={{color:G.dim,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginBottom:16}}>No forum posts yet.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[...forum].reverse().map(post=>(
              <div key={post.id} style={{background:G.surface,border:`1px solid ${post.pinned?G.gold+"55":G.border}`,borderRadius:3,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:15,fontStyle:"italic",fontWeight:600}}>{post.name}</span>
                  <span style={{color:G.dim,fontSize:11}}>{timeAgo(post.ts)}</span>
                  {post.pinned&&<Badge color={G.gold}>Pinned</Badge>}
                </div>
                <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:14,lineHeight:1.6,marginBottom:12}}>{post.msg}</p>
                {post.teaserNote&&(
                  <div style={{background:G.gold+"11",border:`1px solid ${G.gold}33`,borderRadius:2,padding:"8px 12px",marginBottom:10}}>
                    <span style={{color:G.dim,fontSize:10,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em"}}>YOUR NOTE: </span>
                    <span style={{color:G.goldLight,fontFamily:"'EB Garamond',serif",fontSize:13,fontStyle:"italic"}}>{post.teaserNote}</span>
                  </div>
                )}
                {(post.replies||[]).map((r,i)=>(
                  <div key={i} style={{paddingLeft:12,borderLeft:`2px solid ${G.border}`,marginBottom:6}}>
                    <span style={{color:G.smoke,fontSize:11,fontFamily:"'Cinzel',serif"}}>{r.name} · {timeAgo(r.ts)}</span>
                    <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:13,marginTop:2}}>{r.msg}</p>
                  </div>
                ))}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  <Btn size="sm" variant="ghost" onClick={()=>setReplyId(replyId===post.id?null:post.id)}>Reply</Btn>
                  <Btn size="sm" variant="ghost" onClick={()=>setTeaserId(teaserId===post.id?null:post.id)}>Add Teaser Note</Btn>
                  <Btn size="sm" variant="dark" onClick={()=>pinPost(post.id)}>{post.pinned?"Unpin":"Pin"}</Btn>
                  <Btn size="sm" variant="danger" onClick={()=>deletePost(post.id)}>Delete</Btn>
                </div>
                {replyId===post.id&&(
                  <div style={{marginTop:12,display:"flex",gap:8}} className="fadeIn">
                    <input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Your reply…" style={{...iStyle,flex:1}}/>
                    <Btn size="sm" onClick={()=>addReply(post.id)} disabled={!replyText.trim()}>Post Reply</Btn>
                  </div>
                )}
                {teaserId===post.id&&(
                  <div style={{marginTop:12,display:"flex",gap:8,flexDirection:"column"}} className="fadeIn">
                    <p style={{color:G.smoke,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>This note will appear publicly under the post — use it to hint at upcoming content inspired by this suggestion.</p>
                    <div style={{display:"flex",gap:8}}>
                      <input value={teaserNote} onChange={e=>setTeaserNote(e.target.value)} placeholder="e.g. This one inspired something — watch this space…" style={{...iStyle,flex:1}}/>
                      <Btn size="sm" onClick={()=>addTeaserNote(post.id)} disabled={!teaserNote.trim()}>Publish Note</Btn>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGES tab */}
      {(view==="all"||view==="messages")&&(
        <div style={{marginBottom:32}}>
          {(view==="all")&&<h4 style={{color:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:16}}>Private Messages</h4>}
          {messages.length===0&&<p style={{color:G.dim,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginBottom:16}}>No private messages yet.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[...messages].reverse().map(m=>(
              <div key={m.id} style={{background:G.surface,border:`1px solid ${m.read?G.border:G.gold+"55"}`,borderRadius:3,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:15,fontStyle:"italic",fontWeight:600}}>{m.name}</span>
                  <span style={{color:G.dim,fontSize:11}}>{timeAgo(m.ts)}</span>
                  {!m.read&&<Badge color={G.gold}>New</Badge>}
                </div>
                <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:14,lineHeight:1.6,marginBottom:10}}>{m.msg}</p>
                <div style={{display:"flex",gap:8}}>
                  {!m.read&&<Btn size="sm" variant="dark" onClick={()=>markRead(m.id)}>Mark Read</Btn>}
                  <Btn size="sm" variant="ghost" onClick={()=>window.open(`mailto:?subject=Re: Your private message&body=Hi ${m.name},%0A%0A`)}>Reply by Email</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMMISSIONS tab */}
      {(view==="all"||view==="commissions")&&(
        <div>
          {(view==="all")&&<h4 style={{color:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:16}}>Commissions</h4>}
          {commissions.length===0&&<p style={{color:G.dim,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>No commissions yet.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[...commissions].reverse().map(c=>(
              <div key={c.id} style={{background:G.surface,border:`1px solid ${statusColor(c.status)}44`,borderRadius:3,padding:"16px 18px"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap",marginBottom:10}}>
                  <div>
                    <span style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:16,fontStyle:"italic",fontWeight:600}}>{c.name}</span>
                    <span style={{color:G.dim,fontSize:11,marginLeft:10}}>{timeAgo(c.ts)}</span>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                    <Badge color={statusColor(c.status)}>{c.status}</Badge>
                    {c.adult&&<Badge color={G.rose}>🔞 Adult</Badge>}
                    <Badge color={G.smoke}>{c.type}</Badge>
                  </div>
                </div>
                <p style={{color:G.text,fontFamily:"'EB Garamond',serif",fontSize:14,lineHeight:1.6,marginBottom:8}}>{c.idea}</p>
                <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:12}}>
                  {c.budget&&<span style={{color:G.smoke,fontSize:12}}><span style={{color:G.dim}}>Budget: </span><span style={{color:G.gold,fontFamily:"'Cinzel',serif"}}>{fmt(c.budget)}</span></span>}
                  <span style={{color:G.smoke,fontSize:12}}><span style={{color:G.dim}}>Email: </span>{c.email}</span>
                  {c.stagesPaid?.length>0&&<span style={{color:G.smoke,fontSize:12}}><span style={{color:G.dim}}>Stages paid: </span><span style={{color:G.success}}>{c.stagesPaid.join(", ")}</span></span>}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {["pending","confirmed","inprogress","complete","declined"].map(s=>(
                    <Btn key={s} size="sm" variant={c.status===s?"gold":"dark"} onClick={()=>updateCommStatus(c.id,s)} style={{textTransform:"capitalize"}}>{s}</Btn>
                  ))}
                  <Btn size="sm" variant="ghost" onClick={()=>window.open(`mailto:${c.email}?subject=Your commission request`)}>Email Client</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  FEATURED IMAGE  (weekly rotating)
// ══════════════════════════════════════════════════════════════════
function FeaturedImage({data,galleryScope,accent=G.gold}){
  const pool=(data.featured||[]).filter(f=>f.gallery==="both"||f.gallery===galleryScope);
  if(!pool.length)return null;
  const manual=pool.find(f=>f.manualActive);
  const weekNum=Math.floor(Date.now()/(1000*60*60*24*7));
  const featured=manual||pool[weekNum%pool.length];
  if(!featured)return null;
  return(
    <a href={featured.url||"#"} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none",display:"block",marginBottom:40}}>
      <div style={{position:"relative",borderRadius:4,overflow:"hidden",border:`1px solid ${accent}44`,boxShadow:`0 0 40px ${accent}18`,background:G.card,transition:"box-shadow .3s,border-color .3s"}}
        onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 0 60px ${accent}33`;e.currentTarget.style.borderColor=accent+"88";}}
        onMouseLeave={e=>{e.currentTarget.style.boxShadow=`0 0 40px ${accent}18`;e.currentTarget.style.borderColor=accent+"44";}}>
        <div style={{position:"absolute",top:16,left:0,zIndex:2,background:`linear-gradient(135deg,${accent},${accent}bb)`,color:"#08080a",fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",padding:"5px 18px 5px 14px",borderRadius:"0 2px 2px 0",boxShadow:`2px 2px 12px ${accent}44`}}>✦ Featured this week</div>
        <div style={{aspectRatio:"21/9",background:`linear-gradient(135deg,${G.surface},${G.bg})`,overflow:"hidden",position:"relative"}}>
          {featured.img
            ?<img src={featured.img} alt={featured.caption||"Featured"} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .4s"}} onMouseEnter={e=>e.target.style.transform="scale(1.03)"} onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
            :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",color:accent,fontSize:40,opacity:.15}}>✦</div>}
          <div style={{position:"absolute",inset:0,background:`linear-gradient(to top,${G.bg}cc 0%,transparent 50%)`}}/>
        </div>
        <div style={{padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            {featured.label&&<p style={{color:G.smoke,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:4}}>{featured.label}</p>}
            {featured.caption&&<p style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:18,fontStyle:"italic"}}>{featured.caption}</p>}
          </div>
          <div style={{color:accent,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.15em",flexShrink:0}}>View →</div>
        </div>
      </div>
    </a>
  );
}

// ══════════════════════════════════════════════════════════════════
//  AFFILIATE STRIP
// ══════════════════════════════════════════════════════════════════
function AffiliateStrip({data,galleryScope,stripIndex}){
  const all=(data.affiliates||[]).filter(a=>a.gallery==="both"||a.gallery===galleryScope);
  if(!all.length)return null;
  const count=Math.min(3,all.length);
  const start=(stripIndex*2)%all.length;
  const picks=[];
  for(let i=0;i<count;i++)picks.push(all[(start+i)%all.length]);
  return(
    <div style={{margin:"0 0 40px",padding:"20px 0",borderTop:`1px solid ${G.border}`,borderBottom:`1px solid ${G.border}`}}>
      <p style={{color:G.dim,fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:14,textAlign:"center"}}>✦ You may also enjoy</p>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${picks.length},1fr)`,gap:12}}>
        {picks.map((aff,i)=>(
          <a key={aff.id+i} href={aff.url||"#"} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
            <div className="card-hover" style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:3,overflow:"hidden",opacity:.88,transition:"opacity .2s,border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.opacity="1"}
              onMouseLeave={e=>e.currentTarget.style.opacity="0.88"}>
              <div style={{aspectRatio:"4/3",background:G.bg,overflow:"hidden"}}>
                {aff.img?<img src={aff.img} alt={aff.name||""} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:G.border}}>✦</div>}
              </div>
              <div style={{padding:"10px 12px"}}>
                <div style={{color:G.smoke,fontSize:12,fontFamily:"'EB Garamond',serif",fontStyle:"italic",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{aff.name||"View more"}</div>
                <div style={{color:G.dim,fontSize:10,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em",marginTop:3}}>Visit →</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  GALLERY VIEW
// ══════════════════════════════════════════════════════════════════
function GalleryView({data,galleryId,accent,purchased,basket,onBuyNow,onAddBasket}){
  const[filter,setFilter]=useState("all");
  const items      = data.items.filter(i=>i.gallery===galleryId);
  const filtered   = filter==="all"?items:items.filter(i=>i.type===filter);
  const sets       = data.sets.filter(s=>s.gallery===galleryId);
  const setItems   = (sid)=>filtered.filter(i=>i.setId===sid&&i.grouping!=="fullset");
  const fullSets   = filtered.filter(i=>i.grouping==="fullset");
  const solos      = filtered.filter(i=>i.grouping==="solo");
  const activeSets = sets.filter(s=>setItems(s.id).length>0);
  const hasAff     = (data.affiliates||[]).some(a=>a.gallery==="both"||a.gallery===galleryId);

  const SHead=({children,count})=>(
    <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:16}}>
      <h3 style={{color:accent,fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:400,fontStyle:"italic"}}>{children}</h3>
      {count!=null&&<span style={{color:G.dim,fontSize:12}}>{count} items</span>}
    </div>
  );
  const Grid=({items})=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:14,marginBottom:40}}>
      {items.map(i=><ItemCard key={i.id} item={i} accent={accent} hasAccess={false} purchased={purchased} basket={basket} onBuyNow={onBuyNow} onAddBasket={onAddBasket}/>)}
    </div>
  );

  const sections=[];
  if(fullSets.length)sections.push({label:"Complete Bundles",items:fullSets});
  activeSets.forEach(set=>{const its=setItems(set.id);if(its.length)sections.push({label:set.name,items:its});});
  if(solos.length)sections.push({label:"Individual Pieces",items:solos});

  let stripCount=0;
  const rendered=[];
  sections.forEach((sec,i)=>{
    rendered.push(<section key={`sec-${i}`}><SHead count={sec.items.length}>{sec.label}</SHead><Grid items={sec.items}/></section>);
    if(hasAff&&(i+1)%2===0&&i<sections.length-1){
      rendered.push(<AffiliateStrip key={`strip-${stripCount}`} data={data} galleryScope={galleryId} stripIndex={stripCount}/>);
      stripCount++;
    }
  });

  return(
    <div>
      <FeaturedImage data={data} galleryScope={galleryId} accent={accent}/>
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:32}}>
        {[["all","All"],["photo","Photos"],["video","Videos"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{background:filter===v?accent+"18":"transparent",border:`1px solid ${filter===v?accent+"66":G.border}`,color:filter===v?accent:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.1em",padding:"7px 18px",borderRadius:2,cursor:"pointer",transition:"all .2s"}}>{l}</button>
        ))}
      </div>
      {rendered}
      {hasAff&&sections.length>0&&<AffiliateStrip data={data} galleryScope={galleryId} stripIndex={stripCount+10}/>}
      {filtered.length===0&&(
        <div style={{textAlign:"center",padding:"80px 0",color:G.dim}}>
          <div style={{fontSize:32,marginBottom:12,color:accent,animation:"shimmer 2s ease infinite"}}>✦</div>
          <p style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:16}}>Nothing here yet — check back soon.</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SUBSCRIPTION MODAL
// ══════════════════════════════════════════════════════════════════
function SubModal({onClose,onSubscribe,current}){
  const[billing,setBilling]=useState("monthly");
  return(
    <div style={{position:"fixed",inset:0,zIndex:700,background:G.overlay,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div className="fadeUp" onClick={e=>e.stopPropagation()} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:6,padding:"36px 32px",width:"min(720px,95vw)",boxShadow:"0 32px 80px #000c",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <p style={{color:G.dim,fontSize:10,letterSpacing:"0.2em",fontFamily:"'Cinzel',serif",textTransform:"uppercase",marginBottom:6}}>Membership</p>
            <h2 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:300}}>Choose Your Plan</h2>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",color:G.smoke,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",marginBottom:24}}>Members receive <strong style={{color:G.gold}}>40% off</strong> all individual downloads.</p>
        <div style={{display:"flex",gap:8,marginBottom:28,background:G.surface,padding:4,borderRadius:3,width:"fit-content"}}>
          {["monthly","annual"].map(b=>(
            <button key={b} onClick={()=>setBilling(b)} style={{background:billing===b?G.gold+"22":"transparent",border:`1px solid ${billing===b?G.gold+"55":"transparent"}`,color:billing===b?G.gold:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.1em",padding:"7px 20px",borderRadius:2,cursor:"pointer",transition:"all .2s",textTransform:"capitalize"}}>
              {b}{b==="annual"&&<span style={{color:G.success,fontSize:10}}> · Save ~30%</span>}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14}}>
          {Object.entries(PLANS).map(([key,plan])=>{
            const price=billing==="monthly"?plan.monthly:plan.annual;
            const isCurrent=current===key;
            const ac=key==="adult"?G.rose:G.gold;
            return(
              <div key={key} className="card-hover" style={{background:G.surface,border:`1px solid ${isCurrent?ac+"66":G.border}`,borderRadius:4,padding:"24px 20px",textAlign:"center",position:"relative"}}>
                {isCurrent&&<div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",background:ac,color:"#08080a",fontSize:9,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em",padding:"3px 12px",borderRadius:"0 0 3px 3px"}}>ACTIVE</div>}
                <div style={{color:ac,fontFamily:"'Playfair Display',serif",fontSize:17,fontStyle:"italic",marginBottom:10,lineHeight:1.3}}>{plan.label}</div>
                <div style={{color:G.text,fontSize:28,fontFamily:"'Cinzel',serif",fontWeight:600,marginBottom:4}}>{fmt(price)}</div>
                <div style={{color:G.dim,fontSize:11,marginBottom:16}}>per {billing==="monthly"?"month":"year"}</div>
                <div style={{fontSize:12,color:G.smoke,fontFamily:"'EB Garamond',serif",marginBottom:20,lineHeight:1.6}}>
                  {plan.g1&&<div>✓ {CFG.gallery1Name.split(",")[0]}</div>}
                  {plan.g2&&<div>✓ {CFG.gallery2Name.split(",")[0]}</div>}
                  <div>✓ 40% off downloads</div>
                </div>
                <Btn variant={key==="adult"?"rose":"gold"} size="sm" full onClick={()=>onSubscribe(key,billing)}>
                  {isCurrent?"Renew":"Subscribe"}
                </Btn>
              </div>
            );
          })}
        </div>
        <p style={{color:G.dim,fontSize:11,fontFamily:"'EB Garamond',serif",marginTop:20,textAlign:"center",fontStyle:"italic"}}>Prices in GBP. Adult gallery requires age verification at site entry.</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  GALLERY HUB
// ══════════════════════════════════════════════════════════════════
function GalleryHub({data,subPlan,onOpenSub,purchased,basket,onBuyNow,onAddBasket}){
  const[view,setView]=useState("hub");
  const[g1ok,setG1]=useState(false);
  const[g2ok,setG2]=useState(false);
  const[ageOk,setAgeOk]=useState(false);
  const[ageChecked,setAgeChecked]=useState(false);
  const galName=galleryId=>galleryId==="1"?CFG.gallery1Name:CFG.gallery2Name;
  const accent=galleryId=>galleryId==="1"?G.gold:G.rose;

  const AdultGate=()=>(
    <div className="fadeUp" style={{maxWidth:480,margin:"60px auto"}}>
      <div style={{background:G.card,border:`1px solid ${G.rose}44`,borderRadius:4,padding:"32px 36px",boxShadow:"0 24px 64px #000b"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:36,marginBottom:10}}>🔞</div>
          <h3 style={{color:G.rose,fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:400}}>Adult Content</h3>
          <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",marginTop:10,lineHeight:1.7}}>This gallery contains explicit adult content restricted to persons 18 and over.</p>
        </div>
        <label style={{display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:24}}>
          <input type="checkbox" checked={ageChecked} onChange={e=>setAgeChecked(e.target.checked)} style={{marginTop:3,accentColor:G.rose,width:16,height:16,flexShrink:0}}/>
          <span style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",lineHeight:1.7}}>I confirm I am <strong style={{color:G.text}}>18+</strong> and consent to view explicit adult material.</span>
        </label>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="rose" disabled={!ageChecked} onClick={()=>setAgeOk(true)} full>Confirm & Continue</Btn>
          <Btn variant="dark" onClick={()=>setView("hub")} full>Go Back</Btn>
        </div>
      </div>
    </div>
  );

  if(view==="g1"||view==="g2"){
    const gid=view==="g1"?"1":"2";
    const ok=view==="g1"?g1ok:g2ok;
    const setOk=view==="g1"?setG1:setG2;
    const pw=view==="g1"?CFG.gallery1Pw:CFG.gallery2Pw;
    const ac=accent(gid);
    const back=()=>{setView("hub");if(view==="g2"){setAgeOk(false);setAgeChecked(false);}};

    if(view==="g2"&&!ageOk) return(
      <div style={{maxWidth:980,margin:"0 auto"}}>
        <button onClick={back} style={{background:"none",border:"none",color:G.smoke,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:12,margin:"16px 0",letterSpacing:"0.1em"}}>← Back</button>
        <AdultGate/>
      </div>
    );

    if(!ok) return(
      <div style={{maxWidth:960,margin:"0 auto"}}>
        <button onClick={back} style={{background:"none",border:"none",color:G.smoke,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:12,margin:"16px 0 32px",letterSpacing:"0.1em"}}>← Back to Galleries</button>
        <LockScreen title={galName(gid)} subtitle="Enter your passphrase." icon={view==="g2"?"🔞":"✦"} correctPw={pw} onUnlock={()=>setOk(true)} accent={ac}/>
      </div>
    );

    return(
      <div>
        <div style={{maxWidth:980,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0 0",marginBottom:8}}>
            <button onClick={back} style={{background:"none",border:"none",color:G.smoke,cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:12,letterSpacing:"0.1em"}}>← Galleries</button>
          </div>
          <div style={{textAlign:"center",padding:"32px 0 28px"}}>
            <h2 style={{color:ac,fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,34px)",fontWeight:300,letterSpacing:"0.04em",lineHeight:1.3}}>{galName(gid)}</h2>
            <Divider color={ac}/>
          </div>
          <GalleryView data={data} galleryId={gid} accent={ac} purchased={purchased} basket={basket} onBuyNow={onBuyNow} onAddBasket={onAddBasket}/>
        </div>
      </div>
    );
  }

  // Hub home
  const GalCard=({gid,desc})=>{
    const ac=accent(gid);
    return(
      <div className="card-hover" onClick={()=>{if(gid==="2"){setAgeOk(false);setAgeChecked(false);}setView(gid==="1"?"g1":"g2");}} style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:"32px 28px",cursor:"pointer",flex:1,minWidth:260,backgroundImage:`radial-gradient(ellipse at 50% 0%,${ac}09 0%,transparent 70%)`}}>
        <h3 style={{color:ac,fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:400,fontStyle:"italic",lineHeight:1.3,marginBottom:10}}>{galName(gid)}</h3>
        <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",lineHeight:1.7,marginBottom:20}}>{desc}</p>
        <div style={{color:ac,fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:"0.12em"}}>Enter Gallery →</div>
      </div>
    );
  };

  return(
    <div style={{maxWidth:980,margin:"0 auto"}} className="fadeUp">
      <div style={{textAlign:"center",padding:"48px 0 36px"}}>
        <p style={{color:G.dim,fontSize:10,letterSpacing:"0.25em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:10}}>Private Collection</p>
        <h1 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,48px)",fontWeight:300,letterSpacing:"0.06em"}}>The Gallery</h1>
        <Divider/>
        {!subPlan?(
          <div style={{background:G.card,border:`1px solid ${G.gold}44`,borderRadius:4,padding:"22px 32px",display:"inline-flex",alignItems:"center",gap:24,marginBottom:16,flexWrap:"wrap",justifyContent:"center"}}>
            <div style={{textAlign:"left"}}>
              <div style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:18,fontStyle:"italic"}}>Become a Member</div>
              <div style={{color:G.smoke,fontSize:13,marginTop:4,fontFamily:"'EB Garamond',serif"}}>From £8.99/mo · Unlock galleries + 40% off all downloads</div>
            </div>
            <Btn size="lg" onClick={onOpenSub}>View Plans</Btn>
          </div>
        ):(
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:16}}>
            <span style={{color:G.gold,fontSize:12,fontFamily:"'Cinzel',serif",background:G.gold+"11",border:`1px solid ${G.gold}33`,padding:"8px 20px",borderRadius:2}}>✦ {PLANS[subPlan].label} · Active</span>
            <Btn variant="ghost" size="sm" onClick={onOpenSub}>Change Plan</Btn>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:20,flexWrap:"wrap",marginBottom:48}}>
        <GalCard gid="1" desc="Lifestyle, portraits and curated moments for any time of day."/>
        <GalCard gid="2" desc="Intimate and adult content. 18+ only. Password required."/>
      </div>
      <FeaturedImage data={data} galleryScope="hub" accent={G.gold}/>
      {/* Friends compact */}
      {data.friends&&data.friends.length>0&&(
        <div>
          <Divider/>
          <h3 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:400,fontStyle:"italic",marginBottom:20}}>Friends & Affiliates</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14}}>
            {data.friends.map(f=>(
              <a key={f.id} href={f.url||"#"} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}>
                <div className="card-hover" style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,overflow:"hidden"}}>
                  <div style={{aspectRatio:"16/9",background:`linear-gradient(135deg,${G.surface},${G.bg})`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                    {f.previewImg?<img src={f.previewImg} alt={f.name} style={{width:"100%",height:"100%",objectFit:"cover",opacity:.85}}/>:<span style={{fontSize:28,opacity:.1}}>✦</span>}
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,#08080acc,transparent)"}}/>
                  </div>
                  <div style={{padding:"14px 16px"}}>
                    <div style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:16,fontStyle:"italic",marginBottom:4}}>{f.name}</div>
                    {f.tagline&&<p style={{color:G.smoke,fontSize:12,fontFamily:"'EB Garamond',serif",lineHeight:1.5}}>{f.tagline}</p>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ADMIN  (unchanged structure, abbreviated)
// ══════════════════════════════════════════════════════════════════
function AdminPanel({data,setData}){
  const[unlocked,setUnlocked]=useState(false);
  const[tab,setTab]=useState("add");
  const[form,setForm]=useState({title:"",type:"photo",grouping:"solo",setId:"",price:"",path:"",gallery:"1",isAdult:false});
  const[newSet,setNewSet]=useState({name:"",gallery:"1"});
  const[friend,setFriend]=useState({name:"",tagline:"",url:"",previewImg:""});
  const[aff,setAff]=useState({name:"",img:"",url:"",gallery:"both"});
  const[feat,setFeat]=useState({img:"",url:"",caption:"",label:"",gallery:"hub",manualActive:false});
  const fileRef=useRef();
  if(!unlocked)return <LockScreen title="Admin Access" subtitle="Manage content, sets, pricing and affiliates." correctPw={CFG.adminPw} onUnlock={()=>setUnlocked(true)}/>;
  const upd=(fn)=>{const d={...data,...fn(data)};setData(d);saveData(d);};
  const addSet=()=>{if(!newSet.name.trim())return;upd(d=>({sets:[...d.sets,{id:uid(),name:newSet.name.trim(),gallery:newSet.gallery}]}));setNewSet({name:"",gallery:"1"});};
  const addItem=()=>{
    if(!form.title||!form.price||!form.path)return;
    const id=uid();
    upd(d=>({items:[...d.items,{id,...form,link:`${CFG.baseUrl}/item/${id}`,createdAt:Date.now()}]}));
    setForm({title:"",type:"photo",grouping:"solo",setId:"",price:"",path:"",gallery:"1",isAdult:false});
    if(fileRef.current)fileRef.current.value="";
  };
  const addFriend=()=>{if(!friend.name.trim())return;upd(d=>({friends:[...(d.friends||[]),{id:uid(),...friend}]}));setFriend({name:"",tagline:"",url:"",previewImg:""});};
  const TABS=[{id:"add",l:"Add Item"},{id:"sets",l:"Sets"},{id:"items",l:"All Items"},{id:"friends",l:"Friends"},{id:"affiliates",l:"Affiliate Pics"},{id:"featured",l:"Featured Pool"},{id:"requests",l:"Requests"}];
  return(
    <div style={{maxWidth:860,margin:"0 auto"}} className="fadeUp">
      <div style={{marginBottom:28}}>
        <p style={{color:G.dim,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:"'Cinzel',serif",marginBottom:6}}>Control Panel</p>
        <h2 style={{color:G.gold,fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:400}}>Admin — Content Manager</h2>
      </div>
      <div style={{display:"flex",gap:0,marginBottom:28,borderBottom:`1px solid ${G.border}`}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"transparent",border:"none",borderBottom:`2px solid ${tab===t.id?G.gold:"transparent"}`,color:tab===t.id?G.gold:G.smoke,fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:"0.12em",padding:"10px 18px",cursor:"pointer",transition:"all .2s",marginBottom:-1}}>{t.l}</button>)}
      </div>
      {tab==="add"&&(
        <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            <Inp label="Title" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Golden Hour #4"/>
            <Inp label="Price (£)" type="number" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="9.99"/>
            <Sel label="Content Type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}><option value="photo">📷 Photo</option><option value="video">🎬 Video</option></Sel>
            <Sel label="Gallery" value={form.gallery} onChange={e=>setForm(p=>({...p,gallery:e.target.value,setId:""}))}><option value="1">{CFG.gallery1Name}</option><option value="2">{CFG.gallery2Name}</option></Sel>
            <Sel label="Grouping" value={form.grouping} onChange={e=>setForm(p=>({...p,grouping:e.target.value,setId:e.target.value==="solo"?"":p.setId}))}><option value="solo">Solo Item</option><option value="set">Part of a Set</option><option value="fullset">Full Set (bundle)</option></Sel>
            {form.grouping!=="solo"&&<Sel label="Assign to Set" value={form.setId} onChange={e=>setForm(p=>({...p,setId:e.target.value}))}><option value="">— choose set —</option>{data.sets.filter(s=>s.gallery===form.gallery).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</Sel>}
            <div style={{gridColumn:"1/-1"}}>
              <Label>File (path reference)</Label>
              <input ref={fileRef} type="file" accept="image/*,video/*" onChange={e=>{const f=e.target.files[0];if(f)setForm(p=>({...p,path:`/content/${uid()}_${f.name.replace(/\s+/g,"_")}`}));}} style={{color:G.smoke,fontSize:13,width:"100%"}}/>
              {form.path&&<p style={{color:G.gold,fontSize:11,marginTop:6,fontFamily:"monospace"}}>Path: <code style={{color:G.goldLight}}>{form.path}</code></p>}
            </div>
            <div style={{gridColumn:"1/-1",display:"flex",alignItems:"center",gap:16}}>
              <Label>Adult Content?</Label>
              <button onClick={()=>setForm(p=>({...p,isAdult:!p.isAdult}))} style={{background:form.isAdult?G.rose+"22":"transparent",border:`1px solid ${form.isAdult?G.rose+"66":G.border}`,color:form.isAdult?G.rose:G.smoke,borderRadius:2,padding:"8px 16px",fontSize:12,fontFamily:"'Cinzel',serif",letterSpacing:"0.1em",cursor:"pointer",transition:"all .2s"}}>
                {form.isAdult?"🔞 Adult":"✓ General"}
              </button>
            </div>
          </div>
          <div style={{marginTop:24,display:"flex",justifyContent:"flex-end",gap:12}}>
            <Btn variant="dark" onClick={()=>setForm({title:"",type:"photo",grouping:"solo",setId:"",price:"",path:"",gallery:"1",isAdult:false})}>Clear</Btn>
            <Btn onClick={addItem} disabled={!form.title||!form.price||!form.path}>Add to Gallery</Btn>
          </div>
        </div>
      )}
      {tab==="sets"&&(
        <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
          <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
            <input value={newSet.name} onChange={e=>setNewSet(p=>({...p,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addSet()} placeholder="New set name…" style={{...iStyle,flex:1,minWidth:160}}/>
            <Sel value={newSet.gallery} onChange={e=>setNewSet(p=>({...p,gallery:e.target.value}))} style={{width:200}}><option value="1">{CFG.gallery1Name}</option><option value="2">{CFG.gallery2Name}</option></Sel>
            <Btn onClick={addSet}>Create Set</Btn>
          </div>
          {data.sets.length===0&&<p style={{color:G.dim,fontFamily:"'EB Garamond',serif",fontStyle:"italic"}}>No sets yet.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {data.sets.map(s=>(
              <div key={s.id} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:2,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                <div style={{flex:1}}><span style={{color:G.text,fontSize:14,fontWeight:600}}>{s.name}</span><span style={{color:G.dim,fontSize:11,marginLeft:12}}>{data.items.filter(i=>i.setId===s.id).length} items</span></div>
                <Btn variant="danger" size="sm" onClick={()=>upd(d=>({sets:d.sets.filter(x=>x.id!==s.id),items:d.items.map(i=>i.setId===s.id?{...i,setId:"",grouping:"solo"}:i)}))}>Remove</Btn>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab==="items"&&(
        <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
          <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",marginBottom:18}}>{data.items.length} items total</p>
          {data.items.length===0&&<p style={{color:G.dim,fontStyle:"italic",fontFamily:"'EB Garamond',serif"}}>No items yet.</p>}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {data.items.map(item=>{
              const sn=data.sets.find(s=>s.id===item.setId)?.name;
              return(
                <div key={item.id} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:2,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <span style={{fontSize:16}}>{item.type==="video"?"🎬":"🖼️"}</span>
                  <div style={{flex:1,minWidth:140}}><div style={{color:G.text,fontSize:14,fontWeight:600}}>{item.title}</div><div style={{color:G.dim,fontSize:11,marginTop:3}}>{sn?`Set: ${sn}`:"Solo"} · {fmt(item.price)} · G{item.gallery}</div></div>
                  <Badge color={item.isAdult?G.rose:G.success}>{item.isAdult?"🔞":"✓"}</Badge>
                  <Btn variant={item.isAdult?"ghost":"ghostRose"} size="sm" onClick={()=>upd(d=>({items:d.items.map(i=>i.id===item.id?{...i,isAdult:!i.isAdult}:i)}))}>Toggle Adult</Btn>
                  <Btn variant="danger" size="sm" onClick={()=>upd(d=>({items:d.items.filter(i=>i.id!==item.id)}))}>Remove</Btn>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {tab==="friends"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
            <h3 style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,marginBottom:20}}>Add Affiliate</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Inp label="Name / Handle" value={friend.name} onChange={e=>setFriend(p=>({...p,name:e.target.value}))} placeholder="e.g. Scarlet Rose"/>
              <Inp label="Their Site URL" value={friend.url} onChange={e=>setFriend(p=>({...p,url:e.target.value}))} placeholder="https://…"/>
              <Inp label="Short tagline" value={friend.tagline} onChange={e=>setFriend(p=>({...p,tagline:e.target.value}))} placeholder="e.g. Boudoir & lifestyle"/>
              <Inp label="Preview image URL" value={friend.previewImg} onChange={e=>setFriend(p=>({...p,previewImg:e.target.value}))} placeholder="https://hosted-image.jpg"/>
            </div>
            <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><Btn onClick={addFriend} disabled={!friend.name.trim()}>Add Affiliate</Btn></div>
          </div>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
            <h3 style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,marginBottom:16}}>Current Affiliates ({(data.friends||[]).length})</h3>
            {(!data.friends||data.friends.length===0)&&<p style={{color:G.dim,fontStyle:"italic",fontFamily:"'EB Garamond',serif"}}>No affiliates yet.</p>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(data.friends||[]).map(f=>(
                <div key={f.id} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:2,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  {f.previewImg&&<img src={f.previewImg} alt="" style={{width:44,height:44,objectFit:"cover",borderRadius:2}}/>}
                  <div style={{flex:1,minWidth:120}}><div style={{color:G.text,fontSize:14,fontWeight:600}}>{f.name}</div><div style={{color:G.gold,fontSize:11,marginTop:2}}>{f.url}</div></div>
                  <Btn variant="danger" size="sm" onClick={()=>upd(d=>({friends:d.friends.filter(x=>x.id!==f.id)}))}>Remove</Btn>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==="affiliates"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
            <h3 style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,marginBottom:6}}>Add Affiliate Picture</h3>
            <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginBottom:20}}>These appear as small thumbnail strips between your sets, earning you commission when clicked.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Inp label="Label / Name" value={aff.name} onChange={e=>setAff(p=>({...p,name:e.target.value}))} placeholder="e.g. Mia — Boudoir"/>
              <Inp label="Affiliate URL" value={aff.url} onChange={e=>setAff(p=>({...p,url:e.target.value}))} placeholder="https://your-affiliate-link.com"/>
              <Inp label="Thumbnail image URL" value={aff.img} onChange={e=>setAff(p=>({...p,img:e.target.value}))} placeholder="https://hosted-image.jpg"/>
              <Sel label="Show in" value={aff.gallery} onChange={e=>setAff(p=>({...p,gallery:e.target.value}))}>
                <option value="both">Both galleries</option>
                <option value="1">{CFG.gallery1Name.split(",")[0]} only</option>
                <option value="2">{CFG.gallery2Name.split(",")[0]} only</option>
              </Sel>
            </div>
            {aff.img&&<div style={{marginTop:14}}><img src={aff.img} alt="preview" style={{height:80,borderRadius:2,border:`1px solid ${G.border}`,objectFit:"cover"}}/></div>}
            <div style={{marginTop:20,display:"flex",justifyContent:"flex-end"}}><Btn onClick={()=>{if(!aff.url.trim())return;upd(d=>({affiliates:[...(d.affiliates||[]),{id:uid(),...aff}]}));setAff({name:"",img:"",url:"",gallery:"both"});}} disabled={!aff.url.trim()}>Add Affiliate</Btn></div>
          </div>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
            <h3 style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,marginBottom:16}}>Current Affiliates ({(data.affiliates||[]).length})</h3>
            {(!(data.affiliates)||data.affiliates.length===0)&&<p style={{color:G.dim,fontStyle:"italic",fontFamily:"'EB Garamond',serif"}}>No affiliate pictures yet.</p>}
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(data.affiliates||[]).map(a=>(
                <div key={a.id} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:2,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  {a.img&&<img src={a.img} alt="" style={{width:52,height:52,objectFit:"cover",borderRadius:2,border:`1px solid ${G.border}`,flexShrink:0}}/>}
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{color:G.text,fontSize:14,fontWeight:600}}>{a.name||"Unnamed"}</div>
                    <div style={{color:G.gold,fontSize:11,marginTop:2,wordBreak:"break-all"}}>{a.url}</div>
                    <div style={{color:G.dim,fontSize:11,marginTop:2}}>Shows in: {a.gallery==="both"?"Both galleries":a.gallery==="1"?"Gallery 1":"Gallery 2"}</div>
                  </div>
                  <Btn variant="danger" size="sm" onClick={()=>upd(d=>({affiliates:(d.affiliates||[]).filter(x=>x.id!==a.id)}))}>Remove</Btn>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {tab==="featured"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:G.card,border:`1px solid ${G.border}`,borderRadius:4,padding:28}}>
            <h3 style={{color:G.text,fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:400,marginBottom:6}}>Add to Featured Pool</h3>
            <p style={{color:G.smoke,fontSize:13,fontFamily:"'EB Garamond',serif",fontStyle:"italic",marginBottom:20}}>Up to 3 images auto-rotate weekly. Toggle "Override" on any one to pin it as this week's feature.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Inp label="Image URL (wide format works best)" value={feat.img} onChange={e=>setFeat(p=>({...p,img:e.target.value}))} placeholder="https://hosted-wide-image.jpg"/>
              <Inp label="Clic