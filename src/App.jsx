import { useState, useEffect, useRef } from "react";

const TOPICS_FLOAT = ["guitar","sourdough","python","photography","watercolour","yoga","chess","beatboxing","car maintenance","investing","french","pottery","sketching","meditation","filmmaking","astronomy","salsa","calligraphy","gardening","ukulele","origami","baking","piano","cooking","drawing","spanish","knitting","reels","editing"];

const CONTEXT_QUESTIONS = {
  cooking: [{q:"What's your food background?",opts:["Indian","East Asian","Mediterranean","Western","Mixed / Other"]},{q:"Do you have a kitchen available?",opts:["Yes, fully equipped","Basic kitchen","Limited — just a hob","Not right now"]}],
  language: [{q:"What's your native language?",opts:["English","Hindi","Spanish","French","Other"]},{q:"Why are you learning it?",opts:["Travel","Work","Heritage / family","Just curious"]}],
  default: [{q:"How would you describe yourself?",opts:["Complete beginner","Tried before, didn't stick","Some basics, want to go deeper"]}]
};

const LEVELS = ["Curious","Dabbler","Explorer","Practitioner","Enthusiast","Expert"];
const XP_PER_LEVEL = 300;
const getLevel = xp => Math.min(Math.floor(xp/XP_PER_LEVEL), LEVELS.length-1);

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&family=Dancing+Script:wght@600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
@keyframes drift0{0%,100%{transform:translate(0,0) rotate(-1deg)}30%{transform:translate(10px,-14px) rotate(1.5deg)}70%{transform:translate(-8px,10px) rotate(-.5deg)}}
@keyframes drift1{0%,100%{transform:translate(0,0) rotate(.5deg)}40%{transform:translate(-12px,-10px) rotate(-1.5deg)}80%{transform:translate(8px,8px) rotate(1deg)}}
@keyframes drift2{0%,100%{transform:translate(0,0)}25%{transform:translate(8px,12px)}75%{transform:translate(-10px,-8px)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes popIn{0%{transform:scale(.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes slideIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
.fadein{animation:fadeUp .5s ease forwards}
.popin{animation:popIn .35s ease forwards}
.slidein{animation:slideIn .35s ease forwards}
.btn-primary{background:#C4622D;color:white;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;transition:all .25s ease}
.btn-primary:hover:not(:disabled){background:#1C3A2B;transform:translateY(-2px);box-shadow:0 6px 20px rgba(28,58,43,.2)}
.btn-primary:disabled{opacity:.35;cursor:not-allowed;transform:none!important}
.btn-ghost{background:transparent;border:2px solid #E8DDD0;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s ease;color:#8B7355}
.btn-ghost:hover{border-color:#C4622D;color:#C4622D}
.opt{background:white;border:2px solid #E8DDD0;cursor:pointer;font-family:'DM Sans',sans-serif;text-align:left;width:100%;transition:all .2s ease;color:#1C3A2B}
.opt:hover{border-color:#C4622D;background:rgba(196,98,45,.04)}
.opt.sel{border-color:#2D7A4F;background:rgba(45,122,79,.07);color:#2D7A4F;font-weight:500}
.tag{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;font-weight:500}
input:focus,textarea:focus{outline:none}
.pip{width:8px;height:8px;border-radius:50%;cursor:pointer;transition:transform .15s ease}
.pip:hover{transform:scale(1.4)}
.chat-user{background:#1C3A2B;color:white;border-radius:18px 18px 4px 18px;padding:10px 15px;font-size:.88rem;line-height:1.6;align-self:flex-end;max-width:80%}
.chat-ai{background:white;border:2px solid #E8DDD0;color:#1C3A2B;border-radius:18px 18px 18px 4px;padding:10px 15px;font-size:.88rem;line-height:1.6;align-self:flex-start;max-width:85%}
.fc{perspective:600px;cursor:pointer}
.fc-inner{position:relative;width:100%;height:100%;transition:transform .5s;transform-style:preserve-3d}
.fc.flipped .fc-inner{transform:rotateY(180deg)}
.fc-front,.fc-back{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:16px;display:flex;align-items:center;justify-content:center;padding:1.5rem;text-align:center}
.fc-back{transform:rotateY(180deg)}
.xp-bar{height:5px;background:#E8DDD0;border-radius:6px;overflow:hidden}
.xp-fill{height:100%;background:linear-gradient(90deg,#C4622D,#E8854D);border-radius:6px;transition:width .6s ease}
.check-box{width:22px;height:22px;min-width:22px;border:2px solid #E8DDD0;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:all .2s ease}
.check-box.done{background:#C4622D;border-color:#C4622D;color:white}
.qopt{background:white;border:2px solid #E8DDD0;border-radius:12px;padding:13px 16px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:.9rem;text-align:left;width:100%;transition:all .2s ease;color:#1C3A2B;line-height:1.5}
.qopt:hover:not(:disabled){border-color:#C4622D;background:rgba(196,98,45,.04)}
.qopt.selected{border-color:#2D7A4F;background:rgba(45,122,79,.07);color:#2D7A4F;font-weight:500}
.qopt.correct{border-color:#2D7A4F!important;background:rgba(45,122,79,.1)!important;color:#2D7A4F!important;font-weight:500!important}
.qopt.wrong{border-color:#C4622D!important;background:rgba(196,98,45,.08)!important;color:#C4622D!important}
.spice{background:white;border:2px solid #E8DDD0;border-radius:14px;padding:1rem;cursor:pointer;transition:all .25s ease;text-align:center}
.spice:hover{border-color:#C4622D;transform:translateY(-2px);box-shadow:0 6px 20px rgba(196,98,45,.12)}
.spice.open{border-color:#C4622D;background:rgba(196,98,45,.03)}
.insight-box{background:linear-gradient(135deg,rgba(28,58,43,.06),rgba(196,98,45,.06));border-radius:14px;padding:1rem;border-left:4px solid #C4622D;margin-bottom:.8rem}
`;

// ─── DEEP PROMPT ─────────────────────────────────────────────────────────────
function buildDeepPrompt(topic, timePerDay, contextQ, contextAns, isMastery=false) {
  const ctx = contextQ.map((q,i)=>`${q.q}: ${contextAns[i]||"not specified"}`).join(". ");
  
  return `You are building a FORAY learning plan. This is a premium learning app. Return ONLY valid JSON — no markdown, no extra text.

TOPIC: "${topic}"
DAILY TIME: ${timePerDay}
CONTEXT: ${ctx}
${isMastery ? "MODE: MASTERY — learner has completed the foundation. Go much deeper, assume basics are known, cover edge cases, advanced techniques, and real expertise." : "MODE: FOUNDATION — beginner starting from zero."}

━━━ STEP 1: CLASSIFY THIS TOPIC ━━━
Before building anything, think carefully about what kind of topic this is:

URGENT PRACTICAL (change a tyre, apply a screen guard, use a fire extinguisher, basic first aid):
→ Goal: learner can DO this successfully and safely in ONE session
→ Plan backwards from success: what is the minimum they need to know to do it right?
→ 1 day MAXIMUM. Structure: tools check → one video → precise step-by-step → done
→ No theory unless it prevents a dangerous mistake
→ Include local context from their country/region if relevant (emergency numbers, apps, services)
→ Mastery plan covers: edge cases, better tools, understanding WHY each step matters

CREATIVE SKILL (editing, photography, drawing, cooking, music):
→ Goal: learner produces something they're proud of
→ Foundation: 3-7 days covering core techniques
→ Each day builds on the last. Include real techniques with names, not generic advice
→ Include the mechanism behind every technique (WHY it works, not just WHAT to do)
→ Use specific numbers, industry terms, pro shortcuts

KNOWLEDGE/MYTHOLOGY/HISTORY/PHILOSOPHY:
→ Goal: learner understands the structure and can follow references and discussions
→ 7-21 days. Heavy on concepts, flashcards, scenarios
→ No assignments (you can't "do" mythology). Use watch days for documentaries
→ Organise by narrative arc or thematic structure, not alphabetically

LANGUAGE:
→ Goal: functional use in real situations
→ 21-30 days minimum
→ Teach patterns not just words. Include how native speakers actually use it vs textbook version
→ Dialogue scenarios over vocabulary drills

TECHNICAL/CODE:
→ Goal: learner can build or fix something real
→ Heavy on concept days with visual breakdowns, then assignments
→ Every concept day must include a working example they can try immediately

WELLNESS/FITNESS/MOVEMENT:
→ Goal: learner can perform the movement correctly and safely
→ Include biomechanics. Wrong form causes injury — explain exactly what to avoid and why

━━━ STEP 2: CONTENT RULES ━━━
These apply to EVERY day regardless of topic type:

1. EXPLAIN THE MECHANISM, not just the action. "Use trending audio" is bad. "Instagram's algorithm indexes audio and surfaces your reel to everyone who recently engaged with that sound — regardless of whether they follow you" is good.
2. ONE COUNTERINTUITIVE INSIGHT per lesson. The thing that surprises people.
3. SPECIFIC NUMBERS when they exist. "First 3 seconds determine 70% of watch completion" beats "hook them early."
4. VISUAL ITEMS must show contrast: wrong vs right, before vs after, beginner vs pro.
5. SCENARIOS must reflect real mistakes beginners actually make.
6. FLASHCARDS must carry a surprising or precise fact, never just a definition.
7. WATCH days: recommend a specific search that returns genuinely useful tutorials. The video_id is your best guess at a real popular tutorial ID.

━━━ STEP 3: LOCAL AND SITUATIONAL CONTEXT ━━━
Use the context answers to personalise:
- Country/region → mention local apps, services, emergency numbers, brands, terminology
- Background → adjust examples and references accordingly  
- Urgency → if they need this NOW, front-load the doing, save the theory
- Skill level → if they have prior exposure, skip the absolute basics

━━━ DAY TYPES ━━━

"orient" — ONLY for topics with physical ingredients/tools/equipment the learner needs to recognise first.
  orient_items: [{emoji, name, smell_or_feel, use, pro_tip}] (6-10 items)
  intro: string

"concept" — core insight lesson.
  lesson: string (4-5 sentences with mechanism, insight, specific detail — NOT generic advice)
  visual_items: [{emoji, label, description}] (3-5 items showing contrast or progression)
  insight: string (the one counterintuitive fact, 1-2 sentences)
  quiz: {question, options:[4], correct:0-3, explanation:string}

"watch" — video lesson with guided observation.
  youtube_search: string (specific search query for this exact subtopic)
  youtube_video_id: string (best guess at a real popular tutorial ID for this)
  watch_duration: string
  watch_intro: string (why this specific video, what makes it the right one)
  watch_points: [3-4 specific things to notice, ideally with timing cues]
  quiz: {question, options:[4], correct:0-3, explanation:string}

"flashcard" — memory sprint with insightful cards.
  flashcards: [{front, back}] (8-12 cards. Back must contain a surprising or precise fact)

"assignment" — real world task.
  mission: string (specific, with clear success criteria)
  steps: [{step, why, tip}] (4-6 steps. WHY is mandatory for each)
  success_looks_like: string
  local_resources: string (relevant apps, services, numbers for their country — leave empty string if not applicable)
  no_pressure_text: string

"scenario" — decision game.
  scenarios: [{situation, options:[3-4], correct:0-3, explanation}] (3-5 real situations beginners get wrong)

"review" — weekly mastery check. 70% to pass.
  review_questions: [{question, options:[4], correct:0-3}] (6-8 questions)

━━━ OUTPUT ━━━
{
  "title": "specific title",
  "overview": "2 sentences on exactly what they will be able to DO after this",
  "emoji": "single emoji",
  "total_days": number,
  "topic_type": "practical|creative|knowledge|language|technical|wellness",
  "is_mastery": ${isMastery},
  "days": [ { "day": 1, "type": "...", "title": "...", ...type-specific fields } ]
}`;
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ xp, streak, topic }) {
  const lvl = getLevel(xp);
  const pct = ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return (
    <div style={{background:"#1C3A2B",padding:"0.75rem 1.2rem",position:"sticky",top:0,zIndex:50}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"0.4rem"}}>
        <div style={{fontSize:"1.5rem",fontFamily:"'Dancing Script',cursive",color:"#FBF7F0"}}>Foray</div>
        <div style={{display:"flex",alignItems:"center",gap:"0.9rem"}}>
          {streak>0&&<div style={{fontSize:"0.82rem",color:"#E8854D",fontWeight:"500",fontFamily:"'DM Sans',sans-serif"}}>🔥 {streak}</div>}
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:"0.7rem",color:"rgba(251,247,240,.45)",fontFamily:"'DM Sans',sans-serif"}}>{LEVELS[lvl]}</div>
            <div style={{fontSize:"0.82rem",color:"rgba(251,247,240,.8)",fontWeight:"500",fontFamily:"'DM Sans',sans-serif"}}>{xp} XP</div>
          </div>
        </div>
      </div>
      <div className="xp-bar"><div className="xp-fill" style={{width:`${pct}%`}}/></div>
    </div>
  );
}

// ─── AI TUTOR ─────────────────────────────────────────────────────────────────
function AITutor({ topic, dayTitle, context }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([{role:"ai",text:`Your tutor here. Ask me anything about ${topic} — stuck, confused, or just curious.`}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>{ if(open) endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,open]);

  const send = async () => {
    if(!input.trim()||loading) return;
    const msg = input.trim(); setInput("");
    setMsgs(m=>[...m,{role:"user",text:msg}]); setLoading(true);
    try {
      const history = msgs.filter(m=>m.role==="user").map(m=>({role:"user",content:m.text}));
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:350,
          system:`Expert tutor for "${topic}". Current lesson: "${dayTitle}". Context: ${JSON.stringify(context)}. Be specific, practical, encouraging. Max 3 sentences. Never waffle. If they describe a problem, give ONE precise fix.`,
          messages:[...history,{role:"user",content:msg}]})
      });
      const d = await res.json();
      setMsgs(m=>[...m,{role:"ai",text:d.content[0].text}]);
    } catch(e) { setMsgs(m=>[...m,{role:"ai",text:"Connection issue — try again."}]); }
    setLoading(false);
  };

  if(!open) return (
    <button onClick={()=>setOpen(true)} className="btn-ghost" style={{width:"100%",padding:"11px",borderRadius:"12px",fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",gap:".5rem"}}>
      💬 Ask your tutor
    </button>
  );
  return (
    <div style={{background:"white",borderRadius:"16px",border:"2px solid #E8DDD0",padding:"1rem",marginTop:".8rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".7rem"}}>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:".9rem",color:"#1C3A2B"}}>Tutor</span>
        <button onClick={()=>setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#8B7355",fontSize:"1.2rem",lineHeight:1}}>×</button>
      </div>
      <div style={{maxHeight:"200px",overflowY:"auto",display:"flex",flexDirection:"column",gap:".5rem",marginBottom:".8rem"}}>
        {msgs.map((m,i)=><div key={i} className={m.role==="user"?"chat-user":"chat-ai"}>{m.text}</div>)}
        {loading&&<div className="chat-ai" style={{opacity:.5,animation:"pulse 1s infinite"}}>thinking...</div>}
        <div ref={endRef}/>
      </div>
      <div style={{display:"flex",gap:".5rem"}}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything..."
          style={{flex:1,padding:"9px 13px",border:"2px solid #E8DDD0",borderRadius:"10px",fontSize:".88rem",fontFamily:"'DM Sans',sans-serif",color:"#1C3A2B",background:"white"}}
          onFocus={e=>e.target.style.borderColor="#C4622D"} onBlur={e=>e.target.style.borderColor="#E8DDD0"}/>
        <button onClick={send} className="btn-primary" style={{padding:"9px 15px",borderRadius:"10px",fontSize:".9rem"}}>→</button>
      </div>
    </div>
  );
}

// ─── VIDEO EMBED ──────────────────────────────────────────────────────────────
function VideoEmbed({ videoId, searchQuery, title }) {
  const [currentId, setCurrentId] = useState(videoId||"");
  const [swapping, setSwapping] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const getEmbedId = (input) => {
    const match = input.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input.trim();
  };

  return (
    <div style={{marginBottom:"1rem"}}>
      {currentId ? (
        <div style={{borderRadius:"14px",overflow:"hidden",background:"#000",marginBottom:".5rem"}}>
          <iframe width="100%" height="215" src={`https://www.youtube.com/embed/${currentId}`}
            title={title} frameBorder="0" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen
            style={{display:"block"}}/>
        </div>
      ) : (
        <div style={{background:"#1C3A2B",borderRadius:"14px",padding:"1.5rem",textAlign:"center",marginBottom:".5rem"}}>
          <div style={{fontSize:"2rem",marginBottom:".5rem"}}>▶️</div>
          <div style={{fontSize:".82rem",color:"rgba(251,247,240,.6)",fontFamily:"'DM Sans',sans-serif"}}>Search: <em style={{color:"rgba(251,247,240,.9)"}}>{searchQuery}</em></div>
          <div style={{fontSize:".75rem",color:"rgba(251,247,240,.4)",marginTop:".3rem"}}>on YouTube</div>
        </div>
      )}
      {!swapping ? (
        <button onClick={()=>setSwapping(true)} style={{background:"transparent",border:"none",color:"#8B7355",fontSize:".75rem",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif",padding:0}}>
          Not the right video? Swap it
        </button>
      ) : (
        <div className="slidein" style={{display:"flex",gap:".5rem",alignItems:"center"}}>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
            placeholder="Paste YouTube URL or video ID"
            style={{flex:1,padding:"8px 12px",border:"2px solid #E8DDD0",borderRadius:"10px",fontSize:".82rem",fontFamily:"'DM Sans',sans-serif",color:"#1C3A2B"}}
            onFocus={e=>e.target.style.borderColor="#C4622D"} onBlur={e=>e.target.style.borderColor="#E8DDD0"}/>
          <button className="btn-primary" onClick={()=>{setCurrentId(getEmbedId(searchInput));setSwapping(false);setSearchInput("");}} style={{padding:"8px 14px",borderRadius:"10px",fontSize:".82rem"}}>Swap</button>
          <button onClick={()=>setSwapping(false)} style={{background:"none",border:"none",cursor:"pointer",color:"#8B7355",fontSize:"1.1rem"}}>×</button>
        </div>
      )}
    </div>
  );
}

// ─── QUIZ BLOCK ───────────────────────────────────────────────────────────────
function QuizBlock({ quiz, onCorrect }) {
  const [ans, setAns] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const correct = submitted && ans === quiz.correct;

  const handleCheck = () => {
    const isCorrect = ans === quiz.correct;
    setSubmitted(true);
    setAttempts(a => a + 1);
    if(isCorrect && onCorrect) onCorrect();
  };

  const handleRetry = () => { setAns(null); setSubmitted(false); };

  return (
    <div style={{background:"white",borderRadius:"14px",border:"2px solid #E8DDD0",padding:"1.1rem",marginBottom:".9rem"}}>
      <div className="tag" style={{color:"#8B7355",marginBottom:".6rem"}}>📝 Quick check</div>
      <p style={{fontWeight:"500",fontSize:".93rem",color:"#1C3A2B",marginBottom:".8rem",lineHeight:1.5}}>{quiz.question}</p>
      <div style={{display:"flex",flexDirection:"column",gap:".5rem"}}>
        {quiz.options.map((o,i)=>{
          let cls="qopt";
          if(submitted){ cls+=i===quiz.correct?" correct":i===ans?" wrong":""; }
          else if(ans===i) cls+=" selected";
          return <button key={i} disabled={submitted} className={cls} onClick={()=>setAns(i)}>{String.fromCharCode(65+i)}. {o}</button>;
        })}
      </div>
      {ans!==null&&!submitted&&(
        <button onClick={handleCheck} className="btn-primary" style={{marginTop:".8rem",padding:"10px 22px",borderRadius:"10px",fontSize:".88rem"}}>Check →</button>
      )}
      {submitted&&(
        <div className="popin">
          <div style={{marginTop:".7rem",padding:".8rem",borderRadius:"10px",background:correct?"rgba(45,122,79,.08)":"rgba(196,98,45,.08)",fontSize:".84rem",color:correct?"#2D7A4F":"#C4622D",fontWeight:"500",lineHeight:1.55}}>
            {correct?"✓ Correct! ":"✗ Not quite — "}{quiz.explanation||quiz.options[quiz.correct]}
          </div>
          {!correct && attempts < 2 && (
            <button onClick={handleRetry} className="btn-ghost" style={{marginTop:".7rem",width:"100%",padding:"10px",borderRadius:"10px",fontSize:".88rem"}}>Try again →</button>
          )}
          {(!correct && attempts >= 2 && onCorrect) && (
            <button onClick={onCorrect} className="btn-primary" style={{marginTop:".7rem",width:"100%",padding:"10px",borderRadius:"10px",fontSize:".88rem"}}>Continue anyway →</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DAY TYPES ────────────────────────────────────────────────────────────────

function OrientDay({ day, onComplete }) {
  const [revealed, setRevealed] = useState([]);
  const items = day.orient_items||[];
  const enough = revealed.length >= Math.ceil(items.length*.6);
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>🌿 Meet your ingredients</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:".6rem",fontWeight:"400",lineHeight:1.35}}>{day.title}</h1>
      <p style={{color:"#8B7355",fontSize:".88rem",lineHeight:1.7,marginBottom:"1rem"}}>{day.intro}</p>
      <p style={{fontSize:".78rem",color:"#C4622D",marginBottom:"1rem",fontStyle:"italic"}}>Tap each one to discover it →</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:".65rem",marginBottom:"1.2rem"}}>
        {items.map((it,i)=>(
          <div key={i} className={`spice ${revealed.includes(i)?"open":""}`} onClick={()=>!revealed.includes(i)&&setRevealed([...revealed,i])}>
            <div style={{fontSize:"2rem",marginBottom:".3rem"}}>{it.emoji}</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:".95rem",color:"#1C3A2B",marginBottom:revealed.includes(i)?".4rem":"0"}}>{it.name}</div>
            {revealed.includes(i)&&(
              <div className="slidein">
                <div style={{fontSize:".75rem",color:"#C4622D",fontWeight:"500",marginBottom:"2px"}}>{it.smell_or_feel}</div>
                <div style={{fontSize:".75rem",color:"#8B7355",lineHeight:1.5,marginBottom:"4px"}}>{it.use}</div>
                {it.pro_tip&&<div style={{fontSize:".72rem",color:"#1C3A2B",background:"rgba(28,58,43,.06)",borderRadius:"6px",padding:"4px 6px",lineHeight:1.45}}>💡 {it.pro_tip}</div>}
              </div>
            )}
            {!revealed.includes(i)&&<div style={{fontSize:".7rem",color:"#8B7355",marginTop:"3px"}}>tap to reveal</div>}
          </div>
        ))}
      </div>
      {enough&&<button onClick={onComplete} className="btn-primary popin" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>I've met my ingredients →</button>}
      {!enough&&<p style={{fontSize:".78rem",color:"#8B7355",textAlign:"center",fontStyle:"italic"}}>Reveal at least {Math.ceil(items.length*.6)} to continue</p>}
    </div>
  );
}

function ConceptDay({ day, onComplete }) {
  const [quizDone, setQuizDone] = useState(false);
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>📖 Concept</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:".8rem",fontWeight:"400",lineHeight:1.35}}>{day.title}</h1>
      <div style={{background:"white",borderRadius:"14px",padding:"1.1rem",marginBottom:".8rem",borderLeft:"4px solid #C4622D",boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
        <p style={{color:"#2C1810",fontSize:".92rem",lineHeight:1.8}}>{day.lesson}</p>
      </div>
      {day.insight&&(
        <div className="insight-box">
          <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>💡 Did you know</div>
          <p style={{fontSize:".88rem",color:"#2C1810",lineHeight:1.65,margin:0,fontStyle:"italic"}}>{day.insight}</p>
        </div>
      )}
      {day.visual_items&&(
        <div style={{marginBottom:".9rem"}}>
          <div className="tag" style={{color:"#8B7355",marginBottom:".55rem"}}>Visual breakdown</div>
          {day.visual_items.map((v,i)=>(
            <div key={i} style={{display:"flex",gap:".75rem",alignItems:"flex-start",padding:".7rem .9rem",background:"white",borderRadius:"12px",border:"2px solid #E8DDD0",marginBottom:".45rem"}}>
              <div style={{fontSize:"1.25rem",minWidth:"1.7rem"}}>{v.emoji}</div>
              <div><div style={{fontWeight:"500",fontSize:".87rem",color:"#1C3A2B",marginBottom:"2px"}}>{v.label}</div>
              <div style={{fontSize:".82rem",color:"#8B7355",lineHeight:1.55}}>{v.description}</div></div>
            </div>
          ))}
        </div>
      )}
      {day.quiz&&<QuizBlock quiz={day.quiz} onCorrect={()=>setQuizDone(true)}/>}
      {quizDone&&<button onClick={onComplete} className="btn-primary popin" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Complete day →</button>}
    </div>
  );
}

function WatchDay({ day, onComplete }) {
  const [checked, setChecked] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const allChecked = (day.watch_points||[]).length>0&&checked.length>=(day.watch_points||[]).length;
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>▶️ Watch & Learn</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:".8rem",fontWeight:"400",lineHeight:1.35}}>{day.title}</h1>
      <VideoEmbed videoId={day.youtube_video_id} searchQuery={day.youtube_search} title={day.title}/>
      <div style={{background:"rgba(28,58,43,.06)",borderRadius:"12px",padding:".85rem",marginBottom:".9rem",fontSize:".84rem",color:"#1C3A2B",lineHeight:1.65}}>{day.watch_intro}</div>
      {day.watch_points&&(
        <div style={{marginBottom:"1rem"}}>
          <div className="tag" style={{color:"#8B7355",marginBottom:".5rem"}}>While you watch, notice:</div>
          {day.watch_points.map((p,i)=>(
            <div key={i} style={{display:"flex",gap:".7rem",alignItems:"flex-start",padding:".55rem 0",cursor:"pointer"}} onClick={()=>setChecked(c=>c.includes(i)?c.filter(x=>x!==i):[...c,i])}>
              <div className={`check-box ${checked.includes(i)?"done":""}`}>{checked.includes(i)&&<span style={{fontSize:".7rem"}}>✓</span>}</div>
              <span style={{fontSize:".88rem",color:"#1C3A2B",lineHeight:1.6,paddingTop:"1px"}}>{p}</span>
            </div>
          ))}
        </div>
      )}
      {allChecked&&day.quiz&&<QuizBlock quiz={day.quiz} onCorrect={()=>setQuizDone(true)}/>}
      {quizDone&&<button onClick={onComplete} className="btn-primary popin" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Complete day →</button>}
    </div>
  );
}

function FlashcardDay({ day, onComplete }) {
  const [deck, setDeck] = useState(() => [...(day.flashcards||[])]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState((day.flashcards||[]).length);
  const [done, setDone] = useState(false);

  const next = knew => {
    setFlipped(false);
    setTimeout(() => {
      if(knew) {
        setScore(s => s + 1);
        const newDeck = deck.filter((_,i) => i !== idx);
        if(newDeck.length === 0) { setDone(true); return; }
        setDeck(newDeck);
        setIdx(i => Math.min(i, newDeck.length - 1));
      } else {
        // move card to end of deck
        const card = deck[idx];
        const newDeck = [...deck.filter((_,i) => i !== idx), card];
        setDeck(newDeck);
        setTotal(t => t + 1);
        setIdx(i => Math.min(i, newDeck.length - 1));
      }
    }, 200);
  };

  if(done) return (
    <div className="fadein" style={{textAlign:"center",padding:"1.5rem 0"}}>
      <div style={{fontSize:"2.8rem",marginBottom:".7rem"}}>⚡</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:"#1C3A2B",marginBottom:".4rem"}}>Sprint done</div>
      <div style={{color:"#8B7355",marginBottom:"1.5rem"}}>{score} cards mastered</div>
      <button onClick={onComplete} className="btn-primary" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Complete day →</button>
    </div>
  );

  const card = deck[idx];
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>⚡ Flashcard Sprint</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:".5rem",fontWeight:"400"}}>{day.title}</h1>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"1.1rem"}}>
        <span style={{fontSize:".8rem",color:"#8B7355"}}>{deck.length} remaining</span>
        <span style={{fontSize:".8rem",color:"#C4622D",fontWeight:"500"}}>Mastered: {score}</span>
      </div>
      <div className={`fc ${flipped?"flipped":""}`} style={{height:"190px",marginBottom:"1rem"}} onClick={()=>setFlipped(!flipped)}>
        <div className="fc-inner">
          <div className="fc-front" style={{background:"#1C3A2B"}}><div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",color:"#FBF7F0",lineHeight:1.5}}>{card.front}</div></div>
          <div className="fc-back" style={{background:"white",border:"2px solid #C4622D"}}><div style={{fontSize:".88rem",color:"#2C1810",lineHeight:1.65}}>{card.back}</div></div>
        </div>
      </div>
      {!flipped
        ? <p style={{textAlign:"center",fontSize:".8rem",color:"#8B7355",fontStyle:"italic"}}>Tap to reveal →</p>
        : <div style={{display:"flex",gap:".7rem"}} className="popin">
            <button className="btn-ghost" onClick={()=>next(false)} style={{flex:1,padding:"13px",borderRadius:"12px",fontSize:".9rem"}}>Not yet 🔁</button>
            <button className="btn-primary" onClick={()=>next(true)} style={{flex:1,padding:"13px",borderRadius:"12px",fontSize:".9rem"}}>Got it ✓</button>
          </div>
      }
      {!flipped && deck.length < (day.flashcards||[]).length && (
        <p style={{textAlign:"center",fontSize:".75rem",color:"#C4622D",marginTop:".5rem",fontStyle:"italic"}}>Cards you don't know yet will come back around</p>
      )}
    </div>
  );
}

function AssignmentDay({ day, context, onComplete }) {
  const [checked, setChecked] = useState([]);
  const [attempted, setAttempted] = useState(false);
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>🎯 Assignment</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:".8rem",fontWeight:"400",lineHeight:1.35}}>{day.title}</h1>
      <div style={{background:"#FDF3EC",borderRadius:"14px",padding:"1.1rem",marginBottom:".9rem"}}>
        <div className="tag" style={{color:"#8B7355",marginBottom:".5rem"}}>Your mission</div>
        <p style={{fontSize:".9rem",color:"#2C1810",lineHeight:1.7,margin:0}}>{day.mission}</p>
      </div>
      {(day.steps||[]).length>0&&(
        <div style={{background:"white",borderRadius:"14px",border:"2px solid #E8DDD0",padding:"1.1rem",marginBottom:".9rem"}}>
          <div className="tag" style={{color:"#8B7355",marginBottom:".6rem"}}>Step by step</div>
          {day.steps.map((s,i)=>(
            <div key={i} style={{display:"flex",gap:".7rem",alignItems:"flex-start",padding:".6rem 0",borderBottom:i<day.steps.length-1?"1px solid #F0EAE2":"none",cursor:"pointer"}} onClick={()=>setChecked(c=>c.includes(i)?c.filter(x=>x!==i):[...c,i])}>
              <div className={`check-box ${checked.includes(i)?"done":""}`}>{checked.includes(i)&&<span style={{fontSize:".7rem"}}>✓</span>}</div>
              <div>
                <div style={{fontSize:".88rem",color:"#1C3A2B",lineHeight:1.6,fontWeight:"500"}}>{s.step}</div>
                {s.why&&<div style={{fontSize:".78rem",color:"#C4622D",marginTop:"2px",fontStyle:"italic"}}>Why: {s.why}</div>}
                {s.tip&&<div style={{fontSize:".78rem",color:"#8B7355",marginTop:"2px"}}>💡 {s.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {day.success_looks_like&&(
        <div style={{background:"rgba(45,122,79,.07)",borderRadius:"12px",padding:".85rem",marginBottom:".9rem",fontSize:".84rem",color:"#1C3A2B",lineHeight:1.65}}>
          <span style={{fontWeight:"500",color:"#2D7A4F"}}>✓ Success looks like: </span>{day.success_looks_like}
        </div>
      )}
      <div style={{background:"rgba(28,58,43,.05)",borderRadius:"12px",padding:".85rem",marginBottom:".9rem",fontSize:".82rem",color:"#8B7355",lineHeight:1.65}}>
        <span style={{fontWeight:"500",color:"#1C3A2B"}}>No pressure. </span>{day.no_pressure_text||"This is a real-world task. Try when you can. Your tutor is below if you get stuck."}
      </div>
      {day.local_resources&&day.local_resources.length>0&&(
        <div style={{background:"rgba(196,98,45,.06)",borderRadius:"12px",padding:".85rem",marginBottom:".9rem",border:"2px solid rgba(196,98,45,.2)"}}>
          <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>📍 Useful in your area</div>
          <p style={{fontSize:".85rem",color:"#2C1810",lineHeight:1.65,margin:0}}>{day.local_resources}</p>
        </div>
      )}
      <AITutor topic={context.topic||"this topic"} dayTitle={day.title} context={context}/>
      <div style={{marginTop:"1rem"}}>
        {!attempted
          ?<button onClick={()=>setAttempted(true)} className="btn-primary" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>I've tried it (or I'll do it later) →</button>
          :<button onClick={onComplete} className="btn-primary popin" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Complete day →</button>
        }
      </div>
    </div>
  );
}

function ScenarioDay({ day, onComplete }) {
  const [scene, setScene] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [shown, setShown] = useState(false);
  const [score, setScore] = useState(0);
  const scenes = day.scenarios||[];
  if(scene>=scenes.length) return (
    <div className="fadein" style={{textAlign:"center",padding:"1.5rem 0"}}>
      <div style={{fontSize:"2.8rem",marginBottom:".7rem"}}>🧠</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.3rem",color:"#1C3A2B",marginBottom:".4rem"}}>Scenarios done</div>
      <div style={{color:"#8B7355",marginBottom:"1.5rem"}}>{score}/{scenes.length} correct</div>
      <button onClick={onComplete} className="btn-primary" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Complete day →</button>
    </div>
  );
  const s = scenes[scene];
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>🎭 Scenario {scene+1}/{scenes.length}</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:"1rem",fontWeight:"400"}}>{day.title}</h1>
      <div style={{background:"#1C3A2B",borderRadius:"14px",padding:"1.1rem",marginBottom:"1rem",color:"#FBF7F0"}}>
        <p style={{fontSize:".92rem",lineHeight:1.7,margin:0}}>{s.situation}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:".5rem",marginBottom:".8rem"}}>
        {s.options.map((o,i)=>{
          let cls="qopt";
          if(shown){cls+=i===s.correct?" correct":i===chosen?" wrong":"";}
          else if(chosen===i)cls+=" selected";
          return <button key={i} disabled={shown} className={cls} onClick={()=>setChosen(i)}>{o}</button>;
        })}
      </div>
      {chosen!==null&&!shown&&<button onClick={()=>{setShown(true);if(chosen===s.correct)setScore(x=>x+1);}} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:"12px",fontSize:".9rem"}}>Check</button>}
      {shown&&(
        <div className="popin">
          <div style={{padding:".85rem",borderRadius:"12px",background:chosen===s.correct?"rgba(45,122,79,.08)":"rgba(196,98,45,.08)",color:chosen===s.correct?"#2D7A4F":"#C4622D",fontSize:".85rem",lineHeight:1.65,marginBottom:".8rem"}}>{s.explanation}</div>
          <button onClick={()=>{setScene(x=>x+1);setChosen(null);setShown(false);}} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:"12px",fontSize:".9rem"}}>{scene<scenes.length-1?"Next →":"See results →"}</button>
        </div>
      )}
    </div>
  );
}

function ReviewDay({ day, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirmed, setConfirmed] = useState({});
  const [done, setDone] = useState(false);
  const qs = day.review_questions||[];
  const score = qs.filter((q,i)=>answers[i]===q.correct).length;
  const pct = qs.length>0?Math.round(score/qs.length*100):0;

  if(done) return (
    <div className="fadein" style={{textAlign:"center",padding:"1rem 0"}}>
      <div style={{fontSize:"3rem",marginBottom:".8rem"}}>{pct>=70?"⭐":"📚"}</div>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:".4rem"}}>{pct>=70?"Week mastered!":"Keep going"}</div>
      <div style={{color:"#8B7355",marginBottom:"1.5rem"}}>{score}/{qs.length} · {pct}%</div>
      {pct>=70
        ?<button onClick={onComplete} className="btn-primary" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Continue →</button>
        :<><p style={{fontSize:".85rem",color:"#8B7355",marginBottom:"1rem",lineHeight:1.65}}>Review the past days and retry</p>
          <button onClick={()=>{setDone(false);setAnswers({});setConfirmed({});setIdx(0);}} className="btn-ghost" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem"}}>Retry</button></>
      }
    </div>
  );

  const q = qs[idx];
  const isConfirmed = confirmed[idx];
  return (
    <div className="fadein">
      <div className="tag" style={{color:"#C4622D",marginBottom:".4rem"}}>🔁 Review · Q{idx+1}/{qs.length}</div>
      <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.4rem",color:"#1C3A2B",marginBottom:"1rem",fontWeight:"400"}}>{day.title}</h1>
      <div style={{background:"white",borderRadius:"14px",border:"2px solid #E8DDD0",padding:"1.1rem",marginBottom:".9rem"}}>
        <p style={{fontWeight:"500",fontSize:".93rem",color:"#1C3A2B",lineHeight:1.55,margin:0}}>{q.question}</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:".5rem",marginBottom:".9rem"}}>
        {q.options.map((o,i)=>{
          let cls="qopt";
          if(isConfirmed){cls+=i===q.correct?" correct":i===answers[idx]?" wrong":"";}
          else if(answers[idx]===i)cls+=" selected";
          return <button key={i} disabled={isConfirmed} className={cls} onClick={()=>!isConfirmed&&setAnswers({...answers,[idx]:i})}>{String.fromCharCode(65+i)}. {o}</button>;
        })}
      </div>
      {answers[idx]!==undefined&&!isConfirmed&&(
        <button onClick={()=>setConfirmed({...confirmed,[idx]:true})} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:"12px",fontSize:".9rem",marginBottom:".6rem"}}>Check answer</button>
      )}
      {isConfirmed&&(
        <div className="popin">
          <div style={{padding:".7rem",borderRadius:"10px",background:answers[idx]===q.correct?"rgba(45,122,79,.08)":"rgba(196,98,45,.08)",fontSize:".84rem",color:answers[idx]===q.correct?"#2D7A4F":"#C4622D",fontWeight:"500",marginBottom:".8rem",lineHeight:1.5}}>
            {answers[idx]===q.correct?"✓ Correct!":"✗ Answer: "+q.options[q.correct]}
          </div>
          <button onClick={()=>{ if(idx<qs.length-1)setIdx(i=>i+1); else setDone(true); }} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:"12px",fontSize:".9rem"}}>
            {idx<qs.length-1?"Next question →":"See results"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Foray() {
  const [screen, setScreen] = useState("landing");
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [timePerDay, setTimePerDay] = useState("");
  const [contextQ, setContextQ] = useState([]);
  const [contextAns, setContextAns] = useState({});
  const [plan, setPlan] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [completedDays, setCompletedDays] = useState([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState(null);
  const [isMastery, setIsMastery] = useState(false);
  const [words] = useState(()=>TOPICS_FLOAT.map((t,i)=>({text:t,x:4+Math.random()*90,y:4+Math.random()*90,dur:18+Math.random()*20,delay:Math.random()*-15,size:.6+Math.random()*.5,opacity:.07+Math.random()*.2,drift:i%3})));

  const getCtxQ = t => {
    const l = t.toLowerCase();
    const base = [
      {q:"What's your situation?", opts:["I need to do this soon / urgently","Learning for when I'll need it","Pure curiosity / interest"]},
      {q:"Where are you based?", opts:["India","UK","US / Canada","Europe","Other"]}
    ];
    if(l.includes("cook")||l.includes("food")||l.includes("bak")||l.includes("recipe")||l.includes("chef"))
      return [...base, {q:"What's your food background?",opts:["Indian","East Asian","Mediterranean","Western","Mixed / Other"]}];
    if(l.includes("spanish")||l.includes("french")||l.includes("japanese")||l.includes("language")||l.includes("hindi")||l.includes("mandarin")||l.includes("german")||l.includes("italian"))
      return [...base, {q:"Why are you learning it?",opts:["Travel","Work","Heritage / family","Just curious"]}];
    return [...base, {q:"How would you describe yourself?",opts:["Complete beginner","Tried before, didn't stick","Some basics, want to go deeper"]}];
  };

  const generate = async (mastery=false) => {
    setIsMastery(mastery);
    setScreen("generating");
    setError(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:6000,
          messages:[{role:"user",content:buildDeepPrompt(topic,timePerDay,contextQ,contextAns,mastery)}]})
      });
      const data = await res.json();
      if(data.error) throw new Error(data.error.message);
      const rawText = data.content[0].text.replace(/```json|```/g,"").trim();
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if(!jsonMatch) throw new Error("No valid JSON in response");
      setPlan(JSON.parse(jsonMatch[0]));
      setCurrentDay(0);
      setCompletedDays([]);
      setScreen("plan");
    } catch(e) {
      setError("Couldn't build your plan — " + (e.message||"unknown error") + ". Please try again.");
      setScreen("time");
    }
  };

  const completeDay = dayIdx => {
    if(completedDays.includes(dayIdx)) return;
    setCompletedDays(d=>[...d,dayIdx]);
    setXp(x=>x+100);
    setStreak(s=>s+1);
    const days = plan?.days||[];
    if(dayIdx < days.length-1) setTimeout(()=>setCurrentDay(dayIdx+1),400);
    else setScreen("complete");
  };

  const reset = () => { setScreen("landing");setStep(0);setTopic("");setTimePerDay("");setContextQ([]);setContextAns({});setPlan(null);setCurrentDay(0);setCompletedDays([]);setXp(0);setStreak(0);setError(null);setIsMastery(false); };

  // LANDING
  if(screen==="landing") return (
    <div style={{minHeight:"100vh",background:"#FBF7F0",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{STYLES}</style>
      {words.map((w,i)=><div key={i} style={{position:"absolute",left:`${w.x}%`,top:`${w.y}%`,fontSize:`${w.size}rem`,color:"#1C3A2B",opacity:w.opacity,fontFamily:"'DM Sans',sans-serif",fontWeight:"300",letterSpacing:".04em",pointerEvents:"none",userSelect:"none",animation:`drift${w.drift} ${w.dur}s ease-in-out infinite`,animationDelay:`${w.delay}s`}}>{w.text}</div>)}
      <div style={{textAlign:"center",zIndex:10}} className="fadein">
        <div style={{fontSize:"5rem",fontFamily:"'Dancing Script',cursive",color:"#1C3A2B",lineHeight:1}}>Foray</div>
        <div style={{width:"36px",height:"2.5px",background:"#C4622D",margin:".6rem auto 1rem",borderRadius:"2px"}}/>
        <p style={{fontSize:".82rem",color:"#8B7355",letterSpacing:".1em",textTransform:"uppercase",fontWeight:"300",marginBottom:"2.8rem"}}>learn anything · one day at a time</p>
        <button className="btn-primary" onClick={()=>setScreen("topic")} style={{padding:"15px 44px",borderRadius:"50px",fontSize:".95rem",letterSpacing:".04em",boxShadow:"0 4px 24px rgba(196,98,45,.25)"}}>Begin your foray →</button>
      </div>
      <div style={{position:"absolute",bottom:"1.8rem",fontSize:".72rem",color:"#8B7355",opacity:.4,fontFamily:"'DM Sans',sans-serif"}}>curious about everything</div>
    </div>
  );

  // TOPIC
  if(screen==="topic") return (
    <div style={{minHeight:"100vh",background:"#FBF7F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <style>{STYLES}</style>
      <div style={{maxWidth:"440px",width:"100%"}} className="fadein">
        <div style={{textAlign:"center",marginBottom:"1.8rem"}}>
          <div style={{fontSize:"2.2rem",fontFamily:"'Dancing Script',cursive",color:"#1C3A2B"}}>Foray</div>
          <div style={{width:"28px",height:"2px",background:"#C4622D",margin:".4rem auto 0"}}/>
        </div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.55rem",color:"#1C3A2B",marginBottom:".5rem",fontWeight:"400"}}>What do you want to learn?</h2>
        <p style={{color:"#8B7355",fontSize:".88rem",marginBottom:"1.4rem",lineHeight:1.65}}>Anything goes — guitar, Indian cooking, Python, reels editing, car maintenance. You name it.</p>
        <input type="text" placeholder="e.g. how to edit Instagram reels" value={topic} onChange={e=>setTopic(e.target.value)}
          onKeyDown={e=>{ if(e.key==="Enter"&&topic.trim()){ const q=getCtxQ(topic); setContextQ(q); setScreen(q.length?"context":"time"); } }}
          autoFocus
          style={{width:"100%",padding:"16px 20px",fontSize:"1rem",border:"2px solid #E8DDD0",borderRadius:"14px",background:"white",color:"#1C3A2B",fontFamily:"'DM Sans',sans-serif",marginBottom:"1.2rem",transition:"border-color .2s",boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}
          onFocus={e=>e.target.style.borderColor="#C4622D"} onBlur={e=>e.target.style.borderColor="#E8DDD0"}/>
        <button className="btn-primary" disabled={!topic.trim()} onClick={()=>{ const q=getCtxQ(topic); setContextQ(q); setScreen(q.length?"context":"time"); }} style={{width:"100%",padding:"15px",borderRadius:"14px",fontSize:"1rem"}}>Continue →</button>
        {error&&<p style={{color:"#C4622D",textAlign:"center",marginTop:"1rem",fontSize:".88rem"}}>{error}</p>}
      </div>
    </div>
  );

  // CONTEXT
  if(screen==="context") {
    const q = contextQ[step];
    const isLast = step===contextQ.length-1;
    return (
      <div style={{minHeight:"100vh",background:"#FBF7F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
        <style>{STYLES}</style>
        <div style={{maxWidth:"440px",width:"100%"}} className="fadein">
          <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
            <div style={{fontSize:"2rem",fontFamily:"'Dancing Script',cursive",color:"#1C3A2B"}}>Foray</div>
            <div style={{width:"24px",height:"2px",background:"#C4622D",margin:".4rem auto 0"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:".4rem"}}>
            <span style={{fontSize:".78rem",color:"#8B7355"}}>{step+1}/{contextQ.length}</span>
            <span style={{fontSize:".78rem",color:"#C4622D",fontStyle:"italic"}}>{topic}</span>
          </div>
          <div style={{height:"3px",background:"#E8DDD0",borderRadius:"3px",overflow:"hidden",marginBottom:"1.4rem"}}>
            <div style={{height:"100%",width:`${((step+1)/contextQ.length)*100}%`,background:"#C4622D",borderRadius:"3px",transition:"width .4s ease"}}/>
          </div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",color:"#1C3A2B",marginBottom:"1.2rem",fontWeight:"400"}}>{q.q}</h2>
          <div style={{display:"flex",flexDirection:"column",gap:".5rem",marginBottom:"1.4rem"}}>
            {q.opts.map(o=><button key={o} className={`opt ${contextAns[step]===o?"sel":""}`} onClick={()=>setContextAns({...contextAns,[step]:o})} style={{padding:"13px 18px",borderRadius:"12px",fontSize:".93rem"}}>{o}</button>)}
          </div>
          <div style={{display:"flex",gap:".7rem"}}>
            {step>0&&<button onClick={()=>setStep(s=>s-1)} className="btn-ghost" style={{padding:"14px 18px",borderRadius:"12px",fontSize:"1rem"}}>←</button>}
            <button className="btn-primary" disabled={!contextAns[step]} onClick={()=>isLast?setScreen("time"):setStep(s=>s+1)} style={{flex:1,padding:"15px",borderRadius:"12px",fontSize:"1rem"}}>{isLast?"Almost there →":"Next →"}</button>
          </div>
        </div>
      </div>
    );
  }

  // TIME
  if(screen==="time") {
    const opts=["15 minutes","30 minutes","45 minutes","1 hour","1.5 hours","2+ hours"];
    return (
      <div style={{minHeight:"100vh",background:"#FBF7F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
        <style>{STYLES}</style>
        <div style={{maxWidth:"440px",width:"100%"}} className="fadein">
          <div style={{textAlign:"center",marginBottom:"1.5rem"}}>
            <div style={{fontSize:"2rem",fontFamily:"'Dancing Script',cursive",color:"#1C3A2B"}}>Foray</div>
            <div style={{width:"24px",height:"2px",background:"#C4622D",margin:".4rem auto 0"}}/>
          </div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"1.5rem",color:"#1C3A2B",marginBottom:".4rem",fontWeight:"400"}}>How much time per day?</h2>
          <p style={{color:"#8B7355",fontSize:".88rem",marginBottom:"1.3rem",lineHeight:1.65}}>Be honest. We'll figure out how many days your journey takes based on what you want to learn.</p>
          <div style={{display:"flex",flexDirection:"column",gap:".5rem",marginBottom:"1.4rem"}}>
            {opts.map(o=><button key={o} className={`opt ${timePerDay===o?"sel":""}`} onClick={()=>setTimePerDay(o)} style={{padding:"13px 18px",borderRadius:"12px",fontSize:".93rem"}}>{o}</button>)}
          </div>
          <div style={{display:"flex",gap:".7rem"}}>
            <button onClick={()=>setScreen(contextQ.length?"context":"topic")} className="btn-ghost" style={{padding:"14px 18px",borderRadius:"12px",fontSize:"1rem"}}>←</button>
            <button className="btn-primary" disabled={!timePerDay} onClick={()=>generate(false)} style={{flex:1,padding:"15px",borderRadius:"12px",fontSize:"1rem"}}>Build my plan →</button>
          </div>
          {error&&<p style={{color:"#C4622D",textAlign:"center",marginTop:"1rem",fontSize:".88rem"}}>{error}</p>}
        </div>
      </div>
    );
  }

  // GENERATING
  if(screen==="generating") return (
    <div style={{minHeight:"100vh",background:"#FBF7F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
      <style>{STYLES}</style>
      <div style={{textAlign:"center"}} className="fadein">
        <div style={{width:"48px",height:"48px",border:"3px solid #E8DDD0",borderTop:"3px solid #C4622D",borderRadius:"50%",animation:"spin .9s linear infinite",margin:"0 auto 1.8rem"}}/>
        <div style={{fontSize:"2.2rem",fontFamily:"'Dancing Script',cursive",color:"#1C3A2B",marginBottom:".8rem"}}>Foray</div>
        <p style={{color:"#8B7355",fontSize:".9rem",lineHeight:1.7}}>Building your {isMastery?"mastery plan for ":""}<em style={{color:"#C4622D"}}>{topic}</em>...</p>
        <p style={{color:"#8B7355",fontSize:".78rem",marginTop:".4rem",opacity:.5}}>This may take a moment</p>
      </div>
    </div>
  );

  // COMPLETE
  if(screen==="complete") return (
    <div style={{minHeight:"100vh",background:"#FBF7F0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem"}}>
      <style>{STYLES}</style>
      <div style={{maxWidth:"440px",width:"100%",textAlign:"center"}} className="fadein">
        <div style={{fontSize:"4rem",marginBottom:"1rem"}}>🌱</div>
        <div style={{fontSize:"2.5rem",fontFamily:"'Dancing Script',cursive",color:"#1C3A2B",marginBottom:".5rem"}}>{isMastery?"Mastery earned":"Foray complete"}</div>
        <div style={{width:"36px",height:"2px",background:"#C4622D",margin:"0 auto 1.2rem"}}/>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",color:"#1C3A2B",lineHeight:1.75,marginBottom:".8rem",fontStyle:"italic"}}>
          You didn't just learn something. You proved to yourself that you could.
        </p>
        <p style={{color:"#8B7355",fontSize:".88rem",lineHeight:1.7,marginBottom:"1.8rem"}}>That's what a foray is. A first step into somewhere new. You took it.</p>
        <div style={{background:"white",borderRadius:"16px",padding:"1.1rem",marginBottom:"1.2rem",border:"2px solid #E8DDD0"}}>
          <div style={{fontSize:"2rem",fontWeight:"600",color:"#C4622D",fontFamily:"'Playfair Display',serif"}}>{xp} XP</div>
          <div style={{fontSize:".82rem",color:"#8B7355",marginTop:"4px"}}>{LEVELS[getLevel(xp)]} · 🔥 {streak} days</div>
        </div>
        {!isMastery&&(
          <button onClick={()=>generate(true)} className="btn-primary" style={{width:"100%",padding:"14px",borderRadius:"14px",fontSize:".95rem",marginBottom:".7rem"}}>
            Go deeper — start mastery plan 🎓
          </button>
        )}
        <button onClick={reset} className="btn-ghost" style={{width:"100%",padding:"13px",borderRadius:"14px",fontSize:".9rem"}}>Start a new foray</button>
      </div>
    </div>
  );

  // PLAN
  if(screen==="plan"&&plan) {
    const days = plan.days||[];
    const today = days[currentDay];
    if(!today) return null;
    const ctx = {topic,timePerDay,...contextAns};

    const renderDay = () => {
      switch(today.type){
        case "orient": return <OrientDay day={today} onComplete={()=>completeDay(currentDay)}/>;
        case "concept": return <ConceptDay day={today} onComplete={()=>completeDay(currentDay)}/>;
        case "watch": return <WatchDay day={today} onComplete={()=>completeDay(currentDay)}/>;
        case "flashcard": return <FlashcardDay day={today} onComplete={()=>completeDay(currentDay)}/>;
        case "assignment": return <AssignmentDay day={today} context={ctx} onComplete={()=>completeDay(currentDay)}/>;
        case "scenario": return <ScenarioDay day={today} onComplete={()=>completeDay(currentDay)}/>;
        case "review": return <ReviewDay day={today} onComplete={()=>completeDay(currentDay)}/>;
        default: return <ConceptDay day={today} onComplete={()=>completeDay(currentDay)}/>;
      }
    };

    return (
      <div style={{minHeight:"100vh",background:"#FBF7F0",fontFamily:"'DM Sans',sans-serif"}}>
        <style>{STYLES}</style>
        <Header xp={xp} streak={streak} topic={topic}/>
        <div style={{background:"#1C3A2B",padding:"0 1.2rem .85rem",display:"flex",gap:"5px",flexWrap:"wrap",alignItems:"center"}}>
          {days.map((_,i)=>(
            <div key={i} className="pip" onClick={()=>{if(completedDays.includes(i)||i<=currentDay)setCurrentDay(i);}}
              style={{background:completedDays.includes(i)?"#C4622D":i===currentDay?"#FBF7F0":"rgba(251,247,240,.18)",cursor:completedDays.includes(i)||i<=currentDay?"pointer":"default"}}/>
          ))}
          <span style={{fontSize:".7rem",color:"rgba(251,247,240,.35)",marginLeft:".3rem",fontFamily:"'DM Sans',sans-serif"}}>Day {currentDay+1}/{days.length}</span>
        </div>
        <div style={{padding:"1.3rem 1.2rem 4rem",maxWidth:"580px",margin:"0 auto"}} key={currentDay} className="fadein">
          {currentDay===0&&(
            <div style={{background:"#1C3A2B",borderRadius:"16px",padding:"1.1rem",marginBottom:"1.2rem",color:"#FBF7F0"}}>
              <div style={{fontSize:".68rem",color:"rgba(251,247,240,.4)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:".4rem"}}>{isMastery?"mastery plan":"your foray"} · {plan.total_days} days</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",marginBottom:".4rem",fontWeight:"400"}}>{plan.emoji} {plan.title}</div>
              <p style={{fontSize:".84rem",color:"rgba(251,247,240,.7)",lineHeight:1.65,margin:0}}>{plan.overview}</p>
            </div>
          )}
          {renderDay()}
          {today.type!=="assignment"&&(
            <div style={{marginTop:"1.1rem"}}>
              <AITutor topic={topic} dayTitle={today.title} context={ctx}/>
            </div>
          )}
          <div style={{textAlign:"center",paddingTop:"1.2rem"}}>
            <button onClick={reset} style={{background:"transparent",border:"none",color:"#8B7355",fontSize:".75rem",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif",opacity:.6}}>Start a new foray</button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}