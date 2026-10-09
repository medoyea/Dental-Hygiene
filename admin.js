import { supabase } from './supabase.js';

let language='ar';
let signedInUser=null;
let passwordRecoveryActive=false;
let savedFaqs=[];
let savedBlogs=[];
const formData=form=>Object.fromEntries(new FormData(form).entries());
const notice=document.querySelector('#adminNotice');
const t=(en,ar)=>language==='ar'?ar:en;
const loginPanel=document.querySelector('#adminLogin');
const loginForm=document.querySelector('#adminLoginForm');
const loginError=document.querySelector('#adminLoginError');
const resetPanel=document.querySelector('#adminPasswordReset');
const resetForm=document.querySelector('#adminPasswordResetForm');
const resetError=document.querySelector('#adminPasswordResetError');
const editorIntro=document.querySelector('.admin-intro');
const workspace=document.querySelector('.admin-layout');
const footnote=document.querySelector('.admin-footnote');
const signOutButton=document.querySelector('#adminSignOut');

function notify(message){notice.textContent=message;window.setTimeout(()=>{notice.textContent=''},4000)}
function setSignedIn(user){
  signedInUser=passwordRecoveryActive?null:(user||null);
  loginPanel.hidden=!!signedInUser||passwordRecoveryActive;
  resetPanel.hidden=!passwordRecoveryActive;
  editorIntro.hidden=!signedInUser;
  workspace.hidden=!signedInUser;
  footnote.hidden=!signedInUser;
  signOutButton.hidden=!signedInUser;
  if(signedInUser)renderSaved();
}
function renderList(selector,items,type){
  const root=document.querySelector(selector);root.replaceChildren();
  if(!items.length){const empty=document.createElement('div');empty.className='saved-empty';empty.textContent=t('Nothing added yet.','لا توجد إضافات حتى الآن.');root.append(empty);return}
  items.forEach(item=>{const row=document.createElement('div');row.className='saved-item';const title=document.createElement('span');title.className='saved-item-title';title.textContent=language==='ar'?(item.title_ar||item.title_en):(item.title_en||item.title_ar);const remove=document.createElement('button');remove.type='button';remove.className='delete-item';remove.dataset.type=type;remove.dataset.id=item.id;remove.textContent=t('Delete','حذف');row.append(title,remove);root.append(row)})
}
async function renderSaved(){
  const [faqResult,blogResult]=await Promise.all([
    supabase.from('faqs').select('id,question_en,question_ar,status').order('created_at',{ascending:false}),
    supabase.from('blogs').select('id,title_en,title_ar,status').order('created_at',{ascending:false})
  ]);
  if(faqResult.error||blogResult.error){notify(t('Could not load content. Check your Supabase tables and policies.','تعذّر تحميل المحتوى. تحقق من جداول Supabase وسياسات الوصول.'));console.error(faqResult.error||blogResult.error);return}
  savedFaqs=faqResult.data;savedBlogs=blogResult.data;
  document.querySelector('#faqCount').textContent=savedFaqs.length;document.querySelector('#blogCount').textContent=savedBlogs.length;
  renderList('#savedFaqs',savedFaqs.map(row=>({...row,title_en:row.question_en,title_ar:row.question_ar})),'faq');
  renderList('#savedBlogs',savedBlogs,'blog');
}
function openEditorPanel(name){const tab=[...document.querySelectorAll('.editor-tab')].find(item=>item.dataset.panel===name);const panel=document.querySelector(`[data-panel-content="${name}"]`);if(!tab||!panel)return;document.querySelectorAll('.editor-tab').forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active))});document.querySelectorAll('[data-panel-content]').forEach(item=>{item.hidden=item!==panel});panel.querySelector('input,textarea')?.focus({preventScroll:true})}
document.querySelectorAll('.editor-tab').forEach(tab=>tab.addEventListener('click',event=>{event.preventDefault();openEditorPanel(tab.dataset.panel)}));
document.querySelector('#faqForm').addEventListener('submit',async event=>{
  event.preventDefault();if(!signedInUser)return;const form=event.currentTarget;const data=formData(form);const button=form.querySelector('[type="submit"]');button.disabled=true;
  const keywords=value=>value.split(/[\n,،]/).map(item=>item.trim()).filter(Boolean);
  const {error}=await supabase.from('faqs').insert({question_en:data.title.trim(),question_ar:data.titleAr.trim(),keywords_en:keywords(data.tags),keywords_ar:keywords(data.tagsAr),replies:[{prompt_en:data.prompt.trim(),answer_en:data.answer.trim(),prompt_ar:data.promptAr.trim(),answer_ar:data.answerAr.trim()}],status:'published',created_by:signedInUser.id});
  button.disabled=false;if(error){console.error(error);notify(t('FAQ could not be saved. Check your table columns and RLS policies.','تعذّر حفظ السؤال. تحقق من أعمدة الجدول وسياسات الوصول.'));return}
  form.reset();await renderSaved();notify(t('FAQ published to the shared website.','نُشر السؤال على الموقع المشترك.'));
});
document.querySelector('#blogForm').addEventListener('submit',async event=>{
  event.preventDefault();if(!signedInUser)return;const form=event.currentTarget;const data=formData(form);const button=form.querySelector('[type="submit"]');button.disabled=true;
  const {error}=await supabase.from('blogs').insert({title_en:data.title.trim(),title_ar:data.titleAr.trim(),author_en:data.author.trim(),author_ar:data.authorAr.trim(),category_en:data.category.trim(),category_ar:data.categoryAr.trim(),excerpt_en:data.desc.trim(),excerpt_ar:data.descAr.trim(),body_en:data.body.trim(),body_ar:data.bodyAr.trim(),read_time:'5 MIN READ',status:'published',created_by:signedInUser.id});
  button.disabled=false;if(error){console.error(error);notify(t('Blog could not be saved. Check your table columns and RLS policies.','تعذّر حفظ المقال. تحقق من أعمدة الجدول وسياسات الوصول.'));return}
  form.reset();await renderSaved();notify(t('Blog published to the shared website.','نُشر المقال على الموقع المشترك.'));
});
document.querySelector('.saved-card').addEventListener('click',async event=>{const button=event.target.closest('.delete-item');if(!button||!signedInUser)return;const table=button.dataset.type==='faq'?'faqs':'blogs';const {error}=await supabase.from(table).delete().eq('id',button.dataset.id);if(error){console.error(error);notify(t('Entry could not be deleted.','تعذّر حذف المحتوى.'));return}await renderSaved();notify(t('Entry deleted.','تم حذف المحتوى.'))});
document.querySelector('#refreshList').addEventListener('click',renderSaved);
document.querySelector('#adminLanguage').addEventListener('click',()=>{language=language==='ar'?'en':'ar';applyLanguage()});
document.querySelector('#adminForgotPassword').addEventListener('click',async()=>{loginError.textContent='';const email=document.querySelector('#adminEmail').value.trim();if(!email){loginError.textContent=t('Enter your account email first.','أدخل البريد الإلكتروني لحسابك أولًا.');document.querySelector('#adminEmail').focus();return}const button=document.querySelector('#adminForgotPassword');button.disabled=true;const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/admin.html`});button.disabled=false;if(error){console.error(error);loginError.textContent=t('Could not send the reset email. Check the Supabase redirect URL settings and try again.','تعذّر إرسال رسالة إعادة التعيين. تحقق من إعدادات روابط إعادة التوجيه في Supabase وحاول مجددًا.');return}loginError.textContent=t('If that account exists, a password reset link is on its way. Check your inbox.','إذا كان الحساب موجودًا، فستصلك رسالة إعادة تعيين. تحقق من بريدك.');});
loginForm.addEventListener('submit',async event=>{event.preventDefault();loginError.textContent='';const data=formData(loginForm);const submit=loginForm.querySelector('[type="submit"]');submit.disabled=true;const {data:result,error}=await supabase.auth.signInWithPassword({email:data.email.trim(),password:data.password});submit.disabled=false;if(error){loginError.textContent=t('Sign-in failed. Check your email and password.','تعذّر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');return}loginForm.reset();setSignedIn(result.user)});
resetForm.addEventListener('submit',async event=>{event.preventDefault();resetError.textContent='';const data=formData(resetForm);if(data.password!==data.confirmPassword){resetError.textContent=t('The passwords do not match.','كلمتا المرور غير متطابقتين.');return}const submit=resetForm.querySelector('[type="submit"]');submit.disabled=true;const {error}=await supabase.auth.updateUser({password:data.password});submit.disabled=false;if(error){console.error(error);resetError.textContent=t('Could not update the password. The reset link may have expired; request a new one.','تعذّر تحديث كلمة المرور. ربما انتهت صلاحية الرابط؛ اطلب رابطًا جديدًا.');return}passwordRecoveryActive=false;resetForm.reset();await supabase.auth.signOut();setSignedIn(null);loginError.textContent=t('Password updated. Sign in with your new password.','تم تحديث كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.');});
signOutButton.addEventListener('click',async()=>{const {error}=await supabase.auth.signOut();if(error){notify(t('Could not sign out. Try again.','تعذّر تسجيل الخروج. حاول مرة أخرى.'));return}setSignedIn(null)});
function applyLanguage(){const arabic=language==='ar';document.documentElement.lang=language;document.documentElement.dir=arabic?'rtl':'ltr';document.querySelectorAll('[data-en][data-ar]').forEach(node=>{node.textContent=arabic?node.dataset.ar:node.dataset.en});document.querySelector('#adminLanguage').textContent=arabic?'English':'العربية';document.querySelectorAll('input[name],textarea[name]').forEach(field=>{const arabicPlaceholders={title:'اكتب العنوان بالإنجليزية',titleAr:'اكتب العنوان بالعربية',tags:'مثال: الأسنان، التفريش',tagsAr:'مثال: الأسنان، التفريش',prompt:'اكتب رسالة مقترحة بالإنجليزية',answer:'اكتب الإجابة بالإنجليزية',promptAr:'اكتب رسالة مقترحة بالعربية',answerAr:'اكتب الإجابة بالعربية',author:'اسم الطبيب بالإنجليزية',authorAr:'اسم الطبيب بالعربية',category:'مثال: صحة اللثة',categoryAr:'مثال: صحة اللثة',desc:'اكتب ملخصًا قصيرًا',descAr:'اكتب ملخصًا قصيرًا بالعربية',body:'اكتب المقال كاملًا',bodyAr:'اكتب المقال كاملًا بالعربية'};const englishPlaceholders={title:'Write the title in English',titleAr:'Write the title in Arabic',tags:'Example: teeth, brushing',tagsAr:'Example: teeth, brushing',prompt:'Write a suggested patient message',answer:'Write the answer in English',promptAr:'Write a suggested patient message in Arabic',answerAr:'Write the answer in Arabic',author:'Doctor’s name in English',authorAr:'Doctor’s name in Arabic',category:'Example: Gum health',categoryAr:'Example: Gum health',desc:'Write a short summary',descAr:'Write a short Arabic summary',body:'Write the full article',bodyAr:'Write the full article in Arabic'};const placeholders=arabic?arabicPlaceholders:englishPlaceholders;if(placeholders[field.name])field.placeholder=placeholders[field.name]});if(signedInUser){renderList('#savedFaqs',savedFaqs.map(row=>({...row,title_en:row.question_en,title_ar:row.question_ar})),'faq');renderList('#savedBlogs',savedBlogs,'blog')}}
applyLanguage();
supabase.auth.getSession().then(({data,error})=>{if(error){console.error(error);loginError.textContent=t('Could not check your session. Refresh and try again.','تعذّر التحقق من الجلسة. حدّث الصفحة وحاول مجددًا.');return}setSignedIn(data.session?.user||null)});
supabase.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'){passwordRecoveryActive=true;setSignedIn(session?.user||null);return}if(event==='SIGNED_OUT')passwordRecoveryActive=false;if(!passwordRecoveryActive)setSignedIn(session?.user||null)});
