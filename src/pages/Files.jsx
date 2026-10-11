import { useEffect, useState } from 'react'
import { Empty, SectionHeading } from '../components/UI'
export default function Files({ data, update, role, kind, status }) {
 const photos = kind === 'photos'; const files = data[kind]; const [message,setMessage] = useState(''); const [slide,setSlide] = useState(0)
 useEffect(() => { if(!photos || files.length < 2) return; const timer = setInterval(() => setSlide(s => (s+1)%files.length),5000); return () => clearInterval(timer) },[photos,files.length])
 async function upload(e) {
  const file = e.target.files[0]; if(!file) return
  if(file.size > 10*1024*1024) { setMessage('Choose a file smaller than 10 MB.'); return }
  if(photos && !['image/jpeg','image/png','image/webp'].includes(file.type)) { setMessage('Choose a JPG, PNG, or WebP image.'); return }
  setMessage('Adding your file…')
  try {
   let url
   if(status === 'MongoDB connected') { const body = new FormData(); body.append('file',file); const response = await fetch('/api/uploads', { method:'POST',body }); if(!response.ok) throw new Error('Upload failed.'); url = (await response.json()).url }
   else url = URL.createObjectURL(file)
   if(await update({ ...data,[kind]:[...files,{ id:crypto.randomUUID(),name:file.name,url,owner:role }] })) setMessage(status === 'MongoDB connected' ? 'File saved.' : 'Added for this demo session. Connect MongoDB for durable uploads.')
  } catch(err) { setMessage(err.message) }
  e.target.value = ''
 }
 return <><SectionHeading eyebrow={photos ? 'OUR LITTLE COLLECTION OF HAPPY' : 'THE IMPORTANT THINGS, TOGETHER'} title={photos ? 'Family gallery' : 'Family documents'}>{role !== 'Julian' && <label className="primary upload-label">{photos ? 'Add a memory' : 'Upload document'}<input type="file" accept={photos ? 'image/jpeg,image/png,image/webp' : '.pdf,.jpg,.jpeg,.png,.webp,.txt'} onChange={upload}/></label>}</SectionHeading><p className="form-message" role="status">{message}</p>{!files.length ? <section className="card"><Empty icon={photos?'photo':'file'} title={photos?'Every photo has a little story':'A safe place to stay organized'}>{photos?'Upload a family photo from Mom or Dad’s tab.':'Keep records, school forms, and important papers together. Maximum 10 MB per file.'}</Empty></section> : <>{photos && <section className="carousel"><img src={files[slide % files.length].url} alt={files[slide % files.length].name}/><div className="carousel-caption"><span>{files[slide % files.length].name}</span><div>{files.map((file,i) => <button key={file.id} aria-label={`Show photo ${i+1}`} aria-pressed={slide % files.length === i} onClick={() => setSlide(i)} className={slide % files.length === i ? 'dot selected':'dot'}/>)}</div></div></section>}<div className="file-grid">{files.map(file => <article className="card file-card" key={file.id}>{photos && <img src={file.url} alt={file.name}/>}<h3>{file.name}</h3><p>Added by {file.owner}</p><a className="text-button" href={file.url} target="_blank" rel="noreferrer">Open {photos?'photo':'document'} ↗</a>{role !== 'Julian' && <button className="text-button" onClick={() => update({ ...data,[kind]:files.filter(f => f.id !== file.id) })}>Remove</button>}</article>)}</div></>}</>
}
