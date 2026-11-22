/* Minigame 3D "Dạo phố" — mỗi bài học là một khu phố Nhật.
   Đồ vật, công trình là từ mới; NPC hỏi chuyện bằng ngữ pháp của bài.
   Three.js tải từ CDN khi mở game, trang chính không phải tải nặng. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/+esm";
import {GLTFLoader} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js/+esm";
import {MeshoptDecoder} from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js/+esm";

/* ---------------- dữ liệu bài 1 ---------------- */
const FLAGS=["nihon","betonamu","tai","kankoku","chuugoku","indoneshia","indo","amerika","igirisu","furansu","doitsu","burajiru"];
const W1={
  daigaku:["大学{だいがく}","trường đại học","Ví dụ: さくら大学の 学生 (sinh viên ĐH Sakura)"],
  byouin:["病院{びょういん}","bệnh viện","Ví dụ: やまだ病院 (bệnh viện Yamada)"],
  denki:["電気{でんき}","điện, đèn điện","Đèn đường thắp bằng 電気"],
  nihon:["日本{にほん}","nước Nhật Bản","日本人{にほんじん}: người Nhật"],
  betonamu:["ベトナム","nước Việt Nam","ベトナム人{じん}: người Việt Nam"],
  tai:["タイ","nước Thái Lan","タイ人{じん}: người Thái"],
  kankoku:["韓国{かんこく}","nước Hàn Quốc","韓国人{かんこくじん}: người Hàn"],
  chuugoku:["中国{ちゅうごく}","nước Trung Quốc","中国人{ちゅうごくじん}: người Trung Quốc"],
  indoneshia:["インドネシア","nước Indonesia","インドネシア人{じん}: người Indonesia"],
  indo:["インド","nước Ấn Độ","インド人{じん}: người Ấn Độ"],
  amerika:["アメリカ","nước Mỹ","アメリカ人{じん}: người Mỹ"],
  igirisu:["イギリス","nước Anh","イギリス人{じん}: người Anh"],
  furansu:["フランス","nước Pháp","フランス人{じん}: người Pháp"],
  doitsu:["ドイツ","nước Đức","ドイツ人{じん}: người Đức"],
  burajiru:["ブラジル","nước Brazil","ブラジル人{じん}: người Brazil"],
  gakusei:["学生{がくせい}","học sinh, sinh viên","ゆいさんは さくら大学の 学生です"],
  kyoushi:["教師{きょうし}","giáo viên (nói về nghề của mình)","Gọi thầy cô của người khác thì dùng 先生{せんせい}"],
  kenkyuusha:["研究者{けんきゅうしゃ}","nhà nghiên cứu","もりさんは 研究者です"],
  isha:["医者{いしゃ}","bác sĩ","やまださんは 医者です"],
  ginkouin:["銀行員{ぎんこういん}","nhân viên ngân hàng","イさんは さくら銀行の 銀行員です"],
  kaishain:["会社員{かいしゃいん}","nhân viên công ty","ABCの 社員{しゃいん}: nhân viên của công ty ABC"],
  enjinia:["エンジニア","kỹ sư","わたしも エンジニアです"]
};
const NPC1=[
 {id:"yui",name:"ゆい",vn:"Yui",job:"Sinh viên",pos:[-13,-8.6],look:{skin:"#ffe0c7",hair:"#3b2a26",style:"long",top:"#f28fb0",bottom:"#3b4a7a",fem:1,eye:"#6a3d2a"},learn:["gakusei"],steps:[
  {n:"はじめまして。わたしは ゆいです。",v:"Rất vui được gặp bạn. Mình là Yui."},
  {q:"Chào lại và tự giới thiệu mình",o:[["はじめまして。タイです。どうぞ よろしく お願{ねが}いします。","Rất vui được gặp. Mình là Tài. Rất mong được giúp đỡ."],
    ["はじめまして。タイさんです。","","Không thêm さん sau tên của chính mình: さん chỉ dùng để gọi người khác."],
    ["さようなら。タイです。","","さようなら là “tạm biệt”, không dùng khi mới gặp lần đầu."]]},
  {n:"タイさんは 学生{がくせい}ですか。",v:"Tài là sinh viên à?"},
  {q:"Bạn là kỹ sư, không phải sinh viên",o:[["いいえ、学生{がくせい}じゃ ありません。エンジニアです。","Không, mình không phải sinh viên. Mình là kỹ sư."],
    ["はい、学生{がくせい}じゃ ありません。","","Câu phủ định thì mở đầu bằng いいえ (không), không phải はい."],
    ["いいえ、学生{がくせい}は エンジニアです。","","Câu này thành “sinh viên là kỹ sư”. Chủ đề ở đây là bạn, không phải 学生."]]},
  {n:"そうですか。わたしは さくら大学{だいがく}の 学生{がくせい}です。",v:"Vậy à. Mình là sinh viên của Đại học Sakura."}]},
 {id:"kimura",name:"きむら",vn:"Kimura",job:"Giáo viên",pos:[-20,-12.4],look:{skin:"#f6d2b3",hair:"#6d6a70",style:"short",top:"#5a6b4f",bottom:"#3a3a44",acc:"glasses"},learn:["kyoushi"],steps:[
  {n:"こんにちは。わたしは きむらです。さくら大学{だいがく}の 教師{きょうし}です。",v:"Xin chào. Tôi là Kimura, giáo viên Đại học Sakura."},
  {n:"あの 人{ひと}は だれですか。",v:"(chỉ về phía cô gái áo hồng) Người kia là ai vậy?"},
  {q:"Trả lời: người kia là Yui",o:[["あの 人{ひと}は ゆいさんです。","Người kia là chị Yui."],
    ["わたしは ゆいさんです。","","わたしは là “tôi là”. Đang nói về người kia thì dùng あの人は."],
    ["あの 人{ひと}は だれです。","","だれ là từ để hỏi “ai”, không dùng trong câu trả lời."]]},
  {n:"ゆいさんは さくら大学{だいがく}の 学生{がくせい}ですか。",v:"Yui là sinh viên của Đại học Sakura à?"},
  {q:"Xác nhận là đúng",o:[["はい、さくら大学{だいがく}の 学生{がくせい}です。","Vâng, là sinh viên Đại học Sakura."],
    ["はい、学生{がくせい}の さくら大学{だいがく}です。","","の nối “thứ sở hữu” đứng trước: さくら大学の学生 = sinh viên của ĐH Sakura. Đảo lại thành “ĐH Sakura của sinh viên”."],
    ["いいえ、さくら大学{だいがく}の 学生{がくせい}です。","","Đồng ý “đúng vậy” thì mở đầu bằng はい."]]},
  {n:"はい、そうです。どうぞ よろしく。",v:"Đúng vậy. Rất vui được làm quen. (Người khác sẽ gọi thầy là きむら先生{せんせい}.)"}]},
 {id:"mori",name:"もり",vn:"Mori",job:"Nhà nghiên cứu",pos:[-11.8,-22.4],look:{skin:"#ffe3cc",hair:"#1f1b24",style:"bun",top:"#8fb3d9",bottom:"#4a5a7a",acc:"coat",fem:1,eye:"#3a2a40"},learn:["kenkyuusha"],steps:[
  {n:"しつれいですが、お名前{なまえ}は？",v:"Xin lỗi, cho hỏi tên bạn là gì ạ?"},
  {q:"Nói tên của bạn",o:[["タイです。","Tôi là Tài."],
    ["お名前{なまえ}は タイです。","","お名前 là cách hỏi lịch sự tên người khác. Nói về mình chỉ cần “タイです”."],
    ["タイさんです。","","Không thêm さん sau tên của chính mình."]]},
  {n:"わたしは もりです。さくら大学{だいがく}の 研究者{けんきゅうしゃ}です。",v:"Tôi là Mori, nhà nghiên cứu của Đại học Sakura."},
  {n:"タイさんも 研究者{けんきゅうしゃ}ですか。",v:"Tài cũng là nhà nghiên cứu à?"},
  {q:"Bạn không phải nhà nghiên cứu",o:[["いいえ、研究者{けんきゅうしゃ}じゃ ありません。","Không, tôi không phải nhà nghiên cứu."],
    ["いいえ、わたしも 研究者{けんきゅうしゃ}です。","","Nói いいえ (không) rồi lại nói “tôi cũng là nhà nghiên cứu” là mâu thuẫn."],
    ["はい、研究者{けんきゅうしゃ}じゃ ありません。","","Câu phủ định thì mở đầu bằng いいえ."]]},
  {n:"そうですか。どうぞ よろしく お願{ねが}いします。",v:"Vậy à. Rất mong được giúp đỡ."}]},
 {id:"yamada",name:"やまだ",vn:"Yamada",job:"Bác sĩ",pos:[15.6,-10.6],look:{skin:"#f3cfae",hair:"#2a2220",style:"short",top:"#ffffff",bottom:"#3d6f8f",acc:"coat"},learn:["isha"],steps:[
  {n:"こんにちは。わたしは やまだです。医者{いしゃ}です。",v:"Xin chào. Tôi là Yamada. Tôi là bác sĩ."},
  {n:"あの 方{かた}も 医者{いしゃ}です。",v:"(chỉ vị đứng ở cửa bệnh viện) Vị kia cũng là bác sĩ."},
  {q:"Hỏi lại cho chắc: vị kia cũng là bác sĩ à?",o:[["あの 方{かた}も 医者{いしゃ}ですか。","Vị kia cũng là bác sĩ ạ?"],
    ["あの 方{かた}は 医者{いしゃ}も ですか。","","も đứng ngay sau chủ đề, thay cho は: あの方も…"],
    ["あの 方{かた}も 医者{いしゃ}か です。","","か luôn đặt ở cuối câu: …ですか。"]]},
  {n:"はい、そうです。",v:"Vâng, đúng vậy."}]},
 {id:"lee",name:"イ",vn:"Lee",job:"Nhân viên ngân hàng",pos:[-20,8.6],look:{skin:"#ffe2cc",hair:"#191820",style:"spiky",top:"#2f3a5a",bottom:"#2a2d3a",acc:"tie"},learn:["ginkouin"],steps:[
  {n:"はじめまして。イです。韓国{かんこく}から 来{き}ました。",v:"Rất vui được gặp. Tôi là Lee. Tôi đến từ Hàn Quốc."},
  {n:"タイさんは ベトナム人{じん}ですか。",v:"Tài là người Việt Nam phải không?"},
  {q:"Trả lời và nói bạn đến từ đâu",o:[["はい、ベトナム人{じん}です。ベトナムから 来{き}ました。","Vâng, tôi là người Việt. Tôi đến từ Việt Nam."],
    ["はい、ベトナムです。","","Nói quốc tịch của một người: tên nước + 人 (じん) → ベトナム人."],
    ["はい、ベトナム人{じん}から 来{き}ました。","","から đi với nơi chốn: ベトナムから (từ Việt Nam), không phải ベトナム人から."]]},
  {n:"わたしは さくら銀行{ぎんこう}の 銀行員{ぎんこういん}です。",v:"Tôi là nhân viên của ngân hàng Sakura."}]},
 {id:"ken",name:"けん",vn:"Ken",job:"Bé trai",pos:[12.6,11.6],kid:true,look:{skin:"#ffe6d2",hair:"#3a2a20",style:"cap",top:"#ffcf4a",bottom:"#3d6fd6"},learn:[],steps:[
  {n:"ぼくは けんです！ 6さいです！",v:"Cháu là Ken! Cháu 6 tuổi!"},
  {n:"クイズです！ ぼくは なんさいですか。",v:"Đố nè! Cháu mấy tuổi?"},
  {q:"Trả lời câu đố của Ken",o:[["けんくんは 6さいです。","Bé Ken 6 tuổi."],
    ["けんさんは 6じんです。","","人 (じん) là “người nước…”; tuổi dùng 歳 (さい). Gọi bé trai thân mật dùng くん."],
    ["けんくんは 6さいですか。","","Câu trả lời không cần か, vì か biến câu thành câu hỏi."]]},
  {n:"せいかい！ ありがとう、タイさん！",v:"Đúng rồi! Cảm ơn anh Tài!"}]},
 {id:"sato",name:"サトウ",vn:"Satō",job:"Kỹ sư",pos:[-8.4,19.4],look:{skin:"#f7d6b8",hair:"#2b2321",style:"short",top:"#e7eef7",bottom:"#2a2d3a",acc:"tie"},learn:["enjinia","kaishain"],steps:[
  {n:"はじめまして、サトウです。ABCの 社員{しゃいん}です。",v:"Rất vui được gặp, tôi là Satō, nhân viên công ty ABC."},
  {n:"わたしは エンジニアです。タイさんは？",v:"Tôi là kỹ sư. Còn Tài?"},
  {q:"Bạn cũng là kỹ sư",o:[["わたしも エンジニアです。","Tôi cũng là kỹ sư."],
    ["わたしは エンジニアも です。","","も thay cho は, đứng ngay sau chủ đề: わたしも…"],
    ["わたしも エンジニアじゃ ありません。","","Bạn là kỹ sư, câu này nói ngược nghĩa."]]},
  {n:"そうですか！ どうぞ よろしく お願{ねが}いします。",v:"Vậy à! Rất mong được giúp đỡ."}]}
];
const LEVELS={1:{title:"はじめまして通り",sub:"Phố Làm quen · Bài 1",words:W1,npcs:NPC1}};
export const hasLevel=n=>!!LEVELS[n];

/* ---------------- tiện ích dựng hình ---------------- */
const TAU=Math.PI*2;
let gradTex=null;
function toonGrad(){if(gradTex)return gradTex;const d=new Uint8Array([90,90,90,255,170,170,170,255,255,255,255,255]);gradTex=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);gradTex.minFilter=gradTex.magFilter=THREE.NearestFilter;gradTex.needsUpdate=true;return gradTex}
const MC=new Map();
const M=(c,o={})=>{const k=c+JSON.stringify(o);if(!MC.has(k))MC.set(k,new THREE.MeshToonMaterial({color:c,gradientMap:toonGrad(),...o}));return MC.get(k)};
function box(w,h,d,c,x=0,y=0,z=0){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==="string"?M(c):c);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;return m}
function cyl(rt,rb,h,c,x=0,y=0,z=0,seg=12){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),M(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;return m}
function sph(r,c,x=0,y=0,z=0,ws=16,hs=12){const m=new THREE.Mesh(new THREE.SphereGeometry(r,ws,hs),M(c));m.position.set(x,y,z);m.castShadow=true;return m}
function canvasTex(w,h,draw){const c=document.createElement("canvas");c.width=w;c.height=h;const g=c.getContext("2d");draw(g,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t}
const JPF='"Kaisei Decol","Hiragino Mincho ProN","Yu Mincho",serif', VNF='"Be Vietnam Pro",system-ui,sans-serif';
function sign(text,sub,{w=4,h=1.2,bg="#fffaf0",fg="#2b2540",border="#c23b2a"}={}){
  const t=canvasTex(512,Math.round(512*h/w),(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle=border;g.lineWidth=14;g.strokeRect(7,7,W-14,H-14);
    g.fillStyle=fg;g.textAlign="center";g.textBaseline="middle";const fs=Math.min(H*(sub?.5:.62),W/(text.length*1.05));g.font=`700 ${fs}px ${JPF}`;g.fillText(text,W/2,sub?H*.42:H/2);
    if(sub){g.font=`600 ${H*.2}px ${VNF}`;g.fillStyle="#6b604f";g.fillText(sub,W/2,H*.8)}});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));m.userData.sign=text;return m}
function star(g,cx,cy,r,rot=0){g.beginPath();for(let i=0;i<10;i++){const a=rot-Math.PI/2+i*Math.PI/5,rr=i%2?r*.4:r;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}g.closePath();g.fill()}
function flagTex(k){return canvasTex(192,128,(g,W,H)=>{
  const st=(cols,vert)=>cols.forEach((c,i)=>{g.fillStyle=c;vert?g.fillRect(i*W/cols.length,0,W/cols.length+1,H):g.fillRect(0,i*H/cols.length,W,H/cols.length+1)});
  if(k==="nihon"){g.fillStyle="#fff";g.fillRect(0,0,W,H);g.fillStyle="#bc002d";g.beginPath();g.arc(W/2,H/2,H*.3,0,TAU);g.fill()}
  else if(k==="betonamu"){g.fillStyle="#da251d";g.fillRect(0,0,W,H);g.fillStyle="#ffcd00";star(g,W/2,H/2,H*.3)}
  else if(k==="tai")st(["#a51931","#f4f5f8","#2d2a4a","#2d2a4a","#f4f5f8","#a51931"]);
  else if(k==="indoneshia")st(["#ce1126","#fff"]);
  else if(k==="furansu")st(["#0055a4","#fff","#ef4135"],1);
  else if(k==="doitsu")st(["#000","#dd0000","#ffce00"]);
  else if(k==="indo"){st(["#ff9933","#fff","#138808"]);g.strokeStyle="#000080";g.lineWidth=3;g.beginPath();g.arc(W/2,H/2,H*.13,0,TAU);g.stroke()}
  else if(k==="chuugoku"){g.fillStyle="#de2910";g.fillRect(0,0,W,H);g.fillStyle="#ffde00";star(g,W*.17,H*.27,H*.15);[[.33,.12],[.4,.22],[.4,.36],[.33,.46]].forEach(([x,y])=>star(g,W*x,H*y,H*.05,.4))}
  else if(k==="kankoku"){g.fillStyle="#fff";g.fillRect(0,0,W,H);g.fillStyle="#cd2e3a";g.beginPath();g.arc(W/2,H/2,H*.22,Math.PI,TAU);g.fill();g.fillStyle="#0047a0";g.beginPath();g.arc(W/2,H/2,H*.22,0,Math.PI);g.fill();
    g.fillStyle="#cd2e3a";g.beginPath();g.arc(W/2-H*.11,H/2,H*.11,0,TAU);g.fill();g.fillStyle="#0047a0";g.beginPath();g.arc(W/2+H*.11,H/2,H*.11,0,TAU);g.fill();
    g.fillStyle="#000";[[.2,.22,-.6],[.8,.22,.6],[.2,.78,.6],[.8,.78,-.6]].forEach(([x,y,r])=>{g.save();g.translate(W*x,H*y);g.rotate(r);for(let i=0;i<3;i++)g.fillRect(-14,-10+i*7,28,4.5);g.restore()})}
  else if(k==="amerika"){for(let i=0;i<13;i++){g.fillStyle=i%2?"#fff":"#b22234";g.fillRect(0,i*H/13,W,H/13+1)}g.fillStyle="#3c3b6e";g.fillRect(0,0,W*.42,H*7/13);g.fillStyle="#fff";for(let r=0;r<5;r++)for(let c=0;c<6;c++){g.beginPath();g.arc(8+c*12.6,7+r*12.5,2.3,0,TAU);g.fill()}}
  else if(k==="igirisu"){g.fillStyle="#012169";g.fillRect(0,0,W,H);g.strokeStyle="#fff";g.lineWidth=22;g.beginPath();g.moveTo(0,0);g.lineTo(W,H);g.moveTo(W,0);g.lineTo(0,H);g.stroke();g.strokeStyle="#c8102e";g.lineWidth=8;g.stroke();
    g.fillStyle="#fff";g.fillRect(W/2-20,0,40,H);g.fillRect(0,H/2-20,W,40);g.fillStyle="#c8102e";g.fillRect(W/2-12,0,24,H);g.fillRect(0,H/2-12,W,24)}
  else if(k==="burajiru"){g.fillStyle="#009c3b";g.fillRect(0,0,W,H);g.fillStyle="#ffdf00";g.beginPath();g.moveTo(W/2,12);g.lineTo(W-14,H/2);g.lineTo(W/2,H-12);g.lineTo(14,H/2);g.closePath();g.fill();g.fillStyle="#002776";g.beginPath();g.arc(W/2,H/2,H*.24,0,TAU);g.fill();g.strokeStyle="#fff";g.lineWidth=5;g.beginPath();g.arc(W/2+20,H/2+50,H*.55,Math.PI*1.18,Math.PI*1.52);g.stroke()}
})}

/* nhân vật chibi kiểu anime: mặt vẽ tay trên canvas, tóc ghép lọn, viền đậm */
const OUT=new THREE.MeshBasicMaterial({color:0x2a2026,side:THREE.BackSide});
function outline(m,k=1.06){const o=new THREE.Mesh(m.geometry,OUT);o.scale.setScalar(k);o.userData.isOutline=true;m.add(o);return m}
const FACE=new Map(), FU0=Math.PI/2-.85, FUL=1.7, FV0=Math.PI*.3, FVL=Math.PI*.44;
function faceTex(o){const key=[o.eye,o.fem,o.kid,o.brow].join();if(FACE.has(key))return FACE.get(key);
  const t=canvasTex(256,256,(g)=>{g.clearRect(0,0,256,256);const ec=o.eye||"#4a3426";
    [80,176].forEach((x,i)=>{const y=148,s=i?1:-1;
      g.fillStyle="#fff";g.beginPath();g.ellipse(x,y,23,28,0,0,TAU);g.fill();
      const gr=g.createLinearGradient(0,y-26,0,y+26);gr.addColorStop(0,"#1e1418");gr.addColorStop(.55,ec);gr.addColorStop(1,"#c9a27a");
      g.fillStyle=gr;g.beginPath();g.ellipse(x,y+2,19,25,0,0,TAU);g.fill();
      g.fillStyle="#140d10";g.beginPath();g.ellipse(x,y+2,9,12,0,0,TAU);g.fill();
      g.fillStyle="#fff";g.beginPath();g.arc(x-7*s*-1-6,y-9,7,0,TAU);g.fill();g.beginPath();g.arc(x+8,y+12,3.2,0,TAU);g.fill();
      g.strokeStyle="#1b1216";g.lineCap="round";g.lineWidth=7;g.beginPath();g.moveTo(x-25,y-18);g.quadraticCurveTo(x,y-34,x+25,y-20);g.stroke();
      if(o.fem){g.lineWidth=4;g.beginPath();g.moveTo(x+s*24,y-20);g.lineTo(x+s*33,y-28);g.stroke()}
      g.lineWidth=4.5;g.strokeStyle=o.brow||"#3a2a24";g.beginPath();g.moveTo(x-20,y-50);g.quadraticCurveTo(x,y-58,x+20,y-51);g.stroke();
      g.fillStyle="rgba(255,140,160,.35)";g.beginPath();g.ellipse(x+s*8,y+38,18,8,0,0,TAU);g.fill()});
    g.strokeStyle="#7a3a44";g.lineWidth=3.5;g.lineCap="round";g.beginPath();g.moveTo(118,206);g.quadraticCurveTo(128,213,138,206);g.stroke()});
  FACE.set(key,t);return t}
function facePt(u,v,r){const phi=FU0+u*FUL,th=FV0+v*FVL;return new THREE.Vector3(-r*Math.cos(phi)*Math.sin(th),r*Math.cos(th),r*Math.sin(phi)*Math.sin(th))}
function lock(H,x,y,z,sx,sy,sz,rx,ry,rz){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),M(H));m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;outline(m,1.1);return m}
/* gộp lưới của nhân vật theo từng khớp (thân, đầu, tay, chân) để mỗi nhân vật chỉ còn ít lần vẽ */
function bakeRig(root){const J=new Set([root,...Object.values(root.userData).filter(v=>v&&v.isObject3D)]);root.updateMatrixWorld(true);const groups=new Map();
  root.traverse(o=>{if(!o.isMesh||Array.isArray(o.material)||o.userData.noBake||o.userData.sign||!o.geometry.attributes.position)return;let q=o.parent;while(q&&!J.has(q))q=q.parent;if(!q)return;const k=q.uuid+"|"+o.material.uuid+"|"+JSON.stringify(o.userData.pick||0)+(o.userData.ground?"g":"");if(!groups.has(k))groups.set(k,{q,list:[]});groups.get(k).list.push(o)});
  const inv=new THREE.Matrix4(),mm=new THREE.Matrix4();
  groups.forEach(({q,list})=>{if(list.length<2)return;inv.copy(q.matrixWorld).invert();let n=0;const parts=[];for(const o of list){mm.multiplyMatrices(inv,o.matrixWorld);if(mm.determinant()<=0)continue;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();const t=new THREE.BufferGeometry();t.setAttribute("position",g.attributes.position.clone());
      if(g.attributes.normal)t.setAttribute("normal",g.attributes.normal.clone());else t.computeVertexNormals();const cnt=t.attributes.position.count;t.setAttribute("uv",g.attributes.uv&&g.attributes.uv.itemSize===2?g.attributes.uv.clone():new THREE.BufferAttribute(new Float32Array(cnt*2),2));t.applyMatrix4(mm);n+=cnt;parts.push([o,t])}
    if(parts.length<2){parts.forEach(([,t])=>t.dispose());return}
    const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let k=0;parts.forEach(([,t])=>{P.set(t.attributes.position.array,k*3);N.set(t.attributes.normal.array,k*3);U.set(t.attributes.uv.array,k*2);k+=t.attributes.position.count;t.dispose()});
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(P,3));geo.setAttribute("normal",new THREE.BufferAttribute(N,3));geo.setAttribute("uv",new THREE.BufferAttribute(U,2));geo.computeBoundingSphere();
    const m=new THREE.Mesh(geo,parts[0][0].material);m.castShadow=parts.some(([o])=>o.castShadow);m.receiveShadow=parts.some(([o])=>o.receiveShadow);const u0=parts[0][0].userData;if(u0.isOutline)m.userData.isOutline=true;if(u0.pick)m.userData.pick=u0.pick;if(u0.ground)m.userData.ground=true;q.add(m);parts.forEach(([o])=>o.parent&&o.parent.remove(o))});
  return root}
function makeChar(o){return bakeRig(makeChar0(o))}
function makeChar0(o){
  const root=new THREE.Group(), body=new THREE.Group();root.add(body);
  const coatOn=o.outfit==="coat"||o.acc==="coat", coatC=o.outfit==="coat"?o.top:"#f7f9fb", inner=o.outfit==="coat"?(o.inner||"#2f2a30"):o.top;
  const legL=new THREE.Group(),legR=new THREE.Group();
  [legL,legR].forEach((L,i)=>{L.position.set(i?.11:-.11,.36,0);const lg=outline(cyl(.085,.08,.3,o.bottom,0,-.16,0,10));L.add(lg);const sh=outline(sph(.1,o.shoes||"#3a2d2a",0,-.33,.04,12,8));sh.scale.set(1,.62,1.35);L.add(sh);body.add(L)});
  const torso=outline(new THREE.Mesh(new THREE.CapsuleGeometry(.24,.2,6,16),M(inner)));torso.position.y=.62;torso.castShadow=true;body.add(torso);
  if(coatOn){const c=outline(new THREE.Mesh(new THREE.CylinderGeometry(.25,.33,.56,18,1,true),M(coatC,{side:THREE.DoubleSide})),1.04);c.position.y=.56;c.castShadow=true;body.add(c);
    const sh=outline(sph(.255,coatC,0,.8,0,16,10));sh.scale.set(1.08,.5,1);body.add(sh);
    const st=box(.13,.5,.02,inner,0,.6,.27);body.add(st);
    [-1,1].forEach(sx=>{const l=box(.075,.34,.02,o.outfit==="coat"?"#f4f1ec":"#e6ebf0",sx*.085,.7,.285);l.rotation.z=sx*.36;body.add(l)});
    if(o.outfit==="coat")[-1,1].forEach(sx=>body.add(sph(.022,"#7a6a5a",sx*.2,.5,.3,6,4)))}
  if(o.acc==="tie")body.add(box(.06,.24,.03,"#c23b2a",0,.66,.25));
  body.add(outline(cyl(.12,.13,.1,coatOn&&o.outfit!=="coat"?"#f7f9fb":inner,0,.88,0,14)));
  const armL=new THREE.Group(),armR=new THREE.Group();
  [armL,armR].forEach((A,i)=>{A.position.set(i?.3:-.3,.8,0);A.rotation.z=i?.18:-.18;const m=outline(new THREE.Mesh(new THREE.CapsuleGeometry(.07,.2,4,10),M(coatOn?coatC:o.top)));m.position.y=-.15;m.castShadow=true;A.add(m);A.add(outline(sph(.068,o.skin,0,-.32,0,10,8)));body.add(A)});
  const head=new THREE.Group();head.position.y=1.32;body.add(head);
  const sk=outline(sph(.5,o.skin,0,0,0,28,20),1.035);sk.scale.set(1,.94,.96);head.add(sk);
  [-1,1].forEach(sx=>head.add(outline(sph(.09,o.skin,sx*.48,-.04,0,10,8))));
  const face=new THREE.Mesh(new THREE.SphereGeometry(.507,32,16,FU0,FUL,FV0,FVL),new THREE.MeshBasicMaterial({map:faceTex(o),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));face.scale.copy(sk.scale);face.renderOrder=2;head.add(face);
  const H=o.hair;
  const cap=outline(new THREE.Mesh(new THREE.SphereGeometry(.535,28,16,0,TAU,0,Math.PI*.5),M(H)),1.04);cap.rotation.x=-.42;cap.position.set(0,.03,-.02);cap.scale.set(1,.98,1);cap.castShadow=true;head.add(cap);
  const back=outline(sph(.5,H,0,-.06,-.1,20,14),1.03);back.scale.set(1.04,.92,.9);head.add(back);
  const st=o.style;
  if(st==="side"){
    head.add(lock(H,-.28,.33,.3,.2,.11,.16,.4,0,.5));head.add(lock(H,-.06,.32,.38,.24,.1,.13,.5,0,.15));head.add(lock(H,.17,.24,.4,.22,.09,.12,.5,0,-.35));head.add(lock(H,.34,.08,.36,.16,.08,.1,.3,0,-.85));
    head.add(lock(H,-.1,.44,.18,.36,.14,.3,.2,0,.25));head.add(lock(H,.24,.4,.14,.24,.12,.26,.1,0,-.4));
    head.add(lock(H,-.47,.06,.14,.07,.2,.12,0,0,.1));head.add(lock(H,.47,.06,.14,.07,.2,.12,0,0,-.1));
    head.add(lock(H,.43,.36,.02,.12,.05,.08,0,.3,-.9));
  }else if(st==="long"){
    [-.24,-.08,.08,.24].forEach((x,i)=>head.add(lock(H,x,.3,.38,.12,.13,.1,.4,0,(i-1.5)*.2)));
    const bk=outline(box(.86,.8,.3,H,0,-.32,-.22),1.04);head.add(bk);[-1,1].forEach(sx=>head.add(lock(H,sx*.46,-.16,.12,.1,.42,.12,0,0,sx*-.06)));
  }else if(st==="spiky"){
    for(let k=0;k<8;k++){const a=(k/7-.5)*2.4;head.add(lock(H,Math.sin(a)*.34,.42+Math.cos(a)*.08,Math.cos(a)*.1,.1,.24,.1,-.3,0,-a*.7))}
    [-.2,0,.2].forEach((x,i)=>head.add(lock(H,x,.3,.38,.1,.14,.09,.5,0,(i-1)*.3)));
  }else if(st==="bun"){
    [-.22,-.06,.1,.25].forEach((x,i)=>head.add(lock(H,x,.31,.38,.12,.1,.1,.45,0,(i-1.5)*.25)));head.add(outline(sph(.19,H,0,.5,-.2,14,10)));
  }else if(st==="cap"){
    [-.2,0,.2].forEach((x,i)=>head.add(lock(H,x,.22,.42,.1,.1,.09,.4,0,(i-1)*.3)));
    const c=outline(new THREE.Mesh(new THREE.SphereGeometry(.55,24,12,0,TAU,0,Math.PI*.42),M(o.capc||"#e5484d")),1.03);c.position.y=.08;head.add(c);
    const br=outline(box(.56,.05,.36,o.capc||"#e5484d",0,.24,.5));br.rotation.x=.18;head.add(br);
  }else{
    [-.26,-.09,.09,.26].forEach((x,i)=>head.add(lock(H,x,.3,.39,.12,.11,.1,.45,0,(i-1.5)*.22)));
    [-1,1].forEach(sx=>head.add(lock(H,sx*.46,.04,.14,.07,.17,.11,0,0,0)));
  }
  if(o.acc==="glasses"||o.glasses){const gc="#1d1a20",tube=o.glasses?.012:.016;
    [[80,148],[176,148]].forEach(([u,v])=>{const p=facePt(u/256,v/256,.53);p.y*=sk.scale.y;p.z*=sk.scale.z;const t=new THREE.Mesh(new THREE.TorusGeometry(.11,tube,6,24),M(gc));t.position.copy(p);t.lookAt(p.clone().multiplyScalar(2));head.add(t)});
    const pb=facePt(.5,138/256,.535);pb.y*=sk.scale.y;pb.z*=sk.scale.z;head.add(box(.07,.014,.014,gc,pb.x,pb.y,pb.z));}
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.5,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.18,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;root.add(shadow);
  root.scale.setScalar(o.kid?1.0:1.3);root.userData={body,legL,legR,armL,armR,head,t:Math.random()*10};
  return root;
}
function animChar(c,dt,moving){const u=c.userData;u.t+=dt*(moving?9:2.2);const sw=moving?Math.sin(u.t)*.6:0;
  u.legL.rotation.x=sw;u.legR.rotation.x=-sw;u.armL.rotation.x=-sw*.8;u.armR.rotation.x=sw*.8;u.body.position.y=moving?Math.abs(Math.sin(u.t))*.06:Math.sin(u.t)*.02;u.head.rotation.z=moving?0:Math.sin(u.t*.5)*.04}
function badge(kind){const t=canvasTex(128,128,(g,W,H)=>{g.fillStyle=kind==="done"||kind==="got"?"#2f9e64":kind==="word"?"#2f6fd6":"#c23b2a";g.beginPath();g.arc(64,58,46,0,TAU);g.fill();g.beginPath();g.moveTo(52,96);g.lineTo(64,122);g.lineTo(76,96);g.fill();
  g.fillStyle="#fff";g.textAlign="center";g.textBaseline="middle";g.font=kind==="word"?`700 60px ${JPF}`:`800 64px ${VNF}`;g.fillText(kind==="done"||kind==="got"?"✓":kind==="word"?"あ":"!",64,kind==="word"?62:60)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.scale.set(.7,.7,1);s.renderOrder=10;s.userData.isBadge=true;return s}
/* dấu あ trên chỗ có từ mới; đã tìm thấy thì đổi thành ✓ nhỏ */
function wordMarkers(scene,targets,isGot,pk){const list=[];const bb=new THREE.Box3(),c=new THREE.Vector3();
  targets.forEach(([key,obj,extraY,sc])=>{obj.updateMatrixWorld(true);bb.setFromObject(obj);let top;if(bb.isEmpty()){top=obj.getWorldPosition(new THREE.Vector3());top.y+=(extraY||0)}else{bb.getCenter(c);top=new THREE.Vector3(c.x,bb.max.y+(extraY||.9),c.z)}
    const b=badge(isGot(key)?"got":"word");b.position.copy(top);if(pk)b.userData.pick=pk(key);const k=sc||1;b.scale.set((isGot(key)?.55:1.05)*k,(isGot(key)?.55:1.05)*k,1);scene.add(b);list.push({key,b,base:top.y,k,got:isGot(key)})});
  return {tick(t,f=1){list.forEach((m,i)=>{m.b.position.y=m.base+Math.sin(t/320+i)*.15*m.k;const s=(m.got?.55:1.05)*m.k*f;m.b.scale.set(s,s,1)})},
    refresh(){list.forEach(m=>{const g=isGot(m.key);if(g===m.got)return;m.got=g;const nb=badge(g?"got":"word");m.b.material.map=nb.material.map;m.b.material.needsUpdate=true;const s=(g?.55:1.05)*m.k;m.b.scale.set(s,s,1)})}}}

/* ---------------- dựng khu phố bài 1 ---------------- */
function sakura(x,z,s=1){const g=new THREE.Group();g.add(cyl(.14,.2,1.6,"#7d5140",0,.8,0,8));[[0,2.1,0,.95],[.6,1.9,.3,.7],[-.6,1.95,-.2,.75],[.2,2.5,-.3,.6],[-.3,1.8,.5,.6]].forEach(([a,b,c,r],i)=>g.add(sph(r,i%2?"#f7b8cc":"#f29ab8",a,b,c,10,8)));g.position.set(x,0,z);g.scale.setScalar(s);return g}
function lamp(x,z){const g=new THREE.Group();g.add(cyl(.06,.08,3.6,"#4a4f5c",0,1.8,0,8));g.add(box(.7,.08,.12,"#4a4f5c",.3,3.55,0));const l=sph(.2,"#fff6c8",.6,3.42,0,10,8);l.material=new THREE.MeshBasicMaterial({color:0xfff2b0});g.add(l);g.position.set(x,0,z);return g}
function pole(x,z){const g=new THREE.Group();g.add(cyl(.12,.14,6.4,"#8a8478",0,3.2,0,8));g.add(box(1.4,.1,.1,"#8a8478",0,5.8,0));g.add(box(1,.1,.1,"#8a8478",0,5.3,0));g.add(cyl(.18,.18,.4,"#6b6a64",.35,4.7,0,8));g.position.set(x,0,z);return g}
function vending(x,z,c){const g=new THREE.Group();g.add(box(1,1.9,.7,c,0,.95,0));const f=box(.8,1,.05,"#e8f4ff",0,1.25,.36);f.material=new THREE.MeshBasicMaterial({color:0xe8f4ff});g.add(f);for(let i=0;i<4;i++)g.add(box(.14,.3,.05,["#e5484d","#3d6fd6","#ffcf4a","#2f9e64"][i],-.27+i*.18,1.25,.39));g.add(box(.6,.16,.06,"#2b2540",0,.45,.36));g.position.set(x,0,z);return g}
function buildCity(scene,words,picks,solids){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(140,140),M("#a9d69a"));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.userData.ground=true;scene.add(ground);
  const road=M("#5c5f6b");
  [[80,8,0,0],[8,80,0,0]].forEach(([w,d,x,z])=>{const r=new THREE.Mesh(new THREE.PlaneGeometry(w,d),road);r.rotation.x=-Math.PI/2;r.position.set(x,.02,z);r.receiveShadow=true;r.userData.ground=true;scene.add(r)});
  for(let i=-38;i<=38;i+=4){if(Math.abs(i)<6)continue;[[i,0,1.6,.18],[0,i,.18,1.6]].forEach(([x,z,w,d])=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M("#f4f1e8"));l.rotation.x=-Math.PI/2;l.position.set(x,.03,z);scene.add(l)})}
  for(let i=0;i<6;i++){[[ -3+i*1.2,-5.4,.7,2.2],[-3+i*1.2,5.4,.7,2.2],[-5.4,-3+i*1.2,2.2,.7],[5.4,-3+i*1.2,2.2,.7]].forEach(([x,z,w,d])=>{const l=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M("#f4f1e8"));l.rotation.x=-Math.PI/2;l.position.set(x,.03,z);scene.add(l)})}
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const s=new THREE.Mesh(new THREE.BoxGeometry(32,.16,32),M("#e9e1d2"));s.position.set(sx*21,.08,sz*21);s.receiveShadow=true;s.userData.ground=true;scene.add(s);
    const tile=new THREE.Mesh(new THREE.PlaneGeometry(28,28),M("#dcd2bf"));tile.rotation.x=-Math.PI/2;tile.position.set(sx*21,.17,sz*21);tile.receiveShadow=true;tile.userData.ground=true;scene.add(tile)});
  const pick=(obj,data)=>{obj.traverse(o=>{if(o.isMesh)o.userData.pick=data});picks.push(obj)};
  const solid=(x,z,w,d)=>solids.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
  /* Đại học Sakura */
  const uni=new THREE.Group();uni.add(box(17,6,8,"#f1e6d4",0,3,0));uni.add(box(17.6,.5,8.6,"#8a4a3a",0,6.2,0));
  for(let i=0;i<7;i++)uni.add(box(1.2,1.4,.1,"#9cc6e8",-6.9+i*2.3,4.2,4.02)),uni.add(box(1.2,1.4,.1,"#9cc6e8",-6.9+i*2.3,1.9,4.02));
  uni.add(box(3,3,3,"#efe2cc",0,7.9,0));uni.add(new THREE.Mesh(new THREE.ConeGeometry(2.4,1.8,4),M("#8a4a3a")));uni.children.at(-1).position.set(0,10.3,0);uni.children.at(-1).rotation.y=Math.PI/4;
  const clk=canvasTex(128,128,(g)=>{g.fillStyle="#fffaf0";g.beginPath();g.arc(64,64,60,0,TAU);g.fill();g.strokeStyle="#2b2540";g.lineWidth=6;g.stroke();g.lineWidth=7;g.beginPath();g.moveTo(64,64);g.lineTo(64,24);g.moveTo(64,64);g.lineTo(92,72);g.stroke()});
  const cm=new THREE.Mesh(new THREE.CircleGeometry(1.1,24),new THREE.MeshBasicMaterial({map:clk}));cm.position.set(0,8,1.52);uni.add(cm);
  const us=sign("さくら大学","Đại học Sakura",{w:6,h:1.5});us.position.set(0,5.25,4.24);uni.add(us);uni.add(box(6.3,1.75,.14,"#8a4a3a",0,5.25,4.12));
  uni.position.set(-20,0,-24);scene.add(uni);pick(uni,{w:"daigaku"});solid(-20,-24,17.6,8.6);
  const gate=new THREE.Group();[-3,3].forEach(x=>gate.add(box(.9,3,.9,"#b8ad9c",x,1.5,0)));const gs=sign("大学","",{w:2.2,h:.9,border:"#8a4a3a"});gs.position.set(-3,2.4,.47);gate.add(gs);gate.position.set(-20,0,-13.6);scene.add(gate);pick(gate,{w:"daigaku"});solid(-23,-13.6,1,1);solid(-17,-13.6,1,1);
  /* phòng nghiên cứu */
  const lab=new THREE.Group();lab.add(box(7,4,6,"#dfe8ee",0,2,0));lab.add(box(7.4,.4,6.4,"#5d6f86",0,4.2,0));for(let i=0;i<3;i++)lab.add(box(1.4,1.2,.1,"#9cc6e8",-2.2+i*2.2,2.6,3.02));const ls=sign("研究所","Phòng nghiên cứu",{w:3.6,h:1.1,border:"#5d6f86"});ls.position.set(0,1.1,3.06);lab.add(ls);lab.position.set(-7,0,-27);scene.add(lab);solid(-7,-27,7.4,6.4);
  /* Bệnh viện Yamada */
  const hos=new THREE.Group();hos.add(box(14,9,9,"#fbfbf8",0,4.5,0));hos.add(box(14.4,.5,9.4,"#9fb6c9",0,9.2,0));
  for(let r=0;r<3;r++)for(let i=0;i<5;i++)hos.add(box(1.4,1.1,.1,"#a9d2ee",-5.2+i*2.6,2.2+r*2.5,4.52));
  const cross=new THREE.Group();cross.add(box(.7,2,.2,"#2f9e64"));cross.add(box(2,.7,.2,"#2f9e64"));cross.position.set(0,10.8,0);hos.add(cross);
  const hsg=sign("やまだ病院","Bệnh viện Yamada",{w:6,h:1.5,border:"#2f9e64"});hsg.position.set(0,8.15,4.74);hos.add(hsg);hos.add(box(6.3,1.75,.14,"#2f9e64",0,8.15,4.62));
  hos.add(box(4,3,1.6,"#e3eef7",0,1.5,5.2));hos.position.set(19,0,-22);scene.add(hos);pick(hos,{w:"byouin"});solid(19,-22,14.4,12.6);
  /* ngân hàng & công ty */
  const bank=new THREE.Group();bank.add(box(12,5,8,"#e8e2d6",0,2.5,0));bank.add(new THREE.Mesh(new THREE.CylinderGeometry(0,7.4,1.8,4),M("#8f897e")));bank.children.at(-1).position.set(0,5.9,0);bank.children.at(-1).rotation.y=Math.PI/4;bank.children.at(-1).scale.z=.75;
  for(let i=0;i<5;i++)bank.add(cyl(.35,.38,4.4,"#f6f2ea",-4.4+i*2.2,2.2,4.4,12));
  bank.add(outline(box(11.6,1.1,.5,"#e8e2d6",0,4.85,4.45),1.02));const bs=sign("さくら銀行","Ngân hàng Sakura",{w:4.6,h:1,border:"#3d6fd6"});bs.position.set(0,4.85,4.72);bank.add(bs);bank.position.set(-22,0,16);scene.add(bank);solid(-22,16.4,12,9);
  const off=new THREE.Group();off.add(box(8,18,8,"#7fa8d8",0,9,0));for(let r=0;r<8;r++)off.add(box(8.05,.25,8.05,"#e8eef6",0,2+r*2.1,0));off.add(box(8.4,.6,8.4,"#5d6f86",0,18.3,0));
  const os=sign("ABC","Công ty ABC",{w:3.4,h:1.4,border:"#2b2540"});os.position.set(0,3,4.06);off.add(os);off.position.set(-10,0,27);scene.add(off);solid(-10,27,8.4,8.4);
  scene.add(vending(-14.5,10.2,"#e5484d"),vending(-13.3,10.2,"#3d6fd6"));solid(-13.9,10.2,2.4,.8);
  /* Quảng trường quốc tế */
  const fount=new THREE.Group();fount.add(cyl(3,3.2,.6,"#cfc6b6",0,.3,0,24));const wtr=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.1,24),new THREE.MeshToonMaterial({color:0x7fc4ec,gradientMap:toonGrad()}));wtr.position.y=.58;fount.add(wtr);fount.add(cyl(.3,.4,1.6,"#cfc6b6",0,1,0,12));fount.add(sph(.5,"#9fd6f4",0,1.9,0,12,10));
  fount.position.set(21,0,22);scene.add(fount);solid(21,22,6.2,6.2);
  const ps=sign("国際広場","Quảng trường quốc tế",{w:4.4,h:1.2,border:"#c23b2a"});ps.position.set(21,1.2,13.2);scene.add(ps);
  FLAGS.forEach((k,i)=>{const a=Math.PI*(.05+i*.9/11)+Math.PI,R=9,x=21+Math.cos(a)*R*-1,z=22+Math.sin(a)*R*-1;const g=new THREE.Group();g.add(cyl(.06,.07,4.2,"#c9c3b6",0,2.1,0,8));g.add(sph(.1,"#e0a62a",0,4.25,0,8,6));
    const f=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1),new THREE.MeshBasicMaterial({map:flagTex(k),side:THREE.DoubleSide}));f.position.set(.78,3.55,0);g.add(f);g.userData.flag=f;g.position.set(x,0,z);g.rotation.y=Math.PI/2-a;scene.add(g);pick(g,{w:k});solid(x,z,.5,.5)});
  /* đường phố */
  const lamps=[];[-30,-18,-8,8,18,30].forEach(v=>{[[v,-4.9],[v,4.9],[-4.9,v],[4.9,v]].forEach(([x,z])=>{const l=lamp(x,z);if(z===-4.9||x===-4.9)l.rotation.y=Math.PI;scene.add(l);lamps.push(l);pick(l,{w:"denki"});solid(x,z,.3,.3)})});
  [-34,-24,-14,14,24,34].forEach(x=>{scene.add(pole(x,-6.2));solid(x,-6.2,.4,.4)});
  [[-10,-12],[-30,-12],[-28,-34],[10,-34],[30,-12],[30,-34],[-30,10],[-30,32],[12,32],[32,32],[32,12],[12,14.5]].forEach(([x,z],i)=>{scene.add(sakura(x,z,.9+((i*7)%4)*.1));solid(x,z,.6,.6)});
  const tor=new THREE.Group();[-1.4,1.4].forEach(x=>tor.add(cyl(.16,.18,3.2,"#d24a36",x,1.6,0,10)));tor.add(box(4.2,.24,.36,"#2b2540",0,3.3,0));tor.add(box(3.4,.18,.24,"#d24a36",0,2.8,0));tor.position.set(33,0,-6.8);tor.rotation.y=-Math.PI/2;scene.add(tor);
  return {lamps};
}

/* ---------------- CSS giao diện game ---------------- */
const CSS=`
.g3{position:fixed;inset:0;z-index:400;background:#cfe6f7;color:#2b2540;font-family:${VNF};overscroll-behavior:none;touch-action:none;user-select:none;-webkit-user-select:none}
.g3 canvas{display:block;width:100%;height:100%;outline:none}
.g3 button{font:inherit;cursor:pointer}
.g3-top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) max(12px,env(safe-area-inset-right,0px)) 0 max(12px,env(safe-area-inset-left,0px));pointer-events:none}
.g3-top>*{pointer-events:auto}
.g3-btn{border:0;border-radius:999px;min-height:44px;padding:0 16px;background:rgba(255,253,248,.94);color:#2b2540;font-weight:700;box-shadow:0 6px 16px -8px rgba(40,30,60,.45);display:inline-flex;align-items:center;gap:6px}
.g3-btn b{color:#b8325f}
.g3-title{flex:1;min-width:0;background:rgba(255,253,248,.9);border-radius:16px;padding:6px 14px;line-height:1.2;box-shadow:0 6px 16px -8px rgba(40,30,60,.45)}
.g3-title b{font-family:${JPF};font-size:1.05rem;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.g3-title span{font-size:.75rem;color:#655d7a;font-weight:600}
.g3-osm{position:absolute;right:max(8px,env(safe-area-inset-right,0px));bottom:calc(env(safe-area-inset-bottom,0px) + 6px);font:600 11px/1.3 system-ui,sans-serif;color:#2b2540;background:rgba(255,255,255,.72);padding:3px 8px;border-radius:8px;pointer-events:none;z-index:3}
.g3-stats{position:absolute;left:max(12px,env(safe-area-inset-left,0px));top:calc(env(safe-area-inset-top,0px) + 66px);display:flex;flex-wrap:wrap;gap:6px;pointer-events:none}
.g3-stats span{background:rgba(255,253,248,.92);border-radius:999px;padding:5px 12px;font-size:.8rem;font-weight:700;box-shadow:0 4px 12px -8px rgba(40,30,60,.5)}
.g3-stats b{color:#b8325f}
.g3-hint{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);transform:translateX(-50%);max-width:min(92vw,560px);text-align:center;background:rgba(43,37,64,.82);color:#fff;border-radius:14px;padding:8px 14px;font-size:.85rem;pointer-events:none;transition:opacity .3s}
.g3-talk{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);transform:translateX(-50%);border:0;border-radius:999px;min-height:48px;padding:0 22px;background:#c23b2a;color:#fff;font-weight:800;box-shadow:0 10px 22px -10px rgba(140,30,20,.8)}
.g3-panel{position:absolute;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 12px);transform:translateX(-50%);width:min(96vw,640px);max-height:min(72vh,560px);overflow:auto;background:#fffdf8;border-radius:22px;padding:16px 16px 14px;box-shadow:0 20px 50px -20px rgba(40,30,60,.6);border:2px solid #f0dcc4;animation:g3up .35s cubic-bezier(.2,.9,.3,1.2)}
@keyframes g3up{from{transform:translate(-50%,30px);opacity:0}}
.g3-who{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.g3-who b{font-family:${JPF};font-size:1.1rem}
.g3-who span{font-size:.78rem;background:#ffe7f0;color:#b8325f;border-radius:999px;padding:2px 10px;font-weight:700}
.g3-who .g3-x{margin-left:auto;border:0;background:#f4ede2;border-radius:50%;width:40px;height:40px;font-size:1.1rem}
.g3-line{font-family:${JPF};font-size:1.25rem;line-height:1.9;margin:2px 0}
.g3-line rt{font-size:.55em;color:#6b604f}
.g3-sub{font-size:.88rem;color:#4a4560;margin:2px 0}
.g3-roma{font-size:.85rem;color:#766a86;font-style:italic}
.g3-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center}
.g3-small{border:1.5px solid #f3c2d4;background:#fff;color:#b8325f;border-radius:999px;min-height:40px;padding:0 14px;font-weight:700;font-size:.85rem}
.g3-next{margin-left:auto;border:0;border-radius:999px;min-height:46px;padding:0 22px;background:#c23b2a;color:#fff;font-weight:800}
.g3-q{font-size:.85rem;font-weight:700;color:#655d7a;margin:10px 0 6px}
.g3-opts{display:grid;gap:8px}
.g3-opt{border:2px solid #eadfca;background:#fff;border-radius:14px;padding:10px 40px 10px 14px;text-align:left;font-family:${JPF};font-size:1.05rem;line-height:1.8;min-height:48px;position:relative}
.g3-opt rt{font-size:.55em;color:#6b604f}
.g3-opt:hover{border-color:#e9a1b9}
.g3-opt.ok{border-color:#2f9e64;background:#eaf7ef}
.g3-opt.no{border-color:#d24a36;background:#fdecea;opacity:.75}
.g3-opt .mk{position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:${VNF};font-weight:800;font-size:1.3rem}
.g3-opt.ok .mk{color:#2f9e64}.g3-opt.no .mk{color:#d24a36}
.g3-why{font-size:.85rem;background:#fff4e6;border-radius:12px;padding:8px 12px;margin-top:8px}
.g3-good{font-size:.85rem;background:#eaf7ef;border-radius:12px;padding:8px 12px;margin-top:8px}
.g3-card{text-align:center}
.g3-card .big{font-family:${JPF};font-size:2.4rem;line-height:1.6}
.g3-card .big rt{font-size:.4em}
.g3-card .vi{font-weight:700;font-size:1.05rem}
.g3-card .ex{font-size:.85rem;color:#4a4560;margin-top:6px;font-family:${JPF}}
.g3-book{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;margin-top:8px}
.g3-w{border:1.5px solid #eadfca;border-radius:12px;padding:8px;background:#fff;text-align:left;min-height:56px}
.g3-w.no{background:#f6f1e8;color:#8a7e6c;border-style:dashed}
.g3-w b{font-family:${JPF};display:block;font-size:1rem}
.g3-w span{font-size:.75rem}
.g3-start{position:absolute;inset:auto 0 0 0;display:grid;place-items:end center;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 12px)}
.g3-opts2{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
.g3-sw{width:38px;height:38px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #eadfca}
.g3-sw.on{box-shadow:0 0 0 3px #c23b2a}
.g3-chip{border:1.5px solid #eadfca;background:#fff;border-radius:999px;min-height:40px;padding:0 14px;font-weight:700;font-size:.85rem}
.g3-chip.on{border-color:#c23b2a;color:#c23b2a;background:#fff1ee}
.g3-lbl{font-size:.8rem;font-weight:700;color:#655d7a}
.g3-load{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(#fbe3ec,#fff6f8);font-weight:700;color:#b8325f;font-size:1rem;text-align:center;padding:20px}
.g3-done{text-align:center}
.g3-done h3{font-family:${JPF};font-size:1.6rem;margin:4px 0;color:#c23b2a}
.g3-zoom .g3-pano{display:grid;place-items:center}.g3-zoom .g3-pano.on{background:#2b2540;color:#fff}
.g3-zoom{position:absolute;right:max(12px,env(safe-area-inset-right,0px));top:calc(env(safe-area-inset-top,0px) + 66px);display:grid;gap:6px}
.g3-zoom button{width:44px;height:44px;border-radius:50%;border:0;background:rgba(255,253,248,.94);font-size:1.3rem;font-weight:800;box-shadow:0 4px 12px -8px rgba(40,30,60,.5)}
.g3-av .g3-panel{max-height:min(56vh,560px)}
@media (min-width:821px){.g3-av .g3-panel{left:auto;right:4vw;bottom:50%;transform:translateY(50%);width:400px;max-height:86vh;animation:none}}
.g3 :focus-visible{outline:3px solid rgba(61,155,224,.7);outline-offset:2px}
@media (max-width:520px){#g3Me{padding:0 12px;font-size:.85rem}.g3-title span{display:none}.g3-line{font-size:1.12rem}.g3-opt{font-size:.98rem}.g3-title b{font-size:.95rem}}
`;

const TAI={model:true,hair:"#2e2420",style:"side",outfit:"coat",top:"#d8d2cb",inner:"#2a2629",bottom:"#d3cdc6",shoes:"#f6f4f0",skin:"#fbe3cf",eye:"#4a3426",glasses:true};
/* nhân vật Tài dựng bằng Blender (scripts/build_tai_blender.py) */
let TAI_GLB=null;
async function loadTai(){if(TAI_GLB)return TAI_GLB;try{const g=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(new URL("./tai.glb?v=1",location.href).href);TAI_GLB=g.scene}catch(e){console.warn("tai.glb",e)}return TAI_GLB}
function makeTai(){const m=TAI_GLB.clone(true);const ms=[];m.traverse(c=>{if(c.isMesh)ms.push(c)});ms.forEach(c=>{c.material=M("#"+c.material.color.getHexString());c.castShadow=true;outline(c,1.025)});
  const root=new THREE.Group();root.add(m);const shadow=new THREE.Mesh(new THREE.CircleGeometry(.5,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.18,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;root.add(shadow);
  const J=n=>m.getObjectByName(n)||new THREE.Group();root.scale.setScalar(1.3);root.userData={body:m,legL:J("legL"),legR:J("legR"),armL:J("armL"),armR:J("armR"),head:J("head"),t:0};return bakeRig(root)}
const makePlayer=av=>{const p=av.model!==false&&TAI_GLB?makeTai():makeChar(av);p.userData.isPlayer=true;return p};
/* =====================================================================
   BẢN ĐỒ THẬT (OpenStreetMap) CHO CẢNH NGẮM CẢNH
   Dữ liệu © OpenStreetMap contributors (ODbL), tải sẵn vào scenes/osm-N.json
   ===================================================================== */
let OD_K=0;const OSM_K=.3,OSM_V="1",FUJI=[35.3606,138.7274];
const LMAPS=new Set([]),LCFG={12:{water:"-z"},13:{water:"-z"}};
/* cấu hình ghép bản đồ với phần địa danh làm tay: off = vị trí (trong cảnh) đặt tâm bản đồ; rot = xoay;
   view = toạ độ cần nằm phía trước (-z); water = hướng từ tâm tới mặt nước gần nhất ("-z" hoặc "+z"); clear = bán kính dọn nhà thật quanh địa danh */
const REAL={0:{k:.6,off:[0,-46],rot:-90,clear:0,clearRect:[[-13,13,-58,38]]},1:{k:.6,off:[0,-20],rot:0,clear:7,roof:"gassho",clearRect:[[-6,6,-14,16]]},2:{k:.6,off:[-6,-16],view:FUJI,clear:10,poi:/忠霊塔/,clearRect:[[-16,10,-28,16]]},3:{k:.6,off:[0,-22],rot:0,clear:15,poi:/^姫路城$/,clearRect:[[-15,15,-38,-6]]},
  4:{k:.6,off:[0,-50],view:FUJI,clear:14,tower:2.4,poi:/東京タワー/,clearRect:[[-22,22,-66,-30]]},5:{off:[0,-16],rot:0,clear:13,poi:/明月院/},6:{off:[0,-24],water:"-z",clear:6,dropWater:1,poi:/大鳥居/,keepWet:["torii"]},7:{off:[0,-6],water:"-z",clear:10,dropWater:1,skytree:1},
  8:{off:[0,-12],rot:0,clear:12},9:{off:[0,-25],water:"+z",clear:9,dropWater:1,poi:/金閣|舎利殿|鹿苑寺/},10:{off:[0,-4],view:FUJI,clear:8,dropWater:1},11:{off:[0,-18],rot:0,clear:12,poi:/時計台/}};
/* cắt vật liệu theo hình vuông trung tâm: keepInside=true chỉ vẽ phần trong, false chỉ vẽ phần ngoài */
function clipBox(mat,half,keepInside){const m=mat.clone();m.onBeforeCompile=sh=>{sh.uniforms.uClipH={value:half};
  sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nvarying vec3 vWP;").replace("#include <project_vertex>","#include <project_vertex>\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;");
  sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying vec3 vWP;uniform float uClipH;").replace("void main() {","void main() {\n  bool insideC=abs(vWP.x)<uClipH&&abs(vWP.z)<uClipH;\n  if("+(keepInside?"!insideC":"insideC")+") discard;")};
  m.customProgramCacheKey=()=>"clip"+(keepInside?1:0)+half;return m}
async function loadLessonMap(n){try{const r=await fetch(`./scenes/lesson-${n}.json?v=${OSM_V}`);if(!r.ok)return null;return await r.json()}catch(e){return null}}
async function loadOSM(m){try{const r=await fetch(`./scenes/osm-${m+1}.json?v=${OSM_V}`);if(!r.ok)return null;return await r.json()}catch(e){return null}}
function mergeTris(parts){let n=0;parts.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=parts.some(g=>g.attributes.color)?new Float32Array(n*3):null;let k=0;
  parts.forEach(g=>{const c=g.attributes.position.count;P.set(g.attributes.position.array,k*3);if(g.attributes.normal)N.set(g.attributes.normal.array,k*3);if(C&&g.attributes.color)C.set(g.attributes.color.array,k*3);k+=c});
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(P,3));geo.setAttribute("normal",new THREE.BufferAttribute(N,3));if(C)geo.setAttribute("color",new THREE.BufferAttribute(C,3));geo.computeBoundingSphere();return geo}
/* tam giác hoá một vòng đa giác (toạ độ cảnh x,z) thành mặt phẳng ở độ cao y */
function flatTris(rings,y,out){const cont=rings[0].map(p=>new THREE.Vector2(p[0],p[1])),holes=rings.slice(1).map(r=>r.map(p=>new THREE.Vector2(p[0],p[1])));
  let tri;try{tri=THREE.ShapeUtils.triangulateShape(cont,holes)}catch(e){return}const all=cont.concat(...holes);tri.forEach(t=>{for(let i=2;i>=0;i--){const v=all[t[i]];out.push(v.x,y,v.y)}})}
function ptIn(ring,x,z){let ins=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])ins=!ins}return ins}
function osmWorld(scene,D,cfg,opt){
  const k=cfg.k||OSM_K,season=opt.season,rng=rngOf(opt.seed||7),CM=m=>opt.core?clipBox(m,opt.core,false):m;
  if(opt.base){const bg=new THREE.Mesh(new THREE.CircleGeometry(720,64),M(opt.base));bg.rotation.x=-Math.PI/2;bg.position.y=-.03;bg.receiveShadow=true;bg.userData.ground=true;scene.add(bg)}
  /* xoay */
  let C0=[0,0];if(cfg.poi&&D.poi){const hit=D.poi.filter(q=>cfg.poi.test(q[0])&&Math.hypot(q[2],q[3])<900).sort((a,b)=>Math.hypot(a[2],a[3])-Math.hypot(b[2],b[3]))[0];if(hit)C0=[hit[2],hit[3]]}
  let rot=(cfg.rot||0)*Math.PI/180;
  if(cfg.view){const lat=D.c[0],lon=D.c[1];const vx=(cfg.view[1]-lon)*111320*Math.cos(lat*Math.PI/180)-C0[0],vz=-(cfg.view[0]-lat)*110540-C0[1];rot=-Math.PI/2-Math.atan2(vz,vx)}
  if(cfg.water){let best=null;const consider=(x0,z0)=>{const x=x0-C0[0],z=z0-C0[1],d=Math.hypot(x,z);if(d>1&&(!best||d<best[0]))best=[d,x,z]};
    [...D.sea,...D.water].forEach(pg=>pg[0].forEach(p=>consider(p[0],p[1])));D.river.forEach(r=>r[1].forEach(p=>consider(p[0],p[1])));
    if(best){const inW=[...D.sea,...D.water].some(pg=>ptIn(pg[0],C0[0],C0[1]));if(inW){best[1]=-best[1];best[2]=-best[2]}const want=cfg.water==="-z"?-Math.PI/2:Math.PI/2;rot=want-Math.atan2(best[2],best[1])}}
  const c=Math.cos(rot),s=Math.sin(rot),[ox,oz]=cfg.off;
  const T=p=>{const x=(p[0]-C0[0])*k,z=(p[1]-C0[1])*k;return [x*c-z*s+ox,x*s+z*c+oz]},TR=r=>r.map(T);
  const LIM=opt.walk||150,G=1,GN=Math.ceil(LIM*2/G),grid=new Uint8Array(GN*GN);/* 0 trống, 1 chặn, 2 đường */
  const gi=(x,z)=>{const i=Math.floor((x+LIM)/G),j=Math.floor((z+LIM)/G);return i<0||j<0||i>=GN||j>=GN?-1:j*GN+i};
  const fillPoly=(rings,v,only)=>{const R0=rings[0];let z0=1e9,z1=-1e9;R0.forEach(p=>{z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])});z0=Math.max(z0,-LIM);z1=Math.min(z1,LIM);
    for(let z=Math.floor(z0)+.5;z<=z1;z+=G){const xs=[];rings.forEach(R=>{for(let i=0,j=R.length-1;i<R.length;j=i++){const a=R[i],b=R[j];if((a[1]>z)!==(b[1]>z))xs.push(a[0]+(z-a[1])*(b[0]-a[0])/(b[1]-a[1]))}});xs.sort((a,b)=>a-b);
      for(let q=0;q+1<xs.length;q+=2)for(let x=Math.ceil(xs[q]-.5)+.5;x<xs[q+1];x+=G){const id=gi(x,z);if(id>=0&&(only==null||grid[id]===only))grid[id]=v}}};
  const fillLine=(pts,w,v,only)=>{for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1];const x0=Math.max(-LIM,Math.min(ax,bx)-w),x1=Math.min(LIM,Math.max(ax,bx)+w),z0=Math.max(-LIM,Math.min(az,bz)-w),z1=Math.min(LIM,Math.max(az,bz)+w);
    const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;for(let z=Math.floor(z0)+.5;z<z1;z+=G)for(let x=Math.floor(x0)+.5;x<x1;x+=G){let t=((x-ax)*dx+(z-az)*dz)/L2;t=Math.max(0,Math.min(1,t));if(Math.hypot(ax+t*dx-x,az+t*dz-z)<=w/2){const id=gi(x,z);if(id>=0&&(only==null||grid[id]===only))grid[id]=v}}}};
  /* màu theo mùa */
  const W=season==="winter";
  const LC={forest:W?"#e9eef5":season==="autumn"?"#a98a45":"#5e9a58",park:W?"#f1f4f9":season==="autumn"?"#c3a65a":"#86c46f",farm:W?"#eef2f7":season==="autumn"?"#d9b45a":season==="spring"?"#9cc8d8":"#8cc56c",cem:W?"#e6eaf0":"#b9b7aa",sand:"#e8d6a4",rock:"#a8a49a"};
  const LY={farm:.01,park:.016,cem:.022,forest:.028,sand:.034,rock:.04};
  const layers={};D.land.forEach(([cls,rings])=>{const R=rings.map(TR);(layers[cls]=layers[cls]||[]).push(R)});
  Object.entries(layers).forEach(([cls,list])=>{const arr=[];list.forEach(R=>flatTris(R,LY[cls]||.015,arr));if(!arr.length)return;const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(arr),3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,CM(M(LC[cls]||"#8fc47a")));m.receiveShadow=true;m.userData.ground=true;scene.add(m)});
  /* nước & biển */
  const wArr=[];[...D.sea,...D.water].forEach(rings=>{const R=rings.map(TR);flatTris(R,.06,wArr);fillPoly(R,3)});
  const wcol=W?"#7fb0d8":"#4fa6d8";
  if(wArr.length){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(wArr),3));g.computeVertexNormals();
    const m=new THREE.Mesh(g,CM(new THREE.MeshToonMaterial({color:wcol,gradientMap:toonGrad(),transparent:true,opacity:.92,polygonOffset:true,polygonOffsetFactor:-1})));m.userData.ground=true;m.receiveShadow=true;scene.add(m);opt.ticks.push(()=>{m.material.opacity=.88+Math.sin(performance.now()/900)*.04})}
  /* dải: sông, đường, đường sắt */
  const ribbon=(pts,w,y,arr)=>{for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1];const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2,ex=dx/L*w*.25,ez=dz/L*w*.25;
    const A=[ax-ex+nx,az-ez+nz],B=[ax-ex-nx,az-ez-nz],C2=[bx+ex-nx,bz+ez-nz],D2=[bx+ex+nx,bz+ez+nz];arr.push(A[0],y,A[1],C2[0],y,C2[1],B[0],y,B[1],A[0],y,A[1],D2[0],y,D2[1],C2[0],y,C2[1])}};
  const rv=[];D.river.forEach(([w,pts])=>{const P=pts.map(T),ww=Math.max(.9,w*k);ribbon(P,ww,.058,rv);fillLine(P,ww,3)});
  if(rv.length){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(rv),3));g.computeVertexNormals();const m=new THREE.Mesh(g,CM(M(wcol)));m.userData.ground=true;scene.add(m)}
  const RD=[[],[]],SW=[],DASH=[],poles=[],lamps=[],footP=[];const pstep=20*k,lstep=34*k;
  D.road.forEach(([w,foot,pts])=>{const P=pts.map(T),ww=Math.max(foot?.8:1.6,w*k*1.3);ribbon(P,ww,foot?.072:.08,RD[foot]);fillLine(P,ww,2,0);fillLine(P,ww,2,3);
    if(foot){footP.push(P);return}if(w>=8)ribbon(P,ww+1.6,.066,SW);
    /* vạch giữa, cột điện, đèn đường dọc theo đường */
    let acc=0,accL=0,side=1;for(let i=0;i+1<P.length;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz);if(L<.01)continue;const ux=dx/L,uz=dz/L,nx=-uz,nz=ux;
      if(w>=8)for(let t=(i?0:1);t<L-1.2;t+=3.2){const x=ax+ux*t,z=az+uz*t;DASH.push([x,z,x+ux*1.6,z+uz*1.6])}
      for(let t=pstep-acc;t<L;t+=pstep){const x=ax+ux*t+nx*(ww/2+.5)*side,z=az+uz*t+nz*(ww/2+.5)*side;if(w<8)poles.push([x,z,Math.atan2(ux,uz)]);acc=0}acc=(acc+L)%pstep;
      if(w>=8)for(let t=lstep-accL;t<L;t+=lstep){[-1,1].forEach(sd=>lamps.push([ax+ux*t+nx*(ww/2+.9)*sd,az+uz*t+nz*(ww/2+.9)*sd,Math.atan2(nx*sd,nz*sd)]))}accL=(accL+L)%lstep}});
  if(SW.length){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(SW),3));g.computeVertexNormals();const m=new THREE.Mesh(g,CM(M(W?"#e8ebf0":"#c9c3b6")));m.receiveShadow=true;m.userData.ground=true;scene.add(m)}
  if(DASH.length){const arr=[];DASH.forEach(([a,b,c2,d2])=>ribbon([[a,b],[c2,d2]],.18,.09,arr));const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(arr),3));g.computeVertexNormals();scene.add(new THREE.Mesh(g,CM(M("#f4f1e8"))))}
  const rcol=[W?"#c7ccd6":"#8d909a",W?"#dfe3ea":"#cdbf9f"];
  RD.forEach((arr,i)=>{if(!arr.length)return;const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(arr),3));g.computeVertexNormals();const m=new THREE.Mesh(g,CM(M(rcol[i])));m.receiveShadow=true;m.userData.ground=true;scene.add(m)});
  const ra=[];D.rail.forEach(pts=>{const P=pts.map(T);ribbon(P,1.3,.098,ra);fillLine(P,1.3,1,0)});
  if(ra.length){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(ra),3));g.computeVertexNormals();scene.add(new THREE.Mesh(g,CM(M("#6b6670"))))}
  /* nhà: tường + mái, gộp theo ô lưới, tô màu từng đỉnh */
  const col=new THREE.Color(),chunks=new Map(),HX=1.25;
  const pal={h:["#f3ece0","#5d6f86"],a:["#e8e4dc","#8a8f99"],c:["#dfe4ea","#7d8794"],s:["#f6efe4","#c8452f"],t:["#eadfcf","#4a4a52"],o:["#efe8dc","#7a6a5a"]};
  if(cfg.roof==="gassho"){pal.h=["#d9c7a6","#8a6b3e"];pal.o=["#d9c7a6","#8a6b3e"]}
  const push=(key,pos,cr,uv)=>{let ch=chunks.get(key);if(!ch)chunks.set(key,ch={p:[],c:[],u:[]});for(let i=0,j=0;i<pos.length;i+=3,j+=2){ch.p.push(pos[i],pos[i+1],pos[i+2]);ch.c.push(cr.r,cr.g,cr.b);ch.u.push(uv?uv[j]:.03,uv?uv[j+1]:.03)}};
  const FLH=3.2*k*1.25,quadUV=(len,h,out)=>{const U=Math.max(1,Math.round(len/(2.6*k/.3*.55))),V=h/FLH;out.push(0,0,U,0,U,V,0,0,U,V,0,V)};
  const clr=opt.clear||(()=>false);let nB=0;
  D.b.forEach(([h,kind,ring])=>{const R=TR(ring);let cx=0,cz=0;R.forEach(p=>{cx+=p[0];cz+=p[1]});cx/=R.length;cz/=R.length;if(clr(cx,cz,R))return;nB++;
    let area=0;for(let i=0,j=R.length-1;i<R.length;j=i++)area+=(R[j][0]+R[i][0])*(R[j][1]-R[i][1]);area=Math.abs(area/2);
    const hh=Math.max(1.6,h*k*HX),[wc,rc]=pal[kind]||pal.o,key=Math.floor(cx/(48*k/.3))+","+Math.floor(cz/(48*k/.3)),wall=[],roof=[],wuv=[];
    const pitched=(kind==="h"||kind==="s"||kind==="t"||cfg.roof==="gassho")&&area<(cfg.roof==="gassho"?900:260)&&h<14;
    if(pitched){/* hộp hướng theo cạnh dài + mái dốc */
      let best=null;for(let i=0;i<R.length;i++){const a=R[i],b=R[(i+1)%R.length];const ang=Math.atan2(b[1]-a[1],b[0]-a[0]),ca=Math.cos(ang),sa=Math.sin(ang);let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
        R.forEach(p=>{const u=(p[0]-cx)*ca+(p[1]-cz)*sa,v=-(p[0]-cx)*sa+(p[1]-cz)*ca;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v)});const ar=(u1-u0)*(v1-v0);if(!best||ar<best.ar)best={ar,ca,sa,u0,u1,v0,v1}}
      let {ca,sa,u0,u1,v0,v1}=best;if(v1-v0>u1-u0){[ca,sa]=[-sa,ca];[u0,u1,v0,v1]=[v0,v1,-u1,-u0]}
      const Pq=(u,v,y)=>[cx+u*ca-v*sa,y,cz+u*sa+v*ca],wh=Math.min(hh,cfg.roof==="gassho"?1.4:2.2),rh=cfg.roof==="gassho"?(v1-v0)*.9:(v1-v0)*.38,ov=.25;
      const q=(a,b,c2,d,arr)=>arr.push(...a,...b,...c2,...a,...c2,...d);
      const c00=Pq(u0,v0,0),c10=Pq(u1,v0,0),c11=Pq(u1,v1,0),c01=Pq(u0,v1,0),t00=Pq(u0,v0,wh),t10=Pq(u1,v0,wh),t11=Pq(u1,v1,wh),t01=Pq(u0,v1,wh);
      q(c00,c10,t10,t00,wall);q(c10,c11,t11,t10,wall);q(c11,c01,t01,t11,wall);q(c01,c00,t00,t01,wall);[u1-u0,v1-v0,u1-u0,v1-v0].forEach(L=>quadUV(L,wh,wuv));
      const vm=(v0+v1)/2,r0=Pq(u0-ov,v0-ov,wh-.15),r1=Pq(u1+ov,v0-ov,wh-.15),r2=Pq(u1+ov,vm,wh+rh),r3=Pq(u0-ov,vm,wh+rh),r4=Pq(u1+ov,v1+ov,wh-.15),r5=Pq(u0-ov,v1+ov,wh-.15);
      q(r0,r1,r2,r3,roof);q(r3,r2,r4,r5,roof);wall.push(...t00,...Pq(u0,vm,wh+rh),...t01,...t10,...t11,...Pq(u1,vm,wh+rh));for(let q2=0;q2<6;q2++)wuv.push(.03,.03);
      if(W){const sn=[];q(Pq(u0-ov,vm-(v1-v0)*.18,wh+rh*.62),Pq(u1+ov,vm-(v1-v0)*.18,wh+rh*.62),Pq(u1+ov,vm,wh+rh+.02),Pq(u0-ov,vm,wh+rh+.02),sn);q(Pq(u0-ov,vm,wh+rh+.02),Pq(u1+ov,vm,wh+rh+.02),Pq(u1+ov,vm+(v1-v0)*.18,wh+rh*.62),Pq(u0-ov,vm+(v1-v0)*.18,wh+rh*.62),sn);push(key,sn,col.set("#ffffff"))}}
    else{for(let i=0;i<R.length;i++){const a=R[i],b=R[(i+1)%R.length];wall.push(a[0],0,a[1],b[0],0,b[1],b[0],hh,b[1],a[0],0,a[1],b[0],hh,b[1],a[0],hh,a[1]);quadUV(Math.hypot(b[0]-a[0],b[1]-a[1]),hh,wuv)}flatTris([R],hh,roof);
      }
    push(key,wall,col.set(wc).offsetHSL(0,0,(rng()-.5)*.06),wuv);push(key,roof,col.set(W&&(!pitched||cfg.roof==="gassho")?"#eef2f7":rc).offsetHSL(0,0,(rng()-.5)*.05));
    fillPoly([R],1)});
  const winT=canvasTex(64,64,(c)=>{c.fillStyle="#ffffff";c.fillRect(0,0,64,64);c.fillStyle="#d9dde3";c.fillRect(14,12,36,34);c.fillStyle=season==="night"?"#ffe7a8":"#7c93ad";c.fillRect(17,15,30,28);c.fillStyle="#d9dde3";c.fillRect(31,15,2,28)});
  winT.wrapS=winT.wrapT=THREE.RepeatWrapping;winT.magFilter=THREE.LinearFilter;winT.anisotropy=8;
  const bmat=new THREE.MeshToonMaterial({vertexColors:true,gradientMap:toonGrad(),side:THREE.DoubleSide,map:winT});
  if(season==="night"||cfg.dusk){const em=canvasTex(64,64,(c)=>{c.fillStyle="#000";c.fillRect(0,0,64,64);c.fillStyle="#ffffff";c.fillRect(17,15,30,28)});em.wrapS=em.wrapT=THREE.RepeatWrapping;bmat.emissive=new THREE.Color(season==="night"?"#ffcf70":"#ffb060");bmat.emissiveMap=em;bmat.emissiveIntensity=season==="night"?.85:.35}
  chunks.forEach(ch=>{const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(ch.p),3));g.setAttribute("color",new THREE.BufferAttribute(new Float32Array(ch.c),3));g.setAttribute("uv",new THREE.BufferAttribute(new Float32Array(ch.u),2));g.computeVertexNormals();
    const m=new THREE.Mesh(g,bmat);m.castShadow=true;m.receiveShadow=true;m.userData.osm=true;m.userData.noBake=true;scene.add(m)});
  /* cột điện + dây điện, đèn đường (bỏ chỗ trùng nhà/nước/vùng trung tâm) */
  {const okP=(x,z)=>{const id=gi(x,z);return !(id>=0&&(grid[id]===1||grid[id]===3))&&!clr(x,z,null)&&!(opt.noTree&&opt.noTree(x,z))&&Math.hypot(x,z)<LIM*2.6};
   const PL=poles.filter(p=>okP(p[0],p[1])).slice(0,900),LP=lamps.filter(p=>okP(p[0],p[1])).slice(0,500),o=new THREE.Object3D(),ph=10*k*1.1;
   if(PL.length){const pg=new THREE.CylinderGeometry(.09,.13,ph,6);pg.translate(0,ph/2,0);const cb=new THREE.BoxGeometry(1.1,.08,.08);cb.translate(0,ph*.9,0);
     const pm=new THREE.InstancedMesh(pg,M("#9a958c"),PL.length),cm2=new THREE.InstancedMesh(cb,M("#6b6670"),PL.length);
     PL.forEach((p,i)=>{o.position.set(p[0],0,p[1]);o.rotation.set(0,p[2]+Math.PI/2,0);o.scale.setScalar(1);o.updateMatrix();pm.setMatrixAt(i,o.matrix);cm2.setMatrixAt(i,o.matrix)});scene.add(pm,cm2);
     const wv=[];for(let i=0;i+1<PL.length;i++){const a=PL[i],b=PL[i+1],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(d>pstep*1.6||d<1)continue;[-.45,.45].forEach(off=>{const ca=Math.cos(a[2]),sa=Math.sin(a[2]);wv.push(a[0]+ca*off,ph*.9,a[1]-sa*off,b[0]+ca*off,ph*.9,b[1]-sa*off)})}
     if(wv.length){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(new Float32Array(wv),3));scene.add(new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x3a3640,transparent:true,opacity:.55})))}
     PL.forEach(p=>{const id=gi(p[0],p[1]);if(id>=0)grid[id]=1})}
   if(LP.length){const lh=7*k*1.1,lg=new THREE.CylinderGeometry(.07,.09,lh,6);lg.translate(0,lh/2,0);const hg=new THREE.BoxGeometry(.25,.14,.9);hg.translate(0,lh,.35);
     const lm=new THREE.InstancedMesh(lg,M("#5a5f6b"),LP.length),hm=new THREE.InstancedMesh(hg,season==="night"?new THREE.MeshBasicMaterial({color:0xfff2b0}):M("#e9eef5"),LP.length);
     LP.forEach((p,i)=>{o.position.set(p[0],0,p[1]);o.rotation.set(0,p[2],0);o.updateMatrix();lm.setMatrixAt(i,o.matrix);hm.setMatrixAt(i,o.matrix)});scene.add(lm,hm);LP.forEach(p=>{const id=gi(p[0],p[1]);if(id>=0)grid[id]=1})}}
  /* cây trong rừng, công viên */
  const TK={winter:["pinesnow"],spring:["sakura","green","pine"],rain:["green","pine"],summer:["green","pine"],night:["pine","green"],autumn:["momiji","amber","pine","green"]}[season]||["green"];
  const pts=[];const want=(cls)=>cls==="forest"?1/14:cls==="park"?1/90:cls==="cem"?1/120:0;
  Object.entries(layers).forEach(([cls,list])=>{const d=want(cls);if(!d)return;list.forEach(R=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;R[0].forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])});
    const n=Math.min(1400,Math.round((x1-x0)*(z1-z0)*d*(k>.4?.6:1)));for(let i=0;i<n&&pts.length<4600;i++){const x=x0+rng()*(x1-x0),z=z0+rng()*(z1-z0);if(!ptIn(R[0],x,z)||R.slice(1).some(h=>ptIn(h,x,z)))continue;const id=gi(x,z);if(id>=0&&grid[id])continue;if(clr(x,z,null)||(opt.noTree&&opt.noTree(x,z)))continue;pts.push([x,z,.8+rng()*.7,TK[(rng()*TK.length)|0]])}})});
  const o3=new THREE.Object3D();const plant=(pts)=>{const byK={};pts.forEach(p=>(byK[p[3]]=byK[p[3]]||[]).push(p));
  const CK={sakura:["#f29ab8","#f7b8cc"],momiji:["#d9472f","#f0743a"],amber:["#e8892c","#f5b04a"],green:["#3f9d62","#5cb87c"],pine:["#2f7f55","#3a8f60"],pinesnow:["#2f7f55","#ffffff"]};
  Object.entries(byK).forEach(([kn,list])=>{const cone=kn==="pine"||kn==="pinesnow";const tg=new THREE.CylinderGeometry(.14,.2,1.2,5,1,true);tg.translate(0,.6,0);const cg=cone?new THREE.ConeGeometry(1.2,2.6,6,1,true):new THREE.IcosahedronGeometry(1.05,0);cg.translate(0,cone?2.2:2.1,0);
    const tm=new THREE.InstancedMesh(tg,M("#6b4433"),list.length),cm=new THREE.InstancedMesh(cg,M(CK[kn][0]),list.length);
    list.forEach((p,i)=>{o3.position.set(p[0],0,p[1]);o3.rotation.y=rng()*6;o3.scale.setScalar(p[2]);o3.updateMatrix();tm.setMatrixAt(i,o3.matrix);cm.setMatrixAt(i,o3.matrix);cm.setColorAt(i,col.set(CK[kn][(i%2)])) });
    scene.add(tm,cm);
    if(kn==="pinesnow"){const sg=new THREE.ConeGeometry(.7,1,6,1,true);sg.translate(0,3.1,0);const sm=new THREE.InstancedMesh(sg,M("#ffffff"),list.length);list.forEach((p,i)=>{cm.getMatrixAt(i,o3.matrix);sm.setMatrixAt(i,o3.matrix)});scene.add(sm)}
    list.forEach(p=>{const id=gi(p[0],p[1]);if(id>=0)grid[id]=1})})};plant(pts);
  /* điểm có tên */
  const poi=(D.poi||[]).map(([n,kd,x,z])=>{const [X,Z]=T([x,z]);return {n,k:kd,x:X,z:Z}});
  const blocked=(x,z)=>{if(Math.hypot(x,z)>LIM-2)return true;const id=gi(x,z);return id>=0&&(grid[id]===1||grid[id]===3)};
  const onRoad=(x,z)=>{const id=gi(x,z);return id>=0&&grid[id]===2};
  const isWater=(x,z)=>{const id=gi(x,z);return id>=0&&grid[id]===3};
  const nearestLand=(x,z,minR=0)=>{for(let r=minR;r<90;r+=1)for(let a=0;a<TAU;a+=.15){const X=x+Math.cos(a)*r,Z=z+Math.sin(a)*r,id=gi(X,Z);if(id>=0&&(grid[id]===0||grid[id]===2))return [X,Z]}return null};
  const nearestWater=(x,z)=>{for(let r=0;r<80;r+=1)for(let a=0;a<TAU;a+=.2){const X=x+Math.cos(a)*r,Z=z+Math.sin(a)*r,id=gi(X,Z);if(id>=0&&grid[id]===3)return [X,Z]}return null};
  const openAt=(x,z,r)=>{for(let a=0;a<TAU;a+=Math.PI/4)for(const d of [r*.5,r]){const id=gi(x+Math.cos(a)*d,z+Math.sin(a)*d);if(id>=0&&grid[id]===1)return false}return true};
  const plantIn=(fn,n,R0)=>{const P=[];for(let i=0;i<n*6&&P.length<n;i++){const a=rng()*TAU,r=Math.sqrt(rng())*R0,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!fn(x,z))continue;const id=gi(x,z);if(id>=0&&grid[id])continue;if(clr(x,z,null)||(opt.noTree&&opt.noTree(x,z)))continue;P.push([x,z,.8+rng()*.7,TK[(rng()*TK.length)|0]])}plant(P);return P.length};
  return {blocked,onRoad,isWater,nearestLand,poi,T,rot,nB,nearestWater,LIM,footP,gi,grid,plantIn,openAt}}
/* tháp Tokyo & Skytree đơn giản */
/* dây cá chép bay ngang (màn 333 con cá chép ở tháp Tokyo) */
function carpLine(x1,z1,x2,z2,y,n,ticks){const g=new THREE.Group(),C=["#e5484d","#3d6fd6","#2b2540","#f5a043","#2f9e64","#e85d8c"];const L=Math.hypot(x2-x1,z2-z1),ang=Math.atan2(z2-z1,x2-x1);
  const rope=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,L,4),M("#5a5f6b"));rope.rotation.z=Math.PI/2;rope.rotation.y=-ang;rope.position.set((x1+x2)/2,y,(z1+z2)/2);g.add(rope);
  const carps=[];for(let i=1;i<n;i++){const t=i/n,cp=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.32,.12,1.7,8,1,true),M(C[i%C.length],{side:THREE.DoubleSide}));b.rotation.z=Math.PI/2;b.position.x=.85;cp.add(b);
    const e=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),M("#ffffff"));e.position.set(.12,.12,.2);cp.add(e);const e2=e.clone();e2.position.z=-.2;cp.add(e2);cp.position.set(x1+(x2-x1)*t,y-.4-Math.sin(t*Math.PI)*.8,z1+(z2-z1)*t);cp.rotation.y=-ang+Math.PI/2;g.add(cp);carps.push(cp)}
  [[x1,z1],[x2,z2]].forEach(([x,z])=>g.add(cyl(.12,.15,y+.4,"#8a8f99",x,(y+.4)/2,z,8)));
  if(ticks)ticks.push(()=>{const t=performance.now()/600;carps.forEach((c,i)=>{c.rotation.z=Math.sin(t+i*.7)*.25;c.children[0].scale.y=1+Math.sin(t*1.7+i)*.08})});return g}
function tower3(){const g=new THREE.Group();const H=30;for(let i=0;i<6;i++){const y0=i*H/6,r0=6*(1-i/6.4)+.4,r1=6*(1-(i+1)/6.4)+.4;const c=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,H/6,4,1,true),M(i%2?"#f6f4f0":"#e8553f",{side:THREE.DoubleSide,wireframe:false}));c.position.y=y0+H/12;c.rotation.y=Math.PI/4;g.add(c)}
  [10,18].forEach((y,i)=>g.add(outline(cyl(i?1.6:3,i?1.6:3,1.4,"#e8553f",0,y,0,12))));g.add(cyl(.25,.45,8,"#e8553f",0,H+4,0,8));g.traverse(o=>{if(o.isMesh)o.castShadow=true});return g}
function skytree3(){const g=new THREE.Group();g.add(outline(cyl(1.1,3.2,60,"#e9eef5",0,30,0,10)));g.add(outline(cyl(3,3,2.4,"#c9d6e6",0,35,0,16)));g.add(outline(cyl(2.2,2.2,1.6,"#c9d6e6",0,45,0,16)));g.add(cyl(.3,.6,12,"#e9eef5",0,66,0,8));return g}

/* gộp vật tĩnh theo vật liệu và ô lưới để giảm số lần vẽ (draw call) — theo checklist tối ưu Three.js */
function bakeStatic(scene,ticks,cell=22){scene.updateMatrixWorld(true);const cand=[],snap=new Map();
  const okMesh=o=>{if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.geometry||!o.geometry.attributes.position||Array.isArray(o.material)||o.userData.pick||o.userData.ground)return false;
    for(let q=o;q&&q!==scene;q=q.parent){if(!q.visible||q.userData.billboard||q.userData.isPlayer||q.userData.legL||q.userData.body||q.userData.carps||q.userData.isBadge||q.userData.noBake)return false}return o.matrixWorld.determinant()>0};
  scene.traverse(o=>{if(okMesh(o)){cand.push(o);snap.set(o,o.matrixWorld.clone())}});
  const run=()=>ticks.forEach(f=>{try{f(.05)}catch(e){}});const t0=performance.now();while(performance.now()-t0<3);run();while(performance.now()-t0<6);run();
  scene.updateMatrixWorld(true);const groups=new Map(),c=new THREE.Vector3();
  cand.forEach(o=>{if(!o.matrixWorld.equals(snap.get(o)))return;const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();c.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);
    const key=o.material.uuid+"|"+Math.floor(c.x/cell)+","+Math.floor(c.z/cell);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o)});
  const outs=new Map();let made=0,removed=0;
  groups.forEach((list,key)=>{if(list.length<2)return;let n=0;const parts=list.map(o=>{let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();const t=new THREE.BufferGeometry();t.setAttribute("position",g.attributes.position.clone());
      if(g.attributes.normal)t.setAttribute("normal",g.attributes.normal.clone());else t.computeVertexNormals();const cnt=t.attributes.position.count;t.setAttribute("uv",g.attributes.uv&&g.attributes.uv.itemSize===2?g.attributes.uv.clone():new THREE.BufferAttribute(new Float32Array(cnt*2),2));t.applyMatrix4(o.matrixWorld);n+=cnt;return t});
    const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2);let k=0;parts.forEach(t=>{P.set(t.attributes.position.array,k*3);N.set(t.attributes.normal.array,k*3);U.set(t.attributes.uv.array,k*2);k+=t.attributes.position.count;t.dispose()});
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(P,3));geo.setAttribute("normal",new THREE.BufferAttribute(N,3));geo.setAttribute("uv",new THREE.BufferAttribute(U,2));geo.computeBoundingSphere();geo.computeBoundingBox();
    const m=new THREE.Mesh(geo,list[0].material);m.castShadow=list.some(o=>o.castShadow);m.receiveShadow=list.some(o=>o.receiveShadow);m.matrixAutoUpdate=false;m.userData.baked=true;
    const cellK=key.split("|")[1];if(list[0].userData.isOutline){m.userData.isOutline=true;outs.set(cellK,m)}scene.add(m);made++;
    list.forEach(o=>{o.parent&&o.parent.remove(o);removed++})});
  scene.traverse(o=>{if(o.userData.baked&&!o.userData.isOutline){const ok=o.geometry.boundingSphere.center;const k=Math.floor(ok.x/cell)+","+Math.floor(ok.z/cell);o.userData.cellOut=outs.get(k)||null}});
  return {made,removed,cand:cand.length,stat:[...groups.values()].reduce((a,l)=>a+l.length,0),single:[...groups.values()].filter(l=>l.length<2).length}}
/* vật che nhân vật: làm mờ những gì nằm giữa máy quay và nhân vật */
function occluder(scene,camera,getTargets){const ray=new THREE.Raycaster();ray.camera=camera;const faded=new Map(),FM=new Map();let fr=0;const dir=new THREE.Vector3(),to=new THREE.Vector3();
  const fadeMat=m=>{if(!FM.has(m)){const f=m.clone();f.transparent=true;f.opacity=.28;f.depthWrite=false;FM.set(m,f)}return FM.get(m)};
  const skip=o=>{for(let q=o;q;q=q.parent){if(q.userData.ground||q.userData.isPlayer||q.userData.noFade)return true}return false};
  const fn=()=>{if(++fr%3)return;const hit=new Set();
    getTargets().forEach(t=>{[1,1.9].forEach(h=>{to.set(t.x,t.y+h,t.z);dir.subVectors(to,camera.position);const L=dir.length();dir.normalize();ray.set(camera.position,dir);ray.far=L-.6;
      ray.intersectObjects(scene.children,true).forEach(i=>{const o=i.object;if(!o.isMesh||o.userData.isOutline||!o.material||Array.isArray(o.material)||skip(o))return;if(o.material.transparent&&!faded.has(o))return;hit.add(o)})})});
    faded.forEach((m0,o)=>{if(!hit.has(o)){o.material=m0;o.children.forEach(c=>{if(c.userData.isOutline)c.visible=true});const co=o.userData.cellOut;if(co&&!--co.userData.hid)co.visible=true;faded.delete(o)}});
    [...hit].forEach(o=>{let top=o;while(top.parent&&top.parent!==scene)top=top.parent;if(top===o||top.userData.legL||top.userData.body)return;let n=0;top.traverse(m=>{if(m.isMesh)n++});if(n>80)return;
      top.traverse(m=>{if(m.isMesh&&!m.userData.isOutline&&m.material&&!Array.isArray(m.material)&&!m.material.transparent&&!skip(m))hit.add(m)})});
    hit.forEach(o=>{if(faded.has(o))return;faded.set(o,o.material);o.material=fadeMat(o.material);o.children.forEach(c=>{if(c.userData.isOutline)c.visible=false});const co=o.userData.cellOut;if(co){co.userData.hid=(co.userData.hid||0)+1;co.visible=false}})};
  fn.clear=()=>{if(!faded.size)return;faded.forEach((m0,o)=>{o.material=m0;o.children.forEach(c=>{if(c.userData.isOutline)c.visible=true});const co=o.userData.cellOut;if(co&&!--co.userData.hid)co.visible=true});faded.clear()};return fn}
/* ---------------- game ---------------- */
export async function start(root,n,api){
  const L=LEVELS[n]||(api.lesson?genLevel(n,api.lesson):null);if(!L)throw new Error("no level");const T=L.T||null;
  const LD=LMAPS.has(n)&&!/g3noosm/.test(location.search)?await loadLessonMap(n):null,CORE=40;
  if(!document.getElementById("g3css")){const st=document.createElement("style");st.id="g3css";st.textContent=CSS;document.head.appendChild(st)}
  const esc=api.esc, R=t=>api.rb(t), plain=t=>api.plainOf(t), roma=t=>api.roma(api.kanaOf(t));
  const KEY="g3-"+n; let prog={npc:[],words:[]};try{prog={...prog,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(prog))}catch(e){}};
  let av={...TAI};try{av={...av,...JSON.parse(localStorage.getItem("g3-avatar")||"{}")}}catch(e){}
  root.className="g3";root.innerHTML=`<div class="g3-load" id="g3Load">Đang dựng ${esc(L.title)}…</div>`;
  try{await Promise.race([document.fonts.load(`700 40px "Kaisei Decol"`),new Promise(r=>setTimeout(r,1500))])}catch(e){}
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
  const mobile=matchMedia("(pointer:coarse)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.6:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  root.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute("aria-label",`Khu phố 3D ${L.sub}`);
  const scene=new THREE.Scene();
  const SKY=T?(T.sky||(T.night?NIGHT:T.dusk?DUSK:DAY)):DAY,night=T&&T.night,dusk=T&&T.dusk;
  scene.background=canvasTex(4,256,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,SKY[0]);gr.addColorStop(.45,SKY[1]);gr.addColorStop(1,SKY[2]);g.fillStyle=gr;g.fillRect(0,0,W,H)});
  scene.fog=new THREE.Fog(T?new THREE.Color(SKY[T.indoor?2:1]).lerp(new THREE.Color(0xffffff),.25):0xdfeef7,T&&T.indoor?60:80,T&&T.indoor?160:220);
  scene.add(new THREE.HemisphereLight(night?0x8a8ad0:dusk?0xe8c8e0:0xffffff,night?0x30304a:T&&T.indoor?0xd9cdb8:0xb9d4a8,night?.75:dusk?.72:T&&T.indoor?1.4:1.25));
  const sun=new THREE.DirectionalLight(night?0xaab4ff:dusk?0xffc89a:0xfff3dd,night?.5:dusk?.8:T&&T.indoor?.9:1.5);sun.position.set(18,30,14);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
  Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:80});sun.shadow.bias=-.0005;scene.add(sun,sun.target);
  if(LD){scene.fog.near=120;scene.fog.far=560}
  const camera=new THREE.PerspectiveCamera(50,1,.1,LD?1500:500);
  const picks=[],solids=[],ticks=[];const wt=[],seenW=new Set(),lampObjs=[];
  if(L.gen){const W=buildWorld(scene,T,L.plan,picks,solids,ticks,rngOf(n*13+5),{noOuter:!!LD});wt.push(...W.targets)}else{buildCity(scene,L.words,picks,solids);enrichCity(scene,solids,ticks,rngOf(7),!!LD);
  picks.forEach(o=>{let w=null;o.traverse(c=>{if(!w&&c.userData.pick&&c.userData.pick.w)w=c.userData.pick.w});if(!w)return;
    if(w==="denki"){lampObjs.push(o);return}if(w==="daigaku"&&seenW.has(w))return;seenW.add(w);if(w==="daigaku"||w==="byouin"){const a=new THREE.Object3D();a.position.set(w==="daigaku"?-20:19,w==="daigaku"?6.6:9.4,w==="daigaku"?-19.5:-17.2);scene.add(a);wt.push([w,a,.4,1.8]);return}wt.push([w,o,.6,1])});
  lampObjs.sort((a,b)=>Math.hypot(a.position.x-2,a.position.z-3.5)-Math.hypot(b.position.x-2,b.position.z-3.5)).slice(0,3).forEach(o=>wt.push(["denki",o,.5,1]));}
  /* ---------- bản đồ thật quanh khu vực bài học ---------- */
  let osmL=null;
  if(LD){scene.updateMatrixWorld(true);const bb=new THREE.Box3();
    [...scene.children].forEach(o=>{if(o.isLight||o.isCamera)return;const d=Math.hypot(o.position.x,o.position.z);
      if(d>=85&&(o.userData.farScene||o.userData.billboard)){if(d<420){const f=430/d;o.position.x*=f;o.position.z*=f;o.scale.multiplyScalar(f)}return}
      if((Math.abs(o.position.x)>CORE+4||Math.abs(o.position.z)>CORE+4)&&!o.userData.keep&&o.position.y<20){scene.remove(o);return}
      bb.setFromObject(o);if(bb.isEmpty())return;
      if(bb.max.x>CORE+1||bb.min.x<-CORE-1||bb.max.z>CORE+1||bb.min.z<-CORE-1)o.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&m.material&&!Array.isArray(m.material))m.material=clipBox(m.material,CORE,true)})});
    const SE=T?(T.ps==="snow"?"winter":T.ps==="petal"?"spring":T.ps==="maple"||T.ps==="leaf"?"autumn":T.night?"night":"summer"):"spring";
    const inC=(x,z,p=0)=>Math.abs(x)<CORE+p&&Math.abs(z)<CORE+p;
    osmL=osmWorld(scene,LD,{off:[0,0],rot:0,clear:0,...(LCFG[n]||{})},{season:SE,ticks,seed:n*17+1,walk:150,core:CORE,base:T&&T.ground?T.ground:(SE==="winter"?"#eef3f9":"#a9cf95"),
      noTree:(x,z)=>inC(x,z,2),clear:(x,z,Rg)=>inC(x,z,3)||(Rg&&Rg.some(p=>inC(p[0],p[1],1)))})}
  const BK=location.search.includes("g3nobake")?null:bakeStatic(scene,ticks);if(BK)picks.forEach(o=>{if(!o.isMesh&&!o.userData.legL)bakeRig(o)});
  const isSolid=(x,z,p=.4)=>solids.some(s=>x>s.x0-p&&x<s.x1+p&&z>s.z0-p&&z<s.z1+p);
  if(L.gen)L.npcs.forEach(d=>{if(!isSolid(d.pos[0],d.pos[1],.8))return;for(let r=1;r<14;r+=.7)for(let a=0;a<TAU;a+=.5){const x=d.pos[0]+Math.cos(a)*r,z=d.pos[1]+Math.sin(a)*r;if(Math.abs(x)<36&&Math.abs(z)<36&&!isSolid(x,z,.8)){d.pos=[x,z];return}}});
  /* nhân vật */
  await loadTai();let player=makePlayer(av);player.position.set(2,0,3.5);scene.add(player);cityTraffic(scene,ticks,()=>player,!L.gen&&LD?{lim:CORE-1}:L.gen?{lim:LD?CORE-1:48,cars:!!T.traffic,noZ:T.key==='station',lane:T.path==='road'?7.4:T.path==='floor'?2.4:1.7,ok:(x,z)=>!isSolid(x,z,.9)}:{});
  if(T&&T.ps){const pts=particles(T.ps,T.ps==="snow"?520:300);scene.add(pts);ticks.push(dt=>pts.userData.tick(dt,player.position.x,player.position.z))}
  const npcs=L.npcs.map(d=>{const c=makeChar(d.look.style?{...d.look,kid:d.kid}:d.look);c.position.set(d.pos[0],0,d.pos[1]);c.rotation.y=Math.atan2(-d.pos[0],-d.pos[1])*.5;scene.add(c);
    const b=badge(prog.npc.includes(d.id)?"done":"talk");b.position.y=2.3;c.add(b);c.userData.badge=b;c.traverse(o=>{if(o.isMesh)o.userData.pick={npc:d.id}});picks.push(c);solids.push({x0:d.pos[0]-.4,x1:d.pos[0]+.4,z0:d.pos[1]-.4,z1:d.pos[1]+.4,npc:d.id});return {d,c}});
  const extra=makeChar({skin:"#f3cfae",hair:"#5a4038",style:"bun",top:"#9cc9b4",bottom:"#3d6f8f",acc:"coat",fem:1});extra.position.set(21.5,0,-12.2);if(!L.gen)scene.add(extra);
  /* HUD */
  const tot=Object.keys(L.words).length;
  root.insertAdjacentHTML("beforeend",`
    <div class="g3-top"><button class="g3-btn" id="g3Exit" type="button" aria-label="Thoát minigame">‹ Thoát</button>
      <div class="g3-title"><b lang="ja">${esc(L.title)}</b><span>${esc(L.sub)}</span></div>
      <button class="g3-btn" id="g3Me" type="button" aria-label="Đổi nhân vật">Nhân vật</button><button class="g3-btn" id="g3Book" type="button">Sổ từ <b id="g3Wc"></b></button></div>
    <div class="g3-stats"><span>Đã gặp <b id="g3Nc"></b></span></div>${LD?'<div class="g3-osm">Bản đồ thật: © OpenStreetMap contributors</div>':''}
    <div class="g3-zoom"><button type="button" id="g3Zin" aria-label="Phóng to">+</button><button type="button" id="g3Zout" aria-label="Thu nhỏ">−</button></div>
    <div class="g3-hint" id="g3Hint">${mobile?"Chạm vào đường để đi · chạm người có dấu ! để nói chuyện · chạm chỗ có dấu あ để học từ mới · kéo để xoay, chụm 2 ngón để thu phóng":"Bấm vào đường hoặc W A S D để đi · bấm người có dấu ! để nói chuyện · bấm chỗ có dấu あ để học từ mới · kéo chuột để xoay, lăn chuột để thu phóng"}</div>
    <button class="g3-talk" id="g3Talk" type="button" hidden></button>
    <div id="g3Panel"></div>`);
  const $=id=>root.querySelector("#"+id);
  scene.updateMatrixWorld(true);const WM=wordMarkers(scene,wt,k=>prog.words.includes(k),k=>({w:k}));ticks.push(()=>WM.tick(performance.now(),Math.max(1,dist/17)));
  const hud=()=>{WM&&WM.refresh();$("g3Wc").textContent=`${prog.words.length}/${tot}`;$("g3Nc").textContent=`${prog.npc.length}/${L.npcs.length}`};hud();
  $("g3Load").remove();
  /* camera */
  let yaw=.62,dist=mobile?15:17,pitch=.78,lookOff=0;const camT=new THREE.Vector3();
  let shR=22;
  function placeCam(snap){const p=player.position,zf=Math.min(1,Math.max(0,(dist-18)/40)),pe=pitch+zf*(1.2-pitch)*.8;camT.set(p.x+Math.sin(yaw)*dist*Math.cos(pe),p.y+dist*Math.sin(pe),p.z+Math.cos(yaw)*dist*Math.cos(pe));if(snap)camera.position.copy(camT);else camera.position.lerp(camT,.12);camera.lookAt(p.x,p.y+1.1-lookOff,p.z);
    const want=Math.max(22,dist*1.2);if(Math.abs(want-shR)>2){shR=want;Object.assign(sun.shadow.camera,{left:-shR,right:shR,top:shR,bottom:-shR,far:60+shR*2});sun.shadow.camera.updateProjectionMatrix()}
    sun.position.set(p.x+18,30+shR*.3,p.z+14);sun.target.position.set(p.x,0,p.z)}
  function resize(){const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();placeCam(true);addEventListener("resize",resize);
  $("g3Zin").onclick=()=>dist=Math.max(6,dist/1.3);$("g3Zout").onclick=()=>dist=Math.min(58,dist*1.3);
  /* di chuyển */
  let target=null,goal=null,panelOpen=false;const keys=new Set();
  const blocked=(x,z)=>((Math.abs(x)>37||Math.abs(z)>37)?(osmL?osmL.blocked(x,z):true):false)||solids.some(s=>x>s.x0-.35&&x<s.x1+.35&&z>s.z0-.35&&z<s.z1+.35);
  function step(dx,dz){const p=player.position,nx=p.x+dx,nz=p.z+dz;if(!blocked(nx,nz)){p.x=nx;p.z=nz;return true}if(!blocked(nx,p.z)){p.x=nx;return true}if(!blocked(p.x,nz)){p.z=nz;return true}return false}
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  function hit(e){const r=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
    const hs=ray.intersectObjects(scene.children,true);for(const h of hs){const u=h.object.userData;if(u.pick)return {pick:u.pick,point:h.point,obj:h.object};if(u.ground)return {point:h.point}}return null}
  let down=null,dragging=false;
  const pts=new Map();let pinch=null;
  renderer.domElement.addEventListener("pointerdown",e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),dist};down=null;dragging=true;return}down={x:e.clientX,y:e.clientY,yaw,pitch};dragging=false;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener("pointercancel",e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null});
  renderer.domElement.addEventListener("pointermove",e=>{if(pts.has(e.pointerId))pts.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&pts.size===2){const [a,b]=[...pts.values()];dist=Math.min(58,Math.max(6,pinch.dist*pinch.d/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1]))));return}if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!dragging&&Math.hypot(dx,dy)>10)dragging=true;if(dragging){yaw=down.yaw-dx*.006;pitch=Math.min(1.25,Math.max(.35,down.pitch+dy*.004))}});
  renderer.domElement.addEventListener("pointerup",e=>{pts.delete(e.pointerId);if(pinch){if(pts.size<2)pinch=null;down=null;dragging=false;return}const was=dragging;down=null;dragging=false;if(was||panelOpen)return;const h=hit(e);if(!h)return;
    if(h.pick&&h.pick.far&&h.pick.w){wordCard(h.pick.w);hintOff();return}
    if(h.pick){goal=h.pick;const p=h.pick.npc?npcs.find(o=>o.d.id===h.pick.npc).c.position:h.point;target=new THREE.Vector3(p.x,0,p.z);hintOff()}
    else{goal=null;target=new THREE.Vector3(h.point.x,0,h.point.z);hintOff()}});
  renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();dist=Math.min(58,Math.max(6,dist*(1+e.deltaY*.0012)))},{passive:false});
  const kd=e=>{if(e.key==="Escape"){if(panelOpen)closePanel();return}if(panelOpen)return;const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)){keys.add(k);target=null;goal=null;hintOff();e.preventDefault()}
    if((k==="e"||k==="enter")&&near&&e.target===renderer.domElement){talk(near.d.id);e.preventDefault()}};
  const ku=e=>keys.delete(e.key.toLowerCase());
  addEventListener("keydown",kd);addEventListener("keyup",ku);
  let hintT=setTimeout(()=>hintOff(),9000);function hintOff(){const h=$("g3Hint");if(h)h.style.opacity=0}
  /* bảng thoại / thẻ từ */
  const panel=$("g3Panel");let opener=null;
  function openPanel(html){try{hintOff()}catch(e){}opener=document.activeElement;panel.innerHTML=`<div class="g3-panel" role="dialog" aria-modal="false">${html}</div>`;panelOpen=true;$("g3Talk").hidden=true;const f=panel.querySelector("[data-focus]")||panel.querySelector("button");if(f)setTimeout(()=>f.focus({preventScroll:true}),30)}
  function closePanel(){panel.innerHTML="";panelOpen=false;try{speechSynthesis.cancel()}catch(e){}(opener&&opener.focus?opener:renderer.domElement).focus({preventScroll:true})}
  const sayJ=t=>{try{api.say(api.spOf?t:plain(t))}catch(e){}};
  function learn(k,quiet){if(!prog.words.includes(k)){prog.words.push(k);save();hud();if(!quiet)api.toast(`+1 từ mới: ${plain(L.words[k][0])}`,1800);return true}return false}
  const rdOf=k=>L.words[k][3]||L.words[k][0];const romaW=k=>L.words[k][3]?api.roma(L.words[k][3]):roma(L.words[k][0]);
  function wordCard(k){const [j,v,ex,rd]=L.words[k];const isNew=learn(k,true);const showRd=rd&&!/\{/.test(j)&&rd!==j;
    openPanel(`<div class="g3-card"><div class="g3-who"><span>${isNew?"Từ mới!":"Đã có trong sổ"}</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="big" lang="ja">${R(j)}</div>${showRd?`<div class="g3-roma" lang="ja" style="font-size:1.05em">${esc(rd)}</div>`:""}<div class="g3-roma">${esc(romaW(k))}</div><div class="vi">${esc(v)}</div>${ex?`<div class="ex" lang="ja">${R(ex)}</div>`:""}
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-say>🔊 Nghe lại</button><button class="g3-next" type="button" data-x data-focus style="margin-left:0">Tiếp tục dạo</button></div></div>`);
    panel.querySelectorAll("[data-x]").forEach(b=>b.onclick=closePanel);panel.querySelector("[data-say]").onclick=()=>sayJ(rdOf(k));sayJ(rdOf(k));
    if(isNew)hud();checkDone()}
  function bookPanel(){const ks=Object.keys(L.words);
    openPanel(`<div class="g3-who"><b>Sổ từ</b><span>${prog.words.length}/${ks.length} từ</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="g3-book">${ks.map(k=>{const got=prog.words.includes(k),[j,v]=L.words[k];return got?`<button type="button" class="g3-w" data-k="${k}"><b lang="ja">${R(j)}</b><span>${esc(v)}</span></button>`:`<div class="g3-w no"><b>？</b><span>Chưa tìm thấy</span></div>`}).join("")}</div>`);
    panel.querySelector("[data-x]").onclick=closePanel;panel.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>sayJ(rdOf(b.dataset.k)))}
  $("g3Book").onclick=bookPanel;
  function talk(id){const o=npcs.find(x=>x.d.id===id);if(!o)return;const d=o.d;
    o.c.rotation.y=Math.atan2(player.position.x-o.c.position.x,player.position.z-o.c.position.z);player.rotation.y=Math.atan2(o.c.position.x-player.position.x,o.c.position.z-player.position.z);
    let i=0;
    const head=`<div class="g3-who"><b lang="ja">${esc(d.name)}</b><span>${esc(d.vn)} · ${esc(d.job)}</span><button class="g3-x" type="button" aria-label="Kết thúc cuộc trò chuyện" data-x>✕</button></div>`;
    function show(){const s=d.steps[i];
      if(!s){finish();return}
      if(s.n){openPanel(`${head}<div class="g3-line" lang="ja">${R(s.n)}</div><div class="g3-row"><button class="g3-small" type="button" data-say>🔊 Nghe</button><button class="g3-small" type="button" data-tr>Dịch</button><button class="g3-next" type="button" data-nx data-focus>Tiếp ›</button></div><div class="g3-sub" data-v hidden>${esc(s.v)}<div class="g3-roma">${esc(roma(s.n))}</div></div>`);
        sayJ(s.n);panel.querySelector("[data-say]").onclick=()=>sayJ(s.n);panel.querySelector("[data-tr]").onclick=()=>{panel.querySelector("[data-v]").hidden=false};panel.querySelector("[data-nx]").onclick=()=>{i++;show()};
      }else{const order=s.o.map((_,k)=>k).sort(()=>Math.random()-.5);
        openPanel(`${head}<div class="g3-q">${s.qj?esc(s.q):"Bạn trả lời: "+esc(s.q)}</div>${s.qj?`<div class="g3-line" lang="ja">${R(s.qj)}</div>${s.qv?`<div class="g3-sub">${esc(s.qv)}</div>`:""}`:""}<div class="g3-opts">${order.map(k=>`<button type="button" class="g3-opt" data-k="${k}" lang="ja">${R(s.o[k][0])}<span class="mk" aria-hidden="true"></span></button>`).join("")}</div><div id="g3Fb" aria-live="polite"></div>`);
        panel.querySelectorAll(".g3-opt").forEach(b=>b.onclick=()=>{const k=+b.dataset.k,fb=panel.querySelector("#g3Fb");
          if(k===0){b.classList.add("ok");b.querySelector(".mk").textContent="○";panel.querySelectorAll(".g3-opt").forEach(x=>x.disabled=true);const fu=s.full||s.o[0][0];sayJ(fu);
            fb.innerHTML=`<div class="g3-good"><b>正解！ Đúng rồi.</b>${s.full?`<div lang="ja">${R(s.full)}</div>`:""} ${esc(s.o[0][1])}<div class="g3-roma">${esc(roma(fu))}</div></div><div class="g3-row"><button class="g3-next" type="button" data-nx>Tiếp ›</button></div>`;
            const nx=fb.querySelector("[data-nx]");nx.onclick=()=>{i++;show()};nx.focus({preventScroll:true});
          }else{b.classList.add("no");b.disabled=true;b.querySelector(".mk").textContent="×";fb.innerHTML=`<div class="g3-why"><b>Chưa đúng.</b> ${esc(s.o[k][2])}<div class="g3-roma">${esc(roma(s.o[k][0]))}</div></div>`}})}
      panel.querySelector("[data-x]").onclick=closePanel}
    function finish(){const first=!prog.npc.includes(d.id);if(first){prog.npc.push(d.id);save()}d.learn.forEach(k=>learn(k,true));hud();
      o.c.remove(o.c.userData.badge);const b=badge("done");b.position.y=2.3;o.c.add(b);o.c.userData.badge=b;
      openPanel(`${head}<div class="g3-good"><b>${first?"Đã làm quen với "+esc(d.vn)+"!":"Đã nói chuyện lại với "+esc(d.vn)+"."}</b>${d.learn.length?` Từ mới vào sổ: <span lang="ja">${d.learn.map(k=>R(L.words[k][0])).join("、")}</span>`:""}</div><div class="g3-row"><button class="g3-next" type="button" data-x data-focus>Tiếp tục dạo</button></div>`);
      panel.querySelectorAll("[data-x]").forEach(b=>b.onclick=closePanel);checkDone()}
    show()}
  let finished=prog.npc.length>=L.npcs.length&&prog.words.length>=tot;
  function checkDone(){if(finished||prog.npc.length<L.npcs.length)return;finished=true;
    try{api.markReview()}catch(e){}
    setTimeout(()=>{openPanel(`<div class="g3-done"><h3 lang="ja">おめでとう！</h3><p>Bạn đã làm quen với cả ${L.npcs.length} người ở <b lang="ja">${esc(L.title)}</b>${prog.words.length<tot?` và nhặt được ${prog.words.length}/${tot} từ. ${L.gen?"Còn vài từ quanh đây, đi tìm các dấu あ nhé.":"Còn vài từ quanh phố, đi tìm tiếp nhé (gợi ý: cột cờ, đèn đường)."}`:` và nhặt đủ ${tot}/${tot} từ mới!`}</p><p>Hôm nay được tính là một ngày ôn bài cho con giáp của bạn.</p>
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-x>Dạo tiếp</button><button class="g3-next" type="button" data-out data-focus style="margin-left:0">Về bài học</button></div></div>`);
      panel.querySelector("[data-x]").onclick=closePanel;panel.querySelector("[data-out]").onclick=()=>api.exit()},400)}
  $("g3Exit").onclick=()=>api.exit();
  $("g3Me").onclick=()=>{root.classList.add("g3-av");dist=6.5;pitch=.45;lookOff=mobile?1.9:0;avatarPanel()};
  $("g3Talk").onclick=()=>{if(near)talk(near.d.id)};
  /* tạo nhân vật lần đầu */
  function rebuildPlayer(){const p=player.position.clone(),r=player.rotation.y;scene.remove(player);player=makePlayer(av);player.position.copy(p);player.rotation.y=r;scene.add(player)}
  function avatarPanel(){const HAIR=["#2e2420","#5a3a2a","#a8753a","#6d6a70"],TOP=["#d8d2cb","#3a3f52","#8a6a4e","#3d6fd6","#c23b2a","#2f9e64"],BOT=["#d3cdc6","#2a2d3a","#3b4a7a","#6b5a4a"],SK=["#fbe3cf","#f7d6b8","#e8bf98"],ST=[["side","Rẽ ngôi"],["short","Tóc ngắn"],["spiky","Tóc vuốt"],["cap","Đội mũ"]];
    const sw=(arr,key)=>arr.map(c=>`<button type="button" class="g3-sw${av[key]===c?" on":""}" style="background:${c}" data-k="${key}" data-v="${c}" aria-label="Màu ${c}"></button>`).join("");
    if(av.model!==false&&TAI_GLB){openPanel(`<div class="g3-who g3-avp"><b>Nhân vật Tài</b><span>${esc(L.sub)}</span></div>
      <p class="g3-sub">Mẫu 3D Tài dựng bằng Blender: tóc vuốt rẽ ngôi, kính tròn, khăn cổ lọ, áo khoác dạ.</p>
      <div class="g3-opts2"><button type="button" class="g3-chip on" aria-pressed="true">Mẫu 3D của Tài</button><button type="button" class="g3-chip" data-custom>Tự tạo nhân vật khác</button></div>
      <p class="g3-sub">Nhiệm vụ: làm quen với ${L.npcs.length} người có dấu <b style="color:#c23b2a">!</b> và tìm ${tot} từ mới quanh đây.</p>
      <div class="g3-row"><button class="g3-next" type="button" data-go data-focus>Bắt đầu khám phá ›</button></div>`);
      panel.querySelector("[data-custom]").onclick=()=>{av={...av,model:false};rebuildPlayer();avatarPanel()};
      panel.querySelector("[data-go]").onclick=()=>{try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}dist=mobile?15:17;lookOff=0;pitch=.78;root.classList.remove("g3-av");closePanel()};return}
    openPanel(`<div class="g3-who g3-avp"><b>Tạo nhân vật Tài</b><span>${esc(L.sub)}</span></div>
      <div class="g3-lbl">Kiểu tóc</div><div class="g3-opts2">${ST.map(([v,t])=>`<button type="button" class="g3-chip${av.style===v?" on":""}" data-k="style" data-v="${v}">${t}</button>`).join("")}</div>
      <div class="g3-lbl">Trang phục</div><div class="g3-opts2"><button type="button" class="g3-chip${av.outfit==="coat"?" on":""}" data-k="outfit" data-v="coat">Áo khoác dạ + cổ lọ</button><button type="button" class="g3-chip${av.outfit!=="coat"?" on":""}" data-k="outfit" data-v="tee">Áo thun</button>
        <button type="button" class="g3-chip${av.glasses?" on":""}" data-k="glasses" data-v="${av.glasses?"":"1"}">${av.glasses?"Có kính ✓":"Đeo kính"}</button><button type="button" class="g3-chip" data-reset>Dùng mẫu 3D của Tài</button></div>
      <div class="g3-lbl">Màu tóc</div><div class="g3-opts2">${sw(HAIR,"hair")}</div>
      <div class="g3-lbl">${av.outfit==="coat"?"Áo khoác":"Áo"}</div><div class="g3-opts2">${sw(TOP,"top")}</div>
      <div class="g3-lbl">Quần</div><div class="g3-opts2">${sw(BOT,"bottom")}</div>
      <div class="g3-lbl">Màu da</div><div class="g3-opts2">${sw(SK,"skin")}</div>
      <p class="g3-sub">Nhiệm vụ: làm quen với ${L.npcs.length} người có dấu <b style="color:#c23b2a">!</b> và tìm ${tot} từ mới quanh đây.</p>
      <div class="g3-row"><button class="g3-next" type="button" data-go data-focus>Bắt đầu khám phá ›</button></div>`);
    panel.querySelector("[data-reset]").onclick=()=>{av={...TAI};try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}rebuildPlayer();avatarPanel()};
    panel.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{av[b.dataset.k]=b.dataset.k==="glasses"?!!b.dataset.v:b.dataset.v;try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}rebuildPlayer();avatarPanel()});
    panel.querySelector("[data-go]").onclick=()=>{try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}dist=mobile?15:17;lookOff=0;pitch=.78;root.classList.remove("g3-av");closePanel()}}
  if(!localStorage.getItem("g3-avatar")){root.classList.add("g3-av");dist=6.5;pitch=.45;lookOff=mobile?1.9:0;yaw=0;avatarPanel()}
  /* vòng lặp */
  const occ=occluder(scene,camera,()=>{const a=[player.position];if(near)a.push(near.c.position);return a});
  let near=null,raf=0,last=performance.now(),alive=true;
  const fwd=new THREE.Vector3(),right=new THREE.Vector3();
  function loop(t){if(!alive)return;raf=requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;
    let moving=false;const sp=5.2*dt,p=player.position;
    if(keys.size){fwd.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(-fwd.z,0,fwd.x);let mx=0,mz=0;
      if(keys.has("w")||keys.has("arrowup")){mx+=fwd.x;mz+=fwd.z}if(keys.has("s")||keys.has("arrowdown")){mx-=fwd.x;mz-=fwd.z}if(keys.has("d")||keys.has("arrowright")){mx+=right.x;mz+=right.z}if(keys.has("a")||keys.has("arrowleft")){mx-=right.x;mz-=right.z}
      const l=Math.hypot(mx,mz);if(l>0){mx/=l;mz/=l;moving=step(mx*sp,mz*sp);player.rotation.y=Math.atan2(mx,mz)}}
    else if(target){const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz),stop=goal?(goal.npc?1.7:2.6):.15;
      if(d>stop){const k=Math.min(sp,d-stop+.001)/d;moving=step(dx*k,dz*k);player.rotation.y=Math.atan2(dx,dz);if(!moving){if(goal&&d<5)arrive();target=null}}
      else{if(goal)arrive();target=null}}
    animChar(player,dt,moving);npcs.forEach(o=>{animChar(o.c,dt,false);o.c.userData.badge.position.y=2.3+Math.sin(t/300)*.06});animChar(extra,dt,false);ticks.forEach(f=>f(dt));
    let nn=null,best=2.6;npcs.forEach(o=>{const d=o.c.position.distanceTo(p);if(d<best){best=d;nn=o}});
    if(nn!==near){near=nn;const b=$("g3Talk");if(near&&!panelOpen){b.hidden=false;b.textContent=`Nói chuyện với ${near.d.vn}`}else b.hidden=true}
    else if(near&&!panelOpen&&$("g3Talk").hidden)$("g3Talk").hidden=false;
    placeCam(false);occ();renderer.render(scene,camera)}
  function arrive(){const g=goal;goal=null;if(!g)return;if(g.npc)talk(g.npc);else if(g.w)wordCard(g.w)}
  const vis=()=>{if(document.hidden){cancelAnimationFrame(raf)}else if(alive){last=performance.now();raf=requestAnimationFrame(loop)}};
  document.addEventListener("visibilitychange",vis);
  raf=requestAnimationFrame(loop);renderer.domElement.focus({preventScroll:true});
  if(location.search.includes("g3debug"))window.__g3={bake:BK,info:()=>({...renderer.info.render,geo:renderer.info.memory.geometries,tex:renderer.info.memory.textures}),talk,wordCard,bookPanel,checkDone,prog,setPos:(x,z)=>{player.position.set(x,0,z);placeCam(true)},setYaw:v=>{yaw=v},setPitch:v=>{pitch=v},setDist:v=>{dist=v},scene,THREE};
  return {stop(){alive=false;cancelAnimationFrame(raf);clearTimeout(hintT);removeEventListener("resize",resize);removeEventListener("keydown",kd);removeEventListener("keyup",ku);document.removeEventListener("visibilitychange",vis);try{speechSynthesis.cancel()}catch(e){}
    scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});renderer.dispose();try{renderer.forceContextLoss()}catch(e){}root.innerHTML="";root.className=""}};
}

/* =====================================================================
   NGẮM CẢNH 3D: 12 cảnh theo tháng, nhân vật Tài đi lại tự do
   ===================================================================== */
function roofQuad(w,h,c){const m=new THREE.Mesh(new THREE.ConeGeometry(w,h,4),M(c));m.rotation.y=Math.PI/4;m.castShadow=true;return outline(m,1.03)}
function torii3(c="#d8432f",s=1){const g=new THREE.Group();[-1.5,1.5].forEach(x=>g.add(outline(cyl(.17,.2,3.4,c,x,1.7,0,12))));
  const k=outline(box(4.6,.26,.42,"#2b2229",0,3.55,0));g.add(k);g.add(outline(box(4.2,.22,.36,c,0,3.28,0)));g.add(outline(box(3.6,.2,.28,c,0,2.75,0)));g.add(box(.26,.5,.2,c,0,3.02,0));g.scale.setScalar(s);return g}
function pagoda3(s=1){const g=new THREE.Group();g.add(outline(box(3.6,.4,3.6,"#c9c2b3",0,.2,0)));
  for(let i=0;i<5;i++){const w=2.6-i*.34,y=.4+i*1.25;g.add(outline(box(w,.95,w,"#d24a36",0,y+.47,0)));const r=roofQuad(w*1.05,.55,"#2f2b3a");r.scale.set(1,1,1);r.position.y=y+1.15;g.add(r)}
  g.add(cyl(.06,.06,1.6,"#e0a62a",0,7.6,0,8));[7.2,7.6,8].forEach(y=>g.add(sph(.12,"#f2bf3a",0,y,0,8,6)));g.scale.setScalar(s);return g}
function castle3(s=1){const g=new THREE.Group();const base=outline(new THREE.Mesh(new THREE.CylinderGeometry(4.2,5.2,2.6,4),M("#a9a3b4")));base.rotation.y=Math.PI/4;base.position.y=1.3;g.add(base);
  [[6,2.4,2.6+1.2],[4.4,2,5.4+1],[3,1.8,7.8+.9]].forEach(([w,h,y],i)=>{g.add(outline(box(w,h,w*.8,"#fbfaf6",0,y,0)));const r=roofQuad(w*.82,1.1,"#5d6f86");r.position.y=y+h/2+.45;r.scale.z=.85;g.add(r);
    for(let k=-1;k<=1;k++)g.add(box(.5,.45,.05,"#2b2540",k*w*.28,y,w*.4+.02))});
  const t=roofQuad(1.8,1.6,"#5d6f86");t.position.y=11.6;g.add(t);g.add(sph(.25,"#f2bf3a",0,12.5,0,8,6));g.scale.setScalar(s);return g}
function gassho3(s=1){const g=new THREE.Group();g.add(outline(box(4.4,1.8,3.2,"#7a5a44",0,.9,0)));[-1,1].forEach(x=>g.add(box(.9,.7,.06,"#ffd36b",x*1.1,1,1.62)));
  const sh=new THREE.Shape();sh.moveTo(-2.7,0);sh.lineTo(0,4.2);sh.lineTo(2.7,0);sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth:3.8,bevelEnabled:false});geo.translate(0,0,-1.9);
  const roof=outline(new THREE.Mesh(geo,M("#b98d55")),1.02);roof.position.y=1.8;roof.castShadow=true;g.add(roof);
  const sn=new THREE.Mesh(geo,M("#ffffff"));sn.scale.set(.98,.55,1.03);sn.position.y=1.8+4.2*.45;g.add(sn);g.add(box(.8,.8,.05,"#ffd36b",0,4,1.92));g.scale.setScalar(s);return g}
function house3(wall="#fff3e0",roof="#4a8fd6",s=1,snow=false){const g=new THREE.Group();g.add(outline(box(3.2,2,2.6,wall,0,1,0)));[-.8,.8].forEach(x=>g.add(box(.7,.6,.05,"#ffd36b",x,1.2,1.32)));
  const r=roofQuad(2.7,1.5,roof);r.position.y=2.75;r.scale.z=.9;g.add(r);if(snow){const sn=roofQuad(2.5,.9,"#ffffff");sn.position.y=3.05;g.add(sn)}g.scale.setScalar(s);return g}
function temple3(s=1){const g=new THREE.Group();g.add(outline(box(7.4,.5,5,"#cdc6bc",0,.25,0)));g.add(outline(box(6,2.8,3.8,"#8a5a44",0,1.9,0)));g.add(box(5,2,.05,"#f5e6ca",0,1.8,1.92));
  const w=new THREE.Mesh(new THREE.CircleGeometry(.85,28),M("#9fe08f"));w.position.set(0,1.9,1.96);g.add(w);const ring=new THREE.Mesh(new THREE.TorusGeometry(.88,.1,8,28),M("#5a3a2a"));ring.position.set(0,1.9,1.97);g.add(ring);
  const r=roofQuad(5.6,2.2,"#2f2b3a");r.position.y=4.3;r.scale.z=.8;g.add(r);g.scale.setScalar(s);return g}
function kinkaku3(s=1){const g=new THREE.Group(),gold="#e8b93a";g.add(outline(box(6,.4,4.6,"#cfc6b6",0,.2,0)));g.add(outline(box(5.4,1.8,4,"#efe2c9",0,1.3,0)));for(let k=-2;k<=2;k++)g.add(box(.18,1.8,.06,"#6b4433",k*1.2,1.3,2.02));
  let r=roofQuad(4.6,.8,"#4a3b2a");r.position.y=2.55;g.add(r);g.add(outline(box(4.4,1.5,3.4,gold,0,3.5,0)));r=roofQuad(3.8,.8,"#4a3b2a");r.position.y=4.6;g.add(r);
  g.add(outline(box(2.8,1.3,2.2,gold,0,5.4,0)));r=roofQuad(2.6,1.2,"#4a3b2a");r.position.y=6.6;g.add(r);g.add(sph(.25,gold,0,7.4,0,8,6));g.scale.setScalar(s);return g}
function clock3(s=1){const g=new THREE.Group();g.add(outline(box(6,3,4,"#fbfaf6",0,1.5,0)));for(let k=-2;k<=2;k++)g.add(box(.7,1.2,.05,"#8ec5ff",k*1.1,1.6,2.02));
  let r=roofQuad(4.6,1.4,"#d24a36");r.position.y=3.7;r.scale.z=.75;g.add(r);g.add(outline(box(1.8,2.6,1.8,"#fbfaf6",0,4.9,0)));
  const cf=new THREE.Mesh(new THREE.CircleGeometry(.6,24),new THREE.MeshBasicMaterial({map:canvasTex(128,128,(c)=>{c.fillStyle="#fffaf0";c.beginPath();c.arc(64,64,60,0,TAU);c.fill();c.strokeStyle="#2b2540";c.lineWidth=8;c.stroke();c.lineWidth=7;c.beginPath();c.moveTo(64,64);c.lineTo(64,22);c.moveTo(64,64);c.lineTo(94,74);c.stroke()})}));cf.position.set(0,5.2,.92);g.add(cf);
  r=roofQuad(1.6,1.4,"#d24a36");r.position.y=6.9;g.add(r);g.scale.setScalar(s);return g}
const fuji3=(x,z,r,h)=>{const g=new THREE.Group();g.userData.farScene=true;const c=new THREE.Mesh(new THREE.ConeGeometry(r,h,32,1,true),M("#6f95cf",{side:THREE.DoubleSide}));c.position.y=h/2;g.add(c);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(r*.34,h*.34,32),M("#ffffff"));cap.position.y=h-h*.17+.05;g.add(cap);g.position.set(x,0,z);return g};
function tree3(kind,s=1){const g=new THREE.Group();
  if(kind==="pine"||kind==="pinesnow"){g.add(cyl(.18,.25,1.2,"#6b4433",0,.6,0,8));[[1.8,1.8,1.6],[1.4,1.6,2.6],[1,1.4,3.5]].forEach(([r,h,y])=>{g.add(outline(new THREE.Mesh(new THREE.ConeGeometry(r,h,8),M("#2f7f55"))));g.children.at(-1).position.y=y;g.children.at(-1).castShadow=true;
    if(kind==="pinesnow"){const sn=new THREE.Mesh(new THREE.ConeGeometry(r*.55,h*.5,8),M("#ffffff"));sn.position.y=y+h*.28;g.add(sn)}})}
  else{const C={sakura:["#f29ab8","#f7b8cc"],momiji:["#d9472f","#f0743a"],amber:["#e8892c","#f5b04a"],green:["#3f9d62","#5cb87c"],plum:["#d8578a","#f08db0"]}[kind];
    g.add(outline(cyl(.16,.24,1.8,"#7d5140",0,.9,0,8)));[[0,2.4,0,1.15],[.75,2.1,.35,.85],[-.75,2.15,-.25,.9],[.25,2.9,-.35,.75],[-.35,2,.6,.72]].forEach(([a,b,c,r],i)=>g.add(outline(sph(r,C[i%2],a,b,c,12,10),1.04)))}
  g.scale.setScalar(s);g.userData.tree=s;return g}
function hyd3(c1,c2){const g=new THREE.Group();g.add(sph(.7,"#3f9d62",0,.35,0,10,8));for(let i=0;i<9;i++){const a=i/9*TAU;g.add(sph(.26,i%3?c1:c2,Math.cos(a)*.45,.7+((i*7)%3)*.08,Math.sin(a)*.45,8,6))}g.add(sph(.3,c1,0,.95,0,8,6));return g}
function wagasa3(){const g=new THREE.Group();g.add(cyl(.04,.04,2.4,"#6b4433",0,1.2,0,6));const c=outline(new THREE.Mesh(new THREE.ConeGeometry(1.4,.7,16,1,true),M("#d63b3b",{side:THREE.DoubleSide})),1.03);c.position.y=2.55;g.add(c);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.75,.08,6,20),M("#ffffff"));ring.rotation.x=Math.PI/2;ring.position.y=2.6;g.add(ring);g.rotation.z=.25;return g}
function ishidoro3(){const g=new THREE.Group();g.add(outline(box(.9,.25,.9,"#a39e94",0,.12,0)));g.add(outline(cyl(.2,.24,1,"#b8b2a6",0,.75,0,8)));g.add(outline(box(.9,.18,.9,"#a39e94",0,1.3,0)));
  const lb=box(.6,.5,.6,"#c9c3b6",0,1.64,0);g.add(lb);const l=new THREE.Mesh(new THREE.BoxGeometry(.4,.3,.62),new THREE.MeshBasicMaterial({color:0xffd36b}));l.position.y=1.64;g.add(l);g.add(roofQuad(.75,.45,"#8f897e"));g.children.at(-1).position.y=2.12;return g}
function snowman3(){const g=new THREE.Group();g.add(outline(sph(.75,"#ffffff",0,.7,0,16,12)));g.add(outline(sph(.52,"#ffffff",0,1.75,0,16,12)));[-.17,.17].forEach(x=>g.add(sph(.06,"#2b2540",x,1.85,.48,6,4)));
  g.add(outline(new THREE.Mesh(new THREE.CylinderGeometry(.32,.4,.5,12),M("#e5484d"))));g.children.at(-1).position.y=2.35;g.children.at(-1).rotation.z=.15;g.add(box(.9,.14,.14,"#e5484d",0,1.32,.3));return g}
function koinobori3(){const g=new THREE.Group();g.add(cyl(.08,.1,8,"#8a5a44",0,4,0,8));g.add(sph(.18,"#ffcf4a",0,8.1,0,8,6));const carps=[];
  [["#3d6fd6",6.9,2.4],["#e5484d",5.6,2],["#ff8fab",4.4,1.6]].forEach(([c,y,L])=>{const f=new THREE.Group();const b=outline(new THREE.Mesh(new THREE.CylinderGeometry(.42,.22,L,12,1,true),M(c,{side:THREE.DoubleSide})));b.rotation.z=Math.PI/2;b.position.x=L/2;f.add(b);
    const tl=new THREE.Mesh(new THREE.ConeGeometry(.35,.5,3),M(c));tl.rotation.z=-Math.PI/2;tl.position.x=L+.2;f.add(tl);const ey=sph(.12,"#ffffff",.25,.15,.35,8,6);f.add(ey);f.add(sph(.06,"#2b2540",.27,.15,.44,6,4));f.position.set(.1,y,0);g.add(f);carps.push(f)});
  g.userData.carps=carps;return g}
function lanternString(x1,x2,y,z,n){const g=new THREE.Group();const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push(new THREE.Vector3(x1+(x2-x1)*t,y-1.2*Math.sin(t*Math.PI),z))}
  g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x2b2540})));
  for(let i=1;i<n;i++){const t=i/n,p=new THREE.Vector3(x1+(x2-x1)*t,y-1.2*Math.sin(t*Math.PI)-.45,z);const l=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),new THREE.MeshBasicMaterial({color:i%2?0xff5a4a:0xffa04a}));l.scale.y=1.3;l.position.copy(p);g.add(l)}return g}
function stall3(c){const g=new THREE.Group();g.add(outline(box(2.6,1,1.4,"#8a5a44",0,.5,0)));[-1.2,1.2].forEach(x=>g.add(cyl(.06,.06,2.4,"#6b4433",x,1.2,.6,6)));
  const tex=canvasTex(128,32,(g2,W,H)=>{for(let i=0;i<8;i++){g2.fillStyle=i%2?"#fff":c;g2.fillRect(i*W/8,0,W/8,H)}});const cur=new THREE.Mesh(new THREE.PlaneGeometry(2.6,.5),new THREE.MeshBasicMaterial({map:tex}));cur.position.set(0,2.15,.72);g.add(cur);
  g.add(outline(box(2.9,.12,1.7,c,0,2.42,.1)));return g}
function rice3(w,d){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M("#e9b93c"));p.rotation.x=-Math.PI/2;p.position.y=.04;p.receiveShadow=true;g.add(p);
  for(let i=0;i<d;i+=1.2){const r=box(w,.25,.35,"#f4cf5a",0,.13,-d/2+i);g.add(r)}return g}
function susuki3(){const g=new THREE.Group();for(let i=0;i<5;i++){const a=(i-2)*.18;const st=cyl(.02,.03,1.8,"#a8955f",Math.sin(a)*.6,.9,0,4);st.rotation.z=-a;g.add(st);const h=sph(.12,"#f3e6bf",Math.sin(a)*1.4,1.85,0,6,6);h.scale.set(1,2.4,1);h.rotation.z=-a*1.6;g.add(h)}return g}
function dango3(){const g=new THREE.Group();g.add(outline(box(1.4,.6,1,"#c9a27a",0,.3,0)));[-.3,0,.3].forEach(x=>{g.add(cyl(.025,.025,1.1,"#c9a27a",x,1.1,0,4));["#9fe08f","#fffaf0","#ff9fb8"].forEach((c,i)=>g.add(sph(.13,c,x,.8+i*.26,0,8,6)))});return g}
function moon3(){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.CircleGeometry(7,40),new THREE.MeshBasicMaterial({color:0xfff3c4,fog:false}));g.add(m);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(13,40),new THREE.MeshBasicMaterial({color:0xfff3c4,transparent:true,opacity:.18,fog:false}));glow.position.z=-.1;g.add(glow);return g}
function sun3(c){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.CircleGeometry(8,40),new THREE.MeshBasicMaterial({color:c,fog:false})));const gl=new THREE.Mesh(new THREE.CircleGeometry(16,40),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.2,fog:false}));gl.position.z=-.1;g.add(gl);return g}
function water3(w,d,c="#5fb4e6"){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d,1,1),new THREE.MeshToonMaterial({color:c,gradientMap:toonGrad(),transparent:true,opacity:.92,polygonOffset:true,polygonOffsetFactor:-2}));m.rotation.x=-Math.PI/2;m.position.y=.06;m.receiveShadow=true;m.userData.water=true;return m}
function mound(r,h,c){const m=new THREE.Mesh(new THREE.SphereGeometry(r,24,12,0,TAU,0,Math.PI/2),M(c));m.scale.y=h/r;m.receiveShadow=true;m.castShadow=true;return m}

/* hạt bay: tuyết, cánh hoa, lá, mưa, sao */
function particles(kind,n=420){const pos=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pos[i*3]=(Math.random()-.5)*70;pos[i*3+1]=Math.random()*24;pos[i*3+2]=(Math.random()-.5)*70;vel.push(Math.random())}
  const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const col={snow:"#ffffff",petal:"#ffb3c7",leaf:"#8fdc7a",drop:"#9cc9f0",star:"#ffe27a",maple:"#e5583a"}[kind]||"#fff";
  const tex=canvasTex(64,64,(g)=>{g.fillStyle=col;if(kind==="drop"){g.fillRect(29,4,6,56)}else if(kind==="petal"||kind==="leaf"||kind==="maple"){g.beginPath();g.ellipse(32,32,14,26,.6,0,TAU);g.fill()}else{const gr=g.createRadialGradient(32,32,2,32,32,30);gr.addColorStop(0,col);gr.addColorStop(1,"rgba(255,255,255,0)");g.fillStyle=gr;g.fillRect(0,0,64,64)}});
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:kind==="drop"?.55:kind==="star"?.5:.4,map:tex,transparent:true,depthWrite:false,alphaTest:.05}));
  pts.userData.tick=(dt,cx,cz)=>{const a=geo.attributes.position.array;for(let i=0;i<n;i++){const v=vel[i];a[i*3+1]-=dt*(kind==="drop"?14:kind==="star"?.3:kind==="snow"?1.2:1.6)*(.6+v);
    if(kind!=="drop"){a[i*3]+=Math.sin(performance.now()/900+v*9)*dt*.6}
    if(a[i*3+1]<0){a[i*3+1]=22+Math.random()*4;a[i*3]=cx+(Math.random()-.5)*70;a[i*3+2]=cz+(Math.random()-.5)*70}}geo.attributes.position.needsUpdate=true};
  return pts}
function fireworks(scene){const pool=[];
  function burst(){const n=90,pos=new Float32Array(n*3),v=[];const cx=(Math.random()-.5)*36,cy=16+Math.random()*8,cz=-34-Math.random()*12;
    for(let i=0;i<n;i++){pos[i*3]=cx;pos[i*3+1]=cy;pos[i*3+2]=cz;const t=Math.acos(2*Math.random()-1),p=Math.random()*TAU,s=6+Math.random()*2;v.push([Math.sin(t)*Math.cos(p)*s,Math.cos(t)*s,Math.sin(t)*Math.sin(p)*s])}
    const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
    const c=["#ff6b9a","#ffd43b","#6cc4ff","#7fe0a0","#c49bff"][Math.floor(Math.random()*5)];
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:c,size:1.6,transparent:true,depthWrite:false,fog:false}));pts.userData={v,t:0};scene.add(pts);pool.push(pts)}
  let next=0;burst();return dt=>{next-=dt;if(next<=0){burst();next=.9+Math.random()*.9}
    for(let k=pool.length-1;k>=0;k--){const p=pool[k],u=p.userData;u.t+=dt;const a=p.geometry.attributes.position.array;for(let i=0;i<u.v.length;i++){a[i*3]+=u.v[i][0]*dt;a[i*3+1]+=(u.v[i][1]-u.t*4)*dt;a[i*3+2]+=u.v[i][2]*dt}
      p.geometry.attributes.position.needsUpdate=true;p.material.opacity=Math.max(0,1-u.t/1.8);if(u.t>1.8){scene.remove(p);p.geometry.dispose();p.material.dispose();pool.splice(k,1)}}}}

/* dữ liệu 12 cảnh: bầu trời, mặt đất, công trình, 3 từ học tại chỗ */
const SC=[
 {focus:[0,-19],name:"伏見稲荷大社",vn:"Đền Fushimi Inari đón năm mới",sky:["#3e5f9e","#ffd9c4"],ground:"#f4f7fb",ps:"snow",spots:[
   ["torii","鳥居{とりい}","cổng torii","Cổng đánh dấu lối vào khu vực linh thiêng của đền Thần đạo"],["sen","千本鳥居{せんぼんとりい}","con đường nghìn cổng torii","Hàng nghìn cổng torii xếp liền nhau thành đường hầm màu đỏ"],["sun","初日{はつひ}の出{で}","bình minh đầu năm","Ngắm mặt trời mọc ngày 1/1 để cầu may cả năm"]],
   build(A){A.sky(sun3("#ff6f4f"),0,16,-90,"sun");
     /* đường vào đền (表参道): cổng torii lớn, đèn đá, sạp hàng đầu năm, cờ đỏ */
     A.add(torii3("#e0482f",1.75),0,20,{solid:[[-2.6,0,.6,.6],[2.6,0,.6,.6]],spot:"torii"});
     for(let z=16;z>-3;z-=4.6)[-1,1].forEach(sx=>A.add(ishidoro3(),sx*4.4,z,{solid:[[0,0,.9,.9]]}));
     ["#c23b2a","#e5a23a","#2f9e64","#c23b2a","#3d6fd6","#e85d8c"].forEach((c,i)=>{const sx=i%2?1:-1,z=14-((i/2)|0)*6.2;A.add(stall3(c),sx*8.6,z,{rot:sx>0?-Math.PI/2:Math.PI/2,solid:[[0,0,1.9,3]]})});
     for(let z=18;z>-2;z-=3.4)[-1,1].forEach(sx=>A.add(nobori(z%2?"#c23b2a":"#d8432f","初詣"),sx*6.3,z+1.2,{rot:sx>0?Math.PI:0}));
     /* cổng lầu 楼門 với hai tượng cáo */
     A.add(romon3(),0,-8,{solid:[[-4.6,0,2.4,3.4],[4.6,0,2.4,3.4],[-1.7,0,.6,3.4],[1.7,0,.6,3.4]]});
     [-1,1].forEach(sx=>{const k=kitsune3();k.scale.setScalar(1.5);A.add(k,sx*3.2,-3.6,{rot:-sx*.25,solid:[[0,0,1.2,1.2]]})});
     const tz=new THREE.Group();tz.add(outline(box(2.6,.8,1.2,"#9aa3ae",0,.4,0)));const wt=box(2.3,.05,.9,"#7fc4ec",0,.82,0);tz.add(wt);[-1.1,1.1].forEach(x=>[-.5,.5].forEach(z=>tz.add(cyl(.08,.08,2.4,"#d8432f",x,1.2,z,6))));const tr=roofQuad(1.9,.8,"#2f2b3a");tr.position.y=2.6;tr.scale.z=.6;tz.add(tr);A.add(tz,8.5,-14,{solid:[[0,0,2.8,1.4]]});
     /* điện thờ ngoài (外拝殿) và chính điện (本殿) */
     A.add(shrine3(1.65),0,-20,{solid:[[0,0,9.9,7.4]]});A.add(shrine3(2.2),0,-43,{solid:[[0,0,13.2,9.9]]});
     const ema=new THREE.Group();ema.add(box(3.2,.12,.12,"#6b4433",0,1.7,0));[-1.5,1.5].forEach(x=>ema.add(cyl(.06,.06,1.8,"#6b4433",x,.9,0,6)));for(let i=0;i<9;i++){const e=box(.3,.22,.03,"#e9d3a8",-1.2+i*.3,1.45-(i%2)*.24,.05);e.rotation.z=(i%3-1)*.1;ema.add(e)}A.add(ema,-7.5,-27,{rot:.4,solid:[[0,0,3.2,.4]]});
     [[-10,-6],[10,-4],[-12,-30],[12,-32],[-13,8],[13,6]].forEach(([x,z],i)=>A.add(tree3("pinesnow",1+(i%3)*.15),x,z,{solid:[[0,0,1,1]]}));A.start(0,30)}},
 {focus:[0,-16],name:"白川郷",vn:"Làng tuyết Shirakawa-go",sky:["#6f96c9","#e6f0fb"],ground:"#f4f7fb",ps:"snow",spots:[
   ["gassho","合掌造{がっしょうづく}り","nhà mái tranh “chắp tay”","Mái dốc như hai bàn tay chắp lại để tuyết dễ trượt xuống"],["yuki","雪{ゆき}だるま","người tuyết","Người tuyết Nhật thường chỉ có 2 khối tròn"],["ume","梅{うめ}","hoa mơ","Nở cuối đông, báo hiệu mùa xuân sắp đến"]],
   build(A){/* nhà Kanda (神田家) làm tâm, người tuyết, cây mơ, đèn tuyết dọc lối đi, đống củi, cột đo tuyết */
     A.add(gassho3(1.45),0,-20,{solid:[[0,0,5.6,4.2]],spot:"gassho"});
     A.add(snowman3(),-4,2,{spot:"yuki",solid:[[0,0,1.4,1.4]]});A.add(tree3("plum",1.1),6,0,{spot:"ume",solid:[[0,0,1,1]]});
     for(let z=6;z>-12;z-=3.6)[-1,1].forEach(sx=>{const l=ishidoro3();A.add(l,sx*3,z,{solid:[[0,0,.9,.9]]})});
     const wood=new THREE.Group();for(let r=0;r<3;r++)for(let c=0;c<5;c++){const lg=cyl(.18,.18,1.6,"#8a5a3a",-1+c*.45,.2+r*.38,0,8);lg.rotation.x=Math.PI/2;wood.add(lg)}wood.add(box(2.6,.12,1.9,"#f4f7fb",0,1.35,0));A.add(wood,6.5,-15,{solid:[[0,0,2.4,1.8]]});
     const pole=new THREE.Group();pole.add(cyl(.08,.08,3,"#f6f4f0",0,1.5,0,6));for(let i=0;i<6;i++)pole.add(box(.2,.06,.2,i%2?"#e5484d":"#2b2540",0,.4+i*.45,0));A.add(pole,-6.5,-9,{solid:[[0,0,.4,.4]]});
     A.far(fuji3(-30,-70,26,22));A.far(fuji3(28,-75,30,28));A.start(0,12)}},
 {focus:[-6,-16],name:"新倉山浅間公園",vn:"Chùa Chureito & núi Phú Sĩ",sky:["#7fa7d8","#ffe2ee"],ground:"#a9d69a",ps:"petal",spots:[
   ["tou","五重塔{ごじゅうのとう}","tháp năm tầng","Tháp Chureito nhìn ra núi Phú Sĩ, cảnh nổi tiếng mùa xuân"],["fuji","富士山{ふじさん}","núi Phú Sĩ","Ngọn núi cao nhất Nhật Bản, 3776 m"],["sakura","桜{さくら}","hoa anh đào","Mùa hoa anh đào nở vào khoảng cuối tháng 3 đến đầu tháng 4"]],
   build(A){A.add(mound(10,3.2,"#93c985"),-6,-16);A.add(pagoda3(1),-6,-16,{y:3,solid:[[0,0,3.8,3.8]],spot:"tou"});A.far(fuji3(10,-70,34,34),"fuji");
     [[4,-8],[8,-14],[-14,-6],[12,-4],[-10,4],[10,6],[-18,-16],[16,-22],[0,-26],[-2,8]].forEach(([x,z],i)=>A.add(tree3("sakura",1+(i%3)*.12),x,z,{solid:[[0,0,1,1]],spot:i===0?"sakura":null}));A.start(2,12)}},
 {focus:[0,-22],name:"姫路城",vn:"Lâu đài Himeji mùa hoa anh đào",sky:["#86b2e0","#ffe7f1"],ground:"#a9d69a",ps:"petal",spots:[
   ["shiro","城{しろ}","lâu đài","Himeji còn được gọi là “thành Hạc trắng” vì màu trắng tinh"],["hanami","花見{はなみ}","ngắm hoa","Trải bạt dưới gốc anh đào, ăn uống và ngắm hoa"],["bentou","お弁当{べんとう}","cơm hộp","Món không thể thiếu khi đi 花見"]],
   build(A){A.add(castle3(OD_K>.4?2:1.3),0,-22,{solid:[[0,0,OD_K>.4?20:13,OD_K>.4?20:13]],spot:"shiro"});
     const mat=box(3,.05,2.2,"#e5484d",0,.06,0);const g=new THREE.Group();g.add(mat);g.add(outline(box(.6,.3,.45,"#2b2540",.4,.25,.2)));g.add(box(.5,.05,.38,"#ffcf4a",.4,.42,.2));A.add(g,6,-2,{spot:"hanami"});
     A.add(dango3(),3.6,-1,{spot:"bentou"});
     [[-10,-8],[10,-8],[-14,-16],[14,-16],[-6,2],[10,2],[-18,-2],[18,-2],[-12,8],[13,9]].forEach(([x,z],i)=>A.add(tree3("sakura",1.05+(i%3)*.1),x,z,{solid:[[0,0,1,1]]}));A.start(0,12)}},
 {focus:[-2,-7],name:"鯉のぼり",vn:"Lễ hội cá chép Koinobori",sky:["#5fa8e8","#c9eeff"],ground:"#9fd88f",ps:"leaf",spots:[
   ["koi","鯉{こい}のぼり","cờ cá chép","Treo ngày 5/5 (ngày trẻ em) cầu cho trẻ khỏe mạnh như cá chép vượt thác"],["fuji","富士山{ふじさん}","núi Phú Sĩ","Đẹp nhất khi trời trong vào sáng sớm"],["ie","家{いえ}","ngôi nhà","Nhà có con trai thường treo cá chép trước sân"]],
   build(A){const k=koinobori3();A.add(k,-2,-6,{solid:[[0,0,.5,.5]],spot:"koi"});A.koi=k;A.far(fuji3(18,-75,30,30),"fuji");
     A.add(house3("#fff3e0","#4a8fd6",1.3),6,-12,{solid:[[0,0,4.4,3.6]],spot:"ie"});
     [[-12,-10],[-16,0],[14,4],[-8,8],[10,10],[0,-20],[-14,-20]].forEach(([x,z])=>A.add(tree3("green",1.05),x,z,{solid:[[0,0,1,1]]}));A.start(0,9)}},
 {focus:[0,-16],name:"明月院",vn:"Chùa Meigetsu-in mùa cẩm tú cầu",sky:["#8fa0c8","#e3e6f5"],ground:"#9fd88f",ps:"drop",spots:[
   ["ajisai","紫陽花{あじさい}","hoa cẩm tú cầu","Nở rộ vào mùa mưa (梅雨, tháng 6)"],["kasa","傘{かさ}","cái ô","Ô giấy truyền thống gọi là 和傘 (wagasa)"],["tera","お寺{てら}","ngôi chùa","Chùa Meigetsu-in nổi tiếng với ô cửa tròn"]],
   build(A){A.add(temple3(1.3),0,-16,{solid:[[0,0,10,7]],spot:"tera"});A.add(wagasa3(),5,-4,{spot:"kasa"});
     for(let i=0;i<14;i++){const side=i%2?1:-1,z=6-i*1.6;A.add(hyd3(["#7aa7ff","#b48cf0","#ff9fc8"][i%3],["#a9c4ff","#d2b8ff","#ffc2dc"][i%3]),side*2.6,z,{solid:[[0,0,1.2,1.2]],spot:i===3?"ajisai":null})}
     [[-12,-8],[12,-8],[-14,4],[14,4],[-8,-24],[8,-24]].forEach(([x,z])=>A.add(tree3("green",1.1),x,z,{solid:[[0,0,1,1]]}));A.start(0,10)}},
 {focus:[0,-8],name:"厳島神社",vn:"Cổng torii nổi Itsukushima",sky:["#4f9be0","#c8eefc"],ground:"#f2dca5",ps:"star",spots:[
   ["torii","大鳥居{おおとりい}","cổng torii lớn","Cổng torii đứng giữa biển, khi thủy triều lên trông như đang nổi"],["umi","海{うみ}","biển","Mùa hè (夏) là mùa đi biển"],["tourou","灯籠{とうろう}","đèn lồng đá","Đặt dọc lối vào đền, thắp sáng vào buổi tối"]],
   build(A){A.add(water3(140,80,"#3fb0e0"),0,-48,{water:[-70,-88,70,-8.5],spot:"umi"});A.add(torii3("#e8553f",2.6),0,-24,{y:-.2,spot:"torii"});
     A.far(fuji3(-35,-80,22,14));const isl=mound(16,8,"#4f9f78");A.far(isl);isl.position.set(30,0,-80);
     [[-6,-4],[6,-4],[-10,2],[10,2]].forEach(([x,z],i)=>A.add(ishidoro3(),x,z,{solid:[[0,0,1,1]],spot:i===1?"tourou":null}));
     [[-16,0],[16,-2],[-22,6],[22,8],[-12,10],[13,12]].forEach(([x,z])=>A.add(tree3("pine",1.1),x,z,{solid:[[0,0,1,1]]}));A.start(0,10)}},
 {focus:[0,-3],name:"夏祭り",vn:"Lễ hội pháo hoa mùa hè",sky:["#141838","#6a3f7a"],ground:"#5b6e5a",ps:"star",night:true,spots:[
   ["hanabi","花火{はなび}","pháo hoa","Lễ hội pháo hoa (花火大会) là đặc sản mùa hè Nhật"],["matsuri","祭{まつ}り","lễ hội","Có các quầy hàng (屋台) bán đồ ăn, trò chơi"],["chouchin","提灯{ちょうちん}","đèn lồng giấy","Treo dọc phố trong các lễ hội mùa hè"]],
   build(A){A.add(water3(120,14,"#2f4f8a"),0,-26,{water:[-60,-33,60,-19]});A.fw=true;
     A.add(lanternString(-14,14,5,-6,12),0,0,{spot:"chouchin"});A.add(lanternString(-14,14,5,4,12),0,0);
     [[-8,-10,"#e5484d"],[-3,-10,"#3d6fd6"],[3,-10,"#2f9e64"],[8,-10,"#e5484d"],[-8,10,"#ff8a3c"],[8,10,"#8f6fd6"]].forEach(([x,z,c],i)=>A.add(stall3(c),x,z,{rot:z>0?Math.PI:0,solid:[[0,0,3,1.8]],spot:i===1?"matsuri":null}));A.start(0,8);
     A.sky(new THREE.Mesh(new THREE.SphereGeometry(1.6,10,8),new THREE.MeshBasicMaterial({color:0xffd43b,fog:false})),-10,28,-45,"hanabi");A.start(0,9)}},
 {focus:[0,-10],name:"お月見",vn:"Ngắm trăng Tsukimi trên đồng lúa",sky:["#2a3466","#e9c7a8"],ground:"#b6d6a4",ps:"leaf",dusk:true,spots:[
   ["tsuki","月{つき}","mặt trăng","Đêm trăng rằm tháng 8 âm lịch gọi là 十五夜{じゅうごや}"],["dango","団子{だんご}","bánh dày dango","Bày 月見団子 để cúng trăng"],["ta","田{た}んぼ","ruộng lúa","Mùa thu lúa chín vàng"]],
   build(A){A.sky(moon3(),0,24,-80,"tsuki");A.add(rice3(40,16),0,-18,{spot:"ta"});A.add(dango3(),2,-2,{spot:"dango",solid:[[0,0,1.6,1.2]]});
     [[-4,-1],[5,0],[-8,-4],[8,-4],[-12,0],[12,1]].forEach(([x,z])=>A.add(susuki3(),x,z));A.add(house3("#fff3e0","#6b5a8f",1.3),-14,-30,{solid:[[0,0,4.4,3.6]]});
     [[-20,-8],[20,-8],[-18,6],[18,6]].forEach(([x,z])=>A.add(tree3("amber",1),x,z,{solid:[[0,0,1,1]]}));A.start(0,8)}},
 {focus:[0,-14],name:"金閣寺",vn:"Chùa Vàng Kinkaku-ji mùa thu",sky:["#7aa6d6","#ffe3bd"],ground:"#c9b067",ps:"maple",spots:[
   ["kinkaku","金閣寺{きんかくじ}","chùa Vàng","Ngôi chùa phủ vàng lá ở Kyoto"],["ike","池{いけ}","cái ao","Chùa soi bóng xuống ao Kyōko-chi"],["momiji","紅葉{もみじ}","lá phong đỏ","Mùa lá đỏ ở Kyoto khoảng tháng 11"]],
   build(A){A.add(water3(30,14,"#4fa9e0"),0,-14,{water:[-15,-21,15,-7],spot:"ike"});A.add(kinkaku3(1.2),0,-25,{solid:[[0,0,8,6]],spot:"kinkaku"});
     [[-12,-12],[12,-12],[-17,-4],[17,-4],[-9,2],[9,2],[-18,-22],[18,-22]].forEach(([x,z],i)=>A.add(tree3(i%2?"momiji":"amber",1.1),x,z,{solid:[[0,0,1,1]],spot:i===4?"momiji":null}));
     [[-6,-32],[6,-32],[-20,-30],[20,-30]].forEach(([x,z])=>A.add(tree3("pine",1.2),x,z,{solid:[[0,0,1,1]]}));A.start(0,9)}},
 {focus:[0,-14],name:"河口湖",vn:"Núi Phú Sĩ & hồ Kawaguchi lá đỏ",sky:["#7a9ed6","#ffdcc7"],ground:"#b3d98f",ps:"maple",spots:[
   ["fuji","富士山{ふじさん}","núi Phú Sĩ","Nhìn từ hồ Kawaguchi, núi soi bóng xuống mặt nước"],["mizuumi","湖{みずうみ}","hồ","Hồ Kawaguchi là một trong Ngũ hồ Phú Sĩ"],["kouyou","紅葉{こうよう}","lá đổi màu mùa thu","Đọc こうよう khi nói về mùa lá đỏ nói chung"]],
   build(A){A.add(water3(140,60,"#62b9e6"),0,-44,{water:[-70,-74,70,-14],spot:"mizuumi"});A.far(fuji3(0,-118,44,46),"fuji");
     [[-14,-8],[-8,-10],[8,-10],[14,-8],[-18,-2],[18,-2],[-10,4],[11,5]].forEach(([x,z],i)=>A.add(tree3(i%2?"amber":"momiji",1.15),x,z,{solid:[[0,0,1,1]],spot:i===2?"kouyou":null}));A.start(0,8)}},
 {focus:[0,-18],name:"さっぽろ雪まつり",vn:"Lễ hội tuyết Sapporo",sky:["#7da3d4","#e4f0fc"],ground:"#f4f7fb",ps:"snow",spots:[
   ["tokei","時計台{とけいだい}","tháp đồng hồ","Tháp đồng hồ Sapporo, biểu tượng của thành phố"],["yukimatsuri","雪祭{ゆきまつ}り","lễ hội tuyết","Diễn ra vào tháng 2 với các tượng tuyết khổng lồ"],["yuki","雪{ゆき}だるま","người tuyết","雪 (tuyết) + だるま (búp bê Daruma)"]],
   build(A){A.add(clock3(1.3),0,-18,{solid:[[0,0,8,5.4]],spot:"tokei"});
     const sc=new THREE.Group();sc.add(outline(box(5,3,3,"#ffffff",0,1.5,0)));const t=roofQuad(3,2,"#eef4fc");t.position.y=4;sc.add(t);sc.add(outline(box(1.4,4,1.4,"#ffffff",-2.4,2,0)));sc.add(outline(box(1.4,4,1.4,"#ffffff",2.4,2,0)));
     A.add(sc,-12,-10,{rot:.4,solid:[[0,0,6,4]],spot:"yukimatsuri"});A.add(snowman3(),5,-2,{spot:"yuki",solid:[[0,0,1.4,1.4]]});
     A.add(house3("#fff3e0","#e5484d",1.2,true),12,-10,{solid:[[0,0,4,3.4]]});[[-18,0],[18,2],[-6,8],[8,10],[-16,-22],[16,-24]].forEach(([x,z])=>A.add(tree3("pinesnow",1),x,z,{solid:[[0,0,1,1]]}));A.start(0,9)}}
];

export async function startScene(root,m,api){
  if(!document.getElementById("g3css")){const st=document.createElement("style");st.id="g3css";st.textContent=CSS;document.head.appendChild(st)}
  const S=SC[m], esc=api.esc, R=t=>api.rb(t), plain=t=>api.plainOf(t), roma=t=>api.roma(api.kanaOf(t));
  const CFG=REAL[m],osmP=CFG&&!/g3noosm/.test(location.search)?loadOSM(m):Promise.resolve(null);
  let av={...TAI};try{av={...av,...JSON.parse(localStorage.getItem("g3-avatar")||"{}")}}catch(e){}
  let seen={};try{seen=JSON.parse(localStorage.getItem("g3-scene")||"{}")}catch(e){}
  root.className="g3";root.innerHTML=`<div class="g3-load">Đang dựng cảnh ${esc(S.vn)}…</div>`;
  try{await Promise.race([document.fonts.load(`700 40px "Kaisei Decol"`),new Promise(r=>setTimeout(r,1200))])}catch(e){}
  const mobile=matchMedia("(pointer:coarse)").matches;
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.6:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  root.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute("aria-label",`Cảnh 3D: ${S.vn}`);
  const scene=new THREE.Scene();
  scene.background=canvasTex(4,256,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,S.sky[0]);gr.addColorStop(1,S.sky[1]);g.fillStyle=gr;g.fillRect(0,0,W,H)});
  scene.fog=new THREE.Fog(new THREE.Color(S.sky[1]),90,320);
  const night=!!S.night, dusk=!!S.dusk;
  scene.add(new THREE.HemisphereLight(night?0x8a8ad0:dusk?0xd8c8f0:0xffffff,night?0x30304a:0xb9d4a8,night?.7:dusk?.95:1.2));
  const sun=new THREE.DirectionalLight(night?0xaab4ff:dusk?0xffd8b0:0xfff3dd,night?.55:dusk?1:1.45);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
  Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:1,far:90});sun.shadow.bias=-.0005;scene.add(sun,sun.target);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(120,48),M(S.ground));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.userData.ground=true;scene.add(ground);
  const OD=await osmP;if(OD){ground.geometry.dispose();ground.geometry=new THREE.CircleGeometry(700,64);scene.fog.near=130;scene.fog.far=560}
  const camera=new THREE.PerspectiveCamera(52,1,.1,OD?1500:600);
  const solids=[],waters=[],ticks=[],trees=[],spotObj={},wSpots=[],craft=[];let startP=[0,8];const A={
    add(obj,x,z,o={}){const s0=solids.length;craft.push({obj,o,s0,x,z});if(obj.userData.tree)trees.push({x,z,h:3.1*obj.userData.tree});obj.position.set(x,o.y!=null?o.y:(obj.userData.water?.07:0),z);if(o.rot)obj.rotation.y=o.rot;scene.add(obj);
      if(o.solid)o.solid.forEach(([dx,dz,w,d])=>{const sw=w*(obj.scale.x||1)*(o.scaleSolid||1),sd=d*(obj.scale.z||1);solids.push({x0:x+dx-sw/2,x1:x+dx+sw/2,z0:z+dz-sd/2,z1:z+dz+sd/2})});
      if(o.water){if(OD&&CFG.dropWater){obj.visible=false;if(o.spot)wSpots.push([o.spot,obj])}else waters.push(o.water)}
      if(o.spot){obj.traverse(c=>{if(c.isMesh&&!c.userData.isOutline)c.userData.pick={spot:o.spot}});if(!spotObj[o.spot])spotObj[o.spot]=[obj,.6,1]}return obj},
    far(obj,spot){if(OD){const d=Math.hypot(obj.position.x,obj.position.z);if(d>1&&d<420){const f=430/d;obj.position.x*=f;obj.position.z*=f;obj.scale.multiplyScalar(f)}obj.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.fog=false}})}scene.add(obj);if(spot){obj.traverse(c=>{if(c.isMesh)c.userData.pick={spot}});if(!spotObj[spot])spotObj[spot]=[obj,2,4]}return obj},
    sky(obj,x,y,z,spot){if(OD){const d=Math.hypot(x,z);if(d>1&&d<480){const f=520/d;x*=f;z*=f;y*=f;obj.scale.multiplyScalar(f*.6)}}obj.position.set(x,y,z);obj.userData.billboard=true;scene.add(obj);if(spot){obj.traverse(c=>{if(c.isMesh)c.userData.pick={spot}});if(!spotObj[spot])spotObj[spot]=[obj,1.5,4]}return obj},
    start(x,z){startP=[x,z]}};
  OD_K=OD&&CFG?(CFG.k||OSM_K):0;S.build(A);

  /* ---------- làm đầy khuôn viên ---------- */
  const SEAS=["winter","winter","spring","spring","spring","rain","summer","night","autumn","autumn","autumn","winter"][m], rng=rngOf(m*97+13), FC=S.focus||[0,-16];
  /* ---------- bản đồ thật quanh địa danh ---------- */
  let osm=null;
  if(OD){const near=(x,z,p)=>solids.some(q=>x>q.x0-p&&x<q.x1+p&&z>q.z0-p&&z<q.z1+p);
    osm=osmWorld(scene,OD,CFG,{season:SEAS,ticks,seed:m*31+3,walk:150,noTree:(x,z)=>{const dx=x-startP[0],dz=z-startP[1];return Math.hypot(dx,dz)<9||(dz>-4&&dz<30&&Math.abs(dx)<12)},clear:(x,z,Rg)=>(CFG.clearRect&&CFG.clearRect.some(([x0,x1,z0,z1])=>x>x0&&x<x1&&z>z0&&z<z1))||Math.hypot(x-CFG.off[0],z-CFG.off[1])<CFG.clear||Math.hypot(x-startP[0],z-startP[1])<8||(z-startP[1]>-2&&z-startP[1]<26&&Math.abs(x-startP[0])<11)||near(x,z,2.5)||(Rg&&Rg.some(p=>near(p[0],p[1],1.2)))});
    if(CFG.tower){const ts=CFG.tower===1?1:CFG.tower,tw=tower3();tw.scale.setScalar(ts);tw.position.set(CFG.off[0],0,CFG.off[1]);scene.add(tw);const h=6*ts;solids.push({x0:CFG.off[0]-h,x1:CFG.off[0]+h,z0:CFG.off[1]-h,z1:CFG.off[1]+h})}
    if(CFG.skytree){const p=osm.poi.find(q=>/スカイツリー/.test(q.n));if(p){const st=skytree3();st.position.set(p.x,0,p.z);scene.add(st)}}
    wSpots.forEach(([id,obj])=>{const w=osm.nearestWater(startP[0],startP[1]-6);if(w){const a=new THREE.Object3D();a.position.set(w[0],.4,w[1]);scene.add(a);a.traverse(()=>{});spotObj[id]=[a,.4,1.4];
      const pk=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.2,12),new THREE.MeshBasicMaterial({visible:false}));pk.position.set(w[0],.1,w[1]);pk.userData.pick={spot:id};scene.add(pk)}});
    /* đồ làm tay rơi xuống nước thật: bỏ đi (đồ có từ vựng thì dời lên bờ gần nhất) */
    craft.forEach((c,i)=>{const {obj,o,s0,x,z}=c;if(o.water||!osm.isWater(x,z))return;const e=(craft[i+1]?craft[i+1].s0:solids.length);
      if(o.spot&&!(CFG.keepWet||[]).includes(o.spot)){const L=osm.nearestLand(x,z);if(L){const dx=L[0]-x,dz=L[1]-z;obj.position.x+=dx;obj.position.z+=dz;for(let q=s0;q<e;q++){solids[q].x0+=dx;solids[q].x1+=dx;solids[q].z0+=dz;solids[q].z1+=dz}return}}
      if(!o.spot){scene.remove(obj);for(let q=s0;q<e;q++)solids[q]={x0:1e9,x1:1e9,z0:1e9,z1:1e9};const t=trees.findIndex(t=>t.x===x&&t.z===z);if(t>=0)trees.splice(t,1)}});
    /* tháng 1: hàng nghìn cổng torii dọc các lối mòn thật lên núi Inari, khách đi lễ đầu năm */
    if(m===4){[[-26,-28,26,-28,11,24],[-30,-20,30,-20,9,26],[-22,-12,22,-12,7.5,20]].forEach(([a,b,c2,d,y,n])=>{const cl=carpLine(a,b,c2,d,y,n,ticks);scene.add(cl);solids.push({x0:a-.3,x1:a+.3,z0:b-.3,z1:b+.3},{x0:c2-.3,x1:c2+.3,z0:d-.3,z1:d+.3})});osm.plantIn((x,z)=>osm.openAt(x,z,6)&&!osm.onRoad(x,z),1200,200)}
    if(m===2){osm.plantIn((x,z)=>Math.hypot(x-CFG.off[0],z-CFG.off[1])>9&&osm.openAt(x,z,7)&&!osm.onRoad(x,z),2400,110);osm.plantIn((x,z)=>osm.openAt(x,z,9)&&!osm.onRoad(x,z),2200,330);
      const dk=new THREE.Group();dk.add(outline(box(9,.4,5,"#a0693e",0,.6,0)));for(let i=0;i<9;i++)dk.add(box(.12,.6,.12,"#7a4a2a",-4.4+i*1.1,1.1,2.45));dk.add(box(9,.08,.1,"#7a4a2a",0,1.4,2.45));[-4.3,4.3].forEach(x=>[-2.3,2.3].forEach(z=>dk.add(box(.2,.6,.2,"#7a4a2a",x,.3,z))));dk.position.set(startP[0],0,startP[1]-4.2);scene.add(dk)}
    if(m===1){osm.plantIn((x,z)=>x>100||x<-275,3000,360);[[240,-200,70,40],[260,60,80,55],[230,280,70,40],[-400,-150,80,50],[-420,180,90,60]].forEach(([x,z,r,h])=>{const md=mound(r,h,"#e9eef5");md.position.set(x,0,z);scene.add(md)})}
    if(m===0){const TL=[];osm.footP.forEach(P=>{if(!P.some(p=>p[1]<-50))return;for(let i=0;i+1<P.length;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],L=Math.hypot(bx-ax,bz-az);if(L<.01)continue;const ux=(bx-ax)/L,uz=(bz-az)/L;
        for(let t=.6;t<L&&TL.length<1800;t+=1.25){const x=ax+ux*t,z=az+uz*t;if(z>-50||Math.hypot(x,z)>190)continue;const id=osm.gi(x,z);if(id>=0&&osm.grid[id]===1)continue;TL.push([x,z,Math.atan2(ux,uz)])}}});
      toriiTunnel(scene,TL);osm.plantIn((x,z)=>z<-58&&Math.abs(x)<230,2600,260);const sp=osm.poi.find(q=>/千本鳥居/.test(q.n));let best=null;TL.forEach(p=>{const d=sp?Math.hypot(p[0]-sp.x,p[1]-sp.z):Math.hypot(p[0],p[1]+60);if(!best||d<best[0])best=[d,p]});
      if(best){const [x,z]=best[1];const a=new THREE.Object3D();a.position.set(x,1.4,z);scene.add(a);spotObj.sen=[a,1.4,1.4];const pk=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,3,10),new THREE.MeshBasicMaterial({visible:false}));pk.position.set(x,1.5,z);pk.userData.pick={spot:"sen"};scene.add(pk)}
      const KM=[["#ffe0c7","#2b2321","bun","#d8432f","#2b2540",1],["#ffe3cc","#3b2a26","long","#e9a1b9","#7a2f4a",1],["#f6d2b3","#1f1b24","short","#3a4a6a","#2a2d3a",0],["#ffe6d2","#5a3a2a","bun","#f2bf3a","#c23b2a",1],["#f3cfae","#2a2220","short","#5a6f9a","#2a2d3a",0],["#ffe0c7","#2b2321","long","#7a5ac8","#3a2f5a",1],["#f6d2b3","#3a2a20","cap","#2f9e64","#2a2d3a",0],["#ffe3cc","#2e231f","bun","#f6f4f0","#c23b2a",1]];
      const vis=KM.slice(0,4).map(([sk,hr,st,tp,bt,fem],i)=>{const c=makeChar({skin:sk,hair:hr,style:st,top:tp,bottom:bt,fem});c.scale.setScalar(1.1);const walk=i<6,x=(i%2?1:-1)*(1.6+(i%3)*.5),z=walk?26-i*6.5:-13.2;c.position.set(walk?x:(i===6?-1.6:1.6),0,z);c.rotation.y=walk?(i%2?0:Math.PI):Math.PI;scene.add(c);return {c,walk,dir:i%2?-1:1,x}});
      ticks.push(dt=>vis.forEach(v=>{if(v.walk){v.c.position.z+=v.dir*dt*1.6;if(v.c.position.z<-13){v.dir=1}if(v.c.position.z>28){v.dir=-1}v.c.rotation.y=v.dir<0?Math.PI:0}animChar(v.c,dt,v.walk)}))}
    if(osm.blocked(startP[0],startP[1]))for(let r=1;r<60;r++){let ok=null;for(let a=0;a<TAU&&!ok;a+=.3){const x=startP[0]+Math.cos(a)*r,z=startP[1]+Math.sin(a)*r;if(!osm.blocked(x,z))ok=[x,z]}if(ok){startP=ok;break}}}
  const free=(x,z,pad=1)=>!(Math.hypot(x,z)>36||(osm&&(osm.blocked(x,z)||osm.onRoad(x,z)||osm.blocked(x+pad,z)||osm.blocked(x-pad,z)||osm.blocked(x,z+pad)||osm.blocked(x,z-pad)))||solids.some(q=>x>q.x0-pad&&x<q.x1+pad&&z>q.z0-pad&&z<q.z1+pad)||waters.some(([a,b,c,d])=>x>a-pad&&x<c+pad&&z>b-pad&&z<d+pad));
  const camLane=(x,z)=>z>startP[1]-4&&z<startP[1]+26&&Math.abs(x-startP[0])<13;
  const addSolid=(x,z,w)=>solids.push({x0:x-w/2,x1:x+w/2,z0:z-w/2,z1:z+w/2});
  const P0=[startP[0],startP[1]-1.4],P1=[FC[0],FC[1]+6],PL=Math.hypot(P1[0]-P0[0],P1[1]-P0[1]),path=[];
  for(let t=0;t<=PL;t+=1.15){const x=P0[0]+(P1[0]-P0[0])*t/PL+(rng()-.5)*.45,z=P0[1]+(P1[1]-P0[1])*t/PL;if(free(x,z,.1))path.push([x,.06,z,rng()*3,.85+rng()*.35])}
  if(path.length)instScatter(scene,new THREE.CylinderGeometry(.5,.56,.1,8),M(SEAS==="winter"?"#c8c9d2":"#b8b2a6"),path,1);
  const nearPath=(x,z,r=1.6)=>path.some(q=>Math.hypot(q[0]-x,q[2]-z)<r);
  const benches=[],rocks=[],food=[];
  [[-1,0],[1,0]].forEach(([sx])=>{const x=startP[0]+sx*5,z=startP[1]-5;if(free(x,z,1)){const b=bench3();b.position.set(x,0,z);b.rotation.y=-sx*Math.PI/2;scene.add(b);addSolid(x,z,2);benches.push([x,z,-sx*Math.PI/2])}});
  if(m!==0&&m!==7)for(let t=6;t<PL-2;t+=9){const q=[P0[0]+(P1[0]-P0[0])*t/PL,P0[1]+(P1[1]-P0[1])*t/PL];[-2.8,2.8].forEach(o=>{const x=q[0]+o,z=q[1];if(free(x,z,.6)){A.add(ishidoro3(),x,z);addSolid(x,z,1);rocks.push([x,z,2.3,"lantern"])}})}
  if(["spring","rain","autumn","summer"].includes(SEAS))[-1,1].forEach(sx=>{const x=startP[0]+sx*7.5,z=startP[1]-12;if(free(x,z,1.5)){const f=bambooFence(6);f.position.set(x,0,z);f.rotation.y=Math.PI/2;scene.add(f);solids.push({x0:x-.2,x1:x+.2,z0:z-3,z1:z+3})}});
  const TK={winter:["pinesnow","pinesnow","pine"],spring:["sakura","green","sakura","pine"],rain:["green","green","pine"],summer:["green","pine","green"],night:["pine","green"],autumn:["momiji","amber","momiji","pine"]}[SEAS];
  for(let k=0;k<(osm?0:36);k++){const a=rng()*TAU,r=31+rng()*8,x=Math.cos(a)*r,z=Math.sin(a)*r;if(camLane(x,z))continue;if(waters.some(([a1,b1,c1,d1])=>x>a1&&x<c1&&z>b1&&z<d1))continue;const tr=tree3(TK[k%TK.length],1+rng()*.5);tr.position.set(x,0,z);scene.add(tr)}
  for(let k=0,n=0;k<60&&n<9;k++){const x=(rng()-.5)*50,z=(rng()-.5)*50;if(Math.hypot(x,z)<10||!free(x,z,2)||nearPath(x,z,3)||camLane(x,z))continue;n++;A.add(tree3(TK[n%TK.length],.9+rng()*.35),x,z,{solid:[[0,0,1,1]]})}
  for(let k=0,n=0;k<80&&n<11;k++){const x=(rng()-.5)*56,z=(rng()-.5)*56;if(Math.hypot(x,z)<5||!free(x,z,1)||nearPath(x,z,2)||camLane(x,z))continue;n++;const r=rock3(.6+rng()*.7,SEAS==="winter"?"#b9bcc6":"#9c978d");r.position.set(x,.2,z);r.rotation.y=rng()*3;scene.add(r);addSolid(x,z,1.2);rocks.push([x,z,.62,"rock"])}
  const GC={winter:["#ffffff","#eef4fc"],spring:["#7cc472","#93d48a"],rain:["#5fb86a","#7cc472"],summer:["#6cc26a","#86d47a"],night:["#3f6a4a","#4f7a5a"],autumn:["#c9a24a","#a8914f"]}[SEAS];
  const FL={winter:["#ffffff"],spring:["#ffb3c7","#ffffff","#ffe066"],rain:["#9db8ff","#c9a8ff","#ffb3c7"],summer:["#ffe066","#ffffff","#ff9f68"],night:["#ffe27a","#c9a8ff"],autumn:["#e5583a","#f5a043","#ffd36b"]}[SEAS];
  const tufts=[],flw=[];for(let k=0;k<900&&tufts.length<340;k++){const a=rng()*TAU,r=3+Math.sqrt(rng())*29,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!free(x,z,.3)||nearPath(x,z,.9))continue;tufts.push([x,0,z,rng()*3,.7+rng()*.8,GC[k%2]]);if(rng()<.45)flw.push([x+.25,.22,z+.15,0,.8+rng()*.6,FL[k%FL.length]])}
  if(SEAS==="winter")instScatter(scene,new THREE.SphereGeometry(.28,8,6,0,TAU,0,Math.PI/2),M("#ffffff"),tufts,1);
  else{instScatter(scene,new THREE.ConeGeometry(.16,.5,5),M("#ffffff"),tufts.map(t=>[t[0],.22,t[2],t[3],t[4],t[5]]),1);instScatter(scene,new THREE.SphereGeometry(.09,6,5),M("#ffffff"),flw,1)}
  const RC={winter:"#a9b8d4",spring:"#9fb7d8",rain:"#97a9c4",summer:"#8fb8c8",night:"#3a3560",autumn:"#b89a86"}[SEAS];
  for(let k=0;k<18;k++){const a=k/18*TAU+rng()*.2,r=(osm?470:100)+rng()*14,h=(10+rng()*14)*(osm?3:1);const c=new THREE.Mesh(new THREE.ConeGeometry((16+rng()*10)*(osm?3:1),h,7),M(RC));c.position.set(Math.cos(a)*r,h/2-1,Math.sin(a)*r);scene.add(c)}
  if(!night){const cl=[];for(let k=0;k<7;k++){const c=kasumi3();c.position.set((rng()-.5)*120,24+rng()*12,-30-rng()*60);c.scale.setScalar(1+rng()*.8);scene.add(c);cl.push(c)}ticks.push(dt=>cl.forEach((c,i)=>{c.position.x+=dt*(.6+i*.1);if(c.position.x>70)c.position.x=-70}));
    const bd=[];for(let k=0;k<5;k++){const b=bird3();scene.add(b);bd.push(b)}ticks.push(()=>{const t=performance.now()/1000;bd.forEach((b,i)=>{const a=t*.25+i*1.3;b.position.set(FC[0]+Math.cos(a)*(14+i*2),15+i*1.2+Math.sin(t*2+i)*.4,FC[1]+Math.sin(a)*(10+i));b.rotation.y=-a;b.children.forEach((w,j)=>w.rotation.z=(j?1:-1)*(.35+Math.sin(t*9+i)*.4))})})}
  /* điểm nhấn riêng từng cảnh */
  if(m===0&&!osm){[-1,1].forEach(sx=>rocks.push([sx*3.2,-3.6,2.1,"statue"]))}
  if(m===1&&!osm){const f=new THREE.Mesh(new THREE.PlaneGeometry(10,7),M("#f7f9fc"));f.rotation.x=-Math.PI/2;f.position.set(-17,.05,9);scene.add(f);for(let k=0;k<6;k++)scene.add(box(10,.12,.18,"#d9dfe8",-17,.08,6+k*1.2))}
  if(m===2){const st=stairs3(9,2.6);st.position.set(-6,0,-6.4);scene.add(st);const mt=box(2.6,.05,2,"#e5484d",6,.06,2);scene.add(mt);food.push([6,2])}
  if(m===3&&!osm){waters.push([-9,-13.6,-1.4,-11]);waters.push([1.4,-13.6,9,-11]);[-5.2,5.2].forEach(x=>A.add(water3(7.6,2.6,"#5fa4d6"),x,-12.3));A.add(box(2.8,.25,3,"#b8b2a6",0,.12,-12.3),0,-12.3);food.push([6,-2])}
  if(m===4){[[-12,-14],[12,-4]].forEach(([x,z])=>{const k=koinobori3();A.add(k,x,z,{solid:[[0,0,.5,.5]]});ticks.push(()=>k.userData.carps.forEach((c,i)=>{c.rotation.y=Math.sin(performance.now()/520+i+x)*.35}))});
    A.add(water3(10,7,"#7fc4e0"),-16,8,{water:[-21,4.5,-11,11.5]});for(let r=0;r<5;r++)for(let c=0;c<8;c++)scene.add(cyl(.04,.06,.4,"#5fb86a",-20+c*1.2,.2,5.5+r*1.3,5))}
  if(m===5){for(let k=0;k<18;k++){const x=12+rng()*6,z=-12+rng()*10;if(!free(x,z,.2))continue;const h=5+rng()*3;scene.add(cyl(.12,.14,h,"#6aa84f",x,h/2,z,7));scene.add(sph(.45,"#5fb86a",x,h,z,8,6));addSolid(x,z,.4)}}
  if(m===6){[[-10,-16,.4],[12,-20,-.3]].forEach(([x,z,r])=>{const b=boat3();b.position.set(x,0,z);b.rotation.y=r;scene.add(b);ticks.push(()=>{b.position.y=Math.sin(performance.now()/700+x)*.08})})}
  if(m===7){A.add(yagura3(),0,-2,{solid:[[0,0,3.8,3.8]]});food.push([-3,-10],[8,10])}
  if(m===8){const rb=new THREE.Group();rb.add(outline(sph(.35,"#f6f4f0",0,.35,0,12,10)));rb.add(outline(sph(.25,"#f6f4f0",0,.82,.05,12,10)));[-1,1].forEach(s=>{const e=outline(sph(.07,"#f6f4f0",s*.09,1.18,0,8,6));e.scale.y=3;rb.add(e)});A.add(rb,-2.4,-2);addSolid(-2.4,-2,.9);food.push([2,-2])}
  if(m===9){const zg=zenGarden(9,6);A.add(zg,15,4);solids.push({x0:10.5,x1:19.5,z0:1,z1:7})}
  if(m===10){[[-8,-18,.3],[10,-22,-.4]].forEach(([x,z,r])=>{const b=boat3();b.position.set(x,0,z);b.rotation.y=r;scene.add(b);ticks.push(()=>{b.position.y=Math.sin(performance.now()/700+x)*.08})});A.add(box(3,.3,6,"#a0693e",0,.15,0),8,-14);solids.push({x0:6.5,x1:9.5,z0:-17,z1:-11})}
  if(m===11){[[-6,-6],[8,-4],[16,-14]].forEach(([x,z],i)=>{A.add(iceSculpt(["#bfe6ff","#d6f0ff","#c8dcff"][i]),x,z,{solid:[[0,0,2.6,1.8]]})})}
  const ps=particles(S.ps);scene.add(ps);ticks.push(dt=>ps.userData.tick(dt,player.position.x,player.position.z));
  if(A.fw)ticks.push(fireworks(scene));
  if(A.koi)ticks.push(()=>A.koi.userData.carps.forEach((c,i)=>{c.rotation.y=Math.sin(performance.now()/500+i)*.35;c.rotation.z=Math.sin(performance.now()/380+i*2)*.12}));
  await loadTai();let player=makePlayer(av);player.position.set(startP[0],0,startP[1]);player.rotation.y=Math.PI;scene.add(player);

  /* ---------- 12 con giáp ---------- */
  const NM=api.names||[],GR=api.greets||[],zs=[];
  const pickZ=(g,i)=>{g.traverse(c=>{if(c.isMesh&&!c.userData.isOutline)c.userData.pick={animal:i}});return g};
  const comp=pickZ(zodiac3(m,api.stage||0),m);comp.scale.setScalar(1.08);comp.position.set(startP[0]+1.6,0,startP[1]+.8);scene.add(comp);zs.push({g:comp,i:m,mode:"follow"});
  const taken=[];const faceStart=(g,x,z)=>{g.rotation.y=Math.atan2(startP[0]-x,startP[1]-z)};
  const spot=(minD=2.6)=>{for(let k=0;k<400;k++){const W=k<200?30:60,x=(k<200?0:startP[0])+(rng()-.5)*W,z=k<200?FC[1]+3+rng()*(startP[1]-FC[1]-5):startP[1]+(rng()-.5)*W;if(osm&&osm.blocked(x,z))continue;if(!free(x,z,.8)||nearPath(x,z,1.3)||taken.some(([a,b])=>Math.hypot(a-x,b-z)<minD)||Math.hypot(x-startP[0],z-startP[1])<3)continue;taken.push([x,z]);return [x,z]}return [(rng()-.5)*20,startP[1]-6]};
  const usedRock=new Set();const rockFor=pref=>{let best=-1,bd=1e9;rocks.forEach((r,k)=>{if(usedRock.has(k)||(pref&&r[3]!==pref&&pref!=="any"))return;const d=Math.hypot(r[0]-startP[0],r[1]-startP[1]);if(d<bd){bd=d;best=k}});if(best<0&&pref!=="any")return rockFor("any");if(best>=0)usedRock.add(best);return best>=0?rocks[best]:null};
  for(let i=0;i<12;i++){if(i===m)continue;const g=pickZ(zodiac3(i,0),i);let mode="idle",x,z,y=0;
    if(i===4){mode="fly"}
    else if(i===8&&trees.length){const t=trees.slice().sort((a,b)=>Math.hypot(a.x-startP[0],a.z-startP[1])-Math.hypot(b.x-startP[0],b.z-startP[1]))[Math.min(1,trees.length-1)];const ts=t.h/3.1;
      /* khỉ ngồi trên ngọn cây, nhìn thấy từ mọi phía, không bị tán lá che */
      let top=0;scene.traverse(o=>{if(o.userData.tree&&Math.abs(o.position.x-t.x)<.01&&Math.abs(o.position.z-t.z)<.01){const bb=new THREE.Box3().setFromObject(o);top=bb.max.y}});x=t.x;z=t.z;y=(top||3.6*ts)-.35;}
    else if(i===9||i===5){const r=rockFor(i===9?"lantern":"rock");if(r){x=r[0];z=r[1];y=r[2]}mode=i===9?"peck":"idle"}
    else if(i===3&&benches.length){const b=benches[0];x=b[0];z=b[1];y=.56;mode="sleep";g.rotation.y=b[2]}
    else if(i===11&&food.length){const f=food[0];x=f[0]+1.2;z=f[1]+1;}
    else if(i===6){mode="walk"}
    if(x==null&&mode!=="fly"&&mode!=="walk"){[x,z]=spot()}
    if(i===1||i===7)mode="graze";
    if(mode==="walk"){let zz=startP[1]-7,xx=0;if(osm&&osm.blocked(xx,zz)){const L=osm.nearestLand(startP[0],startP[1],3);if(L){xx=L[0];zz=L[1]}}x=xx;z=zz;g.userData.walk={z:zz,dir:1,x0:xx}}
    if(osm&&mode!=="fly"&&x!=null&&y<.1&&osm.blocked(x,z)){const L=osm.nearestLand(x,z,1);if(L){x=L[0];z=L[1]}}
    if(x!=null){g.position.set(x,y,z);if(mode!=="sleep")faceStart(g,x,z);if(y<.1&&mode!=="walk")addSolid(x,z,.8)}
    scene.add(g);zs.push({g,i,mode})}
  ticks.push(dt=>{const pp=player.position,t=performance.now()/1000;
    zs.forEach(o=>{const g=o.g;let moving=false;
      if(o.mode==="follow"){const fx=-Math.sin(yaw),fz=-Math.cos(yaw),tx=pp.x+(-fz)*1.6+fx*.7,tz=pp.z+fx*1.6+fz*.7,dx=tx-g.position.x,dz=tz-g.position.z,d=Math.hypot(dx,dz);
        if(d>.25){const st=Math.min(d,dt*(d>4?9:5.6));g.position.x+=dx/d*st;g.position.z+=dz/d*st;g.rotation.y=Math.atan2(dx,dz);moving=true}else g.rotation.y+= (Math.atan2(pp.x-g.position.x,pp.z-g.position.z)-g.rotation.y)*.05}
      else if(o.mode==="fly"){const a=t*.35;g.position.set(FC[0]+Math.cos(a)*9,7.5,FC[1]+6+Math.sin(a)*7);g.rotation.y=-a}
      else if(o.mode==="walk"){const w=g.userData.walk;g.position.x+=w.dir*dt*2.2;if(Math.abs(g.position.x-(w.x0||0))>9||blocked(g.position.x+w.dir*.6,g.position.z))w.dir*=-1;g.rotation.y=w.dir>0?Math.PI/2:-Math.PI/2;moving=true}
      animZ(g,dt,o.mode==="follow"||o.mode==="walk"?"idle":o.mode,moving)})});
  function zCard(i){const n=NM[i]||["",""," "],gr=GR[i]||"",jp=(gr.match(/^[^A-Za-zÀ-ỹ]+?[!！]/)||[""])[0];
    openPanel(`<div class="g3-card"><div class="g3-who"><b>${esc(n[0])} <span lang="ja" style="background:none;color:#655d7a">${esc(n[1])}</span></b><span>${i===m?"Bạn đồng hành tháng "+(m+1):"Con giáp năm "+esc((n[2]||"").split(" ")[1]||"")}</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="g3-line" lang="ja" style="text-align:center">${esc(jp||n[1])}</div><div class="vi">${esc(gr.replace(jp,"").trim())}</div>
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-say>🔊 Nghe</button><button class="g3-next" type="button" data-x data-focus style="margin-left:0">Tiếp tục dạo</button></div></div>`);
    panel.querySelectorAll("[data-x]").forEach(b=>b.onclick=closePanel);const sp=()=>{try{api.say(jp||n[1])}catch(e){}};panel.querySelector("[data-say]").onclick=sp;sp();
    const z=zs.find(o=>o.i===i);if(z){z.g.userData.t=0;const b=z.g.userData.body;b.position.y=.4;setTimeout(()=>b.position.y=0,250)}}
  const spots=Object.fromEntries(S.spots.map(s=>[s[0],s]));
  root.insertAdjacentHTML("beforeend",`
    <div class="g3-top"><button class="g3-btn" id="g3Exit" type="button" aria-label="Thoát cảnh 3D">‹ Thoát</button>
      <div class="g3-title"><b lang="ja">${esc(S.name)}</b><span>Tháng ${m+1} · ${esc(S.vn)}</span></div>
      <button class="g3-btn" id="g3Prev" type="button" aria-label="Cảnh tháng trước">‹</button><button class="g3-btn" id="g3Next" type="button" aria-label="Cảnh tháng sau">›</button></div>
    <div class="g3-stats"><span>Từ ở cảnh này <b id="g3Sc"></b></span></div>${OD?'<div class="g3-osm">Bản đồ thật: © OpenStreetMap contributors</div>':''}
    <div class="g3-zoom"><button type="button" id="g3Zin" aria-label="Phóng to">+</button><button type="button" id="g3Zout" aria-label="Thu nhỏ">−</button><button type="button" id="g3Pano" class="g3-pano" aria-pressed="false" aria-label="Xem toàn cảnh từ trên cao" title="Toàn cảnh"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 19l6-9 4 6 3-4 5 7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="17" cy="6" r="2" fill="currentColor"/></svg></button></div>
    <div class="g3-hint" id="g3Hint">${mobile?"Chạm mặt đất để đi · chạm chỗ có dấu あ để học từ · chạm con giáp để nghe chào · kéo để xoay, chụm 2 ngón để thu phóng":"Bấm mặt đất hoặc W A S D để đi · bấm chỗ có dấu あ để học từ · bấm con giáp để nghe chào · kéo chuột để xoay, lăn chuột để thu phóng"}</div>
    <div id="g3Panel"></div>`);
  const $=id=>root.querySelector("#"+id);root.querySelector(".g3-load").remove();
  const isGotS=k=>(seen[m]||[]).includes(k);
  const BKs=bakeStatic(scene,ticks);Object.values(spotObj).forEach(([o])=>{if(!o.isMesh&&!o.userData.body)bakeRig(o)});
  const WMs=wordMarkers(scene,Object.entries(spotObj).map(([k,[o,y,sc]])=>{if(o.userData.water){const g=new THREE.Object3D();g.position.set(o.position.x,0,o.position.z+((S.focus||[0,-16])[1]>-10?6:12));scene.add(g);return [k,g,1.2,1.3]}return [k,o,y,sc]}),isGotS,k=>({spot:k}));ticks.push(()=>WMs.tick(performance.now(),Math.max(1,dist/15)));
  const upd=()=>{WMs.refresh();const got=S.spots.filter(s=>(seen[m]||[]).includes(s[0])).length;$("g3Sc").textContent=`${got}/${S.spots.length}`};upd();
  let yaw=osm?Math.atan2(startP[0]-CFG.off[0],startP[1]-CFG.off[1]):0,dist=mobile?12:13,pitch=.3;const camT=new THREE.Vector3();
  /* chế độ toàn cảnh: máy quay bay cao, quay quanh cả khu vực */
  let pano=false,panoSave=null;const pT=new THREE.Vector3(...(osm?[(startP[0]+CFG.off[0])/2,0,(startP[1]+CFG.off[1])/2]:[FC[0],0,(FC[1]+startP[1])/2]));const DMAX=()=>pano?(osm?420:120):62,DMIN=()=>pano?(osm?50:30):6;
  let shR=26;
  function placeCam(snap){const p=pano?pT:player.position,zf=pano?1:Math.min(1,Math.max(0,(dist-16)/44)),pe=pano?pitch:pitch+zf*(1.15-pitch)*.85,ah=6*(1-zf);
    camT.set(p.x+Math.sin(yaw)*dist*Math.cos(pe),p.y+dist*Math.sin(pe),p.z+Math.cos(yaw)*dist*Math.cos(pe));if(snap)camera.position.copy(camT);else camera.position.lerp(camT,.12);camera.lookAt(p.x-Math.sin(yaw)*ah,p.y+2.6*(1-zf),p.z-Math.cos(yaw)*ah);
    const nn=pano?Math.max(2,dist*.04):Math.max(.1,dist*.012);if(Math.abs(camera.near-nn)>.03){camera.near=nn;camera.updateProjectionMatrix()}
    const want=Math.round(Math.min(pano?150:90,Math.max(26,dist*1.25))/8)*8;if(want!==shR){shR=want;Object.assign(sun.shadow.camera,{left:-shR,right:shR,top:shR,bottom:-shR,far:60+shR*2});sun.shadow.normalBias=shR*.0012;sun.shadow.camera.updateProjectionMatrix()}
    sun.position.set(p.x+20,32+shR*.3,p.z+16);sun.target.position.set(p.x,0,p.z)}
  function resize(){const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();placeCam(true);addEventListener("resize",resize);
  $("g3Zin").onclick=()=>dist=Math.max(DMIN(),dist/1.3);$("g3Zout").onclick=()=>dist=Math.min(DMAX(),dist*1.3);
  const setPano=on=>{if(on===pano)return;pano=on;const b=$("g3Pano");b.setAttribute("aria-pressed",String(on));b.classList.toggle("on",on);
    if(on){panoSave={dist,pitch};dist=osm?200:90;pitch=.95;scene.fog.far=(scene.fog.far||320)*2.2;try{hintOff()}catch(e){}}else{if(panoSave){dist=panoSave.dist;pitch=panoSave.pitch}scene.fog.far=scene.fog.far/2.2}};
  $("g3Pano").onclick=()=>setPano(!pano);
  const blocked=(x,z)=>(osm?osm.blocked(x,z):Math.hypot(x,z)>40)||solids.some(s=>x>s.x0-.35&&x<s.x1+.35&&z>s.z0-.35&&z<s.z1+.35)||waters.some(([a,b,c,d])=>x>a&&x<c&&z>b&&z<d);
  function step(dx,dz){const p=player.position,nx=p.x+dx,nz=p.z+dz;if(!blocked(nx,nz)){p.x=nx;p.z=nz;return true}if(!blocked(nx,p.z)){p.x=nx;return true}if(!blocked(p.x,nz)){p.z=nz;return true}return false}
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  function hit(e){const r=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
    for(const h of ray.intersectObjects(scene.children,true)){const u=h.object.userData;if(u.isOutline)continue;if(u.pick)return {pick:u.pick,point:h.point};if(u.ground)return {point:h.point};if(u.water)return {point:h.point,water:true}}return null}
  let target=null,panelOpen=false,down=null,dragging=false;const keys=new Set();
  const hintOff=()=>{const h=$("g3Hint");if(h)h.style.opacity=0};const hintT=setTimeout(hintOff,9000);
  const cv=renderer.domElement;
  const pts=new Map();let pinch=null;
  cv.addEventListener("pointerdown",e=>{pts.set(e.pointerId,[e.clientX,e.clientY]);if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),dist};down=null;dragging=true;return}down={x:e.clientX,y:e.clientY,yaw,pitch};dragging=false;cv.setPointerCapture(e.pointerId)});
  cv.addEventListener("pointercancel",e=>{pts.delete(e.pointerId);if(pts.size<2)pinch=null});
  cv.addEventListener("pointermove",e=>{if(pts.has(e.pointerId))pts.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&pts.size===2){const [a,b]=[...pts.values()];dist=Math.min(DMAX(),Math.max(DMIN(),pinch.dist*pinch.d/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1]))));return}if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!dragging&&Math.hypot(dx,dy)>10)dragging=true;if(dragging){yaw=down.yaw-dx*.006;pitch=Math.min(1.1,Math.max(.1,down.pitch+dy*.004))}});
  cv.addEventListener("pointerup",e=>{pts.delete(e.pointerId);if(pinch){if(pts.size<2)pinch=null;down=null;dragging=false;return}const was=dragging;down=null;dragging=false;if(was||panelOpen)return;const h=hit(e);if(!h)return;hintOff();
    if(h.pick&&h.pick.animal!=null){zCard(h.pick.animal);return}if(h.pick&&h.pick.spot){spotCard(h.pick.spot);return}if(pano)return;if(!h.water)target=new THREE.Vector3(h.point.x,0,h.point.z)});
  cv.addEventListener("wheel",e=>{e.preventDefault();dist=Math.min(DMAX(),Math.max(DMIN(),dist*(1+e.deltaY*.0012)))},{passive:false});
  const kd=e=>{if(e.key==="Escape"){if(panelOpen)closePanel();return}if(panelOpen)return;const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)){keys.add(k);target=null;hintOff();setPano(false);e.preventDefault()}};
  const ku=e=>keys.delete(e.key.toLowerCase());addEventListener("keydown",kd);addEventListener("keyup",ku);
  const panel=$("g3Panel");let opener=null;
  function openPanel(html){try{hintOff()}catch(e){}opener=document.activeElement;panel.innerHTML=`<div class="g3-panel" role="dialog" aria-modal="false">${html}</div>`;panelOpen=true;const f=panel.querySelector("[data-focus]")||panel.querySelector("button");if(f)setTimeout(()=>f.focus({preventScroll:true}),30)}
  function closePanel(){panel.innerHTML="";panelOpen=false;try{speechSynthesis.cancel()}catch(e){}(opener&&opener.focus?opener:cv).focus({preventScroll:true})}
  const sayJ=t=>{try{api.say(api.spOf?t:plain(t))}catch(e){}};
  function spotCard(id){const s=spots[id];if(!s)return;const [,j,v,ex]=s;const L=seen[m]||[];const isNew=!L.includes(id);if(isNew){seen[m]=[...L,id];try{localStorage.setItem("g3-scene",JSON.stringify(seen))}catch(e){}upd()}
    openPanel(`<div class="g3-card"><div class="g3-who"><span>${isNew?"Từ mới ở cảnh này!":"Đã học"}</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="big" lang="ja">${R(j)}</div><div class="g3-roma">${esc(roma(j))}</div><div class="vi">${esc(v)}</div><div class="g3-sub" style="margin-top:6px">${esc(ex)}</div>
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-say>🔊 Nghe lại</button><button class="g3-next" type="button" data-x data-focus style="margin-left:0">Tiếp tục dạo</button></div></div>`);
    panel.querySelectorAll("[data-x]").forEach(b=>b.onclick=closePanel);panel.querySelector("[data-say]").onclick=()=>sayJ(j);sayJ(j)}
  $("g3Exit").onclick=()=>api.exit();$("g3Prev").onclick=()=>api.go((m+11)%12);$("g3Next").onclick=()=>api.go((m+1)%12);
  const occS=occluder(scene,camera,()=>[player.position]);let raf=0,last=performance.now(),alive=true;const fwd=new THREE.Vector3(),right=new THREE.Vector3();
  function loop(t){if(!alive)return;raf=requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;let moving=false;const sp=5.4*dt,p=player.position;
    if(keys.size){fwd.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(-fwd.z,0,fwd.x);let mx=0,mz=0;
      if(keys.has("w")||keys.has("arrowup")){mx+=fwd.x;mz+=fwd.z}if(keys.has("s")||keys.has("arrowdown")){mx-=fwd.x;mz-=fwd.z}if(keys.has("d")||keys.has("arrowright")){mx+=right.x;mz+=right.z}if(keys.has("a")||keys.has("arrowleft")){mx-=right.x;mz-=right.z}
      const l=Math.hypot(mx,mz);if(l>0){mx/=l;mz/=l;moving=step(mx*sp,mz*sp);player.rotation.y=Math.atan2(mx,mz)}}
    else if(target){const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d>.15){const k=Math.min(sp,d)/d;moving=step(dx*k,dz*k);player.rotation.y=Math.atan2(dx,dz);if(!moving)target=null}else target=null}
    if(pano&&!dragging&&!down&&!window.__g3still)yaw+=dt*.05;
    animChar(player,dt,moving);ticks.forEach(f=>f(dt));
    scene.children.forEach(o=>{if(o.userData.billboard)o.lookAt(camera.position)});if(!pano)occS();else occS.clear&&occS.clear();
    placeCam(false);renderer.render(scene,camera)}
  const vis=()=>{if(document.hidden)cancelAnimationFrame(raf);else if(alive){last=performance.now();raf=requestAnimationFrame(loop)}};document.addEventListener("visibilitychange",vis);
  raf=requestAnimationFrame(loop);cv.focus({preventScroll:true});
  if(location.search.includes("g3debug"))window.__g3s={scene,THREE,bake:BKs,info:()=>({...renderer.info.render}),spotCard,setPos:(x,z)=>{player.position.set(x,0,z);placeCam(true)},setYaw:v=>{yaw=v},setPitch:v=>{pitch=v},setDist:v=>{dist=v}};
  return {stop(){alive=false;cancelAnimationFrame(raf);clearTimeout(hintT);removeEventListener("resize",resize);removeEventListener("keydown",kd);removeEventListener("keyup",ku);document.removeEventListener("visibilitychange",vis);try{speechSynthesis.cancel()}catch(e){}
    scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});renderer.dispose();try{renderer.forceContextLoss()}catch(e){}root.innerHTML="";root.className=""}};
}

/* =====================================================================
   TRANG TRÍ DÙNG CHUNG + 12 CON GIÁP 3D
   ===================================================================== */
const rngOf=seed=>{let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
function kasumi3(){const g=new THREE.Group();[[0,0,0,5.2],[1.2,.55,.3,3.6],[-1,-.5,.2,3.2]].forEach(([x,y,z,w])=>{const c=new THREE.Mesh(new THREE.CapsuleGeometry(.45,w,6,12),new THREE.MeshBasicMaterial({color:0xfffaf0,fog:false}));c.rotation.z=Math.PI/2;c.position.set(x,y,z);g.add(c);
  const e=new THREE.Mesh(new THREE.BoxGeometry(w,.08,.08),new THREE.MeshBasicMaterial({color:0xe2bf72,fog:false}));e.position.set(x,y-.42,z+.4);g.add(e)});return g}
function bird3(){const g=new THREE.Group();[-1,1].forEach(s=>{const w=new THREE.Mesh(new THREE.BoxGeometry(.6,.05,.18),new THREE.MeshBasicMaterial({color:0x3a3f52}));w.position.x=s*.28;w.rotation.z=s*.35;g.add(w)});return g}
function bench3(){const g=new THREE.Group();g.add(outline(box(2,.12,.6,"#a0693e",0,.5,0)));g.add(outline(box(2,.5,.1,"#a0693e",0,.82,-.27)));[-.85,.85].forEach(x=>g.add(box(.12,.5,.5,"#5a4a3a",x,.25,0)));return g}
function bambooFence(len){const g=new THREE.Group();for(let x=-len/2;x<=len/2+.01;x+=.9)g.add(cyl(.05,.05,1.1,"#c9b16a",x,.55,0,6));[.35,.8].forEach(y=>{const r=cyl(.04,.04,len,"#b39a55",0,y,0,6);r.rotation.z=Math.PI/2;g.add(r)});return g}
function rock3(s=1,c="#9c978d"){const m=outline(new THREE.Mesh(new THREE.DodecahedronGeometry(.6,0),M(c)),1.04);m.scale.set(s*1.3,s*.7,s);m.castShadow=true;m.receiveShadow=true;return m}
/* cổng lầu 楼門 của Fushimi Inari: hai tầng, cột son, tường trắng, mái đen cong */
function romon3(){const g=new THREE.Group(),V="#d8432f",Wt="#f6f1e6",D="#2f2b3a";
  g.add(outline(box(10.6,.6,4.6,"#c9c2b3",0,.3,0)));
  [-4.6,-1.7,1.7,4.6].forEach(x=>[-1.5,1.5].forEach(z=>g.add(outline(cyl(.24,.26,4.2,V,x,2.7,z,10)))));
  [-1,1].forEach(sx=>{g.add(outline(box(2.6,3.4,2.8,V,sx*3.15,2.3,0)));g.add(box(2.2,2.6,.06,Wt,sx*3.15,2.4,1.43));g.add(box(2.2,2.6,.06,Wt,sx*3.15,2.4,-1.43))});
  g.add(outline(box(10.2,.5,4,V,0,4.95,0)));const r1=roofQuad(7.4,1.3,D);r1.position.y=5.9;r1.scale.set(1,1,.62);g.add(r1);
  g.add(outline(box(7,2.2,3,V,0,7.2,0)));g.add(box(6.2,1.4,.06,Wt,0,7.2,1.52));for(let i=0;i<6;i++)g.add(box(.12,1.4,.08,V,-2.6+i*1.04,7.2,1.55));
  const r2=roofQuad(6.6,2.2,D);r2.position.y=9.4;r2.scale.set(1,1,.6);g.add(r2);g.add(box(1.4,.7,.08,"#f2bf3a",0,6.25,1.6));
  [-3.3,3.3].forEach(x=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshBasicMaterial({color:0xffe9b0}));l.scale.y=1.3;l.position.set(x,4.2,1.9);g.add(l)});return g}
/* hàng nghìn cổng torii theo lối đi thật (instanced: 1 lần vẽ cho mỗi bộ phận) */
function toriiTunnel(scene,list){if(!list.length)return;const o=new THREE.Object3D(),N=list.length,V="#e0482f";
  const post=new THREE.CylinderGeometry(.11,.13,2.6,6,1,true),beam=new THREE.BoxGeometry(2.3,.18,.24),top=new THREE.BoxGeometry(2.6,.2,.3),base=new THREE.CylinderGeometry(.15,.15,.35,6);
  const parts=[[post,V,-.95,1.3,0],[post,V,.95,1.3,0],[beam,V,0,2.15,0],[top,"#231f26",0,2.55,0],[base,"#231f26",-.95,.17,0],[base,"#231f26",.95,.17,0]];
  parts.forEach(([geo,c,dx,dy])=>{const im=new THREE.InstancedMesh(geo,M(c),N);list.forEach((p,i)=>{o.position.set(p[0],0,p[1]);o.rotation.set(0,p[2],0);o.updateMatrix();const m=new THREE.Matrix4().makeTranslation(dx,dy,0);m.premultiply(o.matrix);im.setMatrixAt(i,m)});im.castShadow=false;scene.add(im)})}
function shrine3(s=1){const g=new THREE.Group();g.add(outline(box(6,.5,4.5,"#c9c2b3",0,.25,0)));g.add(outline(box(4.6,2.4,3.4,"#d24a36",0,1.7,0)));g.add(box(3.6,1.6,.06,"#f5e6ca",0,1.6,1.72));
  const r=roofQuad(4.4,1.8,"#2f2b3a");r.position.y=3.8;r.scale.z=.85;g.add(r);g.add(box(1,.5,.06,"#f2bf3a",0,2.75,1.75));[-1,1].forEach(x=>g.add(cyl(.12,.12,2.4,"#d24a36",x*2.1,1.7,1.6,8)));g.scale.setScalar(s);return g}
function kitsune3(){const g=new THREE.Group();g.add(outline(box(.7,.5,.7,"#a39e94",0,.25,0)));g.add(outline(sph(.3,"#f6f4f0",0,.75,0,12,10)));g.add(outline(sph(.22,"#f6f4f0",0,1.15,.08,12,10)));
  [-1,1].forEach(s=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.07,.2,4),M("#f6f4f0"));e.position.set(s*.1,1.38,.05);g.add(e)});g.add(box(.3,.12,.05,"#d24a36",0,.92,.28));return g}
function yagura3(){const g=new THREE.Group();[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]].forEach(([x,z])=>g.add(cyl(.14,.14,4.6,"#8a5a44",x,2.3,z,8)));
  g.add(outline(box(4,.25,4,"#a0693e",0,2.4,0)));const tex=canvasTex(256,32,(c,W,H)=>{for(let i=0;i<16;i++){c.fillStyle=i%2?"#fff":"#d24a36";c.fillRect(i*W/16,0,W/16,H)}});
  [0,1,2,3].forEach(k=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(4,.8),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));p.position.y=1.9;p.rotation.y=k*Math.PI/2;p.position.x=Math.sin(k*Math.PI/2)*2.01;p.position.z=Math.cos(k*Math.PI/2)*2.01;g.add(p)});
  const r=roofQuad(3.4,1.4,"#2f2b3a");r.position.y=5.2;g.add(r);g.add(outline(cyl(.55,.55,.7,"#7a3a2a",0,2.9,0,16)));g.add(cyl(.5,.5,.72,"#f2e6cf",0,2.9,0,16));
  for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;const l=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:k%2?0xff5a4a:0xffa04a}));l.scale.y=1.3;l.position.set(Math.cos(a)*2.3,4.2,Math.sin(a)*2.3);g.add(l)}
  return g}
function iceSculpt(c="#bfe6ff"){const g=new THREE.Group();const mat=new THREE.MeshToonMaterial({color:c,gradientMap:toonGrad(),transparent:true,opacity:.82});
  const a=new THREE.Mesh(new THREE.BoxGeometry(2.4,.4,1.6),mat);a.position.y=.2;g.add(a);const b=new THREE.Mesh(new THREE.ConeGeometry(.9,2.4,6),mat);b.position.y=1.6;g.add(b);const cc=new THREE.Mesh(new THREE.SphereGeometry(.5,12,10),mat);cc.position.y=3;g.add(cc);return g}
function boat3(){const g=new THREE.Group();const h=outline(new THREE.Mesh(new THREE.CylinderGeometry(.6,.4,3.2,8,1,false,0,Math.PI),M("#8a5a44",{side:THREE.DoubleSide})),1.03);h.rotation.set(0,0,Math.PI/2);h.rotation.x=Math.PI/2;h.position.y=.3;g.add(h);g.add(box(.5,.05,1,"#a0693e",0,.42,0));return g}
function zenGarden(w,d){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),M("#ece6d8"));p.rotation.x=-Math.PI/2;p.position.y=.05;g.add(p);
  for(let z=-d/2+.4;z<d/2;z+=.45){const l=new THREE.Mesh(new THREE.PlaneGeometry(w,.06),M("#cfc6b3"));l.rotation.x=-Math.PI/2;l.position.set(0,.06,z);g.add(l)}
  [[-w*.25,-d*.1,1.1],[w*.2,d*.15,.8],[w*.32,-d*.25,.6]].forEach(([x,z,s])=>{const r=rock3(s,"#8f897e");r.position.set(x,.2,z);g.add(r);const ring=new THREE.Mesh(new THREE.RingGeometry(s*1.1,s*1.25,24),M("#cfc6b3"));ring.rotation.x=-Math.PI/2;ring.position.set(x,.07,z);g.add(ring)});return g}
function stairs3(n,w,step=.35,rise=.32){const g=new THREE.Group();for(let i=0;i<n;i++)g.add(outline(box(w,rise*(i+1),step,"#b8b2a6",0,rise*(i+1)/2,-i*step),1.01));return g}
function instScatter(scene,geo,mat,pts,scl){const im=new THREE.InstancedMesh(geo,mat,pts.length);const o=new THREE.Object3D();pts.forEach((p,i)=>{o.position.set(p[0],p[1]||0,p[2]);o.rotation.y=p[3]||0;o.scale.setScalar(scl*(p[4]||1));o.updateMatrix();im.setMatrixAt(i,o.matrix);if(p[5])im.setColorAt(i,new THREE.Color(p[5]))});im.receiveShadow=true;scene.add(im);return im}

/* ---------- 12 con giáp 3D ---------- */
const ZD=[
 {c:"#c3bfd4",belly:"#ecebf4",ear:"round"},{c:"#8e9bb8",belly:"#c9d1e3",ear:"small",horn:"#f3e6c4",muzzle:"#c9d1e3"},{c:"#f8a54a",belly:"#fff4e6",ear:"round",stripes:"#7a4a1e",muzzle:"#fff4e6"},
 {c:"#f7cf98",belly:"#fff4e6",ear:"cat",muzzle:"#fff4e6"},{c:"#6fcf9f",belly:"#f3f0c8",ear:"none",dhorn:"#ffd36b",spikes:"#3f9d72"},{c:"#b9a0ec",belly:"#e8dcff",ear:"none",snake:1},
 {c:"#d39a6a",belly:"#f3dcc2",ear:"cat",mane:"#7a4a2a",muzzle:"#f3dcc2"},{c:"#f4eee2",belly:"#fffaf0",ear:"small",wool:"#fffdf6",shorn:"#d9c7a3",face:"#e9dcc6"},{c:"#b98256",belly:"#f3d9bc",ear:"monkey",plate:"#f3d9bc"},
 {c:"#fffaf2",belly:"#ffffff",ear:"none",comb:"#e5484d",beak:"#ffb547",feet:"#ffb547"},{c:"#ec9e55",belly:"#fff4e6",ear:"cat",urajiro:"#fff4e6",curl:1},{c:"#f8b6c8",belly:"#ffd6e2",ear:"pig",snout:"#f591ad",curl:1}];
const AFACE=new Map();
function animalFace(d){const k=(d.plate||"")+(d.urajiro||"")+(d.muzzle||"");if(AFACE.has(k))return AFACE.get(k);
  const t=canvasTex(256,256,(g)=>{g.clearRect(0,0,256,256);
    if(d.plate){g.fillStyle=d.plate;g.beginPath();g.ellipse(128,160,92,80,0,0,TAU);g.fill()}
    if(d.urajiro){g.fillStyle=d.urajiro;g.beginPath();g.ellipse(128,200,100,58,0,0,TAU);g.fill()}
    if(d.muzzle&&!d.urajiro){g.fillStyle=d.muzzle;g.beginPath();g.ellipse(128,206,46,34,0,0,TAU);g.fill()}
    [86,170].forEach(x=>{g.fillStyle="#1e1418";g.beginPath();g.ellipse(x,150,15,20,0,0,TAU);g.fill();g.fillStyle="#fff";g.beginPath();g.arc(x-5,142,6,0,TAU);g.fill();g.beginPath();g.arc(x+5,157,2.6,0,TAU);g.fill();
      g.fillStyle="rgba(255,130,150,.45)";g.beginPath();g.ellipse(x+(x<128?-14:14),186,20,9,0,0,TAU);g.fill()});
    g.strokeStyle="#4a2a2a";g.lineWidth=4;g.lineCap="round";g.beginPath();g.moveTo(114,200);g.quadraticCurveTo(121,210,128,201);g.quadraticCurveTo(135,210,142,200);g.stroke()});
  AFACE.set(k,t);return t}
function zodiac3(i,stage=0){
  const d=ZD[i],g=new THREE.Group(),b=new THREE.Group();g.add(b);const C=d.c;
  if(d.snake){[[.36,.15,0],[.28,.13,.26],[.2,.11,.46]].forEach(([R,T,y])=>{const t=outline(new THREE.Mesh(new THREE.TorusGeometry(R,T,10,24),M(C)),1.05);t.rotation.x=Math.PI/2;t.position.y=y+.12;b.add(t)})}
  else{const bd=outline(sph(.34,C,0,.44,0,18,14));bd.scale.set(1,.92,.95);b.add(bd);const bl=sph(.22,d.belly,0,.42,.2,14,10);bl.scale.set(1,1.05,.5);b.add(bl);
    [-1,1].forEach(s=>{b.add(outline(sph(.1,d.feet||C,s*.15,.08,.1,10,8)));b.add(outline(sph(.09,C,s*.3,.48,.08,10,8)))})}
  const head=new THREE.Group();head.position.y=d.snake?.98:1.02;b.add(head);
  const hs=outline(sph(.42,d.face||C,0,0,0,24,18),1.035);hs.scale.set(1.06,.95,.95);head.add(hs);
  const face=new THREE.Mesh(new THREE.SphereGeometry(.426,28,14,FU0,FUL,FV0,FVL),new THREE.MeshBasicMaterial({map:animalFace(d),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));face.scale.copy(hs.scale);face.renderOrder=2;head.add(face);
  const E=(x,y,z,s,c,rx=0,rz=0)=>{const e=outline(sph(.1,c,x,y,z,12,8),1.08);e.scale.set(...s);e.rotation.set(rx,0,rz);head.add(e);return e};
  if(d.ear==="round")[-1,1].forEach(s=>{E(s*.3,.32,-.02,[2,2,.7],C);const n=sph(.13,"#ffb3c7",s*.3,.32,.03,10,8);n.scale.set(1,1,.3);head.add(n)});
  if(d.ear==="small")[-1,1].forEach(s=>E(s*.44,.12,0,[1.3,.8,.8],C,0,s*.5));
  if(d.ear==="cat")[-1,1].forEach(s=>{const e=outline(new THREE.Mesh(new THREE.ConeGeometry(.13,.28,4),M(C)),1.08);e.position.set(s*.24,.4,0);e.rotation.z=-s*.35;head.add(e);const n=new THREE.Mesh(new THREE.ConeGeometry(.07,.16,4),M(d.urajiro||"#ffd0dc"));n.position.set(s*.235,.38,.06);n.rotation.z=-s*.35;head.add(n)});
  if(d.ear==="monkey")[-1,1].forEach(s=>{E(s*.45,.02,0,[1.5,1.5,.6],C);const n=sph(.1,d.plate,s*.47,.02,.04,8,6);n.scale.set(1,1,.3);head.add(n)});
  if(d.ear==="pig")[-1,1].forEach(s=>{const e=outline(new THREE.Mesh(new THREE.ConeGeometry(.12,.22,4),M(C)),1.08);e.position.set(s*.26,.38,.06);e.rotation.set(.5,0,-s*.4);head.add(e)});
  if(d.horn)[-1,1].forEach(s=>{const h=outline(new THREE.Mesh(new THREE.ConeGeometry(.07,.3,10),M(d.horn)),1.08);h.position.set(s*.4,.28,0);h.rotation.z=-s*1.05;head.add(h)});
  if(d.dhorn)[-1,1].forEach(s=>{const h=outline(new THREE.Mesh(new THREE.ConeGeometry(.06,.32,8),M(d.dhorn)),1.08);h.position.set(s*.17,.46,-.08);h.rotation.set(-.4,0,-s*.25);head.add(h)});
  if(d.spikes){for(let k=0;k<4;k++){const sp=new THREE.Mesh(new THREE.ConeGeometry(.07,.18,6),M(d.spikes));sp.position.set(0,.36-k*.12,-.3-k*.06);sp.rotation.x=-.9-k*.2;head.add(sp)}for(let k=0;k<3;k++){const sp=new THREE.Mesh(new THREE.ConeGeometry(.08,.2,6),M(d.spikes));sp.position.set(0,.66-k*.18,-.3+k*.02);sp.rotation.x=-.6;b.add(sp)}}
  if(d.stripes)[[-.12,.3,.3,.35],[0,.36,.3,0],[.12,.3,.3,-.35]].forEach(([x,y,z,r])=>{const st=box(.05,.14,.03,d.stripes,x,y,z);st.rotation.z=r;st.rotation.x=-.5;head.add(st)});
  if(d.mane)for(let k=0;k<5;k++)head.add(sph(.09,d.mane,0,.4-k*.1,-.08-k*.08,8,6));
  if(d.wool){[[0,.36,0],[-.2,.3,.05],[.2,.3,.05],[-.32,.12,0],[.32,.12,0]].forEach(([x,y,z])=>head.add(outline(sph(.15,d.wool,x,y,z,10,8),1.06)));
    [-1,1].forEach(s=>{const t=outline(new THREE.Mesh(new THREE.TorusGeometry(.1,.04,8,16,Math.PI*1.5),M(d.shorn)),1.1);t.position.set(s*.4,.1,-.02);t.rotation.y=Math.PI/2;head.add(t)});
    [[0,.7,-.05],[-.2,.55,.12],[.2,.55,.12],[-.24,.35,-.1],[.24,.35,-.1]].forEach(([x,y,z])=>b.add(outline(sph(.16,d.wool,x,y,z,10,8),1.06)))}
  if(d.comb){[[-.08,.42],[0,.48],[.09,.42]].forEach(([x,y])=>head.add(outline(sph(.08,d.comb,x,y,0,8,6),1.08)));
    const bk=outline(new THREE.Mesh(new THREE.ConeGeometry(.07,.16,8),M(d.beak)),1.08);bk.rotation.x=Math.PI/2;bk.position.set(0,-.06,.44);head.add(bk);head.add(sph(.06,d.comb,0,-.17,.38,8,6));
    [-1,1].forEach(s=>{const w=outline(sph(.16,C,s*.33,.45,-.02,10,8));w.scale.set(.5,1,1.2);b.add(w)});for(let k=0;k<3;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(.07,.36,6),M(k===1?"#e5484d":"#3d6fd6"));f.position.set((k-1)*.1,.62,-.32);f.rotation.x=-.8;b.add(f)}}
  if(d.snout){const sn=outline(cyl(.13,.13,.1,d.snout,0,-.1,.42,16),1.06);sn.rotation.x=Math.PI/2;head.add(sn);[-1,1].forEach(s=>head.add(sph(.025,"#b4566f",s*.045,-.1,.48,6,4)))}
  // đuôi
  const tail=(pts,c,r=.045)=>{const cv=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));const t=outline(new THREE.Mesh(new THREE.TubeGeometry(cv,20,r,8),M(c)),1.08);b.add(t)};
  if(i===0)tail([[0,.3,-.3],[0,.25,-.55],[.15,.4,-.7],[.05,.55,-.65]],"#ffb3c7",.03);
  if(i===2)tail([[0,.35,-.3],[.1,.5,-.55],[.05,.75,-.6]],C,.06);
  if(i===3)tail([[0,.3,-.3],[.15,.5,-.5],[.1,.8,-.5],[0,.9,-.4]],C,.06);
  if(i===4)tail([[0,.3,-.3],[.2,.25,-.6],[.35,.4,-.8]],C,.09);
  if(i===6)tail([[0,.45,-.32],[0,.35,-.5],[0,.15,-.55]],d.mane,.08);
  if(i===8)tail([[0,.35,-.3],[.1,.3,-.6],[.25,.55,-.65],[.15,.7,-.55]],C,.045);
  if(d.curl)tail([[0,.5,-.3],[.08,.62,-.42],[-.04,.72,-.4],[.04,.66,-.32]],C,.06);
  // trang phục theo giai đoạn lớn (chỉ con giáp của tháng)
  if(stage>=1&&stage<3&&!d.snake){const bib=outline(sph(.2,"#e5484d",0,.66,.2,12,8));bib.scale.set(1.1,.55,.5);b.add(bib)}
  if(stage>=3&&!d.snake){const hp=outline(new THREE.Mesh(new THREE.SphereGeometry(.355,18,12,0,TAU,0,Math.PI*.62),M("#2f4b8a")),1.03);hp.position.y=.44;hp.scale.set(1,.92,.95);b.add(hp);
    [-1,1].forEach(s=>{const c=box(.05,.3,.03,"#ffffff",s*.07,.58,.33);c.rotation.z=s*.4;b.add(c)})}
  if(stage===2||stage===3){const hb=outline(new THREE.Mesh(new THREE.TorusGeometry(.42,.05,8,28),M("#ffffff")),1.1);hb.rotation.x=Math.PI/2-.15;hb.position.y=.17;head.add(hb);head.add(sph(.05,"#e5484d",0,.2,.43,8,6))}
  if(stage>=4){const k=outline(new THREE.Mesh(new THREE.SphereGeometry(.46,20,12,0,TAU,0,Math.PI*.42),M("#2b3a67")),1.04);k.position.y=.05;head.add(k);
    const br=outline(new THREE.Mesh(new THREE.TorusGeometry(.45,.05,6,28),M("#3d4f86")),1.06);br.rotation.x=Math.PI/2;br.position.y=.12;head.add(br);
    [-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.ConeGeometry(.04,.36,6),M("#f2bf3a"));h.position.set(s*.13,.55,.18);h.rotation.z=-s*.5;head.add(h)});head.add(sph(.06,"#f2bf3a",0,.38,.32,8,6))}
  if(stage>=5){const halo=new THREE.Mesh(new THREE.TorusGeometry(.75,.035,8,40),new THREE.MeshBasicMaterial({color:0xf0c75e}));halo.position.set(0,.95,-.35);g.add(halo)}
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.42,18),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.16,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.02;g.add(sh);
  g.userData={body:b,head,t:Math.random()*10,i};return bakeRig(g)}
function animZ(z,dt,mode,moving){const u=z.userData;u.t+=dt;const t=u.t;
  if(mode==="fly"){u.body.position.y=Math.sin(t*1.6)*.15;u.body.rotation.z=Math.sin(t)*.08;return}
  if(mode==="sleep"){u.body.scale.y=1+Math.sin(t*1.6)*.02;u.head.rotation.z=.25;return}
  if(moving){u.body.position.y=Math.abs(Math.sin(t*10))*.12;return}
  if(mode==="graze"){u.head.rotation.x=Math.max(0,Math.sin(t*.7))*.35;return}
  if(mode==="peck"){u.head.rotation.x=Math.max(0,Math.sin(t*2.2))**6*.5;return}
  u.body.position.y=Math.abs(Math.sin(t*1.4))*.03;u.head.rotation.z=Math.sin(t*.9)*.08}

/* =====================================================================
   LÀM ĐẦY KHU PHỐ BÀI 1
   ===================================================================== */
function shop3(o){const g=new THREE.Group(),w=o.w||7,d=o.d||5,h=o.h||4;g.add(outline(box(w,h,d,o.wall,0,h/2,0),1.01));
  g.add(box(w*.82,h*.42,.06,"#a9d2ee",0,h*.3,d/2+.02));g.add(box(w+.3,.3,d+.3,o.trim||"#3a3f5c",0,h+.15,0));
  const aw=outline(box(w*.9,.12,1.2,o.awn,0,h*.62,d/2+.55),1.02);aw.rotation.x=.25;g.add(aw);
  if(o.noren){const t=canvasTex(256,96,(c,W,H)=>{c.fillStyle=o.noren;c.fillRect(0,0,W,H);c.strokeStyle="rgba(0,0,0,.25)";c.lineWidth=4;for(let i=1;i<4;i++){c.beginPath();c.moveTo(i*W/4,H*.25);c.lineTo(i*W/4,H);c.stroke()}c.fillStyle="#fff";c.font=`700 ${H*.5}px ${JPF}`;c.textAlign="center";c.textBaseline="middle";c.fillText(o.nt||"",W/2,H*.55)});
    const n=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.8),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));n.position.set(0,h*.4,d/2+.9);g.add(n)}
  if(o.sign){const s=sign(o.sign,o.sub||"",{w:Math.min(w*.8,5),h:1.1,border:o.awn});s.position.set(0,h*.82,d/2+.03);g.add(s)}
  if(o.lantern){const l=new THREE.Mesh(new THREE.SphereGeometry(.35,12,10),new THREE.MeshBasicMaterial({color:0xff5a4a}));l.scale.y=1.3;l.position.set(w/2-.6,h*.55,d/2+.4);g.add(l)}
  [-1,1].forEach(s=>{const pot=new THREE.Group();pot.add(cyl(.28,.22,.5,"#8a5a44",0,.25,0,10));pot.add(outline(sph(.38,"#4f9f60",0,.75,0,10,8)));pot.position.set(s*(w/2-.4),0,d/2+.6);g.add(pot)});return g}
function house3b(c,roof){const g=new THREE.Group();g.add(outline(box(6,3.2,5,c,0,1.6,0),1.01));g.add(outline(box(4.6,2.2,4,c,0,4.3,0),1.01));
  let r=roofQuad(4.4,1.2,roof);r.position.y=3.6;r.scale.z=.85;g.add(r);r=roofQuad(3.4,1.4,roof);r.position.y=6.1;r.scale.z=.9;g.add(r);
  [-1.6,1.6].forEach(x=>g.add(box(1,.9,.05,"#ffe6a8",x,1.9,2.53)));g.add(box(1.1,1.8,.05,"#6b4433",0,.9,2.53));return g}
function trafficLight(){const g=new THREE.Group();g.add(cyl(.08,.1,4.2,"#5a5f6b",0,2.1,0,8));g.add(box(.9,.1,.1,"#5a5f6b",.4,4,0));const hd=outline(box(1.2,.42,.35,"#3a3f4a",.9,4.05,0),1.02);g.add(hd);
  const L=["#3fd47a","#ffcf4a","#ff5a4a"].map((c,i)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.13,12),new THREE.MeshBasicMaterial({color:0x222222}));m.position.set(.55+i*.35,4.05,.18);g.add(m);return [m,new THREE.Color(c)]});g.userData.L=L;return g}
function postbox(){const g=new THREE.Group();g.add(outline(cyl(.32,.32,1.1,"#d8302a",0,.75,0,16)));g.add(outline(sph(.32,"#d8302a",0,1.3,0,16,8)));g.add(box(.36,.06,.05,"#2b2540",0,1.05,.32));g.add(cyl(.12,.14,.3,"#3a3f4a",0,.15,0,8));return g}
function busStop(){const g=new THREE.Group();g.add(cyl(.05,.05,2.4,"#5a5f6b",0,1.2,0,8));const s=new THREE.Mesh(new THREE.CircleGeometry(.4,20),new THREE.MeshBasicMaterial({map:canvasTex(128,128,(c)=>{c.fillStyle="#3d6fd6";c.beginPath();c.arc(64,64,62,0,TAU);c.fill();c.fillStyle="#fff";c.font=`800 46px ${JPF}`;c.textAlign="center";c.textBaseline="middle";c.fillText("バス",64,66)})}));s.position.set(0,2.5,.06);g.add(s);
  const b=bench3();b.position.set(1.6,0,-.2);b.scale.setScalar(.8);g.add(b);g.add(outline(box(3.4,.1,1.2,"#9fb6c9",1.6,2.3,-.3)));return g}
function bicycle(c){const g=new THREE.Group();[-.45,.45].forEach(z=>{const w=new THREE.Mesh(new THREE.TorusGeometry(.32,.04,6,16),M("#2b2540"));w.position.set(0,.34,z);w.rotation.y=Math.PI/2;g.add(w)});
  const f=box(.05,.05,.9,c,0,.55,0);g.add(f);const f2=box(.05,.45,.05,c,0,.55,-.15);f2.rotation.x=.3;g.add(f2);g.add(box(.5,.04,.04,"#2b2540",0,.85,.4));g.add(box(.18,.06,.26,"#2b2540",0,.8,-.2));return g}
function car3(c){const g=new THREE.Group();g.add(outline(box(1.6,.55,3.2,c,0,.55,0),1.02));g.add(outline(box(1.4,.5,1.7,c,0,1.05,-.2),1.02));
  g.add(box(1.42,.36,1.5,"#bfe0f5",0,1.07,-.2));[-.65,.65].forEach(x=>[-1,1].forEach(z=>{const w=cyl(.27,.27,.22,"#2b2540",x*1.12,.27,z*1.05,12);w.rotation.z=Math.PI/2;g.add(w)}));
  [-.5,.5].forEach(x=>{const l=new THREE.Mesh(new THREE.CircleGeometry(.1,10),new THREE.MeshBasicMaterial({color:0xfff4c0}));l.position.set(x,.62,1.61);g.add(l)});return g}
function enrichCity(scene,solids,ticks,rng,noOuter){
  const add=(o,x,z,r=0)=>{o.position.set(x,0,z);o.rotation.y=r;scene.add(o);return o};
  const sol=(x,z,w,d)=>solids.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
  add(shop3({wall:"#f3e3cc",awn:"#c23b2a",noren:"#2b3a67",nt:"ラーメン",sign:"らーめん",sub:"Quán mì ramen",lantern:1}),-31,-10.6);sol(-31,-10.6,7,5);
  add(shop3({wall:"#ffffff",awn:"#2f9e64",trim:"#3d6fd6",sign:"コンビニ",sub:"Cửa hàng tiện lợi",w:8}),32.6,-10.6);sol(32.6,-10.6,8,5);
  add(shop3({wall:"#efe2c9",awn:"#6b8f4e",noren:"#6b8f4e",nt:"お茶",sign:"茶屋",sub:"Quán trà",lantern:1}),-31,10.6,Math.PI);sol(-31,10.6,7,5);
  add(shop3({wall:"#fbe8ef",awn:"#e85d8c",sign:"花屋",sub:"Tiệm hoa",w:6}),31,-26,Math.PI/2*0);sol(31,-26,6,5);
  [[-31,-30,"#f6efe4","#5d6f86",0],[-20,-34,"#efe6da","#8a4a3a",0],[8,-34,"#f3ebe0","#3a3f5c",0],[33,30,"#f6efe4","#5d6f86",Math.PI],[10,34,"#efe6da","#8a4a3a",Math.PI],[-32,30,"#f3ebe0","#3a3f5c",Math.PI],[-20,34,"#f6efe4","#6b5a8f",Math.PI],[33,14,"#efe6da","#8a4a3a",Math.PI]].forEach(([x,z,c,r,ry])=>{add(house3b(c,r),x,z,ry);sol(x,z,6,5)});
  /* cao ốc xa */
  for(let k=0;k<(noOuter?0:26);k++){const a=k/26*TAU,r=60+rng()*14,h=10+rng()*22,w=5+rng()*5;const b=box(w,h,w,["#9fb0c8","#b3bfd1","#a8b4c4","#c3cad6"][k%4],Math.cos(a)*r,h/2,Math.sin(a)*r);b.castShadow=false;scene.add(b);
    for(let y=2;y<h-1;y+=2.2){const s=box(w+.05,.3,w+.05,"#e3e9f2",Math.cos(a)*r,y,Math.sin(a)*r);s.castShadow=false;scene.add(s)}}
  /* đèn giao thông */
  const TL=[];[[5.6,5.6,0],[-5.6,-5.6,Math.PI],[5.6,-5.6,Math.PI/2],[-5.6,5.6,-Math.PI/2]].forEach(([x,z,r])=>{const t=add(trafficLight(),x,z,r);TL.push(t);sol(x,z,.3,.3)});
  ticks.push(()=>{const ph=Math.floor(performance.now()/3000)%3;TL.forEach((t,k)=>t.userData.L.forEach(([m,c],i)=>m.material.color.set(i===(ph+k%2)%3?c:0x222222)))});
  add(postbox(),-6.6,6.8);sol(-6.6,6.8,.7,.7);
  add(busStop(),11,6.6,Math.PI);sol(12,6.6,3.6,1.4);
  [0,1,2].forEach(k=>{add(bicycle(["#3d6fd6","#e5484d","#2f9e64"][k]),27+k*.9,-7.6,Math.PI/2)});sol(28,-7.6,3,1);
  /* dây điện nối cột */
  [[-34,-24,-14],[14,24,34]].forEach(xs=>{for(let k=0;k<xs.length-1;k++)[5.8,5.3].forEach((y,j)=>{const a=new THREE.Vector3(xs[k]+(j?.4:-.6),y,-6.2),b=new THREE.Vector3(xs[k+1]+(j?.4:-.6),y,-6.2),mid=a.clone().lerp(b,.5);mid.y-=.6;
    const c=new THREE.QuadraticBezierCurve3(a,mid,b);scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(16)),new THREE.LineBasicMaterial({color:0x2b2540})))})});
  /* nắp cống, cây ven đường */
  [[-14,1.8],[16,-1.6],[1.6,-16],[-1.8,22]].forEach(([x,z])=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.5,16),M("#6b6e78"));m.rotation.x=-Math.PI/2;m.position.set(x,.04,z);scene.add(m)});
  [[-26,5.7],[-12,-5.7],[20,5.7],[5.7,26],[-5.7,30],[5.7,-20]].forEach(([x,z])=>{add(sakura(0,0,.8),x,z);sol(x,z,.6,.6)});
  /* mây, chim */
  const cl=[];for(let k=0;k<6;k++){const c=kasumi3();c.position.set((rng()-.5)*120,30+rng()*10,-40-rng()*50);c.scale.setScalar(1.2+rng()*.8);scene.add(c);cl.push(c)}
  const bd=[];for(let k=0;k<5;k++){const b=bird3();scene.add(b);bd.push(b)}
  ticks.push(dt=>{cl.forEach((c,i)=>{c.position.x+=dt*(.6+i*.1);if(c.position.x>70)c.position.x=-70});const t=performance.now()/1000;bd.forEach((b,i)=>{const a=t*.25+i*1.3;b.position.set(Math.cos(a)*(18+i*2),18+i,Math.sin(a)*(14+i));b.rotation.y=-a;b.children.forEach((w,j)=>w.rotation.z=(j?1:-1)*(.35+Math.sin(t*9+i)*.4))})});
  return {TL};
}
function cityTraffic(scene,ticks,getPlayer,opt={}){
  const cars=opt.cars===false?[]:[["#e5484d",1,-2],["#3d6fd6",-1,2],["#f2bf3a",1,-2],["#f7f4ee",-1,2]].map(([c,dir,lane],k)=>{const g=car3(c);g.position.set(-40+k*22,0,lane);g.rotation.y=dir>0?Math.PI/2:-Math.PI/2;scene.add(g);return {g,dir,axis:"x"}});
  if(opt.cars!==false&&!opt.noZ)[["#2f9e64",1,2],["#8f6fd6",-1,-2]].forEach(([c,dir,lane],k)=>{const g=car3(c);g.position.set(lane,0,-30+k*35);g.rotation.y=dir>0?0:Math.PI;scene.add(g);cars.push({g,dir,axis:"z"})});
  const looks=[["#ffe0c7","#5a3a2a","short","#7aa7d8","#3a3f52"],["#f6d2b3","#2b2321","long","#e9a1b9","#4a5a7a"],["#ffe3cc","#6d6a70","short","#8a6a4e","#2a2d3a"],["#f3cfae","#1f1b24","bun","#9cc9b4","#4a4a5a"],["#ffe6d2","#3a2a20","spiky","#ffcf4a","#3d6fd6"],["#f7d6b8","#2b2321","cap","#e5484d","#2a2d3a"]];
  const peds=[[-34,-8,-7.4,"x"],[8,34,-7.6,"x"],[-34,-8,7.4,"x"],[8,34,7.4,"x"],[8,34,7.4,"z"],[-34,-8,-7.4,"z"]].map(r=>opt.lane?[r[0],r[1],Math.sign(r[2])*opt.lane,r[3]]:r).map(r=>{if(!opt.ok)return r;let [a,b,c,ax]=r;const P=t=>ax==="x"?[t,c]:[c,t];const okAt=t=>opt.ok(...P(t));
    for(let k=0;k<40&&!okAt(a);k++)a+=.65;for(let k=0;k<40&&!okAt(b);k++)b-=.65;if(b-a<4)return null;for(let t=a;t<=b;t+=.5)if(!okAt(t)){if(t-a>=4){b=t-.6;break}a=t+.6}return b-a>=4?[a,b,c,ax]:null}).filter(Boolean).map(([a,b,c,ax],k)=>{const L=looks[k];const p=makeChar({skin:L[0],hair:L[1],style:L[2],top:L[3],bottom:L[4],fem:L[2]==="long"||L[2]==="bun"?1:0});
    p.scale.setScalar(1.15);const t=Math.random();if(ax==="x")p.position.set(a+(b-a)*t,0,c);else p.position.set(c,0,a+(b-a)*t);scene.add(p);return {p,a,b,c,ax,dir:k%2?1:-1}});
  ticks.push(dt=>{const pl=getPlayer().position;
    cars.forEach(o=>{const g=o.g,ax=o.axis,sp=7*dt*o.dir;const ahead=ax==="x"?{x:g.position.x+o.dir*3.2,z:g.position.z}:{x:g.position.x,z:g.position.z+o.dir*3.2};
      if(Math.hypot(pl.x-ahead.x,pl.z-ahead.z)<2.6)return;g.position[ax]+=sp;const LM=opt.lim||48;if(g.position[ax]>LM)g.position[ax]=-LM;if(g.position[ax]<-LM)g.position[ax]=LM});
    peds.forEach(o=>{const k=o.ax;const v=o.p.position[k]+o.dir*dt*1.6;if(v>o.b||v<o.a)o.dir*=-1;o.p.position[k]=Math.min(o.b,Math.max(o.a,v));o.p.rotation.y=k==="x"?(o.dir>0?Math.PI/2:-Math.PI/2):(o.dir>0?0:Math.PI);animChar(o.p,dt,true)})});
}

/* =====================================================================
   KHU PHỐ TỰ DỰNG CHO BÀI 2–25 (từ dữ liệu bài học)
   ===================================================================== */
const P3={
 book:c=>{const g=new THREE.Group();g.add(outline(box(.7,.18,.95,c||"#3d6fd6",0,.09,0)));g.add(box(.64,.14,.9,"#fffaf0",.02,.09,0));return g},
 mag:()=>{const g=new THREE.Group();g.add(outline(box(.7,.05,.95,"#e5484d",0,.03,0)));g.add(box(.5,.01,.3,"#ffcf4a",0,.06,.2));return g},
 news:()=>{const g=new THREE.Group();const p=outline(box(.75,.04,1,"#f2efe6",0,.03,0));g.add(p);for(let i=0;i<4;i++)g.add(box(.6,.005,.04,"#5a5a5a",0,.055,-.35+i*.2));return g},
 pen:c=>{const g=new THREE.Group();const b=outline(cyl(.04,.04,.9,c||"#ffcf4a",0,.06,0,8));b.rotation.z=Math.PI/2;g.add(b);const t=new THREE.Mesh(new THREE.ConeGeometry(.04,.15,8),M("#f3d6a8"));t.rotation.z=-Math.PI/2;t.position.set(.52,.06,0);g.add(t);return g},
 key:()=>{const g=new THREE.Group();const r=new THREE.Mesh(new THREE.TorusGeometry(.14,.04,8,16),M("#e0b23a"));r.rotation.x=Math.PI/2;r.position.set(-.25,.05,0);g.add(r);g.add(box(.45,.05,.07,"#e0b23a",.08,.05,0));g.add(box(.06,.05,.14,"#e0b23a",.25,.05,.06));return g},
 clock:()=>{const g=new THREE.Group();const f=outline(cyl(.38,.38,.12,"#e5484d",0,.45,0,24));f.rotation.x=Math.PI/2;g.add(f);const d=new THREE.Mesh(new THREE.CircleGeometry(.31,24),M("#fffaf0"));d.position.set(0,.45,.065);g.add(d);g.add(box(.03,.22,.01,"#2b2540",0,.53,.07));g.add(box(.16,.03,.01,"#2b2540",.07,.45,.07));[-.2,.2].forEach(x=>g.add(cyl(.05,.07,.1,"#e5484d",x,.06,0,8)));return g},
 umbrella:()=>{const g=wagasa3();g.scale.setScalar(.45);g.rotation.z=.15;return g},
 bag:c=>{const g=new THREE.Group();g.add(outline(box(.8,.55,.32,c||"#8a5a44",0,.3,0)));const h=new THREE.Mesh(new THREE.TorusGeometry(.2,.035,6,16,Math.PI),M("#5a3a2a"));h.position.y=.57;g.add(h);return g},
 tv:()=>{const g=new THREE.Group();g.add(outline(box(1.1,.7,.12,"#2b2540",0,.5,0)));g.add(box(.98,.58,.02,"#6cb8f0",0,.5,.065));g.add(box(.3,.15,.25,"#2b2540",0,.08,0));return g},
 radio:()=>{const g=new THREE.Group();g.add(outline(box(.8,.45,.25,"#c9a27a",0,.23,0)));const s=new THREE.Mesh(new THREE.CircleGeometry(.14,16),M("#5a4a3a"));s.position.set(-.18,.23,.13);g.add(s);g.add(box(.25,.1,.02,"#2b2540",.17,.28,.13));g.add(cyl(.01,.01,.6,"#9a9a9a",.3,.6,0,4));return g},
 camera:()=>{const g=new THREE.Group();g.add(outline(box(.7,.42,.3,"#2b2540",0,.21,0)));const l=outline(cyl(.15,.15,.18,"#5a5f6b",0,.21,.22,16));l.rotation.x=Math.PI/2;g.add(l);g.add(box(.2,.1,.15,"#2b2540",-.18,.47,0));return g},
 pc:()=>{const g=new THREE.Group();g.add(outline(box(.95,.05,.65,"#b8bcc6",0,.03,0)));const s=outline(box(.95,.6,.04,"#b8bcc6",0,.33,-.31));s.rotation.x=-.2;g.add(s);const sc=box(.85,.5,.01,"#6cb8f0",0,.33,-.28);sc.rotation.x=-.2;g.add(sc);return g},
 phone:()=>{const g=new THREE.Group();g.add(outline(box(.36,.06,.7,"#2b2540",0,.04,0)));g.add(box(.3,.01,.6,"#8ec5ff",0,.075,0));return g},
 desk:()=>{const g=new THREE.Group();g.add(outline(box(1.4,.1,.8,"#a0693e",0,.72,0)));[[-.6,-.32],[.6,-.32],[-.6,.32],[.6,.32]].forEach(([x,z])=>g.add(box(.08,.7,.08,"#7a4a2a",x,.35,z)));return g},
 chair:()=>{const g=new THREE.Group();g.add(outline(box(.6,.08,.6,"#a0693e",0,.45,0)));g.add(outline(box(.6,.6,.08,"#a0693e",0,.75,-.26)));[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]].forEach(([x,z])=>g.add(box(.06,.45,.06,"#7a4a2a",x,.22,z)));return g},
 choco:()=>{const g=new THREE.Group();g.add(outline(box(.7,.1,.4,"#6b3a24",0,.06,0)));for(let i=0;i<3;i++)g.add(box(.2,.03,.36,"#7d4630",-.23+i*.23,.12,0));g.add(box(.3,.105,.42,"#e5484d",.2,.06,0));return g},
 cup:c=>{const g=new THREE.Group();g.add(outline(cyl(.2,.16,.36,"#fffaf0",0,.2,0,16)));const t=new THREE.Mesh(new THREE.CircleGeometry(.18,16),M(c||"#6b3a24"));t.rotation.x=-Math.PI/2;t.position.y=.37;g.add(t);const h=new THREE.Mesh(new THREE.TorusGeometry(.09,.03,6,12),M("#fffaf0"));h.position.set(.22,.2,0);g.add(h);g.add(cyl(.32,.32,.03,"#fffaf0",0,.02,0,16));return g},
 gift:c=>{const g=new THREE.Group();g.add(outline(box(.6,.5,.6,c||"#e85d8c",0,.25,0)));g.add(box(.62,.52,.1,"#ffcf4a",0,.25,0));g.add(box(.1,.52,.62,"#ffcf4a",0,.25,0));[-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.TorusGeometry(.1,.03,6,12),M("#ffcf4a"));b.position.set(s*.1,.55,0);b.rotation.y=Math.PI/2;g.add(b)});return g},
 shoes:()=>{const g=new THREE.Group();[-.18,.18].forEach(x=>{const s=outline(sph(.2,"#3d6fd6",x,.12,0,12,8));s.scale.set(.75,.55,1.4);g.add(s);g.add(box(.3,.04,.55,"#f6f4f0",x,.02,0))});return g},
 tie:()=>{const g=new THREE.Group();const t=outline(new THREE.Mesh(new THREE.ConeGeometry(.15,.9,4),M("#c23b2a")));t.position.y=.5;t.rotation.x=Math.PI;g.add(t);g.add(box(.16,.12,.08,"#c23b2a",0,.98,0));return g},
 bottle:c=>{const g=new THREE.Group();g.add(outline(cyl(.13,.13,.6,c||"#5a2a3a",0,.3,0,12)));g.add(outline(cyl(.05,.11,.25,c||"#5a2a3a",0,.72,0,10)));g.add(box(.27,.18,.02,"#fffaf0",0,.32,.13));return g},
 flower:()=>{const g=new THREE.Group();g.add(outline(cyl(.22,.16,.32,"#c97a4a",0,.16,0,12)));[[0,.65,0],[-.15,.55,.08],[.15,.55,-.05],[0,.5,.15]].forEach(([x,y,z],i)=>{g.add(cyl(.015,.015,y,"#3f8a52",x,y/2+.2,z,4));g.add(outline(sph(.1,["#ff7aa8","#ffcf4a","#ff9f68","#c9a8ff"][i],x,y+.22,z,8,6),1.08))});return g},
 photo:()=>{const g=new THREE.Group();const f=outline(box(.6,.45,.05,"#8a5a44",0,.3,0));f.rotation.x=-.25;g.add(f);const p=new THREE.Mesh(new THREE.PlaneGeometry(.5,.35),new THREE.MeshBasicMaterial({map:canvasTex(128,96,(c)=>{c.fillStyle="#9fd6f4";c.fillRect(0,0,128,96);c.fillStyle="#6f95cf";c.beginPath();c.moveTo(20,96);c.lineTo(64,30);c.lineTo(108,96);c.fill();c.fillStyle="#fff";c.beginPath();c.moveTo(52,48);c.lineTo(64,30);c.lineTo(76,48);c.fill()})}));p.position.set(0,.31,.035);p.rotation.x=-.25;g.add(p);return g},
 letter:()=>{const g=new THREE.Group();g.add(outline(box(.75,.03,.48,"#fffaf0",0,.03,0)));const t=box(.75,.01,.02,"#d9cbb5",0,.05,0);t.rotation.y=.55;g.add(t);const t2=box(.75,.01,.02,"#d9cbb5",0,.05,0);t2.rotation.y=-.55;g.add(t2);g.add(box(.14,.012,.16,"#e5484d",.25,.05,-.13));return g},
 boxp:()=>{const g=new THREE.Group();g.add(outline(box(.75,.55,.6,"#c9a27a",0,.28,0)));g.add(box(.77,.04,.12,"#a0804e",0,.56,0));return g},
 fridge:()=>{const g=new THREE.Group();g.add(outline(box(.7,1.4,.6,"#eef2f6",0,.7,0)));g.add(box(.72,.02,.62,"#c9cfd8",0,.95,0));g.add(box(.04,.3,.04,"#9aa3ae",.25,1.15,.32));return g},
 bed:()=>{const g=new THREE.Group();g.add(outline(box(1,.35,1.6,"#a0693e",0,.18,0)));g.add(box(.95,.12,1.5,"#f6f4f0",0,.41,0));g.add(box(.7,.1,.3,"#ffffff",0,.5,-.55));g.add(box(.97,.13,.9,"#8ec5ff",0,.43,.28));return g},
 fruit:c=>{const g=new THREE.Group();g.add(outline(cyl(.45,.3,.2,"#c9a27a",0,.1,0,14)));[[0,.3,0],[-.2,.28,.12],[.2,.28,.1],[.05,.28,-.2],[-.12,.45,-.05]].forEach(([x,y,z],i)=>g.add(outline(sph(.15,c||["#e5484d","#f5a043","#ffd43b"][i%3],x,y,z,10,8),1.06)));return g},
 bread:()=>{const g=new THREE.Group();const b=outline(sph(.3,"#d9963d",0,.18,0,14,10));b.scale.set(1.4,.6,.9);g.add(b);for(let i=0;i<3;i++){const c=box(.05,.02,.3,"#f3d6a8",-.2+i*.2,.33,0);c.rotation.y=.4;g.add(c)}return g},
 egg:()=>{const g=new THREE.Group();g.add(outline(cyl(.35,.25,.12,"#c9a27a",0,.06,0,12)));[[-.12,0],[.12,0],[0,.14],[0,-.14]].forEach(([x,z])=>{const e=outline(sph(.11,"#fff4e6",x,.2,z,10,8),1.08);e.scale.y=1.3;g.add(e)});return g},
 meat:()=>{const g=new THREE.Group();g.add(outline(cyl(.4,.4,.05,"#fffaf0",0,.03,0,16)));const m=outline(sph(.3,"#c8564a",0,.12,0,12,8));m.scale.set(1.2,.35,.9);g.add(m);const f=sph(.12,"#fff4e6",.25,.13,.05,8,6);f.scale.set(1,.4,.7);g.add(f);return g},
 fish:()=>{const g=new THREE.Group();const b=outline(sph(.25,"#7fa8d8",0,.16,0,14,10));b.scale.set(1.8,.7,.6);g.add(b);const t=new THREE.Mesh(new THREE.ConeGeometry(.16,.25,3),M("#6f95cf"));t.rotation.z=Math.PI/2;t.position.set(-.55,.16,0);g.add(t);g.add(sph(.04,"#2b2540",.3,.2,.12,6,4));return g},
 veg:()=>{const g=new THREE.Group();const cab=outline(sph(.25,"#7cc472",-.15,.24,0,12,10));g.add(cab);const car=outline(new THREE.Mesh(new THREE.ConeGeometry(.08,.5,8),M("#f08a3a")));car.rotation.z=Math.PI/2.3;car.position.set(.25,.12,.05);g.add(car);g.add(box(.08,.15,.08,"#3f9d62",.48,.22,.05));return g},
 rice:()=>{const g=new THREE.Group();g.add(outline(cyl(.28,.16,.25,"#c23b2a",0,.13,0,16)));const r=sph(.26,"#ffffff",0,.25,0,14,10);r.scale.y=.5;g.add(r);[-.05,.05].forEach(x=>{const c=box(.02,.02,.7,"#a0693e",x,.42,0);c.rotation.x=.4;g.add(c)});return g},
 milk:()=>{const g=new THREE.Group();g.add(outline(box(.3,.55,.3,"#ffffff",0,.28,0)));const r=roofQuad(.24,.18,"#ffffff");r.position.y=.64;g.add(r);g.add(box(.31,.18,.31,"#6cb8f0",0,.3,0));return g},
 cake:()=>{const g=new THREE.Group();g.add(outline(cyl(.32,.32,.3,"#fff4e6",0,.15,0,16)));g.add(cyl(.33,.33,.06,"#ffb3c7",0,.3,0,16));[0,1,2].forEach(i=>g.add(sph(.06,"#e5484d",Math.cos(i*2.1)*.18,.38,Math.sin(i*2.1)*.18,8,6)));return g},
 bento:()=>{const g=new THREE.Group();g.add(outline(box(.8,.18,.55,"#2b2540",0,.09,0)));g.add(box(.36,.06,.48,"#ffffff",-.18,.19,0));g.add(sph(.06,"#e5484d",-.18,.22,0,8,6));g.add(box(.36,.06,.22,"#f5a043",.2,.19,-.12));g.add(box(.36,.06,.22,"#7cc472",.2,.19,.12));return g},
 sushi:()=>{const g=new THREE.Group();g.add(outline(box(.9,.06,.4,"#a0693e",0,.03,0)));[-.3,0,.3].forEach((x,i)=>{g.add(box(.2,.1,.16,"#fffaf0",x,.11,0));g.add(box(.22,.04,.18,["#ff7a5a","#ffcf4a","#e5484d"][i],x,.18,0))});return g},
 icecream:()=>{const g=new THREE.Group();const c=outline(new THREE.Mesh(new THREE.ConeGeometry(.15,.45,12),M("#d9a560")));c.rotation.x=Math.PI;c.position.y=.25;g.add(c);g.add(outline(sph(.17,"#ffd6e2",0,.55,0,12,10)));return g},
 curry:()=>{const g=new THREE.Group();g.add(outline(cyl(.42,.36,.1,"#fffaf0",0,.05,0,16)));const r=sph(.2,"#ffffff",-.13,.12,0,10,8);r.scale.y=.5;g.add(r);const c=sph(.22,"#c8862a",.14,.1,0,10,8);c.scale.y=.35;g.add(c);return g},
 sandwich:()=>{const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.08,3),M("#f3d6a8"));t.position.y=.05;g.add(outline(t));const m=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.06,3),M("#7cc472"));m.position.y=.12;g.add(m);const b=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.08,3),M("#f3d6a8"));b.position.y=.19;g.add(outline(b));return g},
 train:()=>{const w=new THREE.Group(),g=new THREE.Group();w.add(g);g.position.y=-.22;[-2,2].forEach(z=>[-.8,.8].forEach(x=>{const wh=cyl(.3,.3,.15,"#2b2b33",x,.3,z,12);wh.rotation.z=Math.PI/2;w.add(wh)}));g.add(outline(box(1.8,1.6,6,"#e8eef6",0,1.1,0),1.01));g.add(box(1.82,.25,6.02,"#3d6fd6",0,.75,0));for(let i=0;i<4;i++)[-1,1].forEach(s=>g.add(box(.02,.5,.9,"#8ec5ff",s*.91,1.4,-2.2+i*1.45)));g.add(box(1.5,.6,.02,"#8ec5ff",0,1.45,3.01));return w},
 bus:()=>{const g=new THREE.Group();g.add(outline(box(2,1.8,5,"#2f9e64",0,1.2,0),1.01));g.add(box(2.02,.6,5.02,"#f6f4f0",0,1.55,0));for(let i=0;i<4;i++)[-1,1].forEach(s=>g.add(box(.02,.45,.8,"#8ec5ff",s*1.01,1.6,-1.8+i*1.15)));[-1,1].forEach(s=>[-1.6,1.6].forEach(z=>{const w=cyl(.35,.35,.25,"#2b2540",s*1,.35,z,12);w.rotation.z=Math.PI/2;g.add(w)}));return g},
 taxi:()=>{const g=car3("#ffcf4a");g.add(box(.5,.22,.3,"#2b2540",0,1.42,-.2));return g},
 plane:()=>{const g=new THREE.Group();const b=outline(cyl(.45,.45,5,"#f6f4f0",0,1.4,0,16));b.rotation.x=Math.PI/2;g.add(b);const n=new THREE.Mesh(new THREE.SphereGeometry(.45,14,10),M("#f6f4f0"));n.position.set(0,1.4,2.5);n.scale.z=1.5;g.add(n);
   g.add(outline(box(5.5,.12,1.2,"#c9d4e3",0,1.25,.2)));g.add(outline(box(.12,1.2,.9,"#3d6fd6",0,2.1,-2.2)));g.add(box(2,.1,.6,"#c9d4e3",0,1.5,-2.2));[-.8,.8].forEach(x=>g.add(cyl(.06,.06,1,"#5a5f6b",x,.5,.5,6)));return g},
 ship:()=>{const g=boat3();g.scale.setScalar(1.6);g.add(cyl(.05,.05,2,"#6b4433",0,1.2,0,6));const s=new THREE.Mesh(new THREE.PlaneGeometry(.9,1.2),M("#fff8e8",{side:THREE.DoubleSide}));s.position.set(.45,1.4,0);g.add(s);return g},
 bike:()=>{const g=bicycle("#3d6fd6");g.scale.setScalar(1.3);return g},
 car:c=>car3(c||"#e5484d"),
 dog:()=>{const z=zodiac3(10);z.scale.setScalar(.8);return z},cat:()=>{const z=zodiac3(3);z.scale.setScalar(.8);return z},
 tree:()=>tree3("green",.9),
 card:()=>{const g=new THREE.Group();g.add(outline(box(.6,.02,.38,"#fffaf0",0,.02,0)));g.add(box(.4,.01,.05,"#3d6fd6",0,.035,-.08));g.add(box(.25,.01,.04,"#9a9a9a",0,.035,.06));return g},
 stamp:()=>{const g=new THREE.Group();g.add(outline(box(.35,.02,.42,"#fffaf0",0,.02,0)));g.add(box(.27,.01,.33,"#e5484d",0,.035,0));return g},
 water:()=>P3.bottle("#8ec5ff"),
};
const PK={ほん:["book"],きょうかしょ:["book","#2f9e64"],じしょ:["book","#c23b2a"],ざっし:["mag"],しんぶん:["news"],ノート:["book","#f2bf3a"],てちょう:["book","#8a5a44"],めいし:["card"],カード:["card"],えんぴつ:["pen"],ボールペン:["pen","#3d6fd6"],シャープペンシル:["pen","#8f6fd6"],かぎ:["key"],とけい:["clock"],かさ:["umbrella"],かばん:["bag"],
 テレビ:["tv"],ラジオ:["radio"],カメラ:["camera"],コンピューター:["pc"],パソコン:["pc"],ノートパソコン:["pc"],でんわ:["phone"],けいたいでんわ:["phone"],スマートフォン:["phone"],スマホ:["phone"],つくえ:["desk"],いす:["chair"],チョコレート:["choco"],コーヒー:["cup","#6b3a24"],おちゃ:["cup","#7cc472"],こうちゃ:["cup","#c8642a"],
 おみやげ:["gift"],プレゼント:["gift","#3d6fd6"],くつ:["shoes"],ネクタイ:["tie"],ワイン:["bottle","#7a1f3a"],ビール:["bottle","#c8862a"],おさけ:["bottle","#f6f4f0"],ジュース:["bottle","#f5a043"],みず:["water"],ぎゅうにゅう:["milk"],ミルク:["milk"],はな:["flower"],しゃしん:["photo"],てがみ:["letter"],はがき:["letter"],きって:["stamp"],はこ:["boxp"],にもつ:["boxp"],
 れいぞうこ:["fridge"],ベッド:["bed"],くだもの:["fruit"],りんご:["fruit","#e5484d"],みかん:["fruit","#f5a043"],バナナ:["fruit","#ffd43b"],パン:["bread"],たまご:["egg"],にく:["meat"],さかな:["fish"],やさい:["veg"],ごはん:["rice"],あさごはん:["rice"],ひるごはん:["bento"],ばんごはん:["rice"],べんとう:["bento"],ケーキ:["cake"],かし:["choco"],おかし:["choco"],
 すし:["sushi"],さしみ:["sushi"],アイスクリーム:["icecream"],カレー:["curry"],サンドイッチ:["sandwich"],ぎゅうどん:["rice"],りょうり:["curry"],のみもの:["cup","#6cb8f0"],
 でんしゃ:["train"],ちかてつ:["train"],しんかんせん:["train"],バス:["bus"],タクシー:["taxi"],ひこうき:["plane"],ふね:["ship"],じてんしゃ:["bike"],くるま:["car"],じどうしゃ:["car","#3d6fd6"],いぬ:["dog"],ねこ:["cat"],き:["tree"]};
const VEH=new Set(["train","bus","taxi","plane","ship","bike","car"]);
const PLACE={えき:"station",ぎんこう:"bank",びょういん:"hospital",ゆうびんきょく:"post",としょかん:"library",ほんや:"library",びじゅつかん:"museum",デパート:"store",スーパー:"store",コンビニ:"store",がっこう:"school",だいがく:"school",こうこう:"school",
 こうえん:"park",レストラン:"food",きっさてん:"food",しょくどう:"food",みせ:"food",ホテル:"hotel",かいしゃ:"office",じむしょ:"office",ビル:"office",しやくしょ:"office",くうこう:"airport",じんじゃ:"shrine",おてら:"temple",プール:"pool",とこや:"food",うち:"home",いえ:"home",りょう:"home",まち:"park",にわ:"park",こうさてん:"park",ちゅうしゃじょう:"park",たてもの:"office",いなか:"park",きょうしつ:"school",かいぎしつ:"office",うけつけ:"office",へや:"home",わしつ:"home"};
const cleanW=t=>(t||"").replace(/^\[(.+?)\]/,"$1").replace(/\s*\[.*?\]\s*/g,"").replace(/\s*[（(].*?[)）]\s*/g,"").split(/\s*[\/／,，]\s*/)[0].trim();
const kanaKey=r=>cleanW(r).replace(/\s/g,"").replace(/^お(?=[^ちかしみ])/,"");
function placeBuilding(style,label,sub,seedc){const g=new THREE.Group();const C=["#f1e6d4","#e3ecf2","#f6efe4","#efe2dc","#e6f0e2"][seedc%5];
  const S=(w,h,y,z,b)=>{if(!label)return;const s=sign(label,sub,{w,h,border:b});s.position.set(0,y,z+.24);g.add(s);g.add(box(w+.3,h+.25,.14,b,0,y,z+.12))};
  if(style==="park"){[-4,4].forEach(x=>g.add(cyl(.3,.3,3,"#8a5a44",x,1.5,3)));S(5.2,1.2,3.4,3,"#3f8a52");[[-3,-1],[3,-2],[0,-4],[-4,-4],[4,1]].forEach(([x,z],i)=>{const t=tree3(i%2?"sakura":"green",1);t.position.set(x,0,z);g.add(t)});const f=new THREE.Group();f.add(cyl(1.6,1.8,.4,"#cfc6b6",0,.2,0,20));f.add(cyl(1.4,1.4,.42,"#7fc4ec",0,.21,0,20));f.position.set(0,0,0);g.add(f);const b=bench3();b.position.set(2.5,0,1.5);g.add(b);return {g,w:10,d:9,solidW:3.6,solidD:3.6}}
  if(style==="shrine"){const s=shrine3(1.2);s.position.z=-1;g.add(s);const t=torii3("#d8432f",1);t.position.z=4;g.add(t);const l=sign(label,sub,{w:3,h:1,border:"#d8432f"});l.position.set(0,3.2,4.3);g.add(l);return {g,w:8,d:9}}
  if(style==="temple"){const t=temple3(1.3);g.add(t);S(4.6,1.1,4.4,2.6,"#5a3a2a");return {g,w:10,d:7}}
  if(style==="meeting"||style==="reception"||style==="toilet")style="office";if(style==="apartment")style="hotel";
  const H={station:5,bank:5.5,hospital:9,post:5,library:6,museum:6,store:8,school:7,food:5.4,hotel:12,office:14,airport:6,pool:3,home:6}[style]||6;
  const W={station:13,store:12,airport:14,hotel:9,office:9,home:8}[style]||11,D=8;
  const col={hospital:"#fbfbf8",post:"#f6e3d6",bank:"#e8e2d6",library:"#c98a6a",museum:"#f4f4f6",store:"#fbe3ec",school:"#f1e6d4",food:"#f3e3cc",hotel:"#e9eef6",office:"#9fb6d4",airport:"#eef2f6",pool:"#dff0f8",home:C,station:"#efe8da"}[style]||C;
  const trim={hospital:"#2f9e64",post:"#e8622f",bank:"#3d6fd6",library:"#8a4a3a",museum:"#2b2540",store:"#e85d8c",school:"#8a4a3a",food:"#c23b2a",hotel:"#3a3f5c",office:"#2b3a67",airport:"#3d6fd6",pool:"#2f9e64",home:"#8a4a3a",station:"#3a3f5c"}[style]||"#3a3f5c";
  g.add(outline(box(W,H,D,col,0,H/2,0),1.01));
  for(let r=0;r<Math.max(1,Math.floor((H-2.5)/2.4));r++)for(let i=0;i<Math.floor(W/2.6);i++)g.add(box(1.2,1,.1,"#a9d2ee",-W/2+1.6+i*2.6,1.5+r*2.4,D/2+.02));
  if(style==="station"){const c=outline(box(W+3,.25,4,"#3a3f5c",0,3.4,D/2+1.6),1.02);g.add(c);[-W/2,W/2].forEach(x=>g.add(cyl(.15,.15,3.4,"#5a5f6b",x,1.7,D/2+3.2,8)))}
  if(style==="bank"||style==="museum")for(let i=0;i<5;i++)g.add(cyl(.32,.35,H*.75,"#f6f2ea",-W/2+1.8+i*(W-3.6)/4,H*.37,D/2+.9,12));
  if(style==="hospital"){const cr=new THREE.Group();cr.add(box(.6,1.8,.2,"#2f9e64"));cr.add(box(1.8,.6,.2,"#2f9e64"));cr.position.set(0,H+1,0);g.add(cr)}
  if(style==="post"){const t=canvasTex(128,128,(c)=>{c.fillStyle="#e8622f";c.beginPath();c.arc(64,64,60,0,TAU);c.fill();c.fillStyle="#fff";c.font=`800 84px ${VNF}`;c.textAlign="center";c.textBaseline="middle";c.fillText("〒",64,70)});const m=new THREE.Mesh(new THREE.CircleGeometry(.8,24),new THREE.MeshBasicMaterial({map:t}));m.position.set(W/2-1.4,H-1,D/2+.26);g.add(m)}
  if(style==="school"){const tw=outline(box(3,3,3,col,0,H+1.5,0));g.add(tw);const r=roofQuad(2.4,1.6,trim);r.position.y=H+3.8;g.add(r)}
  if(style==="home"){const r=roofQuad(W*.75,2.4,trim);r.position.y=H+1.2;r.scale.z=.8;g.add(r)}else g.add(box(W+.3,.4,D+.3,trim,0,H+.2,0));
  const aw=outline(box(W*.7,.12,1.4,trim,0,2.9,D/2+.6),1.02);aw.rotation.x=.22;if(style!=="station"&&style!=="bank"&&style!=="museum"&&style!=="pool")g.add(aw);
  g.add(box(2,2.4,.06,"#5a4a3a",0,1.2,D/2+.04));
  S(Math.min(W*.7,6.4),1.4,style==="station"?4.6:Math.min(H-1,4.6),D/2+(style==="bank"||style==="museum"?1.2:style==="station"?3.5:0),trim);
  return {g,w:W,d:D}}
function kanban(label,kana){const g=new THREE.Group();[-0.55,.55].forEach(x=>g.add(cyl(.06,.06,1.9,"#6b4433",x,.95,0,6)));g.add(outline(box(1.4,1.1,.1,"#a0693e",0,1.45,0)));
  const t=canvasTex(256,200,(c,W,H)=>{c.fillStyle="#fff8e8";c.fillRect(0,0,W,H);c.fillStyle="#2b2540";c.textAlign="center";c.textBaseline="middle";const L=label.length;c.font=`700 ${Math.min(96,220/Math.max(1,L*.95))}px ${JPF}`;c.fillText(label,W/2,kana?H*.42:H/2);if(kana&&kana!==label){c.font=`600 28px ${JPF}`;c.fillStyle="#8a4a3a";c.fillText(kana,W/2,H*.82)}});
  const p=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.98),new THREE.MeshBasicMaterial({map:t}));p.position.set(0,1.45,.06);p.userData.sign=label;g.add(p);g.add(box(1.55,.1,.2,"#3a3f5c",0,2.05,0));return g}
function stallTable(){const g=new THREE.Group();g.add(outline(box(1.5,.08,1,"#a0693e",0,.8,0)));[[-.65,-.4],[.65,-.4],[-.65,.4],[.65,.4]].forEach(([x,z])=>g.add(box(.07,.8,.07,"#7a4a2a",x,.4,z)));g.add(box(1.52,.18,1.02,"#e85d8c",0,.72,0));return g}
/* thêm đồ vật cho các bài sau */
Object.assign(P3,{
 elev:()=>{const g=new THREE.Group();g.add(outline(box(2.6,3.4,.5,"#9aa3ae",0,1.7,0)));[-.55,.55].forEach(x=>g.add(box(1.05,2.7,.06,"#d6dde5",x,1.4,.27)));g.add(box(.05,2.7,.07,"#5a5f6b",0,1.4,.29));
   g.add(box(1,.35,.06,"#2b2540",0,3.05,.27));g.add(box(.25,.25,.07,"#ffb347",-.2,3.05,.29));g.add(box(.25,.25,.07,"#ffb347",.2,3.05,.29));g.add(box(.18,.4,.08,"#c9cfd8",1.15,1.3,.3));return g},
 esc:()=>{const g=new THREE.Group();const b=outline(box(1.6,.6,6.4,"#9aa3ae",0,0,0));b.rotation.x=-.52;b.position.set(0,1.6,0);g.add(b);
   [-.85,.85].forEach(x=>{const r=box(.12,.9,6.6,"#2b2540",0,0,0);r.rotation.x=-.52;r.position.set(x,2.1,0);g.add(r)});g.add(box(1.8,.1,1.4,"#c9cfd8",0,3.3,-3.4));return g},
 stairsP:()=>{const g=stairs3(8,2.4);g.position.z=1.4;const w=new THREE.Group();w.add(g);return w},
 vend:c=>vending(0,0,c||"#3d6fd6"),
 postbox:()=>postbox(),
 panda:()=>{const g=new THREE.Group();const b=outline(sph(.55,"#ffffff",0,.6,0,16,12));b.scale.set(1,.9,1.1);g.add(b);g.add(outline(sph(.42,"#ffffff",0,1.25,.25,16,12)));
   [-1,1].forEach(s=>{g.add(sph(.15,"#2b2540",s*.28,1.58,.2,10,8));g.add(sph(.11,"#2b2540",s*.16,1.3,.6,8,6));g.add(sph(.22,"#2b2540",s*.42,.25,.25,10,8));g.add(sph(.2,"#2b2540",s*.45,.75,.35,10,8))});
   g.add(sph(.07,"#2b2540",0,1.16,.66,6,4));const bb=cyl(.04,.04,1.2,"#6fa34a",.5,.9,.5,6);bb.rotation.z=.6;g.add(bb);return g},
 elephant:()=>{const g=new THREE.Group(),C="#a9b0bd";const b=outline(sph(1,C,0,1.6,0,16,12));b.scale.set(1,.85,1.35);g.add(b);g.add(outline(sph(.7,C,0,2.2,1.3,16,12)));
   [[-.5,-.6],[.5,-.6],[-.5,.6],[.5,.6]].forEach(([x,z])=>g.add(cyl(.28,.3,1,C,x,.5,z,10)));[-1,1].forEach(s=>{const e=outline(sph(.55,"#c3c9d3",s*.75,2.3,1.1,12,10));e.scale.set(.3,1,.9);g.add(e);g.add(sph(.07,"#2b2540",s*.3,2.4,1.9,6,4))});
   const t=outline(cyl(.16,.22,1.3,C,0,1.5,2,10));t.rotation.x=.35;g.add(t);g.scale.setScalar(.8);return g},
 horse:()=>{const z=zodiac3(6);z.scale.setScalar(1.5);return z},
 piano:()=>{const g=new THREE.Group();g.add(outline(box(1.8,1.3,.7,"#2b2540",0,.85,0)));g.add(box(1.7,.06,.35,"#ffffff",0,.95,.5));for(let i=0;i<9;i++)g.add(box(.07,.05,.2,"#2b2540",-.7+i*.17,.99,.45));
   g.add(box(1.7,.12,.4,"#2b2540",0,.88,.52));[-.8,.8].forEach(x=>g.add(box(.1,.8,.1,"#2b2540",x,.4,.55)));g.add(outline(box(1,.08,.4,"#2b2540",0,.5,1.2)));return g},
 medicine:()=>{const g=new THREE.Group();g.add(outline(cyl(.18,.18,.45,"#ffffff",0,.23,0,12)));g.add(cyl(.19,.19,.12,"#e5484d",0,.5,0,12));[[.35,.05],[.5,-.15],[.25,-.25]].forEach(([x,z],i)=>{const p=sph(.06,i%2?"#ffcf4a":"#e5484d",x,.04,z,8,6);p.scale.x=1.8;g.add(p)});return g},
 kimono:()=>{const g=new THREE.Group();g.add(cyl(.03,.03,1.6,"#6b4433",0,.8,0,6));const b=box(1.6,.06,.06,"#6b4433",0,1.55,0);g.add(b);const k=outline(box(1.3,1.3,.12,"#c2406b",0,.9,0));g.add(k);g.add(box(1.32,.22,.14,"#f2bf3a",0,.75,0));
   [[-.3,1.2],[.3,.6],[-.2,.4],[.35,1.3]].forEach(([x,y])=>g.add(sph(.08,"#ffd6e2",x,y,.07,8,6)));return g},
 hat:()=>{const g=new THREE.Group();g.add(outline(cyl(.5,.5,.04,"#d9b77a",0,.03,0,20)));g.add(outline(cyl(.28,.3,.3,"#d9b77a",0,.2,0,16)));g.add(cyl(.305,.305,.07,"#c23b2a",0,.1,0,16));return g},
 glasses:()=>{const g=new THREE.Group();[-.2,.2].forEach(x=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.15,.025,6,16),M("#2b2540"));r.position.set(x,.18,0);g.add(r)});g.add(box(.12,.02,.02,"#2b2540",0,.2,0));[-1,1].forEach(s=>g.add(box(.02,.02,.4,"#2b2540",s*.35,.18,-.2)));return g},
 shirt:c=>{const g=new THREE.Group();c=c||"#7aa7d8";g.add(outline(box(.8,.9,.15,c,0,.6,0)));[-1,1].forEach(s=>{const a=outline(box(.3,.6,.14,c,s*.5,.85,0));a.rotation.z=s*.6;g.add(a)});g.add(box(.25,.1,.16,"#ffffff",0,1.02,0));g.rotation.x=-.2;return g},
 futon:()=>{const g=new THREE.Group();g.add(outline(box(1.1,.15,1.9,"#f6f4f0",0,.08,0)));g.add(box(1.12,.1,1.2,"#5f86c9",0,.2,.3));g.add(box(.6,.12,.3,"#ffffff",0,.21,-.7));return g},
 scissors:()=>{const g=new THREE.Group();[-1,1].forEach(s=>{const b=box(.06,.03,.6,"#c9cfd8",s*.05,.04,-.15);b.rotation.y=s*.15;g.add(b);const r=new THREE.Mesh(new THREE.TorusGeometry(.1,.03,6,12),M("#e5484d"));r.rotation.x=Math.PI/2;r.position.set(s*.12,.04,.25);g.add(r)});return g},
 spoon:()=>{const g=new THREE.Group();g.add(box(.05,.02,.6,"#c9cfd8",0,.03,.1));const h=sph(.12,"#c9cfd8",0,.04,-.27,10,6);h.scale.set(1,.3,1.3);g.add(h);return g},
 fork:()=>{const g=new THREE.Group();g.add(box(.05,.02,.55,"#c9cfd8",0,.03,.1));for(let i=0;i<4;i++)g.add(box(.02,.02,.2,"#c9cfd8",-.045+i*.03,.03,-.27));return g},
 knife:()=>{const g=new THREE.Group();g.add(box(.08,.02,.4,"#c9cfd8",0,.03,-.15));g.add(box(.07,.04,.3,"#6b4433",0,.03,.2));return g},
 chopsticks:()=>{const g=new THREE.Group();[-.04,.04].forEach(x=>{const c=box(.03,.03,.8,"#a0693e",x,.04,0);c.rotation.y=x*2;g.add(c)});g.add(box(.12,.06,.12,"#e5484d",0,.03,.3));return g},
 ticket:()=>{const g=new THREE.Group();g.add(outline(box(.7,.02,.32,"#9fd0ff",0,.02,0)));g.add(box(.5,.01,.04,"#3d6fd6",0,.035,-.05));g.add(box(.3,.01,.04,"#2b2540",-.1,.035,.06));return g},
 money:()=>{const g=new THREE.Group();for(let i=0;i<3;i++){const b=box(.76,.02,.38,"#d9c9a0",0,.02+i*.025,0);b.rotation.y=i*.15;g.add(b)}[[.45,.1],[.5,-.15]].forEach(([x,z])=>g.add(cyl(.1,.1,.04,"#e0b23a",x,.03,z,14)));return g},
 passport:()=>{const g=new THREE.Group();g.add(outline(box(.5,.05,.7,"#7a1f3a",0,.03,0)));g.add(cyl(.1,.1,.01,"#e0b23a",0,.06,-.05,14));return g},
 map:()=>{const g=new THREE.Group();const t=canvasTex(128,96,(c)=>{c.fillStyle="#f3ecd2";c.fillRect(0,0,128,96);c.strokeStyle="#c9a27a";c.lineWidth=6;c.beginPath();c.moveTo(0,50);c.lineTo(128,40);c.moveTo(60,0);c.lineTo(70,96);c.stroke();c.fillStyle="#7cc472";c.fillRect(10,8,30,24);c.fillStyle="#8ec5ff";c.fillRect(85,60,34,26);c.fillStyle="#e5484d";c.beginPath();c.arc(66,44,6,0,TAU);c.fill()});
   const p=new THREE.Mesh(new THREE.PlaneGeometry(.9,.68),new THREE.MeshBasicMaterial({map:t}));p.rotation.x=-Math.PI/2;p.position.y=.03;g.add(p);return g},
 salt:c=>{const g=new THREE.Group();g.add(outline(cyl(.13,.15,.4,c||"#e8eef6",0,.2,0,12)));g.add(cyl(.14,.14,.1,"#9aa3ae",0,.45,0,12));return g},
 ball:()=>{const g=new THREE.Group();g.add(outline(sph(.3,"#ffffff",0,.3,0,16,12)));[[0,.58,0],[.27,.35,.1],[-.2,.3,.2],[.05,.25,-.28]].forEach(([x,y,z])=>g.add(sph(.08,"#2b2540",x,y,z,6,4)));return g},
 racket:()=>{const g=new THREE.Group();const r=new THREE.Mesh(new THREE.TorusGeometry(.25,.03,6,18),M("#e5484d"));r.rotation.x=Math.PI/2;r.position.set(0,.05,-.2);g.add(r);g.add(box(.06,.04,.45,"#2b2540",0,.05,.25));g.add(outline(sph(.08,"#d6f04a",.4,.08,.1,8,6)));return g},
 aircon:()=>{const g=new THREE.Group();g.add(outline(box(1.2,.4,.3,"#f6f4f0",0,.6,0)));g.add(box(1,.04,.05,"#9aa3ae",0,.47,.15));g.add(box(.2,.05,.02,"#3fd47a",.4,.7,.16));[-1,1].forEach(x=>g.add(box(.06,.4,.06,"#9aa3ae",x*.5,.2,0)));return g},
 battery:()=>{const g=new THREE.Group();[-.15,.15].forEach(x=>{const b=outline(cyl(.1,.1,.5,"#2b2540",x,.25,0,12));g.add(b);g.add(cyl(.105,.105,.18,"#e5a23a",x,.42,0,12));g.add(cyl(.04,.04,.05,"#c9cfd8",x,.53,0,8))});return g},
 film:()=>{const g=new THREE.Group();const c=outline(cyl(.25,.25,.08,"#2b2540",0,.05,0,16));g.add(c);for(let i=0;i<5;i++){const a=i/5*TAU;g.add(cyl(.05,.05,.09,"#5a5f6b",Math.cos(a)*.14,.06,Math.sin(a)*.14,8))}g.add(box(.6,.01,.12,"#5a3a2a",.4,.02,.15));return g},
 stapler:()=>{const g=new THREE.Group();g.add(outline(box(.25,.08,.7,"#3d6fd6",0,.05,0)));const t=outline(box(.22,.08,.65,"#3d6fd6",0,.16,-.02));t.rotation.x=.08;g.add(t);return g},
 tape:()=>{const g=new THREE.Group();const r=new THREE.Mesh(new THREE.TorusGeometry(.18,.07,8,16),M("#e8f4ff",{transparent:true,opacity:.85}));r.rotation.x=Math.PI/2;r.position.y=.08;g.add(r);g.add(outline(box(.6,.12,.3,"#e5484d",0,.06,.35)));return g},
 eraser:()=>{const g=new THREE.Group();g.add(outline(box(.4,.12,.2,"#ffffff",0,.07,0)));g.add(box(.25,.125,.205,"#3d6fd6",.08,.07,0));return g},
 paper:()=>{const g=new THREE.Group();for(let i=0;i<5;i++){const p=box(.7,.012,.95,"#ffffff",0,.02+i*.015,0);p.rotation.y=(i-2)*.04;g.add(p)}return g},
 shelf:()=>{const g=new THREE.Group();g.add(outline(box(1.6,1.8,.5,"#a0693e",0,.9,0)));[.5,1.1,1.6].forEach(y=>g.add(box(1.5,.05,.45,"#7a4a2a",0,y,.02)));for(let i=0;i<6;i++)g.add(box(.18,.4,.35,["#3d6fd6","#e5484d","#2f9e64","#ffcf4a"][i%4],-.55+i*.22,.75,.05));return g},
 door:()=>{const g=new THREE.Group();g.add(outline(box(1.3,2.4,.15,"#a0693e",0,1.2,0)));g.add(box(1.1,2.2,.05,"#c98a5a",0,1.15,.08));g.add(sph(.07,"#e0b23a",.42,1.15,.13,8,6));return g},
 window:()=>{const g=new THREE.Group();g.add(outline(box(1.6,1.4,.12,"#f6f4f0",0,1.3,0)));g.add(box(1.4,1.2,.05,"#a9d2ee",0,1.3,.05));g.add(box(.05,1.2,.08,"#f6f4f0",0,1.3,.06));[-.6,.6].forEach(x=>g.add(box(.06,.6,.06,"#9aa3ae",x,.3,0)));return g},
 nabe:()=>{const g=new THREE.Group();g.add(outline(cyl(.45,.38,.25,"#3a3f4a",0,.15,0,18)));const s=cyl(.42,.42,.02,"#c8642a",0,.27,0,18);g.add(s);[[.15,.1],[-.15,-.05],[0,-.2],[-.1,.18]].forEach(([x,z],i)=>g.add(box(.18,.04,.12,i%2?"#c8564a":"#7cc472",x,.29,z)));[-1,1].forEach(x=>g.add(box(.15,.06,.1,"#3a3f4a",x*.5,.2,0)));return g},
 tea:()=>P3.cup("#7cc472"),
});
Object.assign(PK,{パンダ:["panda"],ぞう:["elephant"],うま:["horse"],ピアノ:["piano"],くすり:["medicine"],きもの:["kimono"],ぼうし:["hat"],めがね:["glasses"],シャツ:["shirt"],コート:["shirt","#8a6a4e"],セーター:["shirt","#e5484d"],スーツ:["shirt","#2b3a67"],うわぎ:["shirt","#5d6f86"],したぎ:["shirt","#f6f4f0"],ふく:["shirt","#e85d8c"],
 ふとん:["futon"],はさみ:["scissors"],スプーン:["spoon"],フォーク:["fork"],ナイフ:["knife"],はし:["chopsticks"],きっぷ:["ticket"],チケット:["ticket"],おかね:["money"],げんきん:["money"],パスポート:["passport"],ちず:["map"],しお:["salt"],さとう:["salt","#ffffff"],サッカー:["ball"],テニス:["racket"],エアコン:["aircon"],でんち:["battery"],フィルム:["film"],ビデオ:["tv"],
 ワープロ:["pc"],ファクス:["pc"],ホッチキス:["stapler"],セロテープ:["tape"],けしゴム:["eraser"],かみ:["paper"],しりょう:["paper"],レポート:["paper"],しゅくだい:["book","#e5484d"],ふうとう:["letter"],テーブル:["desk"],たな:["shelf"],ドア:["door"],まど:["window"],ポスト:["postbox"],じどうはんばいき:["vend"],かいだん:["stairsP"],エレベーター:["elev"],エスカレーター:["esc"],
 ゆ:["cup","#dfefff"],すきやき:["nabe"],てんぷら:["sushi"],ていしょく:["bento"],ぎゅうにゅう:["milk"],さけ:["bottle","#f6f4f0"],プレゼント:["gift","#3d6fd6"],カタログ:["mag"],じこくひょう:["news"],ソフト:["pc"],せいひん:["boxp"],キャッシュカード:["card"],ほけんしょう:["card"],がいこくじんとうろくしょう:["card"],にっき:["book","#8a5a44"],
 マンガ:["book","#ffcf4a"],ざっし:["mag"],ケーキ:["cake"],べんとう:["bento"],かし:["choco"],おかし:["choco"],たばこ:["boxp"],ネクタイ:["tie"],くつ:["shoes"]});
Object.assign(PK,{紙:["paper"],花:["flower"],木:["tree"],箸:["chopsticks"],リンゴ:["fruit","#e5484d"],細かいお金:["money"],生け花:["flower"],ビザ:["passport"],インターネット:["pc"],ひっこし:["boxp"],引っ越し:["boxp"],やちん:["money"],家賃:["money"],絵:["photo"],パーティー:["cake"],誕生日:["cake"],映画:["film"],速達:["letter"],書留:["letter"],航空便:["letter"],船便:["boxp"],放送:["tv"],ニュース:["tv"],野球:["ball"],スポーツ:["ball"],試合:["ball"],母の日:["flower"],父の日:["gift"],旅行:["bag"],病気:["medicine"],熱:["medicine"],サイズ:["shirt"],寿司:["sushi"],天ぷら:["sushi"],砂糖:["salt","#ffffff"],塩:["salt"],下着:["shirt","#f6f4f0"],帽子:["hat"],眼鏡:["glasses"],手紙:["letter"],写真:["photo"],宿題:["book","#e5484d"],ビール:["bottle","#c8862a"],お酒:["bottle","#f6f4f0"],ジュース:["bottle","#f5a043"],クリスマス:["tree"],スイッチ:["aircon"],地球:["ball"],日本語:["book","#c23b2a"],英語:["book","#3d6fd6"]});
PLACE.とこや="store";PLACE.床屋="store";
/* đồ vật thêm: ATM, lịch, micro, quả địa cầu, cây thông Noel, thời tiết, nhiệt kế, cấm hút thuốc, cờ, thư pháp */
const txtTex=(w,h,draw)=>canvasTex(w,h,draw);
Object.assign(P3,{
 atm:()=>{const g=new THREE.Group();g.add(outline(box(1.3,2.2,.9,"#3d6fd6",0,1.1,0)));g.add(box(1.32,.35,.92,"#ffcf4a",0,2.05,0));
   const sc=new THREE.Mesh(new THREE.PlaneGeometry(.8,.5),new THREE.MeshBasicMaterial({map:txtTex(160,100,(c,W,H)=>{c.fillStyle="#bfe6ff";c.fillRect(0,0,W,H);c.fillStyle="#2b3a67";c.font=`700 34px ${JPF}`;c.textAlign="center";c.fillText("¥ ATM",W/2,44);c.font=`600 22px ${VNF}`;c.fillText("****",W/2,80)})}));sc.position.set(0,1.45,.46);sc.rotation.x=-.25;g.add(sc);
   g.add(box(.6,.06,.3,"#2b2540",0,1.05,.5));for(let i=0;i<9;i++)g.add(box(.12,.03,.1,"#d6dde5",-.15+(i%3)*.15,1.1,.42+((i/3)|0)*.06));g.add(box(.4,.05,.05,"#2b2540",0,.78,.46));
   const sg=sign("ATM","",{w:1,h:.32,border:"#3d6fd6"});sg.position.set(0,2.05,.47);g.add(sg);return g},
 calendar:t=>{const g=new THREE.Group();const label=t||"今日";const tex=txtTex(200,240,(c,W,H)=>{c.fillStyle="#ffffff";c.fillRect(0,0,W,H);c.fillStyle="#e5484d";c.fillRect(0,0,W,56);c.fillStyle="#fff";c.font=`700 34px ${VNF}`;c.textAlign="center";c.fillText("2026",W/2,40);
     c.fillStyle="#2b2540";c.font=`800 ${Math.min(96,170/Math.max(1,label.length))}px ${JPF}`;c.textBaseline="middle";c.fillText(label,W/2,150);c.strokeStyle="#9aa3ae";c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.arc(30+i*35,8,5,0,TAU);c.stroke()}});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(.7,.84),new THREE.MeshBasicMaterial({map:tex}));m.position.set(0,.5,0);m.rotation.x=-.2;m.userData.sign=label;g.add(m);const st=box(.7,.84,.04,"#c9a27a",0,.5,-.05);st.rotation.x=-.2;g.add(st);const b=box(.08,.5,.3,"#8a5a44",0,.25,-.2);b.rotation.x=.4;g.add(b);return g},
 mic:()=>{const g=new THREE.Group();g.add(outline(cyl(.3,.35,.06,"#2b2540",0,.03,0,16)));g.add(cyl(.03,.03,1.1,"#9aa3ae",0,.6,0,8));const h=outline(cyl(.06,.08,.35,"#2b2540",0,1.3,.05,10));h.rotation.x=.4;g.add(h);
   const head=outline(sph(.13,"#c9cfd8",0,1.5,.13,12,10));g.add(head);return g},
 globe:()=>{const g=new THREE.Group();g.add(outline(cyl(.25,.3,.08,"#8a5a44",0,.04,0,16)));g.add(cyl(.03,.03,.3,"#8a5a44",0,.2,0,6));const tex=txtTex(256,128,(c,W,H)=>{c.fillStyle="#4fa6d4";c.fillRect(0,0,W,H);c.fillStyle="#6fbf5a";
     [[40,40,30,22],[70,80,18,26],[130,35,34,20],[150,70,22,28],[200,50,26,18],[215,95,16,12]].forEach(([x,y,a,b])=>{c.beginPath();c.ellipse(x,y,a,b,0,0,TAU);c.fill()})});
   const ball=new THREE.Mesh(new THREE.SphereGeometry(.38,24,16),new THREE.MeshToonMaterial({map:tex,gradientMap:toonGrad()}));ball.position.y=.72;ball.rotation.z=.4;g.add(outline(ball,1.03));
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.44,.025,6,32,Math.PI*1.2),M("#e0b23a"));ring.position.y=.72;ring.rotation.set(0,Math.PI/2,.4);g.add(ring);return g},
 xmas:()=>{const g=new THREE.Group();g.add(outline(box(.8,.5,.8,"#c23b2a",0,.25,0)));g.add(cyl(.15,.18,.5,"#6b4433",0,.7,0,8));[[1.3,1.5,1.4],[1,1.2,2.2],[.7,1,2.9]].forEach(([r,h,y])=>{const c=outline(new THREE.Mesh(new THREE.ConeGeometry(r,h,10),M("#2f7f55")));c.position.y=y;g.add(c)});
   const st=new THREE.Mesh(new THREE.OctahedronGeometry(.25),new THREE.MeshBasicMaterial({color:0xffd43b}));st.position.y=3.6;g.add(st);
   ["#e5484d","#ffd43b","#5ad1ff","#ff8fab","#ffffff"].forEach((c,i)=>{for(let k=0;k<3;k++){const a=k*2.1+i,y=1.2+i*.4,r=1.25-i*.17;g.add(sph(.1,c,Math.cos(a)*r,y,Math.sin(a)*r,8,6))}});
   [[.9,.3],[-.8,.5]].forEach(([x,z],i)=>{const b=P3.gift(i?"#3d6fd6":"#e85d8c");b.position.set(x,0,z);b.scale.setScalar(.8);g.add(b)});return g},
 weather:k=>{const g=new THREE.Group();g.add(cyl(.05,.05,1.2,"#6b4433",0,.6,0,6));const tex=txtTex(200,200,(c,W,H)=>{c.fillStyle="#e8f4ff";c.fillRect(0,0,W,H);c.strokeStyle="#3d6fd6";c.lineWidth=10;c.strokeRect(5,5,W-10,H-10);
     const cloud=(x,y,col)=>{c.fillStyle=col;[[0,0,34],[30,-14,28],[-30,-8,24],[52,8,22]].forEach(([dx,dy,r])=>{c.beginPath();c.arc(x+dx,y+dy,r,0,TAU);c.fill()})};
     if(k==="sun"){c.fillStyle="#ffb400";c.beginPath();c.arc(100,100,46,0,TAU);c.fill();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(100+Math.cos(a)*62-6,100+Math.sin(a)*62-6,12,12)}}
     else{cloud(90,90,k==="cloud"?"#9aa3ae":"#b8c4d2");if(k==="rain"){c.strokeStyle="#3d6fd6";c.lineWidth=7;for(let i=0;i<5;i++){c.beginPath();c.moveTo(55+i*22,130);c.lineTo(47+i*22,160);c.stroke()}}
       if(k==="snow"){c.fillStyle="#7fb8e6";for(let i=0;i<6;i++){c.beginPath();c.arc(50+i*20,140+(i%2)*16,7,0,TAU);c.fill()}}}});
   const p=new THREE.Mesh(new THREE.PlaneGeometry(.8,.8),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));p.position.y=1.4;g.add(p);return g},
 thermo:()=>{const g=new THREE.Group();g.add(outline(box(.25,.06,.9,"#ffffff",0,.04,0)));g.add(box(.06,.02,.6,"#e5484d",0,.08,-.05));g.add(sph(.08,"#e5484d",0,.08,.33,10,8));for(let i=0;i<6;i++)g.add(box(.1,.01,.015,"#2b2540",.07,.075,-.3+i*.1));return g},
 nosmoke:()=>{const g=new THREE.Group();g.add(cyl(.05,.05,1.3,"#9aa3ae",0,.65,0,6));const tex=txtTex(200,200,(c,W,H)=>{c.fillStyle="#fff";c.fillRect(0,0,W,H);c.fillStyle="#2b2540";c.fillRect(40,92,110,18);c.fillStyle="#e5484d";c.fillRect(150,92,14,18);
     c.strokeStyle="#e5484d";c.lineWidth=16;c.beginPath();c.arc(100,100,80,0,TAU);c.stroke();c.beginPath();c.moveTo(43,43);c.lineTo(157,157);c.stroke()});
   const p=new THREE.Mesh(new THREE.CircleGeometry(.4,24),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));p.position.y=1.45;g.add(p);return g},
 flag:k=>{const g=new THREE.Group();g.add(outline(cyl(.04,.05,1.6,"#c9cfd8",0,.8,0,8)));const tex=txtTex(180,120,(c,W,H)=>{if(k==="jp"){c.fillStyle="#fff";c.fillRect(0,0,W,H);c.fillStyle="#d8302a";c.beginPath();c.arc(W/2,H/2,34,0,TAU);c.fill();return}
     c.fillStyle="#da251d";c.fillRect(0,0,W,H);c.fillStyle="#ffde00";c.beginPath();for(let i=0;i<10;i++){const r=i%2?16:40,a=-Math.PI/2+i*Math.PI/5;c.lineTo(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r)}c.closePath();c.fill()});
   const f=new THREE.Mesh(new THREE.PlaneGeometry(.75,.5),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));f.position.set(.4,1.33,0);g.add(f);return g},
 brush:t=>{const g=new THREE.Group();const label=t||"字";const tex=txtTex(160,220,(c,W,H)=>{c.fillStyle="#fbf6ea";c.fillRect(0,0,W,H);c.fillStyle="#1f1b24";c.font=`700 ${Math.min(130,190/Math.max(1,label.length))}px ${JPF}`;c.textAlign="center";c.textBaseline="middle";c.fillText(label,W/2,H/2);c.fillStyle="#d8302a";c.fillRect(W-30,H-34,18,18)});
   const m=new THREE.Mesh(new THREE.PlaneGeometry(.55,.75),new THREE.MeshBasicMaterial({map:tex}));m.rotation.x=-Math.PI/2+.25;m.position.set(-.1,.08,0);m.userData.sign=label;g.add(m);
   const br=cyl(.025,.03,.6,"#a0693e",.38,.06,.05,8);br.rotation.z=Math.PI/2;br.rotation.y=.5;g.add(br);g.add(sph(.05,"#1f1b24",.08,.06,.2,8,6));g.add(outline(box(.22,.06,.14,"#2b2540",.4,.03,-.25)));return g},
});
Object.assign(PK,{暗証番号:["atm"],金額:["atm"],確認:["atm"],下ろします:["atm"],キャッシュカード:["card"],
 月曜日:["calendar","月"],火曜日:["calendar","火"],水曜日:["calendar","水"],木曜日:["calendar","木"],金曜日:["calendar","金"],土曜日:["calendar","土"],日曜日:["calendar","日"],
 今日:["calendar","今日"],明日:["calendar","明日"],昨日:["calendar","昨日"],あさって:["calendar","あさって"],おととい:["calendar","おととい"],毎日:["calendar","毎日"],先週:["calendar","先週"],今週:["calendar","今週"],来週:["calendar","来週"],先月:["calendar","先月"],今月:["calendar","今月"],来月:["calendar","来月"],
 去年:["calendar","去年"],今年:["calendar","今年"],来年:["calendar","来年"],週末:["calendar","週末"],休み:["calendar","休み"],お正月:["calendar","正月"],季節:["calendar","季節"],春:["calendar","春"],夏:["calendar","夏"],秋:["calendar","秋"],冬:["calendar","冬"],母の日:["calendar","母の日"],父の日:["calendar","父の日"],
 歌:["mic"],歌います:["mic"],音楽:["mic"],コンサート:["mic"],カラオケ:["mic"],
 地球:["globe"],世界:["globe"],外国:["globe"],国際:["globe"],留学生:["globe"],
 クリスマス:["xmas"],
 天気:["weather","sun"],雨:["weather","rain"],雪:["weather","snow"],曇り:["weather","cloud"],
 熱:["thermo"],禁煙:["nosmoke"],吸います:["nosmoke"],ベトナム:["flag","vn"],国:["flag","jp"],お国:["flag","jp"],
 漢字:["brush","漢字"],字:["brush","字"],ひらがな:["brush","あ"],かたかな:["brush","ア"],ローマ字:["brush","ABC"],日記:["brush","日記"],今:["clock"],時間:["clock"],半:["clock"],何時:["clock"]});
const FLOOR=new Set(["atm","xmas","weather","nosmoke","flag","train","bus","taxi","plane","ship","bike","car","elev","esc","stairsP","vend","postbox","panda","elephant","horse","piano","desk","chair","fridge","bed","tree","dog","cat","shelf","door","window"]);
const BIGP=new Set(["train","bus","taxi","plane","ship","car","elev","esc","stairsP","elephant","horse","piano"]);
Object.assign(PLACE,{きょうしつ:"school",しょくどう:"food",じむしょ:"office",かいぎしつ:"meeting",うけつけ:"reception",へや:"home",トイレ:"toilet",うりば:"store",かいしゃ:"office",アパート:"apartment",りょう:"home",こうこう:"school",とこや:"food",はいしゃ:"hospital",プレイガイド:"store",みせ:"food",レストラン:"food",
 きっさてん:"food",ほんや:"library",ビル:"office",しやくしょ:"office",プール:"pool",ホテル:"hotel",くうこう:"airport",デパート:"store",ぎんこう:"bank",ゆうびんきょく:"post",としょかん:"library",びじゅつかん:"museum",がっこう:"school",スーパー:"store",えき:"station",こうえん:"park",うち:"home",いえ:"home",にわ:"park"});
["まち","こうさてん","ちゅうしゃじょう","たてもの","いなか","じんじゃ","おてら","てら","ダイニングキッチン","わしつ","ようしつ","ところ","くに","ロビー","ちか","のりば","うりば"].forEach(k=>{if(PLACE[k]&&!["うりば"].includes(k))delete PLACE[k]});
/* ---------- môi trường theo chủ đề ---------- */
const DAY=["#4f7fbf","#a9d3f0","#ffe9e0"],DUSK=["#3b3f7a","#e78f8a","#ffd2a1"],NIGHT=["#0c1030","#1f2457","#3a3170"];
function neonTex(text,col,w=512,h=160,bg="#140f24"){return canvasTex(w,h,(c,W,H)=>{c.fillStyle=bg;c.fillRect(0,0,W,H);c.strokeStyle=col;c.lineWidth=8;c.strokeRect(8,8,W-16,H-16);c.shadowColor=col;c.shadowBlur=24;c.fillStyle="#fff";c.textAlign="center";c.textBaseline="middle";
  c.font=`800 ${Math.min(H*.6,W/(text.length*1.05))}px ${JPF}`;c.fillText(text,W/2,H*.53);c.shadowBlur=0})}
function neonSign(text,col,w,h){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:neonTex(text,col,512,Math.round(512*h/w)),side:THREE.DoubleSide}));m.userData.sign=text;return m}
function stoneTex(c1,c2){const t=canvasTex(128,128,(c,W,H)=>{c.fillStyle=c2;c.fillRect(0,0,W,H);for(let y=0;y<4;y++)for(let x=0;x<4;x++){c.fillStyle=c1;const o=y%2?16:0;c.fillRect(x*32+o+2,y*32+2,28,28)}});t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function plane(w,d,col,x,z,y=.02,mat){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat||M(col));m.rotation.x=-Math.PI/2;m.position.set(x,y,z);m.receiveShadow=true;m.userData.ground=true;return m}
function fenceRect(w,d,c="#c9a27a"){const g=new THREE.Group();const side=(L,x,z,r)=>{const f=new THREE.Group();for(let t=-L/2;t<=L/2+.01;t+=1.2)f.add(box(.12,1,.12,c,t,.5,0));[.35,.8].forEach(y=>f.add(box(L,.08,.06,c,0,y,0)));f.position.set(x,0,z);f.rotation.y=r;g.add(f)};
  side(w,0,-d/2,0);side(w,0,d/2,0);side(d,-w/2,0,Math.PI/2);side(d,w/2,0,Math.PI/2);return g}
function blockWall(L){const g=new THREE.Group();g.add(outline(box(L,1.1,.3,"#c9c3b6",0,.55,0),1.01));for(let x=-L/2+.6;x<L/2;x+=1.2)g.add(box(.02,1.1,.31,"#b5ae9f",x,.55,0));return g}
function cornerMirror(){const g=new THREE.Group();g.add(cyl(.06,.06,3,"#e8622f",0,1.5,0,8));const m=new THREE.Mesh(new THREE.CircleGeometry(.5,20),M("#d6eef8"));m.position.set(0,3,.12);g.add(m);const r=new THREE.Mesh(new THREE.TorusGeometry(.5,.06,6,20),M("#e8622f"));r.position.set(0,3,.12);g.add(r);return g}
function bridge3(len,w,c="#c23b2a",arch=.8){const g=new THREE.Group();const n=10;for(let i=0;i<n;i++){const t=i/(n-1),x=-len/2+t*len,y=.25+Math.sin(t*Math.PI)*arch;const p=box(len/n+.05,.25,w,"#a0693e",x,y,0);g.add(p)}
  [-1,1].forEach(s=>{for(let i=0;i<=n;i++){const t=i/n,x=-len/2+t*len,y=.25+Math.sin(t*Math.PI)*arch;g.add(box(.12,.9,.12,c,x,y+.45,s*w/2))}const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push(new THREE.Vector3(-len/2+t*len,.25+Math.sin(t*Math.PI)*arch+.9,s*w/2))}
    const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,.07,6),M(c));g.add(tube)});g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.ground=true}});return g}
function tent3(c){const g=new THREE.Group();const t=outline(new THREE.Mesh(new THREE.ConeGeometry(1.6,2,4),M(c)));t.rotation.y=Math.PI/4;t.position.y=1;g.add(t);g.add(box(.8,1.1,.05,"#2b2540",0,.55,1.14));return g}
function campfire(ticks){const g=new THREE.Group();for(let i=0;i<6;i++){const a=i/6*TAU;g.add(rock3(.35,"#8f897e"));g.children.at(-1).position.set(Math.cos(a)*.7,.15,Math.sin(a)*.7)}
  [0,1,2].forEach(i=>{const l=cyl(.08,.08,1.1,"#6b4433",0,.2,0,6);l.rotation.set(Math.PI/2,0,i*1.05);g.add(l)});const f=new THREE.Mesh(new THREE.ConeGeometry(.35,.9,8),new THREE.MeshBasicMaterial({color:0xffa53a}));f.position.y=.6;g.add(f);
  const f2=new THREE.Mesh(new THREE.ConeGeometry(.2,.6,8),new THREE.MeshBasicMaterial({color:0xffe27a}));f2.position.y=.5;g.add(f2);ticks.push(()=>{const t=performance.now()/120;f.scale.set(1,1+Math.sin(t)*.15,1);f2.scale.y=1+Math.cos(t*1.3)*.2});return g}
function cabin3(){const g=new THREE.Group();g.add(outline(box(5,2.6,4,"#8a5a3a",0,1.3,0),1.01));for(let y=.3;y<2.6;y+=.45)g.add(box(5.05,.06,4.05,"#6b4433",0,y,0));const r=roofQuad(4.4,1.8,"#5a3a2a");r.position.y=3.5;r.scale.z=.85;g.add(r);g.add(box(1,1.8,.05,"#4a2e22",0,.9,2.03));g.add(box(.9,.8,.05,"#ffe6a8",1.5,1.6,2.03));return g}
function barn3(){const g=new THREE.Group();g.add(outline(box(7,4,6,"#b8352a",0,2,0),1.01));const r=roofQuad(5.6,2.4,"#4a3b3a");r.position.y=5.2;r.scale.z=.95;g.add(r);g.add(box(2.4,3,.06,"#f6f4f0",0,1.5,3.03));const x1=box(2.6,.15,.07,"#f6f4f0",0,1.5,3.05);x1.rotation.z=.85;g.add(x1);const x2=x1.clone();x2.rotation.z=-.85;g.add(x2);return g}
function windmill(ticks){const g=new THREE.Group();g.add(outline(cyl(.6,1.2,7,"#f6f4f0",0,3.5,0,10)));const h=new THREE.Group();h.position.set(0,6.6,1.1);for(let i=0;i<4;i++){const b=box(.5,3.4,.08,"#c9a27a",0,1.8,0);const a=new THREE.Group();a.add(b);a.rotation.z=i*Math.PI/2;h.add(a)}g.add(h);ticks.push(dt=>h.rotation.z+=dt*.8);return g}
function hay3(){const g=outline(cyl(.7,.7,1.2,"#e2c46a",0,.7,0,16));g.rotation.z=Math.PI/2;g.position.y=.7;const w=new THREE.Group();w.add(g);return w}
function scarecrow(){const g=new THREE.Group();g.add(cyl(.06,.06,2.4,"#8a5a44",0,1.2,0,6));const a=box(1.8,.08,.08,"#8a5a44",0,1.7,0);g.add(a);g.add(outline(box(.7,.8,.3,"#5f86c9",0,1.5,0)));g.add(outline(sph(.3,"#f3e6bf",0,2.15,0,10,8)));const h=outline(new THREE.Mesh(new THREE.ConeGeometry(.55,.4,12),M("#d9b77a")));h.position.y=2.45;g.add(h);return g}
function paddy(w,d,c="#7cc472"){const g=new THREE.Group();g.add(plane(w,d,"#8fb8c8",0,0,.03));for(let z=-d/2+.5;z<d/2;z+=.9)g.add(box(w-.4,.35,.25,c,0,.18,z));g.add(fenceRect(w,d,"#b39a55"));g.children.at(-1).scale.y=.35;return g}
function dohyo(){const g=new THREE.Group();g.add(outline(box(6,.6,6,"#d9b07a",0,.3,0)));const r=new THREE.Mesh(new THREE.TorusGeometry(2.2,.12,6,30),M("#c9b16a"));r.rotation.x=Math.PI/2;r.position.y=.63;g.add(r);
  [[-2.8,-2.8],[2.8,-2.8],[-2.8,2.8],[2.8,2.8]].forEach(([x,z],i)=>g.add(cyl(.12,.12,4.6,"#6b4433",x,2.3,z,8)));const rf=roofQuad(4.6,1.6,"#3a3f5c");rf.position.y=5.3;g.add(rf);
  ["#2f9e64","#e5484d","#f6f4f0","#2b2540"].forEach((c,i)=>{const a=Math.PI/4+i*Math.PI/2;g.add(sph(.25,c,Math.cos(a)*3.6,4.3,Math.sin(a)*3.6,8,6))});return g}
function stage3(){const g=new THREE.Group();g.add(outline(box(8,1,5,"#2b2540",0,.5,0)));g.add(box(8.4,5,.3,"#3a2f5a",0,3.5,-2.4));const tr=box(8.6,.3,.3,"#5a5f6b",0,6,1.8);g.add(tr);[-4,4].forEach(x=>g.add(cyl(.12,.12,6,"#5a5f6b",x,3,1.8,8)));
  ["#ff5aa8","#5ad1ff","#ffd43b","#7fe0a0"].forEach((c,i)=>{const l=new THREE.Mesh(new THREE.SphereGeometry(.25,10,8),new THREE.MeshBasicMaterial({color:c}));l.position.set(-3+i*2,5.8,1.8);g.add(l);
    const beam=new THREE.Mesh(new THREE.ConeGeometry(1.2,5,12,1,true),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.14,side:THREE.DoubleSide,depthWrite:false}));beam.position.set(-3+i*2,3.3,1.4);g.add(beam)});
  const mic=cyl(.03,.03,1.4,"#9aa3ae",0,1.7,.8,6);g.add(mic);g.add(sph(.08,"#2b2540",0,2.45,.8,8,6));return g}
function bigScreen(text){const g=new THREE.Group();g.add(outline(box(7,4.2,.3,"#2b2540",0,0,0)));const t=canvasTex(512,300,(c,W,H)=>{const gr=c.createLinearGradient(0,0,W,H);gr.addColorStop(0,"#1e3a8a");gr.addColorStop(1,"#7c3aed");c.fillStyle=gr;c.fillRect(0,0,W,H);c.fillStyle="#fff";c.font=`800 92px ${JPF}`;c.textAlign="center";c.textBaseline="middle";c.fillText(text,W/2,H*.42);c.fillStyle="#ffd43b";c.fillRect(0,H*.78,W,H*.22);c.fillStyle="#2b2540";c.font=`700 40px ${VNF}`;c.fillText("LIVE · NEWS",W/2,H*.89)});
  const s=new THREE.Mesh(new THREE.PlaneGeometry(6.6,3.8),new THREE.MeshBasicMaterial({map:t}));s.position.z=.16;s.userData.sign=text;g.add(s);return g}
function tower(h,w,c,lit){const g=new THREE.Group();g.add(outline(box(w,h,w,c,0,h/2,0),1.01));const wm=lit?new THREE.MeshBasicMaterial({color:0xffe08a}):M("#a9d2ee");
  for(let y=1.6;y<h-.8;y+=1.8)for(let i=0;i<Math.floor(w/1.6);i++){if(lit&&((i*7+y*3)|0)%3===0)continue;const m=new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.05),wm);m.position.set(-w/2+1+i*1.6,y,w/2+.03);g.add(m)}return g}
function machiya(c="#5a3a2a"){const g=new THREE.Group();g.add(outline(box(5,3,4,"#e9dcc5",0,1.5,0),1.01));for(let x=-2.2;x<=2.2;x+=.3)g.add(box(.06,2.2,.06,c,x,1.4,2.03));const r=roofQuad(4.2,1.4,"#3a3f4a");r.position.y=3.6;r.scale.z=.85;g.add(r);
  const l=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xff6a4a}));l.scale.y=1.3;l.position.set(2,2.4,2.4);g.add(l);return g}
function nobori(c,text){const g=new THREE.Group();g.add(cyl(.04,.04,3.2,"#9aa3ae",0,1.6,0,6));const t=canvasTex(64,256,(x,W,H)=>{x.fillStyle=c;x.fillRect(0,0,W,H);x.fillStyle="#fff";x.font=`800 44px ${JPF}`;x.textAlign="center";[...text].forEach((ch,i)=>x.fillText(ch,W/2,50+i*52))});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(.5,2),new THREE.MeshBasicMaterial({map:t,side:THREE.DoubleSide}));f.position.set(.27,2.1,0);g.add(f);return g}
function arch3(label){const g=new THREE.Group();[-4.6,4.6].forEach(x=>g.add(outline(box(.5,6,.5,"#8a5a44",x,3,0))));g.add(outline(box(10,.5,.6,"#8a5a44",0,6.1,0)));if(label){const s=sign(label,"",{w:5,h:1.1,border:"#c23b2a"});s.position.set(0,5.3,.32);g.add(s);g.add(box(5.3,1.3,.12,"#c23b2a",0,5.3,.24))}return g}
function room3(kind,label,sub){const g=new THREE.Group(),W=13,D=9,H=2.4,wc="#efe6da";const fl={school:"#d9c9a8",food:"#e8d8c0",office:"#cfd8e2",meeting:"#d6d0e6",reception:"#e6dccf",toilet:"#dfeef3",home:"#e8d6b8",store:"#f3e3ea"}[kind]||"#e3dccf";
  g.add(plane(W,D,fl,0,0,.04));g.add(box(W,H,.3,wc,0,H/2,-D/2));[-1,1].forEach(s=>g.add(box(.3,H,D,wc,s*W/2,H/2,0)));[-1,1].forEach(s=>g.add(box(W/2-1.6,H,.3,wc,s*(W/4+.8),H/2,D/2)));g.add(box(3.2,.6,.3,wc,0,H-.3,D/2));
  g.children.forEach(c=>{if(c.isMesh&&!c.userData.ground)outline(c,1.005)});
  if(label){const s=sign(label,sub,{w:3.4,h:1,border:"#3a3f5c"});s.position.set(-3.8,H+.55,D/2+.17);g.add(s);g.add(box(.08,1.1,.08,"#5a5f6b",-5.4,H+.3,D/2+.12),box(.08,1.1,.08,"#5a5f6b",-2.2,H+.3,D/2+.12))}
  const put=(o,x,z,r=0)=>{o.position.set(x,0,z);o.rotation.y=r;g.add(o)};
  if(kind==="school"){const b=box(5,1.6,.08,"#2f5a46",0,1.8,-D/2+.2);g.add(b);for(let i=0;i<3;i++)for(let j=0;j<2;j++){put(P3.desk(),-3.5+i*3.5,-.5+j*2.2);g.children.at(-1).scale.setScalar(.6);put(P3.chair(),-3.5+i*3.5,.2+j*2.2,Math.PI);g.children.at(-1).scale.setScalar(.6)}}
  else if(kind==="food"){for(let i=0;i<3;i++){put(P3.desk(),-4+i*4,0);[-.8,.8].forEach(z=>{put(P3.chair(),-4+i*4,z,z<0?0:Math.PI);g.children.at(-1).scale.setScalar(.7)})}g.add(outline(box(6,1.1,.8,"#a0693e",0,.55,-D/2+.8)))}
  else if(kind==="office"){for(let i=0;i<2;i++)for(let j=0;j<2;j++){put(P3.desk(),-3+i*6,-1.6+j*3);const p=P3.pc();p.position.set(-3+i*6,.78,-1.6+j*3);p.scale.setScalar(.8);g.add(p)}put(P3.shelf(),5.5,-D/2+.5)}
  else if(kind==="meeting"){const t=outline(box(7,.12,2.2,"#8a5a3a",0,.78,0));g.add(t);[-2.5,2.5].forEach(x=>g.add(box(.15,.75,1.8,"#5a3a2a",x,.38,0)));for(let i=0;i<4;i++)[-1.5,1.5].forEach(z=>{put(P3.chair(),-2.7+i*1.8,z,z<0?0:Math.PI);g.children.at(-1).scale.setScalar(.65)});g.add(box(3.5,1.8,.06,"#ffffff",0,1.8,-D/2+.2))}
  else if(kind==="reception"){g.add(outline(box(6,1.1,1,"#a0693e",0,.55,-1)));g.add(box(6.1,.08,1.1,"#efe2c9",0,1.12,-1));g.add(sph(.12,"#e0b23a",1.5,1.22,-1,8,6))}
  else if(kind==="toilet"){[["#3d6fd6",-2.5],["#e5484d",2.5]].forEach(([c,x])=>{g.add(box(2.4,2.4,.15,c,x,1.2,-D/2+.25));g.add(sph(.25,"#ffffff",x,1.9,-D/2+.35,10,8));g.add(box(.5,.7,.05,"#ffffff",x,1.3,-D/2+.34))});g.add(outline(box(3,.9,.8,"#f6f4f0",0,.45,1)))}
  else if(kind==="home"){put(P3.bed(),-3.5,-1.5);put(P3.desk(),3,-2.6);put(P3.shelf(),5.4,1,-Math.PI/2);g.add(plane(3,2,"#c98a6a",0,1,.05))}
  else{for(let i=0;i<3;i++){put(P3.shelf(),-4+i*4,-2.8);put(P3.shelf(),-4+i*4,.6)}}
  return {g,w:W,d:D,walls:[[0,-D/2,W,.4],[-W/2,0,.4,D],[W/2,0,.4,D],[-(W/4+.8),D/2,W/2-1.6,.4],[W/4+.8,D/2,W/2-1.6,.4]]}}

const TH={
 town:{jp:"さくら町",vn:"Phố Sakura",path:"road",traffic:1,layout(C){enrichCity(C.scene,C.solids,C.ticks,C.rng)},decor(){}},
 canal:{jp:"運河の町",vn:"Phố bên kênh",path:"road",traffic:1,feats:["橋","道","交差点","信号","角","駐車場","建物"],
  layout(C){const W=C.water(6,160,32,0,"#5fa9d6");C.sol(32,-21,6.4,34);C.sol(32,21,6.4,34);const b=bridge3(9,8,"#9aa3ae",.25);C.add(b,32,0);C.feat("橋",b,.8,1.4);
   const b2=bridge3(8,2.4,"#c23b2a",.9);b2.rotation.y=0;C.add(b2,32,-26);C.feat("道",C.anchor(-22,1.2,0),0,1.2);C.feat("交差点",C.anchor(-2.5,1.4,-5.6),0,1.2);
   const tl=trafficLight();C.add(tl,5.6,5.6);C.sol(5.6,5.6,.3,.3);C.feat("信号",tl,.5,1);[[-5.6,-5.6,Math.PI],[5.6,-5.6,Math.PI/2],[-5.6,5.6,-Math.PI/2]].forEach(([x,z,r])=>{C.add(trafficLight(),x,z,r);C.sol(x,z,.3,.3)});
   const cm=cornerMirror();C.add(cm,-6.4,-6.4,Math.PI/4);C.sol(-6.4,-6.4,.3,.3);C.feat("角",cm,.5,1);
   const pk=new THREE.Group();pk.add(plane(9,7,"#6b6e78",0,0,.19));for(let i=0;i<4;i++)pk.add(plane(.12,3,"#f4f1e8",-3+i*2,-1.5,.2));const ps=sign("P","駐車場",{w:1.6,h:1.6,border:"#3d6fd6"});ps.position.set(4,2.4,3);pk.add(ps);pk.add(cyl(.06,.06,2.4,"#5a5f6b",4,1.2,2.9,6));
   [["#e5484d",-2],["#f7f4ee",0],["#3d6fd6",2]].forEach(([c,x])=>{const car=car3(c);car.position.set(x,0,-1.5);pk.add(car)});C.add(pk,-29,31);C.sol(-29,29.5,8,3.6);C.feat("駐車場",ps,.6,1.2);
   const t=clock3(1.3);C.add(t,-30,-31);C.sol(-30,-31,8,5.4);C.feat("建物",t,.6,1.4);
   for(let k=0;k<4;k++){const bt=boat3();C.add(bt,31+((k%2)?1.2:-1.2),-34+k*18,Math.PI/2);bt.position.y=.1}},
  decor(C){C.skyline(22);C.scatter(()=>tree3("green",.9),10,[27,29.4,-36,36],.6,.6,true);C.scatter(()=>tree3("green",.9),8,[34.6,37,-36,36],.6,.6,true);C.houses(10)}},
 station:{jp:"さくら駅前",vn:"Quảng trường trước ga",path:"road",traffic:1,feats:["駅","乗り場","タクシー","電車"],
  layout(C){const g=new THREE.Group();g.add(outline(box(18,7,8,"#efe8da",0,3.5,0),1.01));g.add(box(18.4,.5,8.4,"#3a3f5c",0,7.2,0));for(let i=0;i<6;i++)g.add(box(1.8,2,.06,"#a9d2ee",-7.5+i*3,4.4,4.03));g.add(box(4,2.8,.06,"#5a4a3a",0,1.4,4.03));
   const cl=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({map:canvasTex(128,128,(c)=>{c.fillStyle="#fffaf0";c.beginPath();c.arc(64,64,60,0,TAU);c.fill();c.strokeStyle="#2b2540";c.lineWidth=7;c.beginPath();c.moveTo(64,64);c.lineTo(64,22);c.moveTo(64,64);c.lineTo(94,64);c.stroke()})}));cl.position.set(0,8.6,0);g.add(box(2.2,2.2,.4,"#3a3f5c",0,8.6,-.25));g.add(cl);cl.position.z=.02;
   const s=sign("さくら駅","Ga Sakura",{w:6,h:1.4,border:"#3a3f5c"});s.position.set(0,5.9,4.2);g.add(s);g.add(box(6.3,1.6,.12,"#3a3f5c",0,5.9,4.1));const cn=outline(box(16,.25,3,"#3a3f5c",0,3.6,5.6),1.02);g.add(cn);[-7.5,7.5].forEach(x=>g.add(cyl(.12,.12,3.6,"#5a5f6b",x,1.8,6.9,8)));
   C.add(g,0,-27);C.sol(0,-27,18.4,8.4);C.sol(-7.5,-20.1,.4,.4);C.sol(7.5,-20.1,.4,.4);C.feat("駅",s,.4,1.6);
   const pf=outline(box(70,.6,3,"#c9c3b6",0,.3,-32.6),1.005);C.scene.add(pf);[-1,1].forEach(s2=>{const r=box(160,.12,.14,"#8a8f99",0,.1,-34.6+s2*.7);C.scene.add(r)});for(let x=-79;x<80;x+=1.2)C.scene.add(box(.3,.06,2.2,"#6b5a4a",x,.04,-34.6));C.sol(0,-33.5,74,4);
   const tr=new THREE.Group();for(let k=0;k<3;k++){const c=P3.train();c.rotation.y=Math.PI/2;c.position.x=k*6.3;tr.add(c)}tr.position.set(-60,0,-34.6);tr.userData.keep=1;C.scene.add(tr);C.ticks.push(dt=>{tr.position.x+=dt*9;if(tr.position.x>70)tr.position.x=-90});
   const bs=busStop();C.add(bs,11,6.6,Math.PI);C.sol(12,6.6,3.6,1.4);C.feat("乗り場",bs,1.6,1);
   for(let k=0;k<3;k++){const t=P3.taxi();C.add(t,-13-k*4.2,6.4,Math.PI/2);C.sol(-13-k*4.2,6.4,3.4,1.8);if(!k)C.feat("タクシー",t,.5,1.2)}C.feat("電車",pf,1.2,1.5,1);
   for(let k=0;k<6;k++){C.add(bicycle(["#3d6fd6","#e5484d","#2f9e64","#ffcf4a"][k%4]),24+k*.9,-7.6,Math.PI/2)}C.sol(26.5,-7.6,6,1)},
  decor(C){C.skyline(24);C.lampsPoles();C.houses(6);C.scatter(()=>vending(0,0,["#e5484d","#3d6fd6"][(C.rng()*2)|0]),3,[-36,36,-18,36],1,.9)}},
 shotengai:{jp:"にぎわい商店街",vn:"Phố mua sắm",path:"stone",pw:8,
  layout(C){[-30,-18,18,30].forEach((x,i)=>{const a=arch3(i===1||i===2?"さくら商店街":"");a.scale.y=1.25;C.add(a,x,0,Math.PI/2);C.sol(x,-4.6,.6,.6);C.sol(x,4.6,.6,.6)});
   [-24,-12,12,24].forEach(x=>C.scene.add(lanternString(x-6,x+6,7.2,-3.6,7),lanternString(x-6,x+6,7.2,3.6,7)))},
  decor(C){const SH=[["八百屋","Hàng rau","#2f9e64"],["魚屋","Hàng cá","#3d6fd6"],["パン屋","Tiệm bánh","#c8862a"],["靴屋","Tiệm giày","#5a3a2a"],["服屋","Tiệm quần áo","#e85d8c"],["薬局","Hiệu thuốc","#2f9e64"],["時計屋","Tiệm đồng hồ","#3a3f5c"],["文房具","Văn phòng phẩm","#e5a23a"],["和菓子","Bánh ngọt Nhật","#c2406b"],["喫茶","Quán cà phê","#8a5a44"],["本屋","Hiệu sách","#8a4a3a"],["花屋","Tiệm hoa","#e85d8c"]];
   let k=(C.rng()*12)|0;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz],qi)=>{if(C.usedQ.has(qi))return;[10.5,17.5,24.5,31.5].forEach(ax=>{const x=sx*ax,z=sz*15;if(!C.free(x,z,.3,6.6,5))return;const [n,v,c]=SH[k++%SH.length];
     const o=shop3({wall:["#f3e3cc","#fbe8ef","#eef2e6","#efe2dc"][k%4],awn:c,noren:k%2?c:null,nt:n.slice(0,2),sign:n,sub:v,w:6.4,lantern:k%3===0});C.add(o,x,z,sz>0?Math.PI:0);C.sol(x,z,6.4,5)})});
   for(let x=-34;x<=34;x+=6){if(Math.abs(x)<7)continue;[-4.6,4.6].forEach((z,i)=>{if(C.free(x+2,z,.2,.5,.5)){C.add(nobori(["#c23b2a","#2f9e64","#3d6fd6","#e5a23a"][((x+z)|0)&3],["大売出し","特売","いらっしゃい","セール"][((x/6)|0)&3]),x+2,z,Math.PI/2)}})}
   const cs=["#c23b2a","#3d6fd6","#e5a23a","#2f9e64","#e85d8c"];for(const z of [-7.6,7.6])for(let x=-33;x<=33;x+=4.4){if(Math.abs(x)<8)continue;if(C.free(x,z,.3,3,1.8)){C.add(stall3(cs[((x*7+z)|0)&3]),x,z,z>0?Math.PI:0);C.sol(x,z,2.8,1.6)}}
   C.scatter(()=>bench3(),6,[-34,34,-34,34],.5,1.2);C.scatter(()=>{const g=new THREE.Group();g.add(cyl(.35,.3,.6,"#c9a27a",0,.3,0,10));g.add(outline(sph(.6,"#4f9f60",0,1.1,0,10,8)));return g},10,[-34,34,-34,34],.3,.8);
   C.skyline(18,.6);C.houses(8);C.scatter(()=>bicycle(["#3d6fd6","#e5484d"][(C.rng()*2)|0]),6,[-34,34,-8,8],.5,0)}},
 indoor:{jp:"さくらビル",vn:"Bên trong tòa nhà Sakura",path:"floor",pw:7,indoor:1,sky:["#efe6da","#efe6da","#e9dfd0"],ground:"#e6dccb",feats:["ロビー","地下"],greet:"いらっしゃいませ",
  layout(C){const wall=(w,d,x,z)=>{const m=box(w,5,d,"#f6f0e6",x,2.5,z);outline(m,1.002);C.scene.add(m);C.sol(x,z,w,d)};wall(80,1,0,-39);wall(80,1,0,39);wall(1,80,-39,0);wall(1,80,39,0);
   for(let x=-30;x<=30;x+=10){C.scene.add(box(6,2,.1,"#a9d2ee",x,3,-38.45))}
   [[-8,-31],[8,-31],[-8,31],[8,31],[-31,-8],[31,-8],[-31,8],[31,8]].forEach(([x,z])=>{C.add(outline(box(1.2,5,1.2,"#e3d8c6",0,2.5,0)),x,z);C.sol(x,z,1.2,1.2)});
   const lb=new THREE.Group();[[-2.2,0],[2.2,0]].forEach(([x])=>{const s=new THREE.Group();s.add(outline(box(2.6,.5,1,"#5a6f9a",0,.4,0)));s.add(outline(box(2.6,.8,.3,"#5a6f9a",0,.9,-.4)));s.position.x=x;s.rotation.y=x<0?Math.PI/2:-Math.PI/2;lb.add(s)});lb.add(outline(box(1.6,.4,1,"#a0693e",0,.3,0)));
   const pl=new THREE.Group();pl.add(cyl(.35,.3,.6,"#c9a27a",0,.3,0,10));pl.add(outline(sph(.6,"#4f9f60",0,1.1,0,10,8)));pl.position.set(0,0,-1.8);lb.add(pl);const ls=sign("ロビー","Sảnh",{w:2.4,h:.8,border:"#5a6f9a"});ls.position.set(0,2.6,-1.6);lb.add(ls);lb.add(cyl(.05,.05,2.2,"#5a5f6b",0,1.1,-1.65,6));
   C.add(lb,0,-33);C.sol(0,-33,7,3);C.feat("ロビー",ls,.4,1.1);
   const b1=new THREE.Group();b1.add(stairs3(6,2.4));const bs=sign("B1 地下","Tầng hầm",{w:2.4,h:.8,border:"#3a3f5c"});bs.position.set(0,2.8,.2);b1.add(bs);b1.add(cyl(.05,.05,2.4,"#5a5f6b",1.3,1.2,.2,6));C.add(b1,33,-33,Math.PI/2);C.sol(33,-33.5,3,4);C.feat("地下",bs,.4,1.1)},
  decor(C){C.scatter(()=>{const g=new THREE.Group();g.add(cyl(.35,.3,.6,"#c9a27a",0,.3,0,10));g.add(outline(sph(.6,"#4f9f60",0,1.1,0,10,8)));return g},14,[-37,37,-37,37],.6,.7);
   C.scatter(()=>vending(0,0,["#e5484d","#3d6fd6","#2f9e64"][(C.rng()*3)|0]),3,[-37,37,-37,37],.8,1);C.scatter(()=>bench3(),6,[-36,36,-36,36],.8,1.2)}},
 matsuri:{jp:"お花見まつり",vn:"Lễ hội ngắm hoa",path:"stone",dusk:1,ps:"petal",greet:"こんばんは",feats:["お花見","庭"],q:[0,1,2],
  layout(C){const big=tree3("sakura",2.4);C.add(big,22,27);C.sol(22,27,1.4,1.4);C.feat("お花見",big,.6,1.6);[[17,24],[26,31],[19,32]].forEach(([x,z],i)=>{C.scene.add(plane(3,2.4,["#5f86c9","#e85d8c","#ffcf4a"][i],x,z,.05))});
   const gd=new THREE.Group();gd.add(zenGarden(7,5));const pond=water3(3,2,"#6fb8d8");pond.position.set(-1.8,.07,1);gd.add(pond);gd.add(ishidoro3());gd.children.at(-1).position.set(2.6,0,-1.8);C.add(gd,30,15);C.sol(30,15,7,5);C.feat("庭",gd,1.6,1.2);
   C.ticks.push(fireworks(C.scene))},
  decor(C){for(const x of [-30,-22,-14,14,22,30])C.scene.add(lanternString(x-4,x+4,5,-4.4,5),lanternString(x-4,x+4,5,4.4,5));
   const cs=["#c23b2a","#3d6fd6","#e5a23a","#2f9e64","#e85d8c"];for(const z of [-7.2,7.2])for(let x=-33;x<=33;x+=4.2){if(Math.abs(x)<7)continue;if(C.free(x,z,.3,3,1.8)){C.add(stall3(cs[((x+z)|0)&3]),x,z,z>0?Math.PI:0);C.sol(x,z,2.8,1.6)}}
   C.scatter(()=>tree3("sakura",.9+C.rng()*.4),26,[-37,37,-37,37],.8,.9,true);C.ring(["sakura","green"],40);C.scatter(()=>bench3(),5,[-34,34,-34,34],.6,1.2)}},
 home:{jp:"ひだまり住宅街",vn:"Khu nhà ở Hidamari",path:"road",traffic:1,ps:"leaf",
  layout(C){C.lampsPoles()},
  decor(C){C.houses(18,true);C.scatter(()=>tree3("amber",.8),8,[-36,36,-36,36],.6,.7,true);C.scatter(()=>{const c=zodiac3(3);c.scale.setScalar(.8);return c},3,[-34,34,-34,34],.4,0);
   C.scatter(()=>vending(0,0,"#e5484d"),2,[-34,34,-10,10],.6,.9);C.scatter(()=>bicycle("#3d6fd6"),4,[-34,34,-34,34],.4,0);C.skyline(14,.5)}},
 sakura:{jp:"桜の丘",vn:"Đồi hoa anh đào",path:"dirt",ps:"petal",feats:["山","桜","町"],q:[0,2],
  layout(C){const f=fuji3(0,-150,70,52);C.scene.add(f);C.feat("山",f,2,6,1);const big=tree3("sakura",2.6);C.add(big,24,26);C.sol(24,26,1.6,1.6);C.feat("桜",big,.6,1.6);
   const town=new THREE.Group();[[-4,0],[0,-1],[4,0]].forEach(([x,z],i)=>{const h=house3(["#fff3e0","#f6efe4","#efe6da"][i],["#4a8fd6","#c23b2a","#5d6f86"][i],1.4);h.position.set(x,0,z);town.add(h)});const ts=sign("さくら町","Thị trấn Sakura",{w:3.6,h:1,border:"#c23b2a"});ts.position.set(0,1.8,3.2);town.add(ts);[-1.6,1.6].forEach(x=>town.add(cyl(.06,.06,1.8,"#6b4433",x,.9,3.15,6)));
   C.add(town,20,-24);C.sol(20,-24.5,13,4.4);C.feat("町",ts,.4,1.2)},
  decor(C){C.scatter(()=>tree3("sakura",.9+C.rng()*.5),34,[-37,37,-37,37],.8,.9,true);C.hills("#8fcf7f",14);C.ring(["sakura","green"],44);C.scatter(()=>bench3(),5,[-34,34,-34,34],.6,1.2);C.scatter(()=>ishidoro3(),6,[-34,34,-34,34],.6,.8)}},
 night:{jp:"夜の繁華街",vn:"Phố đêm",path:"road",traffic:1,night:1,greet:"こんばんは",feats:["月","カラオケ","映画","歌舞伎","コンサート","音楽","アニメ","マンガ","ニュース"],
  layout(C){const m=moon3();m.position.set(-40,46,-120);m.userData.billboard=true;C.scene.add(m);C.feat("月",m,1,4,1);
   const kt=tower(16,8,"#3a2f5a",1);const ks=neonSign("カラオケ","#ff5aa8",6,1.6);ks.position.set(0,12,4.06);kt.add(ks);C.add(kt,-31,-32);C.sol(-31,-32,8,8);C.feat("カラオケ",ks,.6,1.6);
   const cn=tower(10,8,"#2b2540",1);const ms=neonSign("映画","#5ad1ff",4,1.4);ms.position.set(0,8.6,4.06);cn.add(ms);const sc=bigScreen("ニュース");sc.position.set(0,4.6,4.2);cn.add(sc);C.add(cn,31,-32);C.sol(31,-32,8,8);C.feat("映画",ms,.6,1.5);C.feat("ニュース",sc,.4,1.5);
   const kb=new THREE.Group();kb.add(outline(box(9,5,7,"#e9dcc5",0,2.5,0),1.01));const kr=roofQuad(6.6,2.4,"#2f2b3a");kr.position.y=6.2;kr.scale.z=.8;kb.add(kr);for(let i=0;i<8;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xff6a4a}));l.scale.y=1.3;l.position.set(-3.8+i*1.1,4.3,3.7);kb.add(l)}
   const kbs=sign("歌舞伎座","Nhà hát Kabuki",{w:4.4,h:1.1,border:"#c23b2a"});kbs.position.set(0,3,3.58);kb.add(kbs);kb.rotation.y=Math.PI;C.add(kb,-31,31,Math.PI);C.sol(-31,31,9,7);C.feat("歌舞伎",kbs,.5,1.4);
   const st=stage3();C.add(st,31,31,Math.PI);C.sol(31,31,8.4,5.4);const ss=neonSign("コンサート","#ffd43b",5,1.2);ss.position.set(0,7.2,-1.9);ss.rotation.y=0;st.add(ss);C.feat("コンサート",ss,.5,1.4);C.feat("音楽",st.children[0],.4,1.3);
   const am=shop3({wall:"#2b2540",awn:"#ff5aa8",sign:"アニメ",sub:"Cửa hàng anime",w:7});C.add(am,-32,12.6,Math.PI);C.sol(-32,12.6,7,5);C.feat("アニメ",am.children.find(c=>c.userData.sign),.5,1.2);
   const mg=shop3({wall:"#3a2f5a",awn:"#5ad1ff",sign:"マンガ",sub:"Hiệu truyện tranh",w:7});C.add(mg,32,12.6,Math.PI);C.sol(32,12.6,7,5);C.feat("マンガ",mg.children.find(c=>c.userData.sign),.5,1.2)},
  decor(C){C.skyline(28,1,1);C.lampsPoles();for(let k=0;k<8;k++){const x=-34+k*9.5;if(Math.abs(x)<6)continue;[-4.5,4.5].forEach(z=>C.scene.add(lanternString(x-3,x+3,4.6,z,4)))}
   const NS=[["居酒屋","#ff6a4a"],["ラーメン","#ffd43b"],["ゲーム","#5ad1ff"],["バー","#c49bff"],["焼き鳥","#ff8a3a"]];let k=0;C.scatter(()=>{const t=tower(6+C.rng()*8,6,["#2b2540","#3a2f5a","#1f2a44"][k%3],1);const [n,c]=NS[k++%NS.length];const s=neonSign(n,c,3.6,1);s.position.set(0,4,3.06);t.add(s);return t},12,[-36,36,-36,36],.8,6.4,false,[6,6]);C.scatter(()=>vending(0,0,["#e5484d","#3d6fd6","#ffcf4a"][(C.rng()*3)|0]),6,[-34,34,-34,34],.4,.9);C.scatter(()=>{const g=new THREE.Group();for(let i=0;i<3;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8),new THREE.MeshBasicMaterial({color:0xff5a4a}));l.scale.y=1.3;l.position.set(i*.8-.8,2.2,0);g.add(l)}g.add(box(2.4,.08,.08,"#2b2540",0,2.6,0));[-1.2,1.2].forEach(x=>g.add(cyl(.05,.05,2.6,"#2b2540",x,1.3,0,6)));return g},6,[-34,34,-34,34],.4,2.4)}},
 zoo:{jp:"どうぶつ公園",vn:"Công viên sở thú",path:"dirt",feats:["公園","パンダ","ぞう","犬","猫","上","下","前","後ろ","右","左","中","外","隣","近く","間"],q:[0,1,2],
  layout(C){const gate=arch3("どうぶつ公園");C.add(gate,0,33);C.sol(-4.6,33,.6,.6);C.sol(4.6,33,.6,.6);C.feat("公園",gate.children.find(c=>c.userData.sign),.5,1.4);
   const pens=[["パンダ",13,15,()=>{const g=new THREE.Group();const p=P3.panda();g.add(p);for(let i=0;i<5;i++){const b=cyl(.08,.08,3,"#6fa34a",-2.5+i*.4,1.5,-3,6);g.add(b)}return g}],["ぞう",27,15,()=>{const g=new THREE.Group();g.add(P3.elephant());const w=water3(3,2,"#7fc4ec");w.position.set(2,.07,-2.6);g.add(w);return g}],
     ["犬",13,29,()=>{const g=new THREE.Group();const d=zodiac3(10);d.scale.setScalar(1.2);g.add(d);const d2=zodiac3(10);d2.scale.setScalar(.9);d2.position.set(1.6,0,1);g.add(d2);const h=house3("#c98a5a","#c23b2a",.6);h.position.set(-2.4,0,-2.4);g.add(h);return g}],
     ["猫",27,29,()=>{const g=new THREE.Group();const c=zodiac3(3);c.scale.setScalar(1.2);g.add(c);const c2=zodiac3(3);c2.scale.setScalar(.9);c2.position.set(-1.4,1.2,-2.4);g.add(c2);g.add(outline(box(1.2,1.2,1.2,"#c9a27a",-1.4,.6,-2.4)));return g}]];
   /* góc học vị trí: chiếc hộp và đồ vật quanh nó */
   const px=-31,pz=31,pg=new THREE.Group();pg.add(plane(9,8,"#e6d3b0",0,0,.03));pg.add(outline(box(2.6,.16,2.6,"#a0693e",0,1.6,0)));[[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]].forEach(([x,z])=>pg.add(box(.14,1.55,.14,"#7a4a2a",x,.78,z)));const ps=sign("どこ？","Ở đâu?",{w:2.2,h:.8,border:"#2f9e64"});ps.position.set(0,2.6,-3.4);pg.add(ps);pg.add(cyl(.05,.05,2.6,"#6b4433",0,1.3,-3.45,6));
   const P={上:[sph(.4,"#e5484d",0,2.08,0,12,10)],下:[sph(.38,"#3d6fd6",.3,.38,.2)],前:[sph(.4,"#ffcf4a",0,.4,2)],後ろ:[sph(.4,"#2f9e64",0,.4,-2)],右:[sph(.4,"#e85d8c",2,.4,0)],左:[sph(.4,"#8f6fd6",-2,.4,0)],中:[sph(.35,"#f5a043",-3.3,1.05,-2.2)],外:[sph(.35,"#5ad1ff",3.4,.35,2.6)],隣:[(()=>{const g=new THREE.Group();[[0,-.65],[0,.65]].forEach(([x,z])=>g.add(box(1.4,1.2,.1,"#d9b07a",x,.6,z)));[[-.65],[.65]].forEach(([x])=>g.add(box(.1,1.2,1.4,"#d9b07a",x,.6,0)));g.position.set(-3.3,0,-2.2);return g})()],近く:[sph(.3,"#ff8a3a",1.6,.3,1.8)],間:[sph(.35,"#c23b2a",-2.1,.35,-1.1)]};
   Object.entries(P).forEach(([w,[m]])=>{if(m.isMesh)outline(m,1.05);pg.add(m);C.feat(w,m,.3,.9)});C.add(pg,px,pz);C.sol(px,pz,2.8,2.8);C.sol(px-3.3,pz-2.2,1.4,1.4);
   pens.forEach(([n,x,z,mk])=>{const f=fenceRect(9,9,"#a0693e");C.add(f,x,z);C.sol(x,z,9.4,9.4);C.reserve(x,z-5.6,4,2.6);const a=mk();C.add(a,x,z,Math.PI);a.rotation.y=C.rng()*1.2-.6;
     const s=sign(n,{パンダ:"Gấu trúc",ぞう:"Voi",犬:"Chó",猫:"Mèo"}[n],{w:2,h:.8,border:"#2f9e64"});s.position.set(0,1.6,-4.65);s.rotation.y=Math.PI;const sp=new THREE.Group();sp.add(s);sp.add(cyl(.05,.05,1.6,"#6b4433",0,.8,-4.6,6));sp.position.set(x,0,z);C.scene.add(sp);
     C.feat(n,a.children[0],.5,1.3);const st=C.ticks;st.push(dt=>{const u=a.children[0].userData;if(u&&u.body)animZ(a.children[0],dt,"walk",false)})})},
  decor(C){C.scatter(()=>tree3("green",.9+C.rng()*.4),22,[-37,37,-37,37],.8,.9,true);C.ring(["green"],38);C.scatter(()=>bench3(),6,[-34,34,-34,34],.6,1.2);C.scatter(()=>hyd3("#ff8fab","#ffd43b"),10,[-34,34,-34,34],.4,.6);
   const bal=new THREE.Group();["#e5484d","#3d6fd6","#ffcf4a","#2f9e64"].forEach((c,i)=>{bal.add(sph(.35,c,(i-1.5)*.4,3+i%2*.4,0,10,8));bal.add(cyl(.01,.01,2.6,"#2b2540",(i-1.5)*.2,1.6,0,4))});C.scatter(()=>bal.clone(),2,[-20,20,-20,20],.4,0)}},
 beach:{jp:"青空ビーチ",vn:"Bãi biển trời xanh",path:"sand",feats:["海","山","紅葉","祭り"],q:[2,3],ground:"#a9d69a",
  layout(C){C.scene.add(plane(300,38,"#ecd9a6",0,-21,.015));const sea=water3(300,140,"#3fa0d8");sea.position.set(0,.07,-88);C.scene.add(sea);C.sol(0,-60,200,84);
   const foam=plane(300,.8,"#ffffff",0,-18.2,.08);C.scene.add(foam);C.ticks.push(()=>{foam.position.z=-18.2+Math.sin(performance.now()/900)*.5});const anchor=C.anchor(0,1.4,-22);C.feat("海",anchor,0,1.5);
   const f=fuji3(-110,120,60,44);C.scene.add(f);C.feat("山",f,2,6,1);
   const mj=new THREE.Group();[[0,0],[2.4,1.4],[-2.2,1.6]].forEach(([x,z],i)=>{const t=tree3("momiji",1.2-i*.15);t.position.set(x,0,z);mj.add(t)});C.add(mj,-30,-13);C.sol(-30,-12.5,6,3.6);C.feat("紅葉",mj.children[0],.5,1.3);
   const y=yagura3();C.add(y,30,-12);C.sol(30,-12,4.4,4.4);C.feat("祭り",y,.5,1.3);
   for(let k=0;k<4;k++){const b=boat3();b.scale.setScalar(1.4);b.position.set(-40+k*26,.1,-32-k*6);C.scene.add(b);C.ticks.push(()=>{b.position.y=.1+Math.sin(performance.now()/700+k)*.12;b.rotation.z=Math.sin(performance.now()/900+k)*.05})}
   const lh=new THREE.Group();lh.add(outline(cyl(1,1.4,9,"#ffffff",0,4.5,0,14)));[2,5,8].forEach(yy=>lh.add(cyl(1.05,1.25,1,"#e5484d",0,yy,0,14)));lh.add(cyl(.8,.8,1,"#ffe27a",0,9.5,0,14));lh.add(roofQuad(1.2,1,"#e5484d"));lh.children.at(-1).position.y=10.5;lh.position.set(46,0,-26);C.scene.add(lh)},
  decor(C){const PC=["#e5484d","#3d6fd6","#ffcf4a","#2f9e64","#e85d8c"];C.scatter(()=>{const g=new THREE.Group();g.add(cyl(.04,.04,2.4,"#f6f4f0",0,1.2,0,6));const c=outline(new THREE.Mesh(new THREE.ConeGeometry(1.4,.6,12,1,true),M(PC[(C.rng()*5)|0],{side:THREE.DoubleSide})),1.03);c.position.y=2.5;g.add(c);g.add(plane(1,1.8,PC[(C.rng()*5)|0],.8,0,.03));return g},10,[-36,36,-17,-5],.4,3);
   C.scatter(()=>{const s=shop3({wall:"#f6efe4",awn:"#3d6fd6",sign:"海の家",sub:"Quán bãi biển",w:6,h:3.4});return s},2,[-34,34,-16,-11],.6,6.2,false,[6,5]);
   C.scatter(()=>tree3("pine",1),16,[-37,37,6,37],.8,.9,true);C.ring(["pine","green"],38,[.2,2.94],1);C.scatter(()=>P3.ball(),3,[-34,34,-16,-5],.3,0)}},
 forest:{jp:"森と川",vn:"Rừng và suối",path:"dirt",ground:"#7fbf6f",ps:"leaf",feats:["川","釣り"],q:[2,3],
  layout(C){const r=C.water(200,5,0,-14.5,"#4fa6d4");C.sol(-52,-14.5,99,5.2);C.sol(52,-14.5,99,5.2);const b=bridge3(6.6,4,"#8a5a3a",.18);C.add(b,0,-14.5,Math.PI/2);C.feat("川",C.anchor(-12,1.6,-14.5),0,1.4);
   const dk=new THREE.Group();dk.add(box(2.4,.2,4,"#a0693e",0,.45,0));[[-1,-1.6],[1,-1.6],[-1,1.6],[1,1.6]].forEach(([x,z])=>dk.add(cyl(.1,.1,1,"#6b4433",x,.1,z,6)));const rod=cyl(.03,.03,3.4,"#5a3a2a",.6,1.6,-1.6,6);rod.rotation.x=-.9;dk.add(rod);dk.add(outline(cyl(.3,.25,.4,"#5f86c9",-.6,.75,.6,10)));
   const st=sign("釣り","Câu cá",{w:1.6,h:.7,border:"#2f9e64"});st.position.set(-.9,1.6,1.9);dk.add(st);dk.add(cyl(.04,.04,1.6,"#6b4433",-.9,.9,1.85,6));C.add(dk,22,-12.6);C.sol(22,-12.6,.1,.1);C.feat("釣り",st,.4,1.1);
   for(let k=0;k<5;k++){let rx=-30+k*14+C.rng()*3;if(Math.abs(rx)<4)rx+=6;const rk=rock3(.7+C.rng()*.5,"#8f897e");rk.position.set(rx,.1,-14.5+(C.rng()-.5)*3);C.scene.add(rk)}
   const ws=new THREE.Group();ws.add(mound(9,8,"#8f897e"));const fall=new THREE.Mesh(new THREE.PlaneGeometry(3,8),new THREE.MeshBasicMaterial({color:0xcfeefc,transparent:true,opacity:.85}));fall.position.set(0,4,8.6);ws.add(fall);ws.position.set(-60,0,-24);C.scene.add(ws)},
  decor(C){C.scatter(()=>tree3(C.rng()<.5?"pine":"green",1+C.rng()*.6),40,[-37,37,-37,-18],.6,.9,true);C.scatter(()=>tree3(C.rng()<.4?"pine":"green",.9+C.rng()*.5),44,[-37,37,-11,37],.7,.9,true);C.ring(["pine","green"],70);C.bushes(40);
   C.scatter(()=>cabin3(),2,[-34,34,8,34],.8,5.4,false,[5.4,4.4]);C.scatter(()=>tent3(["#e5a23a","#3d6fd6"][(C.rng()*2)|0]),2,[-34,34,6,34],.6,3.4);C.scatter(()=>campfire(C.ticks),1,[-30,30,6,30],.8,1.6);
   C.scatter(()=>{const g=new THREE.Group();g.add(cyl(.06,.08,.3,"#f6f4f0",0,.15,0,8));const c=sph(.22,"#e5484d",0,.32,0,10,8);c.scale.y=.6;g.add(c);return g},14,[-36,36,-36,36],.2,0);C.scatter(()=>rock3(.6+C.rng()*.6),12,[-36,36,-36,36],.4,1)}},
 shrine:{jp:"稲荷の杜",vn:"Khu đền thần Inari",path:"stone",feats:["神社","お寺"],q:[2,3],greet:"こんにちは",ps:"leaf",
  layout(C){const s=shrine3(1.9);C.add(s,0,-29);C.sol(0,-29,11.4,8.6);const sg=sign("稲荷神社","Đền Inari",{w:3,h:.9,border:"#d24a36"});sg.position.set(0,1.9,.06);const sgp=new THREE.Group();sgp.add(sg);[-1.3,1.3].forEach(x=>sgp.add(cyl(.06,.06,2.3,"#6b4433",x,1.15,0,6)));sgp.position.set(5,0,-22.6);C.scene.add(sgp);C.sol(5,-22.6,3,.3);C.feat("神社",s,.6,1.6);
   [-18,-10,24].forEach((z,i)=>{const t=torii3("#d8432f",i===2?1.6:1.3);C.add(t,0,z);const px=1.5*(i===2?1.6:1.3);C.sol(-px,z,.5,.5);C.sol(px,z,.5,.5)});
   const tm=temple3(1.3);C.add(tm,-24,-26);C.sol(-24,-26,9.6,6.6);const pg=pagoda3(1.1);C.add(pg,-33,-31);C.sol(-33,-31,4,4);const ts=sign("お寺","Chùa",{w:2,h:.8,border:"#5a3a2a"});ts.position.set(0,1.6,3.6);const tsg=new THREE.Group();tsg.add(ts);tsg.add(cyl(.05,.05,1.6,"#6b4433",0,.8,3.55,6));tsg.position.set(-24,0,-26);C.scene.add(tsg);C.feat("お寺",tm,.6,1.5);
   [-1.6,1.6].forEach(x=>{C.add(kitsune3(),x*2,-22.6,0);C.sol(x*2,-22.6,.7,.7)})},
  decor(C){for(let z=-20;z<=30;z+=5){if(Math.abs(z)<7)continue;[-4.2,4.2].forEach(x=>{if(C.free(x,z,.2,.9,.9)){C.add(ishidoro3(),x,z);C.sol(x,z,.9,.9)}})}
   const pond=water3(7,5,"#6fb8d8");pond.position.set(26,.07,-26);C.scene.add(pond);C.sol(26,-26,7,5);C.scatter(()=>tree3(C.rng()<.5?"momiji":"green",1+C.rng()*.4),28,[-37,37,-37,37],.8,.9,true);C.ring(["green","momiji","pine"],48);
   C.scatter(()=>bambooFence(5),5,[-34,34,-34,34],.3,0);C.scatter(()=>zenGarden(6,4),1,[-34,34,8,34],.6,6.2,false,[6,4])}},
 kyoto:{jp:"京の夕暮れ",vn:"Phố cổ Kyoto lúc hoàng hôn",path:"stone",dusk:1,greet:"こんばんは",ps:"maple",
  layout(C){const pg=pagoda3(1.6);C.add(pg,0,-31);C.sol(0,-31,6,6);const t=torii3("#d8432f",1.3);C.add(t,0,-22);C.sol(-1.95,-22,.5,.5);C.sol(1.95,-22,.5,.5);
   for(const z of [-13,13])for(let x=-33;x<=33;x+=5.4){if(Math.abs(x)<8)continue;if(C.free(x,z,.2,5,4)){C.add(machiya(),x,z,z>0?Math.PI:0);C.sol(x,z,5,4)}}},
  decor(C){C.scatter(()=>tree3(C.rng()<.6?"momiji":"amber",1+C.rng()*.4),22,[-37,37,-37,37],.8,.9,true);C.ring(["momiji","pine"],44);C.scatter(()=>ishidoro3(),10,[-34,34,-34,34],.5,.9);C.scatter(()=>wagasa3(),4,[-30,30,-30,30],.4,.6);C.scatter(()=>bambooFence(5),4,[-34,34,-34,34],.3,0)}},
 onsen:{jp:"雪の温泉郷",vn:"Làng suối nước nóng trong tuyết",path:"snow",ground:"#f4f7fb",ps:"snow",sky:["#6f96c9","#c9dcf0","#eef4fb"],feats:["お風呂"],q:[0,1],
  layout(C){const pool=new THREE.Group();const w=water3(9,6,"#8fd4e8");w.position.y=.07;pool.add(w);for(let i=0;i<22;i++){const a=i/22*TAU;const r=rock3(.6,"#8f897e");r.position.set(Math.cos(a)*5,.15,Math.sin(a)*3.6);pool.add(r)}
   const ss=sign("ゆ","Suối nước nóng",{w:1.4,h:1.4,border:"#2b3a67",fg:"#2b3a67"});ss.position.set(0,2.2,-3.9);pool.add(ss);pool.add(cyl(.05,.05,2,"#6b4433",0,1,-4,6));
   const mk=zodiac3(8);mk.scale.setScalar(.9);mk.position.set(1.6,-.25,0);pool.add(mk);const mk2=zodiac3(8);mk2.scale.setScalar(.7);mk2.position.set(-1.8,-.25,.8);pool.add(mk2);C.add(pool,22,25);C.sol(22,25,10.4,7.4);C.feat("お風呂",w,2.4,1.4);
   const steam=new THREE.Group();for(let i=0;i<10;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.6,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.35,depthWrite:false}));p.userData.o=Math.random()*5;steam.add(p)}steam.position.set(22,0,25);C.scene.add(steam);
   C.ticks.push(()=>{const t=performance.now()/1000;steam.children.forEach((p,i)=>{const k=(t*.4+p.userData.o)%3;p.position.set(Math.sin(i*2.3)*3,.4+k*1.4,Math.cos(i*1.7)*2);p.material.opacity=.35*(1-k/3);p.scale.setScalar(.6+k*.5)})});
   const ry=gassho3(1.6);C.add(ry,-22,25,Math.PI);C.sol(-22,25,7.4,6.4);const nr=new THREE.Mesh(new THREE.PlaneGeometry(2.2,.9),new THREE.MeshBasicMaterial({map:canvasTex(256,96,(c,W,H)=>{c.fillStyle="#2b3a67";c.fillRect(0,0,W,H);c.fillStyle="#fff";c.font=`700 64px ${JPF}`;c.textAlign="center";c.textBaseline="middle";c.fillText("ゆ",W/2,H/2)}),side:THREE.DoubleSide}));nr.position.set(-22,1.6,22.3);C.scene.add(nr);
   C.scene.add(fuji3(60,-140,70,56))},
  decor(C){C.scatter(()=>tree3("pinesnow",1+C.rng()*.5),36,[-37,37,-37,37],.8,.9,true);C.ring(["pinesnow"],50);C.scatter(()=>snowman3(),3,[-34,34,-34,34],.5,1);C.scatter(()=>ishidoro3(),6,[-34,34,-34,34],.5,.9);
   C.scatter(()=>{const h=house3("#f3ebe0","#5d6f86",1.4,true);return h},5,[-36,36,-36,-8],.8,4.6,false,[4.6,3.8]);C.scatter(()=>bambooFence(5),4,[10,36,14,36],.3,0)}},
 farm:{jp:"ひろびろ牧場",vn:"Nông trại rộng",path:"dirt",feats:["馬","動物"],q:[1,3],
  layout(C){const f=fenceRect(22,14,"#f6f4f0");C.add(f,-20,-22);C.sol(-20,-15,22,.4);C.sol(-20,-29,22,.4);C.sol(-31,-22,.4,14);C.sol(-9,-22,.4,14);
   const hs=[];for(let k=0;k<3;k++){const h=P3.horse();h.position.set(-26+k*6,0,-22+(k%2)*3);h.rotation.y=k;C.scene.add(h);hs.push(h)}C.feat("馬",hs[0],.5,1.3);C.ticks.push(dt=>hs.forEach((h,k)=>{h.rotation.y+=dt*.15*(k%2?1:-1);h.position.x+=Math.sin(h.rotation.y)*dt*.6;h.position.z+=Math.cos(h.rotation.y)*dt*.6;h.position.x=Math.max(-29,Math.min(-11,h.position.x));h.position.z=Math.max(-27.5,Math.min(-16.5,h.position.z));animZ(h,dt,"graze",false)}));
   const p2=fenceRect(20,12,"#c9a27a");C.add(p2,-20,23);C.sol(-20,17,20,.4);C.sol(-20,29,20,.4);C.sol(-30,23,.4,12);C.sol(-10,23,.4,12);const an=[];[[1,-26,22],[7,-21,25],[9,-15,21],[11,-18,26],[7,-24,19]].forEach(([i,x,z])=>{const a=zodiac3(i);a.scale.setScalar(1.2);a.position.set(x,0,z);a.rotation.y=C.rng()*6;C.scene.add(a);an.push(a)});
   const as=sign("動物","Động vật",{w:2,h:.8,border:"#8a5a44"});as.position.set(-20,1.6,16.7);as.rotation.y=Math.PI;C.scene.add(as);C.feat("動物",an[0],.5,1.3);C.ticks.push(dt=>an.forEach((a,k)=>animZ(a,dt,k%2?"peck":"graze",false)));
   const b=barn3();C.add(b,30,-31);C.sol(30,-31,7.4,6.4);const wm=windmill(C.ticks);C.add(wm,-33,-34);C.sol(-33,-34,2.4,2.4)},
  decor(C){C.scatter(()=>hay3(),10,[-36,36,-36,36],.5,1.4);C.scatter(()=>tree3("green",1+C.rng()*.4),16,[-37,37,-37,37],.8,.9,true);C.ring(["green"],40);C.hills("#9fd38f",12);C.scatter(()=>paddy(8,6,"#8fcf6f"),3,[6,36,6,36],.6,8,false,[8,6]);C.scatter(()=>scarecrow(),2,[-34,34,-34,34],.4,.5)}},
 mountain:{jp:"富士山の登山道",vn:"Đường lên núi Phú Sĩ",path:"dirt",ground:"#8fbf7a",feats:["山","相撲"],q:[0,1,2],sky:["#3f78c8","#a3cdf0","#eaf4ff"],
  layout(C){const f=fuji3(0,-120,80,72);C.scene.add(f);C.feat("山",f,2,8,1);const d=dohyo();C.add(d,22,25);C.sol(22,25,6.4,6.4);const ds=sign("相撲","Đấu vật Sumo",{w:2.2,h:.8,border:"#3a3f5c"});ds.position.set(0,1.6,-3.6);ds.rotation.y=Math.PI;const g=new THREE.Group();g.add(ds);g.add(cyl(.05,.05,1.6,"#6b4433",0,.8,-3.55,6));g.position.set(22,0,25);C.scene.add(g);C.feat("相撲",d,.5,1.4);
   const rk=rock3(3,"#8f897e");rk.position.set(30,.6,-31);C.scene.add(rk);C.sol(30,-31,7,4);const tt=torii3("#d8432f",.6);tt.position.set(30,1.6,-31);C.scene.add(tt)},
  decor(C){C.scatter(()=>tree3("pine",1+C.rng()*.6),34,[-37,37,-37,37],.8,.9,true);C.ring(["pine"],52);C.hills("#7fa86a",18);C.scatter(()=>rock3(.8+C.rng()*1.2),18,[-37,37,-37,37],.4,1.6);
   C.scatter(()=>hyd3("#c9a8ff","#ffffff"),10,[-34,34,-34,34],.3,.6);C.scatter(()=>{const g=new THREE.Group();g.add(cyl(.06,.06,1.6,"#6b4433",0,.8,0,6));const a=box(1.2,.35,.06,"#c9a27a",.4,1.4,0);g.add(a);return g},4,[-30,30,-30,30],.4,.4);
   for(let k=0;k<6;k++){const c=kasumi3();c.position.set(-60+k*24,10+C.rng()*6,-50-C.rng()*30);c.scale.setScalar(2);C.scene.add(c)}}},
 village:{jp:"ふるさとの村",vn:"Làng quê",path:"dirt",feats:["田舎"],ps:"leaf",
  layout(C){const g=arch3("ふるさと村");g.children.slice(0,3).forEach(c=>c.material=M("#6b4433"));C.add(g,0,33);C.sol(-4.6,33,.6,.6);C.sol(4.6,33,.6,.6);C.feat("田舎",g.children.find(c=>c.userData.sign),.5,1.4)},
  decor(C){C.scatter(()=>paddy(9,7,C.T.dusk?"#e9b93c":"#7cc472"),8,[-36,36,-36,36],.6,9,false,[9,7]);C.scatter(()=>{const g=gassho3(1.3);g.children.filter(c=>c.geometry&&c.geometry.type==="ExtrudeGeometry"&&c.material.color.getHex()===0xffffff).forEach(c=>g.remove(c));return g},5,[-36,36,-36,36],.8,5.8,false,[5.8,5]);C.scatter(()=>tree3("amber",1),10,[-36,36,-36,36],.8,.8,true);
   C.scatter(()=>scarecrow(),3,[-34,34,-34,34],.4,.5);C.scatter(()=>susuki3(),12,[-36,36,-36,36],.3,0);C.ring(["green","amber","pine"],46);C.hills("#8fbf7a",16);
   const sm=new THREE.Group();sm.add(shrine3(.5));const tt=torii3("#d8432f",.6);tt.position.z=2.6;sm.add(tt);C.scatter(()=>sm,1,[-34,34,-34,34],.8,3.4)}},
};
const LESSON_TH={2:"shotengai",3:"indoor",4:"town",5:"station",6:"matsuri",7:"home",8:"sakura",9:"night",10:"zoo",11:"town",12:"beach",13:"forest",14:"town",15:"shotengai",16:"shrine",17:"onsen",18:"farm",19:"mountain",20:"kyoto",21:"night",22:"home",23:"canal",24:"village",25:"village"};
const themeOf=n=>{const k=LESSON_TH[n]||["town","forest","village","beach","shrine","mountain"][n%6];const T={...TH[k],key:k};if(n===25)T.dusk=1;if(n===11){T.jp="ゆうびん通り";T.vn="Phố bưu điện"}if(n===14){T.jp="まちかど通り";T.vn="Góc phố chỉ đường"}if(n===21){T.jp="アキバの夜";T.vn="Akiba về đêm"}if(n===22){T.jp="アパート通り";T.vn="Phố chung cư"}if(n===15){T.jp="ショッピング通り";T.vn="Phố mua sắm"}if(n===25){T.jp="夕焼けの村";T.vn="Làng quê lúc chiều tà"}return T};

/* chọn từ cho khu vực */
const HOMO=new Set(["かみ","はな","はし","き","は","め","あめ","ひ","かき","くも","あし"]);
const FOCUS={6:/Động từ/,7:/Động từ/,8:/Tính từ/,9:/Tính từ/,10:/Nơi chốn/,12:/Tính từ/,14:/Động từ/,16:/Động từ|Tính từ/,18:/Động từ/,19:/Động từ/,21:/Động từ/,23:/Động từ|Nơi chốn/};
function planLesson(Ld,T,n){
  const words={},places=[],props=[],bigs=[],feats=[],boards=[];const used=new Set();const FT=new Set(T.feats||[]);
  const RANK=g=>/Danh từ|đồ vật/.test(g)?0:/Ăn uống/.test(g)?1:/Phương tiện/.test(g)?1:/Nơi chốn/.test(g)?2:/Tính từ/.test(g)?3:/Động từ/.test(g)?4:/Thời gian/.test(g)?5:/Người/.test(g)?6:7;
  const sp=t=>(t||"").split(/\s*[\/／]\s*/).map(x=>x.trim()).filter(Boolean);
  const items=[];Ld.words.forEach((w,i)=>{const J=sp(w.jp),K=sp(w.kana),V=(w.vi||"").split(/\s+\/\s+/);
    if(J.length>1&&K.length===J.length)J.forEach((jj,q)=>items.push({w:{...w,vi:V.length===J.length?V[q]:w.vi},i:i+"_"+q,k:cleanW(jj),r:cleanW(K[q])}));
    else items.push({w,i,k:cleanW(w.jp),r:cleanW(w.kana)})});
  const ok=items.filter(o=>o.k&&!/[〜～]/.test(o.k)&&!/Câu giao tiếp|Hậu tố|Từ để hỏi/.test(o.w.g||""));
  const disp=(k,r)=>/^[一-龯々]+$/.test(k)&&r&&r!==k?`${k}{${r}}`:k;
  const rest=[];
  ok.forEach(o=>{const {k,r}=o;if(used.has(k))return;const kk=kanaKey(r||k),key="w"+o.i;const kanaOK=!(/[一-龯々]/.test(k)&&HOMO.has(kk));
    const fk=FT.has(k)?k:FT.has("お"+k)?"お"+k:FT.has(k.replace(/^お/,""))?k.replace(/^お/,""):null;
    const st=PLACE[k]||(kanaOK?PLACE[kk]:null),pr=PK[k]||(kanaOK?PK[kk]:null);
    if(fk)feats.push({key,name:fk});
    else if(st&&places.length<(T.q||[0,1,2,3]).length)places.push({key,style:st,label:k});
    else if(pr&&BIGP.has(pr[0])&&bigs.length<6)bigs.push({key,p:pr});
    else if(pr&&!BIGP.has(pr[0])&&props.length<20)props.push({key,p:pr});
    else{rest.push({o,key});return}
    used.add(k);words[key]=[disp(k,r),o.w.vi,"",r||k]});
  /* xoay vòng theo nhóm từ để có cả động từ, tính từ… (ưu tiên nhóm trọng tâm của bài) */
  const F=FOCUS[n],buckets=new Map();rest.forEach(x=>{const g=x.o.w.g||"",b=F&&F.test(g)?-1:RANK(g);if(!buckets.has(b))buckets.set(b,[]);buckets.get(b).push(x)});
  const order=[...buckets.keys()].sort((a,b)=>a-b);let left=true;
  while(left){left=false;for(const b of order){const L=buckets.get(b);for(let t=0;t<(b===-1?2:1)&&L.length;t++){const {o,key}=L.shift();left=true;const {k,r}=o;if(used.has(k))continue;
    const tot=places.length+props.length+bigs.length+feats.length+boards.length;if(tot>=30||boards.length>=20)continue;used.add(k);boards.push({key,label:k,kana:r&&r!==k?r:""});words[key]=[disp(k,r),o.w.vi,"",r||k]}}}
  return {words,places,props,bigs,feats,boards}}
function genNpcs(Ld,T){
  const NAMES=[["はると","Haruto",{skin:"#ffe0c7",hair:"#2b2321",style:"short",top:"#7aa7d8",bottom:"#3a3f52"}],["さくら","Sakura",{skin:"#ffe3cc",hair:"#3b2a26",style:"long",top:"#e9a1b9",bottom:"#4a5a7a",fem:1}],
    ["けんた","Kenta",{skin:"#f6d2b3",hair:"#1f1b24",style:"spiky",top:"#f6f4f0",bottom:"#3a3a44"}],["ゆうな","Yuna",{skin:"#ffe6d2",hair:"#5a3a2a",style:"bun",top:"#ffcf4a",bottom:"#3d6fd6",fem:1}],
    ["そうた","Sōta",{skin:"#f3cfae",hair:"#2a2220",style:"cap",top:"#2f4b8a",bottom:"#2a2d3a",capc:"#2f4b8a"}],["あおい","Aoi",{skin:"#ffe3cc",hair:"#2e231f",style:"long",top:"#9cc9b4",bottom:"#4a4a5a",fem:1,acc:"glasses"}]];
  const JOB={town:["Học sinh","Nhân viên văn phòng","Đầu bếp","Sinh viên","Nhân viên bưu điện","Giáo viên"],shotengai:["Chủ tiệm rau","Khách mua hàng","Chủ tiệm bánh","Sinh viên","Bác bán cá","Cô bán hoa"],indoor:["Nhân viên lễ tân","Nhân viên văn phòng","Đầu bếp nhà ăn","Sinh viên","Bảo vệ","Giáo viên"],
    station:["Hành khách","Nhân viên văn phòng","Tài xế taxi","Sinh viên","Nhân viên nhà ga","Du khách"],forest:["Người đi câu","Người leo núi","Kiểm lâm","Học sinh cắm trại","Bác tiều phu","Nhiếp ảnh gia"],beach:["Nhân viên cứu hộ","Du khách","Chủ quán bãi biển","Sinh viên","Ngư dân","Lướt sóng"],
    farm:["Chủ nông trại","Người chăn ngựa","Bác nông dân","Học sinh","Bác sĩ thú y","Du khách"],onsen:["Chủ lữ quán","Du khách","Đầu bếp","Sinh viên","Nhân viên suối nóng","Bác sĩ"],shrine:["Vu nữ","Khách hành hương","Thầy tu","Học sinh","Người bán bùa","Du khách"]}[T.key]||["Người dân","Du khách","Chủ tiệm","Sinh viên","Nhân viên","Giáo viên"];
  const POS=[[-13,-8.6],[13.5,-8.8],[-13,8.8],[13.5,8.6],[-8.8,-15.5],[8.8,15.5]];
  const pool=Ld.pool.slice(),sents=Ld.sents.length?Ld.sents:[["はじめまして。","Rất vui được gặp bạn."]];const n=Math.max(3,Math.min(6,Math.floor(pool.length/2)));const G=T.greet||"こんにちは";
  const OUT=[["ありがとう！ がんばってね。","Cảm ơn nhé! Cố lên nha."],["いいですね！ またね。","Hay quá! Hẹn gặp lại."],["すごい！ 日本語{にほんご}が 上手{じょうず}ですね。","Giỏi quá! Tiếng Nhật của bạn giỏi thật."]];
  const toStep=q=>{if(!q)return null;const ok=q.opts.find(o=>o[1]),bad=q.opts.filter(o=>!o[1]);if(!ok)return null;
    return q.kind==="gr"?{q:"Chọn từ thích hợp điền vào chỗ trống ＿",qj:q.q,qv:q.vn,full:q.q.replace("＿",ok[0]),o:[[ok[0],q.vn||"",""],...bad.map(b=>[b[0],"",`Chưa hợp với câu này, thử lại nhé.${q.vn?" Gợi ý nghĩa: "+q.vn:""}`])]}
      :{q:`Chọn câu tiếng Nhật có nghĩa: “${q.q}”`,o:[[ok[0],q.q,""],...bad.map(b=>[b[0],"","Câu này mang nghĩa khác, thử lại nhé."])]}};
  const pl=t=>(t||"").replace(/\{[^}]*\}/g,"").replace(/[\s。、！？]/g,"");
  return NAMES.slice(0,n).map(([name,vn,look],i)=>{const mine=[pool[i*2],pool[i*2+1]].filter(Boolean).flatMap(q=>q.kind==="gr"?[pl(q.q.replace("＿",(q.opts.find(o=>o[1])||[""])[0]))]:[pl((q.opts.find(o=>o[1])||[""])[0])]);
    const cands=sents.filter(x=>!mine.some(m=>m&&(pl(x[0]).includes(m)||m.includes(pl(x[0])))));const s=(cands.length?cands:sents)[i%(cands.length||sents.length)];const steps=[{n:`${G}！ ${s[0]}`,v:`Xin chào! ${s[1]}`}];
    [pool[i*2],pool[i*2+1]].map(toStep).filter(Boolean).forEach(st=>steps.push(st));steps.push({n:OUT[i%3][0],v:OUT[i%3][1]});
    return {id:"n"+i,name,vn,job:JOB[i],pos:POS[i],look,learn:[],steps}})}
function genLevel(n,Ld){const T=themeOf(n);const plan=planLesson(Ld,T,n);return {gen:true,T,plan,title:T.jp,sub:`Bài ${n} · ${T.vn}`,words:plan.words,npcs:genNpcs(Ld,T)}}

/* dựng khu vực */
function buildWorld(scene,T,plan,picks,solids,ticks,rng,wopt={}){
  const pw=T.pw||(T.path==="road"?8:6),H=pw/2;
  const add=(o,x,z,r=0,y=0)=>{o.position.set(x,y,z);o.rotation.y=r;scene.add(o);return o};
  const sol=(x,z,w,d)=>solids.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
  const SP=[[-13,-8.6],[13.5,-8.8],[-13,8.8],[13.5,8.6],[-8.8,-15.5],[8.8,15.5],[2,3.5]],RES=[];
  const onPath=(x,z,m=.6)=>Math.abs(x)<H+m||Math.abs(z)<H+m;
  const free=(x,z,p=.8,w=0,d=0,noPath)=>{const hw=w/2+p,hd=d/2+p;if(solids.some(q=>x+hw>q.x0&&x-hw<q.x1&&z+hd>q.z0&&z-hd<q.z1))return false;if(RES.some(q=>x+hw>q.x0&&x-hw<q.x1&&z+hd>q.z0&&z-hd<q.z1))return false;if(SP.some(([a,b])=>Math.abs(a-x)<hw+2.4&&Math.abs(b-z)<hd+2.4))return false;
    if(noPath)return true;if(Math.abs(x)<38&&Math.abs(z)<38&&(Math.abs(x)-w/2<H+p||Math.abs(z)-d/2<H+p))return false;return true};
  const pick=(obj,w,far)=>{obj.traverse(o=>{if(o.isMesh&&!o.userData.isOutline)o.userData.pick=far?{w,far:1}:{w}});picks.push(obj)};
  const feats={},targets=[];
  const reserve=(x,z,w,d)=>RES.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2});
  const C={scene,T,rng,ticks,solids,add,sol,free,onPath,reserve,usedQ:new Set(),
    feat(name,obj,y=.6,sc=1.2,far){feats[name]=[obj,y,sc,far]},
    anchor(x,y,z){const a=new THREE.Object3D();a.position.set(x,y,z);scene.add(a);return a},
    water(w,d,x,z,c){const m=water3(w,d,c);m.position.set(x,.07,z);scene.add(m);return m},
    scatter(make,n,[x0,x1,z0,z1],pad=.6,sz=1,tree=false,fp){let k=0,tries=0;while(k<n&&tries<n*40){tries++;const x=x0+rng()*(x1-x0),z=z0+rng()*(z1-z0);const fw=fp?fp[0]:tree?Math.max(sz,3.2):sz,fd=fp?fp[1]:tree?Math.max(sz,3.2):sz;if(!free(x,z,pad,fw,fd))continue;
      const o=make();add(o,x,z,fp?(z>0?Math.PI:0):rng()*TAU);if(sz>0||fp)sol(x,z,tree?.7:(fp?fp[0]:sz),tree?.7:(fp?fp[1]:sz));k++}},
    ring(kinds,n,arc,s0){if(wopt.noOuter)return;for(let k=0;k<n;k++){const a=arc?arc[0]+rng()*(arc[1]-arc[0]):rng()*TAU,r=42+rng()*26;const t=tree3(kinds[k%kinds.length],(s0||1.2)+rng()*.8);t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(t)}},
    hills(c,n){if(wopt.noOuter)return;for(let k=0;k<n;k++){const a=k/n*TAU+rng()*.3,r=62+rng()*30;const m=mound(10+rng()*14,5+rng()*8,c);m.position.set(Math.cos(a)*r,0,Math.sin(a)*r);scene.add(m)}},
    skyline(n,hk=1,lit=0){if(wopt.noOuter)return;for(let k=0;k<n;k++){const a=k/n*TAU,r=56+rng()*16,h=(10+rng()*22)*hk,w=5+rng()*5;const t=tower(h,w,lit?["#2b2540","#3a2f5a","#1f2a44"][k%3]:["#9fb0c8","#b3bfd1","#a8b4c4","#c3cad6"][k%4],lit);t.position.set(Math.cos(a)*r,0,Math.sin(a)*r);t.lookAt(0,0,0);t.traverse(o=>o.castShadow=false);scene.add(t)}},
    houses(n,walls){const HC=[["#f6efe4","#5d6f86"],["#efe6da","#8a4a3a"],["#f3ebe0","#3a3f5c"],["#f6efe4","#6b5a8f"],["#fbe8ef","#c23b2a"]];C.scatter(()=>{const [c,r]=HC[(rng()*HC.length)|0];const h=house3b(c,r);if(walls){const w=blockWall(6);w.position.z=3.6;h.add(w)}return h},n,[-37,37,-37,37],.6,6,false,[6,walls?7.4:5])},
    bushes(n,c){const P=["#3f9d62","#5cb87c","#4f8f4a"];C.scatter(()=>{const g=new THREE.Group();const k=2+((rng()*3)|0);for(let i=0;i<k;i++)g.add(outline(sph(.45+rng()*.35,c||P[i%3],(i-k/2)*.5,.35,(rng()-.5)*.5,10,8),1.04));return g},n,[-37,37,-37,37],.3,1.6)},
    tufts(n,c="#6fae5a"){const pts=[];for(let i=0;i<n;i++){const x=(rng()-.5)*76,z=(rng()-.5)*76;if(onPath(x,z,.3)||solids.some(q=>x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1))continue;pts.push([x,0,z,rng()*TAU,.6+rng()*.8])}const geo=new THREE.ConeGeometry(.08,.45,4);geo.translate(0,.22,0);instScatter(scene,geo,M(c),pts,1)},
    lampsPoles(){[-30,-18,18,30].forEach(v=>{[[v,-H-.9],[v,H+.9],[-H-.9,v],[H+.9,v]].forEach(([x,z])=>{if(!free(x,z,0,.3,.3)&&solids.some(q=>x>q.x0&&x<q.x1&&z>q.z0&&z<q.z1))return;const l=lamp(x,z);if(z<0||x<0)l.rotation.y=Math.PI;scene.add(l);sol(x,z,.3,.3)})})}};
  /* nền */
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(320,320),M(T.ground||(T.path==="floor"?"#e6dccb":T.path==="snow"?"#f4f7fb":"#a9d69a")));gnd.rotation.x=-Math.PI/2;gnd.receiveShadow=true;gnd.userData.ground=true;scene.add(gnd);
  if(T.path==="floor"){const ft=stoneTex("#efe6d6","#d9cdb8");ft.repeat.set(40,40);const f=plane(80,80,null,0,0,.01,M("#ffffff",{map:ft}));f.material=new THREE.MeshToonMaterial({map:ft,gradientMap:toonGrad()});scene.add(f)}
  const PC={road:"#5c5f6b",stone:"#cdc4b4",dirt:"#c9ad84",sand:"#c9a27a",floor:"#b8463c",snow:"#dcd6cc"}[T.path];
  if(T.path!=="floor")[[80,pw,0,0],[pw,80,0,0]].forEach(([w,d],ii)=>{let mat=null;if(T.path==="stone"){const t=stoneTex("#d9d1c2","#b8ae9c");t.repeat.set(w/3,d/3);mat=new THREE.MeshToonMaterial({map:t,gradientMap:toonGrad()})}scene.add(plane(w,d,PC,0,0,.02+ii*.004,mat))});
  if(T.path==="road"){for(let i=-38;i<=38;i+=4){if(Math.abs(i)<8)continue;scene.add(plane(1.6,.18,"#f4f1e8",i,0,.03),plane(.18,1.6,"#f4f1e8",0,i,.03))}
    for(let i=0;i<6;i++)[[-3+i*1.2,-5.4,.7,2.2],[-3+i*1.2,5.4,.7,2.2],[-5.4,-3+i*1.2,2.2,.7],[5.4,-3+i*1.2,2.2,.7]].forEach(([x,z,w,d])=>scene.add(plane(w,d,"#f4f1e8",x,z,.03)));
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const s=new THREE.Mesh(new THREE.BoxGeometry(32,.16,32),M("#e9e1d2"));s.position.set(sx*21,.08,sz*21);s.receiveShadow=true;s.userData.ground=true;scene.add(s);scene.add(plane(28,28,"#dcd2bf",sx*21,sz*21,.17))})}
  if(T.path==="floor")[[78,3.6],[3.6,78]].forEach(([w,d])=>{scene.add(plane(w,d,"#d9b45a",0,0,.02),plane(w>d?w:2.9,w>d?2.9:d,"#a8463e",0,0,.025))});
  /* bố cục chính của chủ đề */
  if(T.layout)T.layout(C);if(T.key==="town")C.lampsPoles();
  /* công trình theo từ */
  const Q=[[-20,-24,0],[19,-23,0],[-20,21,Math.PI],[20,22,Math.PI]],QS=T.q||[0,1,2,3];
  plan.places.forEach((pl,i)=>{const qi=QS[i];if(qi==null){delete plan.words[pl.key];return}C.usedQ.add(qi);const [x,z,r]=Q[qi];const vi=(plan.words[pl.key]||[])[1]||"";const sub=vi.length>24?vi.slice(0,22)+"…":vi;
    if(T.indoor){const kind=pl.style==="hotel"||pl.style==="apartment"?"home":pl.style;const R=room3(kind,pl.label,sub);add(R.g,x,z,r);reserve(x,z,14,10);pick(R.g,pl.key);R.walls.forEach(([wx,wz,ww,wd])=>{const c=Math.cos(r),s=Math.sin(r);const X=x+wx*c+wz*s,Z=z-wx*s+wz*c;const rw=Math.abs(c)>.5?ww:wd,rd=Math.abs(c)>.5?wd:ww;sol(X,Z,rw,rd)});
      const a=new THREE.Object3D();a.position.set(x+(r?3.8:-3.8),3.9,z+(r?-4.7:4.7));scene.add(a);targets.push([pl.key,a,.3,1.2]);return}
    const b=placeBuilding(pl.style,pl.label,sub,i);add(b.g,x,z,r);pick(b.g,pl.key);sol(x,z,(b.solidW||b.w)+.4,(b.solidD||b.d)+.6);reserve(x,z+(r?-1:1)*(b.d/2+2.6),Math.min(b.w,9),4.4);
    targets.push([pl.key,b.g,.9,1.8])});
  /* đồ vật */
  const stand=()=>{if(T.path==="floor"||T.key==="home")return stallTable();if(["forest","mountain","farm","village","onsen","zoo","sakura"].includes(T.key)){const g=new THREE.Group();g.add(outline(cyl(.75,.85,.8,"#8a5a3a",0,.4,0,14)));g.add(cyl(.7,.7,.02,"#d9b07a",0,.81,0,14));return g}
    if(T.key==="beach"){const g=new THREE.Group();g.add(outline(box(1.4,.8,1,"#c9a27a",0,.4,0)));g.add(box(1.42,.06,1.02,"#a0804e",0,.6,0));return g}return stallTable()};
  const slots=[];[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{for(let k=0;k<6;k++)slots.push([sx*(H+5.6+k*4.3),sz*(H+6.2),sz>0?Math.PI:0]);for(let k=1;k<4;k++)slots.push([sx*(H+6.2),sz*(H+5.6+k*4.3+2),sx>0?-Math.PI/2:Math.PI/2])});
  const fs=slots.filter(([x,z])=>free(x,z,.5,1.6,1.2)).sort((a,b)=>Math.hypot(a[0],a[1])-Math.hypot(b[0],b[1]));
  plan.props.forEach((pp,i)=>{const s=fs.find(q=>free(q[0],q[1],.5,1.6,1.2));if(!s){delete plan.words[pp.key];return}const fl=FLOOR.has(pp.p[0]);const p=P3[pp.p[0]](pp.p[1]);let base=0;
    if(!fl){const t=stand();add(t,s[0],s[1],s[2]);t.traverse(o=>{if(o.isMesh)o.userData.pick={w:pp.key}});base=.82}
    p.position.set(s[0],base,s[1]);p.rotation.y=s[2]+(fl?0:(rng()-.5)*.5);scene.add(p);pick(p,pp.key);sol(s[0],s[1],1.6,1.1);targets.push([pp.key,p,.5,1])});
  const BS=[];for(const d of [14,21,28,34])for(const s of [-1,1]){BS.push([s*(H+3),d*s,s>0?0:Math.PI],[s*(H+3),-d*s,s>0?0:Math.PI]);BS.push([d*s,s*(H+3),s>0?Math.PI/2:-Math.PI/2])}
  plan.bigs.forEach(v=>{const t=v.p[0];const o=P3[t](v.p[1]);const bx=new THREE.Box3().setFromObject(o),sz=bx.getSize(new THREE.Vector3());const sc=t==="plane"?.7:t==="train"?.8:1;o.scale.setScalar(sc);
    const s=BS.find(([x,z,r])=>{const rot=Math.abs(Math.sin(r))>.5;return free(x+(x>0?1:-1)*0,z,.4,(rot?sz.z:sz.x)*sc,(rot?sz.x:sz.z)*sc)});if(!s){delete plan.words[v.key];return}const rot=Math.abs(Math.sin(s[2]))>.5;add(o,s[0],s[1],s[2]);pick(o,v.key);sol(s[0],s[1],(rot?sz.z:sz.x)*sc,(rot?sz.x:sz.z)*sc);targets.push([v.key,o,.4,1.2])});
  const bs=[[-(H+5.6),-(H+7.5)],[(H+5.6),-(H+7.5)],[-(H+5.6),(H+7.5)],[(H+5.6),(H+7.5)],[-28,-16],[28,-16],[-28,16],[28,16],[-15,-30],[15,-30],[-15,30],[15,30],[-30,-30],[30,30],[-30,30],[30,-30],[-34,-8],[34,-8],[-34,8],[34,8],[-8,-34],[8,-34],[-8,34],[8,34],[-22,-12],[22,-12],[-22,12],[22,12]];
  plan.boards.forEach(bd=>{const s=bs.find(([x,z])=>{if(!free(x,z,.6,1.4,.6))return false;const L=Math.hypot(x,z),ux=-x/L,uz=-z/L;return free(x+ux*2.2,z+uz*2.2,.2,1.6,1.6,true)});if(!s){delete plan.words[bd.key];return}{const L=Math.hypot(s[0],s[1]);reserve(s[0]-s[0]/L*2.6,s[1]-s[1]/L*2.6,3.4,3.4)}const k=kanban(bd.label,bd.kana);add(k,s[0],s[1],Math.atan2(-s[0],-s[1]));pick(k,bd.key);sol(s[0],s[1],1.4,.6);targets.push([bd.key,k,.3,1])});
  /* từ gắn với cảnh vật */
  scene.updateMatrixWorld(true);Object.values(feats).forEach(([o,,,far])=>{if(far)return;const v=o.getWorldPosition(new THREE.Vector3());if(Math.abs(v.x)<40&&Math.abs(v.z)<40)reserve(v.x,v.z,4,4)});
  plan.feats.forEach(f=>{const F=feats[f.name];if(!F){delete plan.words[f.key];return}const [o,y,sc,far]=F;pick(o,f.key,far);targets.push([f.key,o,y,sc])});
  /* làm đầy */
  if(T.decor)T.decor(C);
  if(T.path!=="road"&&!["indoor","onsen"].includes(T.key))C.tufts(T.key==="beach"?260:800,T.key==="beach"?"#7fae5a":"#5f9f4e");
  if(T.key!=="indoor"){const cl=[];for(let k=0;k<6;k++){const c=kasumi3();c.position.set((rng()-.5)*120,30+rng()*10,-40-rng()*50);c.scale.setScalar(1.2+rng()*.8);if(T.night)c.visible=false;scene.add(c);cl.push(c)}
    const bd=[];if(!T.night)for(let k=0;k<5;k++){const b=bird3();scene.add(b);bd.push(b)}
    ticks.push(dt=>{cl.forEach((c,i)=>{c.position.x+=dt*(.6+i*.1);if(c.position.x>70)c.position.x=-70});const t=performance.now()/1000;bd.forEach((b,i)=>{const a=t*.25+i*1.3;b.position.set(Math.cos(a)*(18+i*2),18+i,Math.sin(a)*(14+i));b.rotation.y=-a;b.children.forEach((w,j)=>w.rotation.z=(j?1:-1)*(.35+Math.sin(t*9+i)*.4))})})}
  return {targets,free}}
