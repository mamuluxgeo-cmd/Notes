const STORAGE_KEY='mamuLuxNotesData';

let data={stories:[],prompts:[]};
let currentStoryId=null;

const storyList=document.getElementById('storyList');
const pagesContainer=document.getElementById('pagesContainer');
const promptList=document.getElementById('promptList');
const globalPromptSelect=document.getElementById('globalPromptSelect');
const toast=document.getElementById('toast');

function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));render();}
function loadData(){const saved=localStorage.getItem(STORAGE_KEY);if(saved){data=JSON.parse(saved);}if(!data.stories.length){createStory();}else{currentStoryId=data.stories[0].id;}render();}
function uid(){return Date.now()+Math.random().toString(16).slice(2)}
function createStory(){const story={id:uid(),title:'ახალი ზღაპარი',status:'დასაწერი',pages:[]};data.stories.unshift(story);currentStoryId=story.id;saveData();}
function getCurrentStory(){return data.stories.find(s=>s.id===currentStoryId)}
function render(){renderStories();renderPages();renderPrompts();renderPromptSelect();}
function renderStories(){storyList.innerHTML='';data.stories.forEach(story=>{const div=document.createElement('div');div.className='story-item'+(story.id===currentStoryId?' active':'');div.innerHTML=`<strong>${story.title}</strong><p>${story.status}</p>`;div.onclick=()=>{currentStoryId=story.id;render();};storyList.appendChild(div);});}
function renderPages(){const story=getCurrentStory();if(!story)return;document.getElementById('storyTitleInput').value=story.title;document.getElementById('storyStatusInput').value=story.status;document.getElementById('pageTitle').textContent=story.title;pagesContainer.innerHTML='';story.pages.forEach((page,index)=>{const card=document.createElement('div');card.className='page-card';card.innerHTML=`<div class="page-header"><h4>გვერდი ${index+1}</h4><button class="danger-btn" onclick="deletePage('${page.id}')">წაშლა</button></div><label>ტექსტი<textarea class="textarea" onchange="updatePage('${page.id}','text',this.value)">${page.text||''}</textarea></label><label>ილუსტრაცია<textarea class="textarea" onchange="updatePage('${page.id}','illustration',this.value)">${page.illustration||''}</textarea></label><label>მიმაგრებული პრომპტი<textarea class="textarea" onchange="updatePage('${page.id}','prompt',this.value)">${page.prompt||''}</textarea></label><div class="page-actions"><button class="copy-btn" onclick="copyText(${JSON.stringify('text')},'${page.id}')">ტექსტის კოპირება</button><button class="copy-btn" onclick="copyText(${JSON.stringify('illustration')},'${page.id}')">ილუსტრაციის კოპირება</button><button class="copy-btn" onclick="copyText(${JSON.stringify('prompt')},'${page.id}')">პრომპტის კოპირება</button><button class="copy-btn" onclick="copyFull('${page.id}',${index+1})">სრული კოპირება</button></div>`;pagesContainer.appendChild(card);});}
function renderPrompts(){promptList.innerHTML='';data.prompts.forEach(prompt=>{const div=document.createElement('div');div.className='prompt-item';div.innerHTML=`<strong>${prompt.title}</strong><p>${prompt.group}</p><small>${prompt.text.slice(0,100)}</small>`;promptList.appendChild(div);});}
function renderPromptSelect(){globalPromptSelect.innerHTML='';data.prompts.forEach(prompt=>{const option=document.createElement('option');option.value=prompt.id;option.textContent=`${prompt.group} — ${prompt.title}`;globalPromptSelect.appendChild(option);});}
function updatePage(id,key,value){const story=getCurrentStory();const page=story.pages.find(p=>p.id===id);page[key]=value;saveData();}
function deletePage(id){const story=getCurrentStory();story.pages=story.pages.filter(p=>p.id!==id);saveData();}
function copyText(type,id){const story=getCurrentStory();const page=story.pages.find(p=>p.id===id);navigator.clipboard.writeText(page[type]||'');showToast();}
function copyFull(id,index){const story=getCurrentStory();const page=story.pages.find(p=>p.id===id);const text=`გვერდი ${index}\n\nტექსტი:\n${page.text||''}\n\nილუსტრაცია:\n${page.illustration||''}\n\nპრომპტი:\n${page.prompt||''}`;navigator.clipboard.writeText(text);showToast();}
function showToast(){toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1500);}

document.getElementById('newStoryBtn').onclick=createStory;
document.getElementById('addPageBtn').onclick=()=>{const story=getCurrentStory();story.pages.push({id:uid(),text:'',illustration:'',prompt:''});saveData();};
document.getElementById('storyTitleInput').oninput=e=>{getCurrentStory().title=e.target.value;saveData();};
document.getElementById('storyStatusInput').onchange=e=>{getCurrentStory().status=e.target.value;saveData();};
document.getElementById('savePromptBtn').onclick=()=>{const group=document.getElementById('promptGroupInput').value;const title=document.getElementById('promptTitleInput').value;const text=document.getElementById('promptTextInput').value;if(!title||!text)return;data.prompts.unshift({id:uid(),group,title,text});document.getElementById('promptGroupInput').value='';document.getElementById('promptTitleInput').value='';document.getElementById('promptTextInput').value='';saveData();};
document.getElementById('applyPromptAllBtn').onclick=()=>{const selected=data.prompts.find(p=>p.id===globalPromptSelect.value);if(!selected)return;getCurrentStory().pages.forEach(page=>page.prompt=selected.text);saveData();};
document.getElementById('deleteStoryBtn').onclick=()=>{if(data.stories.length===1)return alert('ბოლო ზღაპარს ვერ წაშლი');data.stories=data.stories.filter(s=>s.id!==currentStoryId);currentStoryId=data.stories[0].id;saveData();};
document.getElementById('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mamu-lux-notes.json';a.click();};
document.getElementById('importFile').onchange=e=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=event=>{data=JSON.parse(event.target.result);currentStoryId=data.stories[0]?.id||null;saveData();};reader.readAsText(file);};
document.getElementById('searchInput').oninput=e=>{const value=e.target.value.toLowerCase();document.querySelectorAll('.story-item').forEach(item=>{item.style.display=item.innerText.toLowerCase().includes(value)?'block':'none';});document.querySelectorAll('.prompt-item').forEach(item=>{item.style.display=item.innerText.toLowerCase().includes(value)?'block':'none';});};

loadData();