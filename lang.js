(function(){
var lang='bn';try{lang=localStorage.getItem('lang')||'bn'}catch(e){}
var EX={
'সেবা':'Services',
'কীভাবে':'How it works',
'স্টাইল':'Styles',
'শুরু করুন':'Get started',
'৩ডি ধারণা-মডেল':'3D concept models',
'মাটিতে নামার আগেই':'Before breaking ground,',
'দেখুন আপনার বাড়ি':'see your home',
'জমির মাপ দিন। ২ডি থেকে ৩ডি, নির্মাণের সময়, খরচ আর ফাইনাল লাইভ ভিউ, সব এক জায়গায়, ফোনেই।':'Enter your plot size. From 2D and 3D to the construction timeline, cost and a final live view, all in one place, on your phone.',
'জমির মাপ দিয়ে শুরু করুন →':'Start with your plot size →',
'স্টাইল দেখুন':'Browse styles',
'ধারণা-মডেল, চূড়ান্ত নকশা নয়':'Concept model, not a final drawing',
'২৮৮০':'2,880',
'ডিজাইন স্টাইল':'design styles',
'২ডি → লাইভ':'2D → Live',
'ধাপে ধাপে ৫টি ভিউ':'5 views, step by step',
'ফোনে':'On phone',
'আঙুলে ঘুরিয়ে দেখুন':'Rotate with your finger',
'জমির মাপ + স্টাইল':'Plot + Style',
'২ডি, ৩ডি, ৪ডি, ৫ডি ও ফাইনাল লাইভ':'2D, 3D, 4D, 5D and final live',
'২৮৮০ সমন্বয় থেকে বেছে নিন':'Choose from 2,880 combinations',
'স্টাইল গ্যালারি':'Style gallery',
'রং, আসবাব, দিন-রাতের আলো':'Colours, furniture, day-night light',
'প্রজেক্ট রিভিউ':'Project review',
'কোড দিয়ে নিজের নকশা দেখুন':'See your own drawing with a code',
'তিন ধাপে সিদ্ধান্ত':'Decide in three steps',
'১':'1',
'২':'2',
'৩':'3',
'জমির মাপ দিন':'Enter your plot size',
'দৈর্ঘ্য, প্রস্থ আর তলার সংখ্যা লিখুন।':'Type the length, width and number of floors.',
'স্টাইল বাছুন':'Choose a style',
'ছাদ, জানালা, রং ও বারান্দার ২৮৮০টি সমন্বয় থেকে।':'From 2,880 combinations of roof, windows, colour and balcony.',
'ভেতর-বাইরে দেখুন':'See inside and out',
'নির্মাণের সময় ও আনুমানিক খরচও দেখুন।':'See the construction timeline and estimated cost too.',
'কয়েকটি স্টাইলের নমুনা':'A few style samples',
'সব স্টাইল দেখুন':'See all styles',
'আপনার জমির মাপ কত?':'What is your plot size?',
'মাপ দিয়ে এখনই নিজের বাড়ির ধারণা দেখুন।':'Enter your size and see your home concept right now.',
'© Shah Neil Khan · এখানকার সব মডেল প্রাথমিক ধারণা দেখানোর জন্য, চূড়ান্ত নকশা বা নির্মাণ-নকশা নয়।':'© Shah Neil Khan · All models here are preliminary concepts, not final or construction drawings.',
'ফোন করুন':'Call','ইমেইল':'Email','যোগাযোগ':'Contact',
'2D প্ল্যান':'2D Plan','3D বাইরে':'3D Outside','3D ভেতরে':'3D Inside','4D সময়':'4D Timeline','5D খরচ':'5D Cost','ফাইনাল লাইভ':'Final Live',
'জমির মাপ দিন, পছন্দের স্টাইলে ২ডি, ৩ডি, ৪ডি (সময়), ৫ডি (খরচ) ও ফাইনাল লাইভ ভিউ দেখুন।':'Enter your plot size and see it in 2D, 3D, 4D (time), 5D (cost) and a final live view.',
'← হোম':'← Home',
'৩ডি ডিজাইনার · বাড়ির ইন্টেরিয়র ও এক্সটেরিয়র ধারণা-মডেল':'3D Designer · Home interior & exterior concept models',
'জমির মাপ + ডিজাইন স্টাইল':'Plot Size + Design Style',
'জমির মাপ দিন, পছন্দের স্টাইলে বিল্ডিং দেখুন, ভেতর ও বাইরে, সাথে আনুমানিক খরচ।':'Enter your plot size, see the building in your chosen style, inside and out, with an estimated cost.',
'ডিজাইন স্টাইল গ্যালারি':'Design Style Gallery',
'২৮৮০টি স্টাইল সমন্বয় থেকে পছন্দ বেছে নিন।':'Choose from 2,880 style combinations.',
'নিজের ঘর সাজান':'Decorate Your Room',
'রং বদলান, আসবাব সরান, দিন-রাতের আলো ও দরজা খুলে দেখুন।':'Change colours, move furniture, try day and night lighting, and open the door.',
'আমার প্রজেক্ট রিভিউ':'My Project Review',
'আপনার প্রজেক্ট কোড দিয়ে নিজের নকশা ও ৩ডি দেখুন।':'Enter your project code to see your drawing and 3D model.',
'এখানকার সব মডেল প্রাথমিক ধারণা দেখানোর জন্য, চূড়ান্ত নকশা বা নির্মাণ-নকশা নয়।':'All models here are preliminary concepts, not final or construction drawings.',
'জমির দৈর্ঘ্য':'Plot length','জমির প্রস্থ':'Plot width','তলা':'Floors','একক':'Unit','ফুট':'Feet','মিটার':'Metres',
'বাইরে':'Outside','ভেতরে':'Inside','প্ল্যান (উপর থেকে)':'Plan (top view)','মান':'Quality','সাধারণ':'Basic','মধ্যম':'Standard','উন্নত':'Premium',
'সাধারণ ৳/ফুট²':'Basic ৳/sq ft','মধ্যম ৳/ফুট²':'Standard ৳/sq ft','উন্নত ৳/ফুট²':'Premium ৳/sq ft',
'যেকোনো স্টাইল':'Random style','তলা দেখুন':'Show floors','যেকোনো একটি':'Random','আগের ১২টি':'Previous 12','পরের ১২টি':'Next 12','আগের':'Previous','পরের':'Next',
'রং':'Colour','বাঁয়ে':'Left','পেছনে':'Back','সামনে':'Front','ডানে':'Right','সরান':'Move','রিসেট':'Reset','দেখান/লুকান':'Show/Hide','সময়':'Time',
'☀️ দিন':'☀️ Day','🌇 সন্ধ্যা':'🌇 Evening','🌙 রাত':'🌙 Night','💡 বাতি':'💡 Light','🚪 দরজা':'🚪 Door',
'যেকোনো জিনিসে ট্যাপ করুন: দেয়াল, মেঝে, সোফা...':'Tap anything: wall, floor, sofa...',
'আগে কোনো জিনিসে ট্যাপ করুন':'Tap an item first',
'প্রজেক্ট কোড':'Project code','খুলুন':'Open','কোড মেলেনি':'Code not found','ছবি নেই':'No image','যেমন A7K2':'e.g. A7K2'
};
var TM=[
['কাঠামো ও দেয়াল','Structure & walls'],['ভিত ও মাটির কাজ','Foundation & earthwork'],['ফিনিশিং','Finishing'],['ছাদ','Roof'],['(উদাহরণ সময়সূচি)','(illustrative schedule)'],['কাজ:','Work:'],['মাস ','Month '],['খরচ এখন:','Cost so far:'],['ফাইনাল লাইভ ভিউ: ধীরে ঘুরছে, দিন থেকে রাত','Final live view: slowly rotating, from day to night'],
['জমির মাপ + ডিজাইন স্টাইল','Plot Size + Design Style'],['ডিজাইন স্টাইল গ্যালারি','Design Style Gallery'],['নিজের ঘর সাজান','Decorate Your Room'],
['প্রাথমিক ধারণা-মডেল','Preliminary concept model'],['২৮৮০টি স্টাইল সমন্বয়','2,880 style combinations'],['২৮৮০ স্টাইল','2,880 styles'],
['ছাদ, সম্মুখভাগ, রং, জানালা, বারান্দা','roof, facade, colour, windows, balcony'],
['আগের স্টাইল','Previous style'],['পরের স্টাইল','Next style'],['স্টাইল নম্বর','Style number'],
['জমি:','Plot:'],['প্রতি তলা:','Per floor:'],['মোট (','Total ('],['· মোট','· Total'],['তলা পর্যন্ত','floors'],['তলা দেখুন','Show floors'],['তলা','floors'],
['আনুমানিক খরচ:','Estimated cost:'],['সম্ভাব্য সীমা','likely range'],['কোটি','crore'],['লাখ','lakh'],['ফুট²','sq ft'],['মি²','m²'],
['স্টাইল #','Style #'],['স্টাইল','Style'],['রং:','Colour:'],
['সমতল + সিঁড়িঘর','Flat roof + stair house'],['সমতল ছাদ','Flat roof'],['ঢালু (গেবল) ছাদ','Gable roof'],['চার-ঢালু ছাদ','Hip roof'],['একমুখী ঢালু ছাদ','Shed roof'],['বাঁকা (ব্যারেল) ছাদ','Barrel roof'],
['সাধারণ জানালা','Regular windows'],['লম্বা ফিতা-জানালা','Ribbon windows'],['বড় কাচের সামনে','Large glass front'],['লম্বা সরু জানালা','Tall slim windows'],['জানালা + উল্লম্ব ফিন','Windows + vertical fins'],
['ইটের লাল','Brick red'],['কালো-সোনালি','Black-gold'],['সাদা','White'],['ধূসর','Grey'],['মাটি','Earth'],['আকাশি','Sky blue'],['সবুজাভ','Sage'],['বালু','Sand'],
['নীল কাচ','Blue glass'],['গাঢ় কাচ','Dark glass'],['উষ্ণ আলো','Warm light'],['সবুজ কাচ','Green glass'],
['বারান্দা নেই','No balcony'],['সামনে বারান্দা','Front balcony'],['নিচে পোর্চ ও ছাউনি','Porch with canopy'],
['বাছাই:','Selected:'],['— নিচে রং বা সরানোর বাটন চাপুন','— use the colour or move buttons below'],
['কফি টেবিল','Coffee table'],['টিভি ইউনিট','TV unit'],['বইয়ের তাক','Bookshelf'],['কার্পেট','Rug'],['ল্যাম্প','Lamp'],['সোফা','Sofa'],['মেঝে','Floor'],['দেয়াল','Walls'],['দরজা','Door'],['গাছ','Plant']
].sort(function(a,b){return b[0].length-a[0].length});
function tr(s){var t=s.trim();if(!t)return s;if(EX[t])return s.replace(t,EX[t]);var o=s;for(var i=0;i<TM.length;i++){if(o.indexOf(TM[i][0])>-1)o=o.split(TM[i][0]).join(TM[i][1])}return o}
var AT=['placeholder','aria-label','title','alt'];
function walk(n){
 if(n.nodeType===3){var v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}
 if(n.nodeType!==1)return;var g=n.tagName;if(g==='SCRIPT'||g==='STYLE'||g==='TEXTAREA'||g==='IFRAME')return;
 AT.forEach(function(a){var x=n.getAttribute(a);if(x){var y=tr(x);if(y!==x)n.setAttribute(a,y)}});
 for(var c=n.firstChild;c;c=c.nextSibling)walk(c)}
function init(){
 var b=document.createElement('button');b.textContent=lang==='en'?'বাংলা':'EN';b.setAttribute('aria-label','Language');b.id='langbtn';
 b.style.cssText='position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);right:96px;z-index:50;background:rgba(22,21,26,.88);border:1px solid #4a3f27;color:#d4af37;padding:6px 12px;border-radius:999px;font:.8rem system-ui,sans-serif;cursor:pointer';
 b.onclick=function(){try{localStorage.setItem('lang',lang==='en'?'bn':'en')}catch(e){}location.reload()};
 document.body.appendChild(b);
 if(lang!=='en')return;
 document.documentElement.lang='en';document.title=tr(document.title);walk(document.body);
 new MutationObserver(function(ms){ms.forEach(function(m){
  if(m.type==='childList')m.addedNodes.forEach(walk);else walk(m.target)})}).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:AT});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
