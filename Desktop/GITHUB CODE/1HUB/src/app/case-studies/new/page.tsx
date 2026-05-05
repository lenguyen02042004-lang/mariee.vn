'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Sparkles, 
  BookOpen, 
  Target, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Layout, 
  Image as ImageIcon, 
  Code, 
  Type,
  Lightbulb,
  Upload,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Block {
  id: string
  type: 'text' | 'image' | 'logic'
  content: string
  caption?: string
}

function NewCaseStudyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectIdFromUrl = searchParams.get('projectId')

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'text', content: '' }
  ])
  const [formData, setFormData] = useState({
    projectId: projectIdFromUrl || '',
    title: '',
    content: '',
    industryContext: ''
  })

  const supabase = createClient()

  useEffect(() => {
    async function fetchProjects() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('projects')
          .select('id, title')
          .eq('owner_id', user.id)
        
        if (data) setProjects(data)
      }
    }
    fetchProjects()
  }, [])

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: ''
    }
    setBlocks([...blocks, newBlock])
  }

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id))
    }
  }

  const updateBlock = (id: string, content: string, caption?: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content, caption } : b))
  }

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show loading state in the block content
    updateBlock(id, 'UPLOADING...')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `case-studies/${fileName}`

      const { data, error } = await supabase.storage
        .from('heritage')
        .upload(filePath, file)

      if (error) {
        if (error.message.includes('bucket not found')) {
           // Fallback for demo: use local preview URL if bucket doesn't exist
           const localUrl = URL.createObjectURL(file)
           updateBlock(id, localUrl)
           return
        }
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('heritage')
        .getPublicUrl(filePath)

      updateBlock(id, publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      updateBlock(id, '')
      alert('Upload failed. Please ensure the "heritage" bucket is created in Supabase.')
    }
  }

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= blocks.length) return
    
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    setBlocks(newBlocks)
  }

  const applySmartDrafting = () => {
    const templates: Record<string, string> = {
      'Architecture': 'Context: The site required a biophilic integration...\n\nLogic: We implemented a fractal grid system to optimize natural light...\n\nSynergy: Collaborated with structural engineers to ensure skeletal integrity...',
      'Default': 'Executive Summary: Define the core challenge...\n\nMethodology: Describe the technical or creative process...\n\nCollaborative Insight: Explain how synergy was achieved across disciplines...'
    }
    
    const template = templates[formData.industryContext] || templates['Default']
    setFormData({ ...formData, content: template })
  }

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  async function handleSubmit() {
    if (wordCount(formData.content) < 300) {
      alert('Your logic requires at least 300 words to establish heritage.')
      return
    }

    setIsSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setTimeout(() => router.push('/dashboard'), 1500)
      return
    }

    try {
      const { error } = await supabase
        .from('case_studies')
        .insert({
          project_id: formData.projectId,
          profile_id: user.id,
          title: formData.title,
          content: formData.content,
          blocks: blocks,
          industry_context: formData.industryContext
        })

      if (error) throw error

      router.push(`/projects/${formData.projectId}`)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-6 selection:bg-accent/30 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-400/[0.02] rounded-full blur-[140px]" />
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full my-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-12 md:p-16 space-y-12 border-white/5 bg-zinc-900/10 backdrop-blur-3xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1 w-12 bg-zinc-900 rounded-full overflow-hidden">
                    {step >= i && <div className="h-full bg-accent shadow-[0_0_10px_#D4AF37]" />}
                  </div>
                ))}
              </div>
              <Link href="/dashboard" className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest hover:text-white">Discard Draft</Link>
            </div>

            {/* Step 1: Context */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="space-y-3">
                  <h1 className="editorial-title text-white italic">Document Logic.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em]">&quot;Define the project and the core context.&quot;</p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Associated Heritage Project</label>
                    <select 
                      value={formData.projectId}
                      onChange={e => setFormData({...formData, projectId: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-8 py-5 text-lg text-white outline-none appearance-none cursor-pointer focus:border-accent/30 transition-all font-serif"
                    >
                      <option value="" disabled className="bg-zinc-900">Select a project...</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id} className="bg-zinc-900">{p.title}</option>
                      ))}
                      {projects.length === 0 && <option value="demo" className="bg-zinc-900">Demo Project (Sanctuary Mode)</option>}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Case Study Title</label>
                    <input 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      type="text" 
                      placeholder="e.g. Implementation of Biophilic Grid"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-8 py-5 text-xl text-white focus:border-accent/30 outline-none font-serif"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Industry Domain</label>
                    <input 
                      list="industries"
                      value={formData.industryContext}
                      onChange={e => setFormData({...formData, industryContext: e.target.value})}
                      type="text" 
                      placeholder="Select or type e.g. Architecture, FinTech..."
                      className="w-full bg-zinc-900 border border-white/10 rounded-2xl px-8 py-5 text-lg text-white focus:border-accent/30 outline-none font-serif"
                    />
                    <datalist id="industries">
                      <option value="Architecture" />
                      <option value="Urbanism" />
                      <option value="Artificial Intelligence" />
                      <option value="Fintech" />
                      <option value="Fine Arts" />
                      <option value="Sustainable Energy" />
                      <option value="Bioengineering" />
                      <option value="Strategic Management" />
                      <option value="Legal Tech" />
                      <option value="Aerospace" />
                      <option value="Quantum Computing" />
                      <option value="Digital Heritage" />
                      <option value="Neuroscience" />
                      <option value="Environmental Science" />
                      <option value="Creative Direction" />
                      <option value="Product Engineering" />
                      <option value="Behavioral Economics" />
                      <option value="Logistics & Supply Chain" />
                      <option value="Maritime Technology" />
                      <option value="Media & Journalism" />
                      <option value="Fashion Design" />
                      <option value="Interior Design" />
                      <option value="Renewable Systems" />
                      <option value="Cybersecurity" />
                      <option value="Blockchain Infrastructure" />
                    </datalist>
                  </div>
                </div>
                <button onClick={nextStep} disabled={!formData.projectId || !formData.title} className="premium-button w-full py-6 flex items-center justify-center gap-4 group">
                  <span className="text-sm tracking-widest uppercase">Write Rationale</span>
                  <BookOpen size={18} />
                </button>
              </div>
            )}

            {/* Step 2: Content & Blocks */}
            {step === 2 && (
              <div className="space-y-12">
                <div className="flex justify-between items-end">
                  <div className="space-y-3">
                    <h1 className="editorial-title text-white italic">The Rationale.</h1>
                    <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em]">&quot;Articulate your execution strategy.&quot;</p>
                  </div>
                  <button 
                    onClick={applySmartDrafting}
                    className="flex items-center gap-2 px-4 py-2 border border-accent/20 rounded-full text-[9px] font-mono text-accent uppercase tracking-widest hover:bg-accent/5 transition-all"
                  >
                    <Lightbulb size={12} />
                    Smart Drafting
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Core Intellectual Logic</label>
                      <span className={`text-[9px] font-mono uppercase tracking-widest ${wordCount(formData.content) < 300 ? 'text-zinc-700' : 'text-accent'}`}>
                        {wordCount(formData.content)} / 300 Words
                      </span>
                    </div>
                    <textarea 
                      value={formData.content}
                      onChange={e => setFormData({...formData, content: e.target.value})}
                      placeholder="Provide the deep logic, technical challenges, and multi-disciplinary synergy involved..."
                      rows={12}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-3xl px-8 py-6 text-sm text-zinc-300 focus:border-accent/20 outline-none transition-all resize-none font-serif leading-relaxed"
                    />
                  </div>

                  {/* Multimedia Blocks */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="h-[1px] flex-1 bg-white/5" />
                       <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Multimedia Proofs</span>
                       <div className="h-[1px] flex-1 bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {blocks.map((block, index) => (
                        <div key={block.id} className="group relative bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-4">
                           <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                 {block.type === 'text' && <Type size={14} className="text-zinc-600" />}
                                 {block.type === 'image' && <ImageIcon size={14} className="text-zinc-600" />}
                                 {block.type === 'logic' && <Code size={14} className="text-zinc-600" />}
                                 <span className="text-[9px] font-mono text-zinc-700 uppercase tracking-widest">Block {index + 1}: {block.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => moveBlock(index, 'up')}
                                  disabled={index === 0}
                                  className="text-zinc-800 hover:text-white disabled:opacity-0 transition-all"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button 
                                  onClick={() => moveBlock(index, 'down')}
                                  disabled={index === blocks.length - 1}
                                  className="text-zinc-800 hover:text-white disabled:opacity-0 transition-all"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <div className="w-[1px] h-3 bg-white/10 mx-1" />
                                <button onClick={() => removeBlock(block.id)} className="text-zinc-800 hover:text-red-900/50 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                           </div>

                           {block.type === 'text' || block.type === 'logic' ? (
                             <textarea 
                               value={block.content}
                               onChange={e => updateBlock(block.id, e.target.value)}
                               placeholder={block.type === 'text' ? "Add deeper sub-logic..." : "Insert code or mathematical proofs..."}
                               rows={3}
                               className="w-full bg-transparent border-none text-sm text-zinc-400 outline-none font-serif italic"
                             />
                           ) : (
                             <div className="space-y-4">
                               <div className="flex gap-4">
                                 <div className="flex-1 relative group/upload">
                                   <input 
                                     type="text" 
                                     placeholder="Image URL or upload from device →"
                                     value={block.content}
                                     onChange={e => updateBlock(block.id, e.target.value, block.caption)}
                                     className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[10px] text-zinc-400 outline-none group-hover/upload:border-white/20 transition-all"
                                   />
                                   {block.content === 'UPLOADING...' && (
                                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                       <Loader2 size={14} className="text-accent animate-spin" />
                                     </div>
                                   )}
                                 </div>
                                 <label className="cursor-pointer px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
                                    <Upload size={14} className="text-zinc-500" />
                                    <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Upload</span>
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden" 
                                      onChange={(e) => handleImageUpload(block.id, e)}
                                    />
                                 </label>
                               </div>
                               
                               {block.content && block.content !== 'UPLOADING...' && block.content.startsWith('http') && (
                                 <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
                                   <img src={block.content} alt="Preview" className="w-full h-full object-cover" />
                                 </div>
                               )}

                               <input 
                                 type="text" 
                                 placeholder="Detailed Caption"
                                 value={block.caption || ''}
                                 onChange={e => updateBlock(block.id, block.content, e.target.value)}
                                 className="w-full bg-transparent border-none text-[10px] text-zinc-600 italic outline-none"
                               />
                             </div>
                           )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center gap-4 pt-4">
                       <button onClick={() => addBlock('text')} className="p-4 border border-white/5 rounded-full hover:bg-white/5 transition-all text-zinc-600 hover:text-white">
                          <Type size={18} />
                       </button>
                       <button onClick={() => addBlock('image')} className="p-4 border border-white/5 rounded-full hover:bg-white/5 transition-all text-zinc-600 hover:text-white">
                          <ImageIcon size={18} />
                       </button>
                       <button onClick={() => addBlock('logic')} className="p-4 border border-white/5 rounded-full hover:bg-white/5 transition-all text-zinc-600 hover:text-white">
                          <Code size={18} />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-8 border-t border-white/5">
                  <button onClick={prevStep} className="w-1/3 py-6 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Back</button>
                  <button onClick={nextStep} disabled={wordCount(formData.content) < 50} className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group">
                    <span className="text-sm tracking-widest uppercase">Verify Depth</span>
                    <Target size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Consecration */}
            {step === 3 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="editorial-title text-white">Commit Triad.</h1>
                  <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    &quot;Committing this case study will link your <br/> professional logic to the global repository.&quot;
                  </p>
                </div>
                
                <div className="p-8 bg-accent/[0.02] border border-accent/10 rounded-3xl space-y-4">
                   <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Heritage Check</span>
                      <ShieldCheck size={14} className="text-accent" />
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between">
                         <span className="text-xs text-zinc-400">Word Count Depth</span>
                         <span className="text-xs font-mono text-white">{wordCount(formData.content)} / 300</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-xs text-zinc-400">Multimedia Proofs</span>
                         <span className="text-xs font-mono text-white">{blocks.filter(b => b.content).length} Blocks</span>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="w-1/3 py-6 border border-white/5 rounded-2xl text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Back</button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || wordCount(formData.content) < 300} 
                    className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group"
                  >
                    <Sparkles size={18} className={isSubmitting ? 'animate-spin' : ''} />
                    <span className="text-sm tracking-widest uppercase">{isSubmitting ? 'COMMITTING...' : 'COMMIT TO REPOSITORY'}</span>
                  </button>
                </div>
                
                {wordCount(formData.content) < 300 && (
                  <p className="text-center text-[9px] font-mono text-red-900/50 uppercase tracking-widest">Insufficient logic depth. Minimum 300 words required.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

export default function NewCaseStudyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center font-mono text-zinc-500 uppercase tracking-widest">Initializing Editor...</div>}>
      <NewCaseStudyContent />
    </Suspense>
  )
}
