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
 {id:"mori",name:"もり",vn:"Mori",job:"Nhà nghiên cứu",pos:[-6.4,-21],look:{skin:"#ffe3cc",hair:"#1f1b24",style:"bun",top:"#8fb3d9",bottom:"#4a5a7a",acc:"coat",fem:1,eye:"#3a2a40"},learn:["kenkyuusha"],steps:[
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
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t}));return m}
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
function makeChar(o){
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
function badge(kind){const t=canvasTex(128,128,(g,W,H)=>{g.fillStyle=kind==="done"?"#2f9e64":"#c23b2a";g.beginPath();g.arc(64,58,46,0,TAU);g.fill();g.beginPath();g.moveTo(52,96);g.lineTo(64,122);g.lineTo(76,96);g.fill();
  g.fillStyle="#fff";g.textAlign="center";g.textBaseline="middle";g.font=`800 64px ${VNF}`;g.fillText(kind==="done"?"✓":"!",64,60)});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.scale.set(.7,.7,1);s.renderOrder=10;return s}

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
  const us=sign("さくら大学","Đại học Sakura",{w:6,h:1.5});us.position.set(0,5.2,4.06);uni.add(us);
  uni.position.set(-20,0,-24);scene.add(uni);pick(uni,{w:"daigaku"});solid(-20,-24,17.6,8.6);
  const gate=new THREE.Group();[-3,3].forEach(x=>gate.add(box(.9,3,.9,"#b8ad9c",x,1.5,0)));const gs=sign("大学","",{w:2.2,h:.9,border:"#8a4a3a"});gs.position.set(-3,2.4,.47);gate.add(gs);gate.position.set(-20,0,-13.6);scene.add(gate);pick(gate,{w:"daigaku"});solid(-23,-13.6,1,1);solid(-17,-13.6,1,1);
  /* phòng nghiên cứu */
  const lab=new THREE.Group();lab.add(box(7,4,6,"#dfe8ee",0,2,0));lab.add(box(7.4,.4,6.4,"#5d6f86",0,4.2,0));for(let i=0;i<3;i++)lab.add(box(1.4,1.2,.1,"#9cc6e8",-2.2+i*2.2,2.6,3.02));const ls=sign("研究所","Phòng nghiên cứu",{w:3.6,h:1.1,border:"#5d6f86"});ls.position.set(0,1.1,3.06);lab.add(ls);lab.position.set(-7,0,-27);scene.add(lab);solid(-7,-27,7.4,6.4);
  /* Bệnh viện Yamada */
  const hos=new THREE.Group();hos.add(box(14,9,9,"#fbfbf8",0,4.5,0));hos.add(box(14.4,.5,9.4,"#9fb6c9",0,9.2,0));
  for(let r=0;r<3;r++)for(let i=0;i<5;i++)hos.add(box(1.4,1.1,.1,"#a9d2ee",-5.2+i*2.6,2.2+r*2.5,4.52));
  const cross=new THREE.Group();cross.add(box(.7,2,.2,"#2f9e64"));cross.add(box(2,.7,.2,"#2f9e64"));cross.position.set(0,10.8,0);hos.add(cross);
  const hsg=sign("やまだ病院","Bệnh viện Yamada",{w:6,h:1.5,border:"#2f9e64"});hsg.position.set(0,8.1,4.56);hos.add(hsg);
  hos.add(box(4,3,1.6,"#e3eef7",0,1.5,5.2));hos.position.set(19,0,-22);scene.add(hos);pick(hos,{w:"byouin"});solid(19,-22,14.4,12.6);
  /* ngân hàng & công ty */
  const bank=new THREE.Group();bank.add(box(12,5,8,"#e8e2d6",0,2.5,0));bank.add(new THREE.Mesh(new THREE.CylinderGeometry(0,7.4,1.8,4),M("#8f897e")));bank.children.at(-1).position.set(0,5.9,0);bank.children.at(-1).rotation.y=Math.PI/4;bank.children.at(-1).scale.z=.75;
  for(let i=0;i<5;i++)bank.add(cyl(.35,.38,4.4,"#f6f2ea",-4.4+i*2.2,2.2,4.4,12));
  const bs=sign("さくら銀行","Ngân hàng Sakura",{w:5,h:1.2,border:"#3d6fd6"});bs.position.set(0,4.4,4.06);bank.add(bs);bank.position.set(-22,0,16);scene.add(bank);solid(-22,16.4,12,9);
  const off=new THREE.Group();off.add(box(8,18,8,"#7fa8d8",0,9,0));for(let r=0;r<8;r++)off.add(box(8.05,.25,8.05,"#e8eef6",0,2+r*2.1,0));off.add(box(8.4,.6,8.4,"#5d6f86",0,18.3,0));
  const os=sign("ABC","Công ty ABC",{w:3.4,h:1.4,border:"#2b2540"});os.position.set(0,3,4.06);off.add(os);off.position.set(-10,0,27);scene.add(off);solid(-10,27,8.4,8.4);
  scene.add(vending(-14.5,10.2,"#e5484d"),vending(-13.3,10.2,"#3d6fd6"));solid(-13.9,10.2,2.4,.8);
  /* Quảng trường quốc tế */
  const fount=new THREE.Group();fount.add(cyl(3,3.2,.6,"#cfc6b6",0,.3,0,24));const wtr=new THREE.Mesh(new THREE.CylinderGeometry(2.6,2.6,.1,24),new THREE.MeshToonMaterial({color:0x7fc4ec,gradientMap:toonGrad()}));wtr.position.y=.58;fount.add(wtr);fount.add(cyl(.3,.4,1.6,"#cfc6b6",0,1,0,12));fount.add(sph(.5,"#9fd6f4",0,1.9,0,12,10));
  fount.position.set(21,0,22);scene.add(fount);solid(21,22,6.2,6.2);
  const ps=sign("国際広場","Quảng trường quốc tế",{w:4.4,h:1.2,border:"#c23b2a"});ps.position.set(21,1.2,13.2);scene.add(ps);
  FLAGS.forEach((k,i)=>{const a=Math.PI*(.05+i*.9/11)+Math.PI,R=9,x=21+Math.cos(a)*R*-1,z=22+Math.sin(a)*R*-1;const g=new THREE.Group();g.add(cyl(.06,.07,4.2,"#c9c3b6",0,2.1,0,8));g.add(sph(.1,"#e0a62a",0,4.25,0,8,6));
    const f=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1),new THREE.MeshBasicMaterial({map:flagTex(k),side:THREE.DoubleSide}));f.position.set(.78,3.55,0);g.add(f);g.userData.flag=f;g.position.set(x,0,z);g.rotation.y=-a+Math.PI;scene.add(g);pick(g,{w:k});solid(x,z,.5,.5)});
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
  const J=n=>m.getObjectByName(n)||new THREE.Group();root.scale.setScalar(1.3);root.userData={body:m,legL:J("legL"),legR:J("legR"),armL:J("armL"),armR:J("armR"),head:J("head"),t:0};return root}
const makePlayer=av=>av.model!==false&&TAI_GLB?makeTai():makeChar(av);
/* ---------------- game ---------------- */
export async function start(root,n,api){
  const L=LEVELS[n];if(!L)throw new Error("no level");
  if(!document.getElementById("g3css")){const st=document.createElement("style");st.id="g3css";st.textContent=CSS;document.head.appendChild(st)}
  const esc=api.esc, R=t=>api.rb(t), plain=t=>api.plainOf(t), roma=t=>api.roma(api.kanaOf(t));
  const KEY="g3-"+n; let prog={npc:[],words:[]};try{prog={...prog,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(prog))}catch(e){}};
  let av={...TAI};try{av={...av,...JSON.parse(localStorage.getItem("g3-avatar")||"{}")}}catch(e){}
  root.className="g3";root.innerHTML=`<div class="g3-load" id="g3Load">Đang dựng khu phố ${esc(L.title)}…</div>`;
  try{await Promise.race([document.fonts.load(`700 40px "Kaisei Decol"`),new Promise(r=>setTimeout(r,1500))])}catch(e){}
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
  const mobile=matchMedia("(pointer:coarse)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.6:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  root.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute("aria-label",`Khu phố 3D ${L.sub}`);
  const scene=new THREE.Scene();
  scene.background=canvasTex(4,256,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,"#4f7fbf");gr.addColorStop(.45,"#a9d3f0");gr.addColorStop(1,"#ffe9e0");g.fillStyle=gr;g.fillRect(0,0,W,H)});
  scene.fog=new THREE.Fog(0xdfeef7,45,110);
  scene.add(new THREE.HemisphereLight(0xffffff,0xb9d4a8,1.25));
  const sun=new THREE.DirectionalLight(0xfff3dd,1.5);sun.position.set(18,30,14);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
  Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:80});sun.shadow.bias=-.0005;scene.add(sun,sun.target);
  const camera=new THREE.PerspectiveCamera(45,1,.1,300);
  const picks=[],solids=[];buildCity(scene,L.words,picks,solids);
  /* nhân vật */
  await loadTai();let player=makePlayer(av);player.position.set(2,0,3.5);scene.add(player);
  const npcs=L.npcs.map(d=>{const c=makeChar(d.look.style?{...d.look,kid:d.kid}:d.look);c.position.set(d.pos[0],0,d.pos[1]);c.rotation.y=Math.atan2(-d.pos[0],-d.pos[1])*.5;scene.add(c);
    const b=badge(prog.npc.includes(d.id)?"done":"talk");b.position.y=2.3;c.add(b);c.userData.badge=b;c.traverse(o=>{if(o.isMesh)o.userData.pick={npc:d.id}});picks.push(c);solids.push({x0:d.pos[0]-.4,x1:d.pos[0]+.4,z0:d.pos[1]-.4,z1:d.pos[1]+.4,npc:d.id});return {d,c}});
  const extra=makeChar({skin:"#f3cfae",hair:"#5a4038",style:"bun",top:"#9cc9b4",bottom:"#3d6f8f",acc:"coat",fem:1});extra.position.set(21.5,0,-12.2);scene.add(extra);
  /* HUD */
  const tot=Object.keys(L.words).length;
  root.insertAdjacentHTML("beforeend",`
    <div class="g3-top"><button class="g3-btn" id="g3Exit" type="button" aria-label="Thoát minigame">‹ Thoát</button>
      <div class="g3-title"><b lang="ja">${esc(L.title)}</b><span>${esc(L.sub)}</span></div>
      <button class="g3-btn" id="g3Me" type="button" aria-label="Đổi nhân vật">Nhân vật</button><button class="g3-btn" id="g3Book" type="button">Sổ từ <b id="g3Wc"></b></button></div>
    <div class="g3-stats"><span>Đã gặp <b id="g3Nc"></b></span></div>
    <div class="g3-zoom"><button type="button" id="g3Zin" aria-label="Phóng to">+</button><button type="button" id="g3Zout" aria-label="Thu nhỏ">−</button></div>
    <div class="g3-hint" id="g3Hint">${mobile?"Chạm vào đường để đi · chạm vào người có dấu ! hoặc đồ vật để học · kéo để xoay":"Bấm vào đường hoặc dùng W A S D / phím mũi tên để đi · bấm vào người có dấu ! hoặc đồ vật để học · kéo chuột để xoay"}</div>
    <button class="g3-talk" id="g3Talk" type="button" hidden></button>
    <div id="g3Panel"></div>`);
  const $=id=>root.querySelector("#"+id);
  const hud=()=>{$("g3Wc").textContent=`${prog.words.length}/${tot}`;$("g3Nc").textContent=`${prog.npc.length}/${L.npcs.length}`};hud();
  $("g3Load").remove();
  /* camera */
  let yaw=.62,dist=mobile?15:17,pitch=.78,lookOff=0;const camT=new THREE.Vector3();
  function placeCam(snap){const p=player.position;camT.set(p.x+Math.sin(yaw)*dist*Math.cos(pitch),p.y+dist*Math.sin(pitch),p.z+Math.cos(yaw)*dist*Math.cos(pitch));if(snap)camera.position.copy(camT);else camera.position.lerp(camT,.12);camera.lookAt(p.x,p.y+1.1-lookOff,p.z);
    sun.position.set(p.x+18,30,p.z+14);sun.target.position.set(p.x,0,p.z)}
  function resize(){const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();placeCam(true);addEventListener("resize",resize);
  $("g3Zin").onclick=()=>dist=Math.max(8,dist-3);$("g3Zout").onclick=()=>dist=Math.min(28,dist+3);
  /* di chuyển */
  let target=null,goal=null,panelOpen=false;const keys=new Set();
  const blocked=(x,z)=>Math.abs(x)>37||Math.abs(z)>37||solids.some(s=>x>s.x0-.35&&x<s.x1+.35&&z>s.z0-.35&&z<s.z1+.35);
  function step(dx,dz){const p=player.position,nx=p.x+dx,nz=p.z+dz;if(!blocked(nx,nz)){p.x=nx;p.z=nz;return true}if(!blocked(nx,p.z)){p.x=nx;return true}if(!blocked(p.x,nz)){p.z=nz;return true}return false}
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  function hit(e){const r=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
    const hs=ray.intersectObjects(scene.children,true);for(const h of hs){const u=h.object.userData;if(u.pick)return {pick:u.pick,point:h.point,obj:h.object};if(u.ground)return {point:h.point}}return null}
  let down=null,dragging=false;
  renderer.domElement.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,yaw,pitch};dragging=false;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!dragging&&Math.hypot(dx,dy)>10)dragging=true;if(dragging){yaw=down.yaw-dx*.006;pitch=Math.min(1.25,Math.max(.35,down.pitch+dy*.004))}});
  renderer.domElement.addEventListener("pointerup",e=>{const was=dragging;down=null;dragging=false;if(was||panelOpen)return;const h=hit(e);if(!h)return;
    if(h.pick){goal=h.pick;const p=h.pick.npc?npcs.find(o=>o.d.id===h.pick.npc).c.position:h.point;target=new THREE.Vector3(p.x,0,p.z);hintOff()}
    else{goal=null;target=new THREE.Vector3(h.point.x,0,h.point.z);hintOff()}});
  renderer.domElement.addEventListener("wheel",e=>{e.preventDefault();dist=Math.min(28,Math.max(8,dist+e.deltaY*.01))},{passive:false});
  const kd=e=>{if(e.key==="Escape"){if(panelOpen)closePanel();return}if(panelOpen)return;const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)){keys.add(k);target=null;goal=null;hintOff();e.preventDefault()}
    if((k==="e"||k==="enter")&&near&&e.target===renderer.domElement){talk(near.d.id);e.preventDefault()}};
  const ku=e=>keys.delete(e.key.toLowerCase());
  addEventListener("keydown",kd);addEventListener("keyup",ku);
  let hintT=setTimeout(()=>hintOff(),9000);function hintOff(){const h=$("g3Hint");if(h)h.style.opacity=0}
  /* bảng thoại / thẻ từ */
  const panel=$("g3Panel");let opener=null;
  function openPanel(html){opener=document.activeElement;panel.innerHTML=`<div class="g3-panel" role="dialog" aria-modal="false">${html}</div>`;panelOpen=true;$("g3Talk").hidden=true;const f=panel.querySelector("[data-focus]")||panel.querySelector("button");if(f)setTimeout(()=>f.focus({preventScroll:true}),30)}
  function closePanel(){panel.innerHTML="";panelOpen=false;try{speechSynthesis.cancel()}catch(e){}(opener&&opener.focus?opener:renderer.domElement).focus({preventScroll:true})}
  const sayJ=t=>{try{api.say(plain(t))}catch(e){}};
  function learn(k,quiet){if(!prog.words.includes(k)){prog.words.push(k);save();hud();if(!quiet)api.toast(`+1 từ mới: ${plain(L.words[k][0])}`,1800);return true}return false}
  function wordCard(k){const [j,v,ex]=L.words[k];const isNew=learn(k,true);
    openPanel(`<div class="g3-card"><div class="g3-who"><span>${isNew?"Từ mới!":"Đã có trong sổ"}</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="big" lang="ja">${R(j)}</div><div class="g3-roma">${esc(roma(j))}</div><div class="vi">${esc(v)}</div>${ex?`<div class="ex" lang="ja">${R(ex)}</div>`:""}
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-say>🔊 Nghe lại</button><button class="g3-next" type="button" data-x data-focus style="margin-left:0">Tiếp tục dạo</button></div></div>`);
    panel.querySelectorAll("[data-x]").forEach(b=>b.onclick=closePanel);panel.querySelector("[data-say]").onclick=()=>sayJ(j);sayJ(j);
    if(isNew)hud();checkDone()}
  function bookPanel(){const ks=Object.keys(L.words);
    openPanel(`<div class="g3-who"><b>Sổ từ</b><span>${prog.words.length}/${ks.length} từ</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="g3-book">${ks.map(k=>{const got=prog.words.includes(k),[j,v]=L.words[k];return got?`<button type="button" class="g3-w" data-k="${k}"><b lang="ja">${R(j)}</b><span>${esc(v)}</span></button>`:`<div class="g3-w no"><b>？</b><span>Chưa tìm thấy</span></div>`}).join("")}</div>`);
    panel.querySelector("[data-x]").onclick=closePanel;panel.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>sayJ(L.words[b.dataset.k][0]))}
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
        openPanel(`${head}<div class="g3-q">Bạn trả lời: ${esc(s.q)}</div><div class="g3-opts">${order.map(k=>`<button type="button" class="g3-opt" data-k="${k}" lang="ja">${R(s.o[k][0])}<span class="mk" aria-hidden="true"></span></button>`).join("")}</div><div id="g3Fb" aria-live="polite"></div>`);
        panel.querySelectorAll(".g3-opt").forEach(b=>b.onclick=()=>{const k=+b.dataset.k,fb=panel.querySelector("#g3Fb");
          if(k===0){b.classList.add("ok");b.querySelector(".mk").textContent="○";panel.querySelectorAll(".g3-opt").forEach(x=>x.disabled=true);sayJ(s.o[0][0]);
            fb.innerHTML=`<div class="g3-good"><b>正解！ Đúng rồi.</b> ${esc(s.o[0][1])}<div class="g3-roma">${esc(roma(s.o[0][0]))}</div></div><div class="g3-row"><button class="g3-next" type="button" data-nx>Tiếp ›</button></div>`;
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
    setTimeout(()=>{openPanel(`<div class="g3-done"><h3 lang="ja">おめでとう！</h3><p>Bạn đã làm quen với cả ${L.npcs.length} người ở <b lang="ja">${esc(L.title)}</b>${prog.words.length<tot?` và nhặt được ${prog.words.length}/${tot} từ. Còn vài từ quanh phố, đi tìm tiếp nhé (gợi ý: cột cờ, đèn đường).`:` và nhặt đủ ${tot}/${tot} từ mới!`}</p><p>Hôm nay được tính là một ngày ôn bài cho con giáp của bạn.</p>
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-x>Dạo tiếp</button><button class="g3-next" type="button" data-out data-focus style="margin-left:0">Về bài học</button></div></div>`);
      panel.querySelector("[data-x]").onclick=closePanel;panel.querySelector("[data-out]").onclick=()=>api.exit()},400)}
  $("g3Exit").onclick=()=>api.exit();
  $("g3Me").onclick=()=>{root.classList.add("g3-av");dist=6.5;pitch=.45;lookOff=mobile?1.9:0;avatarPanel()};
  $("g3Talk").onclick=()=>{if(near)talk(near.d.id)};
  /* tạo nhân vật lần đầu */
  function rebuildPlayer(){const p=player.position.clone(),r=player.rotation.y;scene.remove(player);player=makePlayer(av);player.position.copy(p);player.rotation.y=r;scene.add(player)}
  function avatarPanel(){const HAIR=["#2e2420","#5a3a2a","#a8753a","#6d6a70"],TOP=["#d8d2cb","#3a3f52","#8a6a4e","#3d6fd6","#c23b2a","#2f9e64"],BOT=["#d3cdc6","#2a2d3a","#3b4a7a","#6b5a4a"],SK=["#fbe3cf","#f7d6b8","#e8bf98"],ST=[["side","Rẽ ngôi"],["short","Tóc ngắn"],["spiky","Tóc vuốt"],["cap","Đội mũ"]];
    const sw=(arr,key)=>arr.map(c=>`<button type="button" class="g3-sw${av[key]===c?" on":""}" style="background:${c}" data-k="${key}" data-v="${c}" aria-label="Màu ${c}"></button>`).join("");
    if(av.model!==false&&TAI_GLB){openPanel(`<div class="g3-who g3-avp"><b>Nhân vật Tài</b><span>Bài 1 · ${esc(L.title)}</span></div>
      <p class="g3-sub">Mẫu 3D Tài dựng bằng Blender: tóc vuốt rẽ ngôi, kính tròn, khăn cổ lọ, áo khoác dạ.</p>
      <div class="g3-opts2"><button type="button" class="g3-chip on" aria-pressed="true">Mẫu 3D của Tài</button><button type="button" class="g3-chip" data-custom>Tự tạo nhân vật khác</button></div>
      <p class="g3-sub">Nhiệm vụ: làm quen với ${L.npcs.length} người có dấu <b style="color:#c23b2a">!</b> và tìm ${tot} từ mới quanh phố.</p>
      <div class="g3-row"><button class="g3-next" type="button" data-go data-focus>Bắt đầu dạo phố ›</button></div>`);
      panel.querySelector("[data-custom]").onclick=()=>{av={...av,model:false};rebuildPlayer();avatarPanel()};
      panel.querySelector("[data-go]").onclick=()=>{try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}dist=mobile?15:17;lookOff=0;pitch=.78;root.classList.remove("g3-av");closePanel()};return}
    openPanel(`<div class="g3-who g3-avp"><b>Tạo nhân vật Tài</b><span>Bài 1 · ${esc(L.title)}</span></div>
      <div class="g3-lbl">Kiểu tóc</div><div class="g3-opts2">${ST.map(([v,t])=>`<button type="button" class="g3-chip${av.style===v?" on":""}" data-k="style" data-v="${v}">${t}</button>`).join("")}</div>
      <div class="g3-lbl">Trang phục</div><div class="g3-opts2"><button type="button" class="g3-chip${av.outfit==="coat"?" on":""}" data-k="outfit" data-v="coat">Áo khoác dạ + cổ lọ</button><button type="button" class="g3-chip${av.outfit!=="coat"?" on":""}" data-k="outfit" data-v="tee">Áo thun</button>
        <button type="button" class="g3-chip${av.glasses?" on":""}" data-k="glasses" data-v="${av.glasses?"":"1"}">${av.glasses?"Có kính ✓":"Đeo kính"}</button><button type="button" class="g3-chip" data-reset>Dùng mẫu 3D của Tài</button></div>
      <div class="g3-lbl">Màu tóc</div><div class="g3-opts2">${sw(HAIR,"hair")}</div>
      <div class="g3-lbl">${av.outfit==="coat"?"Áo khoác":"Áo"}</div><div class="g3-opts2">${sw(TOP,"top")}</div>
      <div class="g3-lbl">Quần</div><div class="g3-opts2">${sw(BOT,"bottom")}</div>
      <div class="g3-lbl">Màu da</div><div class="g3-opts2">${sw(SK,"skin")}</div>
      <p class="g3-sub">Nhiệm vụ: làm quen với ${L.npcs.length} người có dấu <b style="color:#c23b2a">!</b> và tìm ${tot} từ mới quanh phố.</p>
      <div class="g3-row"><button class="g3-next" type="button" data-go data-focus>Bắt đầu dạo phố ›</button></div>`);
    panel.querySelector("[data-reset]").onclick=()=>{av={...TAI};try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}rebuildPlayer();avatarPanel()};
    panel.querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{av[b.dataset.k]=b.dataset.k==="glasses"?!!b.dataset.v:b.dataset.v;try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}rebuildPlayer();avatarPanel()});
    panel.querySelector("[data-go]").onclick=()=>{try{localStorage.setItem("g3-avatar",JSON.stringify(av))}catch(e){}dist=mobile?15:17;lookOff=0;pitch=.78;root.classList.remove("g3-av");closePanel()}}
  if(!localStorage.getItem("g3-avatar")){root.classList.add("g3-av");dist=6.5;pitch=.45;lookOff=mobile?1.9:0;yaw=0;avatarPanel()}
  /* vòng lặp */
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
    animChar(player,dt,moving);npcs.forEach(o=>{animChar(o.c,dt,false);o.c.userData.badge.position.y=2.3+Math.sin(t/300)*.06});animChar(extra,dt,false);
    let nn=null,best=2.6;npcs.forEach(o=>{const d=o.c.position.distanceTo(p);if(d<best){best=d;nn=o}});
    if(nn!==near){near=nn;const b=$("g3Talk");if(near&&!panelOpen){b.hidden=false;b.textContent=`Nói chuyện với ${near.d.vn}`}else b.hidden=true}
    else if(near&&!panelOpen&&$("g3Talk").hidden)$("g3Talk").hidden=false;
    placeCam(false);renderer.render(scene,camera)}
  function arrive(){const g=goal;goal=null;if(!g)return;if(g.npc)talk(g.npc);else if(g.w)wordCard(g.w)}
  const vis=()=>{if(document.hidden){cancelAnimationFrame(raf)}else if(alive){last=performance.now();raf=requestAnimationFrame(loop)}};
  document.addEventListener("visibilitychange",vis);
  raf=requestAnimationFrame(loop);renderer.domElement.focus({preventScroll:true});
  if(location.search.includes("g3debug"))window.__g3={talk,wordCard,bookPanel,checkDone,prog,setPos:(x,z)=>{player.position.set(x,0,z);placeCam(true)},setYaw:v=>{yaw=v}};
  return {stop(){alive=false;cancelAnimationFrame(raf);clearTimeout(hintT);removeEventListener("resize",resize);removeEventListener("keydown",kd);removeEventListener("keyup",ku);document.removeEventListener("visibilitychange",vis);try{speechSynthesis.cancel()}catch(e){}
    scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});renderer.dispose();root.innerHTML="";root.className=""}};
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
const fuji3=(x,z,r,h)=>{const g=new THREE.Group();const c=new THREE.Mesh(new THREE.ConeGeometry(r,h,32,1,true),M("#6f95cf",{side:THREE.DoubleSide}));c.position.y=h/2;g.add(c);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(r*.34,h*.34,32),M("#ffffff"));cap.position.y=h-h*.17+.05;g.add(cap);g.position.set(x,0,z);return g};
function tree3(kind,s=1){const g=new THREE.Group();
  if(kind==="pine"||kind==="pinesnow"){g.add(cyl(.18,.25,1.2,"#6b4433",0,.6,0,8));[[1.8,1.8,1.6],[1.4,1.6,2.6],[1,1.4,3.5]].forEach(([r,h,y])=>{g.add(outline(new THREE.Mesh(new THREE.ConeGeometry(r,h,8),M("#2f7f55"))));g.children.at(-1).position.y=y;g.children.at(-1).castShadow=true;
    if(kind==="pinesnow"){const sn=new THREE.Mesh(new THREE.ConeGeometry(r*.55,h*.5,8),M("#ffffff"));sn.position.y=y+h*.28;g.add(sn)}})}
  else{const C={sakura:["#f29ab8","#f7b8cc"],momiji:["#d9472f","#f0743a"],amber:["#e8892c","#f5b04a"],green:["#3f9d62","#5cb87c"],plum:["#d8578a","#f08db0"]}[kind];
    g.add(outline(cyl(.16,.24,1.8,"#7d5140",0,.9,0,8)));[[0,2.4,0,1.15],[.75,2.1,.35,.85],[-.75,2.15,-.25,.9],[.25,2.9,-.35,.75],[-.35,2,.6,.72]].forEach(([a,b,c,r],i)=>g.add(outline(sph(r,C[i%2],a,b,c,12,10),1.04)))}
  g.scale.setScalar(s);return g}
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
 {name:"伏見稲荷大社",vn:"Đền Fushimi Inari đón năm mới",sky:["#3e5f9e","#ffd9c4"],ground:"#f4f7fb",ps:"snow",spots:[
   ["torii","鳥居{とりい}","cổng torii","Cổng đánh dấu lối vào khu vực linh thiêng của đền Thần đạo"],["sen","千本鳥居{せんぼんとりい}","con đường nghìn cổng torii","Hàng nghìn cổng torii xếp liền nhau thành đường hầm màu đỏ"],["sun","初日{はつひ}の出{で}","bình minh đầu năm","Ngắm mặt trời mọc ngày 1/1 để cầu may cả năm"]],
   build(A){A.sky(sun3("#ff6f4f"),0,16,-90,"sun");for(let i=0;i<16;i++)A.add(torii3("#e0482f",1.05),0,-3-i*1.9,{solid:[[-1.6,0,.5,.5],[1.6,0,.5,.5]],spot:i===0?"torii":i===8?"sen":null});
     A.add(ishidoro3(),-3.2,0);A.add(ishidoro3(),3.2,0);[[-10,-10],[11,-12],[-14,-28],[13,-30],[-20,-4],[22,-2],[-8,8],[9,10]].forEach(([x,z],i)=>A.add(tree3("pinesnow",.9+(i%3)*.15),x,z,{solid:[[0,0,1,1]]}));
     [[-16,-20,8,2.4],[18,-22,9,2.8],[0,-44,14,4],[-24,10,7,2],[24,12,7,2]].forEach(([x,z,r,h])=>A.add(mound(r,h,"#eef4fc"),x,z));A.start(0,9)}},
 {name:"白川郷",vn:"Làng tuyết Shirakawa-go",sky:["#6f96c9","#e6f0fb"],ground:"#f4f7fb",ps:"snow",spots:[
   ["gassho","合掌造{がっしょうづく}り","nhà mái tranh “chắp tay”","Mái dốc như hai bàn tay chắp lại để tuyết dễ trượt xuống"],["yuki","雪{ゆき}だるま","người tuyết","Người tuyết Nhật thường chỉ có 2 khối tròn"],["ume","梅{うめ}","hoa mơ","Nở cuối đông, báo hiệu mùa xuân sắp đến"]],
   build(A){[[-9,-10,0],[0,-16,.2],[9,-9,-.3],[-4,-26,.1],[10,-24,0]].forEach(([x,z,r],i)=>A.add(gassho3(1.25),x,z,{rot:r,solid:[[0,0,5.6,4.2]],spot:i===1?"gassho":null}));
     A.add(snowman3(),-4,2,{spot:"yuki",solid:[[0,0,1.4,1.4]]});A.add(tree3("plum",1.1),6,1,{spot:"ume",solid:[[0,0,1,1]]});
     [[-16,-2],[16,0],[-18,-18],[19,-16],[-6,10],[8,12]].forEach(([x,z])=>A.add(tree3("pinesnow",1),x,z,{solid:[[0,0,1,1]]}));
     A.far(fuji3(-30,-70,26,22));A.far(fuji3(28,-75,30,28));A.start(0,10)}},
 {name:"新倉山浅間公園",vn:"Chùa Chureito & núi Phú Sĩ",sky:["#7fa7d8","#ffe2ee"],ground:"#a9d69a",ps:"petal",spots:[
   ["tou","五重塔{ごじゅうのとう}","tháp năm tầng","Tháp Chureito nhìn ra núi Phú Sĩ, cảnh nổi tiếng mùa xuân"],["fuji","富士山{ふじさん}","núi Phú Sĩ","Ngọn núi cao nhất Nhật Bản, 3776 m"],["sakura","桜{さくら}","hoa anh đào","Mùa hoa anh đào nở vào khoảng cuối tháng 3 đến đầu tháng 4"]],
   build(A){A.add(mound(10,3.2,"#93c985"),-6,-16);A.add(pagoda3(1),-6,-16,{y:3,solid:[[0,0,3.8,3.8]],spot:"tou"});A.far(fuji3(10,-70,34,34),"fuji");
     [[4,-8],[8,-14],[-14,-6],[12,-4],[-10,4],[10,6],[-18,-16],[16,-22],[0,-26],[-2,8]].forEach(([x,z],i)=>A.add(tree3("sakura",1+(i%3)*.12),x,z,{solid:[[0,0,1,1]],spot:i===0?"sakura":null}));A.start(2,12)}},
 {name:"姫路城",vn:"Lâu đài Himeji mùa hoa anh đào",sky:["#86b2e0","#ffe7f1"],ground:"#a9d69a",ps:"petal",spots:[
   ["shiro","城{しろ}","lâu đài","Himeji còn được gọi là “thành Hạc trắng” vì màu trắng tinh"],["hanami","花見{はなみ}","ngắm hoa","Trải bạt dưới gốc anh đào, ăn uống và ngắm hoa"],["bentou","お弁当{べんとう}","cơm hộp","Món không thể thiếu khi đi 花見"]],
   build(A){A.add(castle3(1.3),0,-22,{solid:[[0,0,13,13]],spot:"shiro"});
     const mat=box(3,.05,2.2,"#e5484d",0,.06,0);const g=new THREE.Group();g.add(mat);g.add(outline(box(.6,.3,.45,"#2b2540",.4,.25,.2)));g.add(box(.5,.05,.38,"#ffcf4a",.4,.42,.2));A.add(g,6,-2,{spot:"hanami"});
     A.add(dango3(),3.6,-1,{spot:"bentou"});
     [[-10,-8],[10,-8],[-14,-16],[14,-16],[-6,2],[10,2],[-18,-2],[18,-2],[-12,8],[13,9]].forEach(([x,z],i)=>A.add(tree3("sakura",1.05+(i%3)*.1),x,z,{solid:[[0,0,1,1]]}));A.start(0,12)}},
 {name:"鯉のぼり",vn:"Lễ hội cá chép Koinobori",sky:["#5fa8e8","#c9eeff"],ground:"#9fd88f",ps:"leaf",spots:[
   ["koi","鯉{こい}のぼり","cờ cá chép","Treo ngày 5/5 (ngày trẻ em) cầu cho trẻ khỏe mạnh như cá chép vượt thác"],["fuji","富士山{ふじさん}","núi Phú Sĩ","Đẹp nhất khi trời trong vào sáng sớm"],["ie","家{いえ}","ngôi nhà","Nhà có con trai thường treo cá chép trước sân"]],
   build(A){const k=koinobori3();A.add(k,-2,-6,{solid:[[0,0,.5,.5]],spot:"koi"});A.koi=k;A.far(fuji3(18,-75,30,30),"fuji");
     A.add(house3("#fff3e0","#4a8fd6",1.3),6,-12,{solid:[[0,0,4.4,3.6]],spot:"ie"});A.add(house3("#fff3e0","#e5484d",1.1),12,-6,{rot:-.3,solid:[[0,0,3.8,3.2]]});
     [[-12,-10],[-16,0],[14,4],[-8,8],[10,10],[0,-20],[-14,-20]].forEach(([x,z])=>A.add(tree3("green",1.05),x,z,{solid:[[0,0,1,1]]}));A.start(0,9)}},
 {name:"明月院",vn:"Chùa Meigetsu-in mùa cẩm tú cầu",sky:["#8fa0c8","#e3e6f5"],ground:"#9fd88f",ps:"drop",spots:[
   ["ajisai","紫陽花{あじさい}","hoa cẩm tú cầu","Nở rộ vào mùa mưa (梅雨, tháng 6)"],["kasa","傘{かさ}","cái ô","Ô giấy truyền thống gọi là 和傘 (wagasa)"],["tera","お寺{てら}","ngôi chùa","Chùa Meigetsu-in nổi tiếng với ô cửa tròn"]],
   build(A){A.add(temple3(1.3),0,-16,{solid:[[0,0,10,7]],spot:"tera"});A.add(wagasa3(),5,-4,{spot:"kasa"});
     for(let i=0;i<14;i++){const side=i%2?1:-1,z=6-i*1.6;A.add(hyd3(["#7aa7ff","#b48cf0","#ff9fc8"][i%3],["#a9c4ff","#d2b8ff","#ffc2dc"][i%3]),side*2.6,z,{solid:[[0,0,1.2,1.2]],spot:i===3?"ajisai":null})}
     [[-12,-8],[12,-8],[-14,4],[14,4],[-8,-24],[8,-24]].forEach(([x,z])=>A.add(tree3("green",1.1),x,z,{solid:[[0,0,1,1]]}));A.start(0,10)}},
 {name:"厳島神社",vn:"Cổng torii nổi Itsukushima",sky:["#4f9be0","#c8eefc"],ground:"#f2dca5",ps:"star",spots:[
   ["torii","大鳥居{おおとりい}","cổng torii lớn","Cổng torii đứng giữa biển, khi thủy triều lên trông như đang nổi"],["umi","海{うみ}","biển","Mùa hè (夏) là mùa đi biển"],["tourou","灯籠{とうろう}","đèn lồng đá","Đặt dọc lối vào đền, thắp sáng vào buổi tối"]],
   build(A){A.add(water3(140,80,"#3fb0e0"),0,-48,{water:[-70,-88,70,-8.5],spot:"umi"});A.add(torii3("#e8553f",2.6),0,-24,{y:-.2,spot:"torii"});
     A.far(fuji3(-35,-80,22,14));const isl=mound(16,8,"#4f9f78");A.far(isl);isl.position.set(30,0,-80);
     [[-6,-4],[6,-4],[-10,2],[10,2]].forEach(([x,z],i)=>A.add(ishidoro3(),x,z,{solid:[[0,0,1,1]],spot:i===1?"tourou":null}));
     [[-16,0],[16,-2],[-22,6],[22,8],[-12,10],[13,12]].forEach(([x,z])=>A.add(tree3("pine",1.1),x,z,{solid:[[0,0,1,1]]}));A.start(0,10)}},
 {name:"夏祭り",vn:"Lễ hội pháo hoa mùa hè",sky:["#141838","#6a3f7a"],ground:"#5b6e5a",ps:"star",night:true,spots:[
   ["hanabi","花火{はなび}","pháo hoa","Lễ hội pháo hoa (花火大会) là đặc sản mùa hè Nhật"],["matsuri","祭{まつ}り","lễ hội","Có các quầy hàng (屋台) bán đồ ăn, trò chơi"],["chouchin","提灯{ちょうちん}","đèn lồng giấy","Treo dọc phố trong các lễ hội mùa hè"]],
   build(A){A.add(water3(120,14,"#2f4f8a"),0,-26,{water:[-60,-33,60,-19]});A.fw=true;
     A.add(lanternString(-14,14,5,-6,12),0,0,{spot:"chouchin"});A.add(lanternString(-14,14,5,4,12),0,0);
     [[-8,-10,"#e5484d"],[-3,-10,"#3d6fd6"],[3,-10,"#2f9e64"],[8,-10,"#e5484d"],[-8,10,"#ff8a3c"],[8,10,"#8f6fd6"]].forEach(([x,z,c],i)=>A.add(stall3(c),x,z,{rot:z>0?Math.PI:0,solid:[[0,0,3,1.8]],spot:i===1?"matsuri":null}));
     A.sky(new THREE.Mesh(new THREE.SphereGeometry(1.6,10,8),new THREE.MeshBasicMaterial({color:0xffd43b,fog:false})),-10,28,-45,"hanabi");A.start(0,4)}},
 {name:"お月見",vn:"Ngắm trăng Tsukimi trên đồng lúa",sky:["#2a3466","#e9c7a8"],ground:"#b6d6a4",ps:"leaf",dusk:true,spots:[
   ["tsuki","月{つき}","mặt trăng","Đêm trăng rằm tháng 8 âm lịch gọi là 十五夜{じゅうごや}"],["dango","団子{だんご}","bánh dày dango","Bày 月見団子 để cúng trăng"],["ta","田{た}んぼ","ruộng lúa","Mùa thu lúa chín vàng"]],
   build(A){A.sky(moon3(),0,24,-80,"tsuki");A.add(rice3(40,16),0,-18,{spot:"ta"});A.add(dango3(),2,-2,{spot:"dango",solid:[[0,0,1.6,1.2]]});
     [[-4,-1],[5,0],[-8,-4],[8,-4],[-12,0],[12,1]].forEach(([x,z])=>A.add(susuki3(),x,z));A.add(house3("#fff3e0","#6b5a8f",1.3),-14,-30,{solid:[[0,0,4.4,3.6]]});
     [[-20,-8],[20,-8],[-18,6],[18,6]].forEach(([x,z])=>A.add(tree3("amber",1),x,z,{solid:[[0,0,1,1]]}));A.start(0,8)}},
 {name:"金閣寺",vn:"Chùa Vàng Kinkaku-ji mùa thu",sky:["#7aa6d6","#ffe3bd"],ground:"#c9b067",ps:"maple",spots:[
   ["kinkaku","金閣寺{きんかくじ}","chùa Vàng","Ngôi chùa phủ vàng lá ở Kyoto"],["ike","池{いけ}","cái ao","Chùa soi bóng xuống ao Kyōko-chi"],["momiji","紅葉{もみじ}","lá phong đỏ","Mùa lá đỏ ở Kyoto khoảng tháng 11"]],
   build(A){A.add(water3(30,14,"#4fa9e0"),0,-14,{water:[-15,-21,15,-7],spot:"ike"});A.add(kinkaku3(1.2),0,-25,{solid:[[0,0,8,6]],spot:"kinkaku"});
     [[-12,-12],[12,-12],[-17,-4],[17,-4],[-9,2],[9,2],[-18,-22],[18,-22]].forEach(([x,z],i)=>A.add(tree3(i%2?"momiji":"amber",1.1),x,z,{solid:[[0,0,1,1]],spot:i===4?"momiji":null}));
     [[-6,-32],[6,-32],[-20,-30],[20,-30]].forEach(([x,z])=>A.add(tree3("pine",1.2),x,z,{solid:[[0,0,1,1]]}));A.start(0,9)}},
 {name:"河口湖",vn:"Núi Phú Sĩ & hồ Kawaguchi lá đỏ",sky:["#7a9ed6","#ffdcc7"],ground:"#b3d98f",ps:"maple",spots:[
   ["fuji","富士山{ふじさん}","núi Phú Sĩ","Nhìn từ hồ Kawaguchi, núi soi bóng xuống mặt nước"],["mizuumi","湖{みずうみ}","hồ","Hồ Kawaguchi là một trong Ngũ hồ Phú Sĩ"],["kouyou","紅葉{こうよう}","lá đổi màu mùa thu","Đọc こうよう khi nói về mùa lá đỏ nói chung"]],
   build(A){A.add(water3(140,60,"#62b9e6"),0,-44,{water:[-70,-74,70,-14],spot:"mizuumi"});A.far(fuji3(0,-118,44,46),"fuji");
     [[-14,-8],[-8,-10],[8,-10],[14,-8],[-18,-2],[18,-2],[-10,4],[11,5]].forEach(([x,z],i)=>A.add(tree3(i%2?"amber":"momiji",1.15),x,z,{solid:[[0,0,1,1]],spot:i===2?"kouyou":null}));A.start(0,8)}},
 {name:"さっぽろ雪まつり",vn:"Lễ hội tuyết Sapporo",sky:["#7da3d4","#e4f0fc"],ground:"#f4f7fb",ps:"snow",spots:[
   ["tokei","時計台{とけいだい}","tháp đồng hồ","Tháp đồng hồ Sapporo, biểu tượng của thành phố"],["yukimatsuri","雪祭{ゆきまつ}り","lễ hội tuyết","Diễn ra vào tháng 2 với các tượng tuyết khổng lồ"],["yuki","雪{ゆき}だるま","người tuyết","雪 (tuyết) + だるま (búp bê Daruma)"]],
   build(A){A.add(clock3(1.3),0,-18,{solid:[[0,0,8,5.4]],spot:"tokei"});
     const sc=new THREE.Group();sc.add(outline(box(5,3,3,"#ffffff",0,1.5,0)));const t=roofQuad(3,2,"#eef4fc");t.position.y=4;sc.add(t);sc.add(outline(box(1.4,4,1.4,"#ffffff",-2.4,2,0)));sc.add(outline(box(1.4,4,1.4,"#ffffff",2.4,2,0)));
     A.add(sc,-12,-10,{rot:.4,solid:[[0,0,6,4]],spot:"yukimatsuri"});A.add(snowman3(),5,-2,{spot:"yuki",solid:[[0,0,1.4,1.4]]});
     A.add(house3("#fff3e0","#e5484d",1.2,true),12,-10,{solid:[[0,0,4,3.4]]});[[-18,0],[18,2],[-6,8],[8,10],[-16,-22],[16,-24]].forEach(([x,z])=>A.add(tree3("pinesnow",1),x,z,{solid:[[0,0,1,1]]}));A.start(0,9)}}
];

export async function startScene(root,m,api){
  if(!document.getElementById("g3css")){const st=document.createElement("style");st.id="g3css";st.textContent=CSS;document.head.appendChild(st)}
  const S=SC[m], esc=api.esc, R=t=>api.rb(t), plain=t=>api.plainOf(t), roma=t=>api.roma(api.kanaOf(t));
  let av={...TAI};try{av={...av,...JSON.parse(localStorage.getItem("g3-avatar")||"{}")}}catch(e){}
  let seen={};try{seen=JSON.parse(localStorage.getItem("g3-scene")||"{}")}catch(e){}
  root.className="g3";root.innerHTML=`<div class="g3-load">Đang dựng cảnh ${esc(S.vn)}…</div>`;
  try{await Promise.race([document.fonts.load(`700 40px "Kaisei Decol"`),new Promise(r=>setTimeout(r,1200))])}catch(e){}
  const mobile=matchMedia("(pointer:coarse)").matches;
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,mobile?1.6:2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  root.prepend(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute("aria-label",`Cảnh 3D: ${S.vn}`);
  const scene=new THREE.Scene();
  scene.background=canvasTex(4,256,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,S.sky[0]);gr.addColorStop(1,S.sky[1]);g.fillStyle=gr;g.fillRect(0,0,W,H)});
  scene.fog=new THREE.Fog(new THREE.Color(S.sky[1]),60,230);
  const night=!!S.night, dusk=!!S.dusk;
  scene.add(new THREE.HemisphereLight(night?0x8a8ad0:dusk?0xd8c8f0:0xffffff,night?0x30304a:0xb9d4a8,night?.7:dusk?.95:1.2));
  const sun=new THREE.DirectionalLight(night?0xaab4ff:dusk?0xffd8b0:0xfff3dd,night?.55:dusk?1:1.45);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);
  Object.assign(sun.shadow.camera,{left:-26,right:26,top:26,bottom:-26,near:1,far:90});sun.shadow.bias=-.0005;scene.add(sun,sun.target);
  const ground=new THREE.Mesh(new THREE.CircleGeometry(120,48),M(S.ground));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.userData.ground=true;scene.add(ground);
  const camera=new THREE.PerspectiveCamera(48,1,.1,400);
  const solids=[],waters=[],ticks=[];let startP=[0,8];const A={
    add(obj,x,z,o={}){obj.position.set(x,o.y!=null?o.y:(obj.userData.water?.07:0),z);if(o.rot)obj.rotation.y=o.rot;scene.add(obj);
      if(o.solid)o.solid.forEach(([dx,dz,w,d])=>{const sw=w*(obj.scale.x||1)*(o.scaleSolid||1),sd=d*(obj.scale.z||1);solids.push({x0:x+dx-sw/2,x1:x+dx+sw/2,z0:z+dz-sd/2,z1:z+dz+sd/2})});
      if(o.water)waters.push(o.water);
      if(o.spot)obj.traverse(c=>{if(c.isMesh&&!c.userData.isOutline)c.userData.pick={spot:o.spot}});return obj},
    far(obj,spot){scene.add(obj);if(spot)obj.traverse(c=>{if(c.isMesh)c.userData.pick={spot}});return obj},
    sky(obj,x,y,z,spot){obj.position.set(x,y,z);obj.userData.billboard=true;scene.add(obj);if(spot)obj.traverse(c=>{if(c.isMesh)c.userData.pick={spot}});return obj},
    start(x,z){startP=[x,z]}};
  S.build(A);
  const ps=particles(S.ps);scene.add(ps);ticks.push(dt=>ps.userData.tick(dt,player.position.x,player.position.z));
  if(A.fw)ticks.push(fireworks(scene));
  if(A.koi)ticks.push(()=>A.koi.userData.carps.forEach((c,i)=>{c.rotation.y=Math.sin(performance.now()/500+i)*.35;c.rotation.z=Math.sin(performance.now()/380+i*2)*.12}));
  await loadTai();let player=makePlayer(av);player.position.set(startP[0],0,startP[1]);player.rotation.y=Math.PI;scene.add(player);
  const spots=Object.fromEntries(S.spots.map(s=>[s[0],s]));
  root.insertAdjacentHTML("beforeend",`
    <div class="g3-top"><button class="g3-btn" id="g3Exit" type="button" aria-label="Thoát cảnh 3D">‹ Thoát</button>
      <div class="g3-title"><b lang="ja">${esc(S.name)}</b><span>Tháng ${m+1} · ${esc(S.vn)}</span></div>
      <button class="g3-btn" id="g3Prev" type="button" aria-label="Cảnh tháng trước">‹</button><button class="g3-btn" id="g3Next" type="button" aria-label="Cảnh tháng sau">›</button></div>
    <div class="g3-stats"><span>Từ ở cảnh này <b id="g3Sc"></b></span></div>
    <div class="g3-zoom"><button type="button" id="g3Zin" aria-label="Phóng to">+</button><button type="button" id="g3Zout" aria-label="Thu nhỏ">−</button></div>
    <div class="g3-hint" id="g3Hint">${mobile?"Chạm mặt đất để đi · chạm công trình, cây, bầu trời để học từ · kéo để xoay":"Bấm mặt đất hoặc W A S D để đi · bấm công trình, cây, bầu trời để học từ · kéo chuột để xoay"}</div>
    <div id="g3Panel"></div>`);
  const $=id=>root.querySelector("#"+id);root.querySelector(".g3-load").remove();
  const upd=()=>{const got=S.spots.filter(s=>(seen[m]||[]).includes(s[0])).length;$("g3Sc").textContent=`${got}/${S.spots.length}`};upd();
  let yaw=0,dist=mobile?12:13,pitch=.3;const camT=new THREE.Vector3();
  function placeCam(snap){const p=player.position;camT.set(p.x+Math.sin(yaw)*dist*Math.cos(pitch),p.y+dist*Math.sin(pitch),p.z+Math.cos(yaw)*dist*Math.cos(pitch));if(snap)camera.position.copy(camT);else camera.position.lerp(camT,.12);camera.lookAt(p.x-Math.sin(yaw)*6,p.y+2.6,p.z-Math.cos(yaw)*6);
    sun.position.set(p.x+20,32,p.z+16);sun.target.position.set(p.x,0,p.z)}
  function resize(){const w=root.clientWidth,h=root.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  resize();placeCam(true);addEventListener("resize",resize);
  $("g3Zin").onclick=()=>dist=Math.max(7,dist-3);$("g3Zout").onclick=()=>dist=Math.min(30,dist+3);
  const blocked=(x,z)=>Math.hypot(x,z)>40||solids.some(s=>x>s.x0-.35&&x<s.x1+.35&&z>s.z0-.35&&z<s.z1+.35)||waters.some(([a,b,c,d])=>x>a&&x<c&&z>b&&z<d);
  function step(dx,dz){const p=player.position,nx=p.x+dx,nz=p.z+dz;if(!blocked(nx,nz)){p.x=nx;p.z=nz;return true}if(!blocked(nx,p.z)){p.x=nx;return true}if(!blocked(p.x,nz)){p.z=nz;return true}return false}
  const ray=new THREE.Raycaster(),ptr=new THREE.Vector2();
  function hit(e){const r=renderer.domElement.getBoundingClientRect();ptr.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ptr,camera);
    for(const h of ray.intersectObjects(scene.children,true)){const u=h.object.userData;if(u.isOutline)continue;if(u.pick)return {pick:u.pick,point:h.point};if(u.ground)return {point:h.point};if(u.water)return {point:h.point,water:true}}return null}
  let target=null,panelOpen=false,down=null,dragging=false;const keys=new Set();
  const hintOff=()=>{const h=$("g3Hint");if(h)h.style.opacity=0};const hintT=setTimeout(hintOff,9000);
  const cv=renderer.domElement;
  cv.addEventListener("pointerdown",e=>{down={x:e.clientX,y:e.clientY,yaw,pitch};dragging=false;cv.setPointerCapture(e.pointerId)});
  cv.addEventListener("pointermove",e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(!dragging&&Math.hypot(dx,dy)>10)dragging=true;if(dragging){yaw=down.yaw-dx*.006;pitch=Math.min(1.1,Math.max(.1,down.pitch+dy*.004))}});
  cv.addEventListener("pointerup",e=>{const was=dragging;down=null;dragging=false;if(was||panelOpen)return;const h=hit(e);if(!h)return;hintOff();
    if(h.pick&&h.pick.spot){spotCard(h.pick.spot);return}if(!h.water)target=new THREE.Vector3(h.point.x,0,h.point.z)});
  cv.addEventListener("wheel",e=>{e.preventDefault();dist=Math.min(30,Math.max(7,dist+e.deltaY*.01))},{passive:false});
  const kd=e=>{if(e.key==="Escape"){if(panelOpen)closePanel();return}if(panelOpen)return;const k=e.key.toLowerCase();if(["w","a","s","d","arrowup","arrowdown","arrowleft","arrowright"].includes(k)){keys.add(k);target=null;hintOff();e.preventDefault()}};
  const ku=e=>keys.delete(e.key.toLowerCase());addEventListener("keydown",kd);addEventListener("keyup",ku);
  const panel=$("g3Panel");let opener=null;
  function openPanel(html){opener=document.activeElement;panel.innerHTML=`<div class="g3-panel" role="dialog" aria-modal="false">${html}</div>`;panelOpen=true;const f=panel.querySelector("[data-focus]")||panel.querySelector("button");if(f)setTimeout(()=>f.focus({preventScroll:true}),30)}
  function closePanel(){panel.innerHTML="";panelOpen=false;try{speechSynthesis.cancel()}catch(e){}(opener&&opener.focus?opener:cv).focus({preventScroll:true})}
  const sayJ=t=>{try{api.say(plain(t))}catch(e){}};
  function spotCard(id){const s=spots[id];if(!s)return;const [,j,v,ex]=s;const L=seen[m]||[];const isNew=!L.includes(id);if(isNew){seen[m]=[...L,id];try{localStorage.setItem("g3-scene",JSON.stringify(seen))}catch(e){}upd()}
    openPanel(`<div class="g3-card"><div class="g3-who"><span>${isNew?"Từ mới ở cảnh này!":"Đã học"}</span><button class="g3-x" type="button" aria-label="Đóng" data-x>✕</button></div>
      <div class="big" lang="ja">${R(j)}</div><div class="g3-roma">${esc(roma(j))}</div><div class="vi">${esc(v)}</div><div class="g3-sub" style="margin-top:6px">${esc(ex)}</div>
      <div class="g3-row" style="justify-content:center"><button class="g3-small" type="button" data-say>🔊 Nghe lại</button><button class="g3-next" type="button" data-x data-focus style="margin-left:0">Tiếp tục dạo</button></div></div>`);
    panel.querySelectorAll("[data-x]").forEach(b=>b.onclick=closePanel);panel.querySelector("[data-say]").onclick=()=>sayJ(j);sayJ(j)}
  $("g3Exit").onclick=()=>api.exit();$("g3Prev").onclick=()=>api.go((m+11)%12);$("g3Next").onclick=()=>api.go((m+1)%12);
  let raf=0,last=performance.now(),alive=true;const fwd=new THREE.Vector3(),right=new THREE.Vector3();
  function loop(t){if(!alive)return;raf=requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000);last=t;let moving=false;const sp=5.4*dt,p=player.position;
    if(keys.size){fwd.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(-fwd.z,0,fwd.x);let mx=0,mz=0;
      if(keys.has("w")||keys.has("arrowup")){mx+=fwd.x;mz+=fwd.z}if(keys.has("s")||keys.has("arrowdown")){mx-=fwd.x;mz-=fwd.z}if(keys.has("d")||keys.has("arrowright")){mx+=right.x;mz+=right.z}if(keys.has("a")||keys.has("arrowleft")){mx-=right.x;mz-=right.z}
      const l=Math.hypot(mx,mz);if(l>0){mx/=l;mz/=l;moving=step(mx*sp,mz*sp);player.rotation.y=Math.atan2(mx,mz)}}
    else if(target){const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);if(d>.15){const k=Math.min(sp,d)/d;moving=step(dx*k,dz*k);player.rotation.y=Math.atan2(dx,dz);if(!moving)target=null}else target=null}
    animChar(player,dt,moving);ticks.forEach(f=>f(dt));
    scene.children.forEach(o=>{if(o.userData.billboard)o.lookAt(camera.position)});
    placeCam(false);renderer.render(scene,camera)}
  const vis=()=>{if(document.hidden)cancelAnimationFrame(raf);else if(alive){last=performance.now();raf=requestAnimationFrame(loop)}};document.addEventListener("visibilitychange",vis);
  raf=requestAnimationFrame(loop);cv.focus({preventScroll:true});
  if(location.search.includes("g3debug"))window.__g3s={spotCard,setPos:(x,z)=>{player.position.set(x,0,z);placeCam(true)},setYaw:v=>{yaw=v},setPitch:v=>{pitch=v},setDist:v=>{dist=v}};
  return {stop(){alive=false;cancelAnimationFrame(raf);clearTimeout(hintT);removeEventListener("resize",resize);removeEventListener("keydown",kd);removeEventListener("keyup",ku);document.removeEventListener("visibilitychange",vis);try{speechSynthesis.cancel()}catch(e){}
    scene.traverse(o=>{if(o.geometry)o.geometry.dispose()});renderer.dispose();root.innerHTML="";root.className=""}};
}
