import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const actDirRef = useRef(1)
  const actPosRef = useRef(0)

  useEffect(() => {
    // ─── Cursor glow ───
    const existingGlow = document.getElementById('cursor-glow')
    if (!existingGlow) {
      const glow = document.createElement('div')
      glow.id = 'cursor-glow'
      document.body.appendChild(glow)
    }
    const handleMouseMove = (e) => {
      const g = document.getElementById('cursor-glow')
      if (g) { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px' }
    }
    document.addEventListener('mousemove', handleMouseMove)

    // ─── Parallax ───
    const band = document.getElementById('parallaxBand')
    const handleParallax = (e) => {
      const rect = band.getBoundingClientRect()
      const cx = (e.clientX - rect.left) / rect.width - 0.5
      const cy = (e.clientY - rect.top) / rect.height - 0.5
      const c1 = document.getElementById('hpbc1')
      const c2 = document.getElementById('hpbc2')
      const c3 = document.getElementById('hpbc3')
      if (c1) c1.style.transform = `translate(${cx * -30}px, ${cy * -20}px)`
      if (c2) c2.style.transform = `translate(${cx * 25}px, ${cy * 18}px)`
      if (c3) c3.style.transform = `translate(${cx * 40}px, ${cy * 30}px)`
    }
    const handleParallaxLeave = () => {
      ['hpbc1', 'hpbc2', 'hpbc3'].forEach(id => {
        const el = document.getElementById(id)
        if (el) el.style.transform = ''
      })
    }
    if (band) {
      band.addEventListener('mousemove', handleParallax)
      band.addEventListener('mouseleave', handleParallaxLeave)
    }

    // ─── Activity scroll auto-advance ───
    const actScroll = document.getElementById('activityScroll')
    let intervalId
    if (actScroll) {
      intervalId = setInterval(() => {
        const max = actScroll.scrollWidth - actScroll.clientWidth
        actPosRef.current += actDirRef.current * 0.8
        if (actPosRef.current >= max) { actPosRef.current = max; actDirRef.current = -1 }
        if (actPosRef.current <= 0)   { actPosRef.current = 0;   actDirRef.current = 1 }
        actScroll.scrollLeft = actPosRef.current
      }, 16)
      actScroll.addEventListener('mouseenter', () => { actDirRef.current = 0 })
      actScroll.addEventListener('mouseleave', () => { actDirRef.current = 1 })
    }

    // ─── Animated counters ───
    const animateCounters = () => {
      document.querySelectorAll('.hcs-num[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target)
        const suffix = el.dataset.suffix || ''
        let current = 0
        const step = Math.ceil(target / 40)
        const timer = setInterval(() => {
          current = Math.min(current + step, target)
          el.textContent = current + suffix
          if (current >= target) clearInterval(timer)
        }, 140)
      })
    }
    let countersRan = false
    const counterStrip = document.querySelector('.home-counter-strip')
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !countersRan) {
          countersRan = true
          animateCounters()
          counterObserver.disconnect()
        }
      })
    }, { threshold: 0.3 })
    if (counterStrip) counterObserver.observe(counterStrip)

    // ─── Staggered reveal ───
    const style = document.createElement('style')
    style.textContent = '.revealed { opacity: 1 !important; transform: translateY(0) !important; }'
    document.head.appendChild(style)

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = (i * 0.06) + 's'
          entry.target.classList.add('revealed')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })

    document.querySelectorAll('.hcs-item, .domain-block, .act-card, .sp-proj, .sp-post, .sp-track, .faq-item').forEach(el => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(16px)'
      el.style.transition = 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)'
      revealObserver.observe(el)
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (band) {
        band.removeEventListener('mousemove', handleParallax)
        band.removeEventListener('mouseleave', handleParallaxLeave)
      }
      if (intervalId) clearInterval(intervalId)
      counterObserver.disconnect()
      revealObserver.disconnect()
      document.head.removeChild(style)
    }
  }, [])

  const filterFeed = (type, btn) => {
    document.querySelectorAll('.nf-filter').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    document.querySelectorAll('#feedGrid .nf-card').forEach(card => {
      card.style.display = (type === 'all' || card.dataset.type === type) ? '' : 'none'
    })
  }

  const toggleFaq = (btn) => {
    const item = btn.closest('.faq-item')
    const isOpen = item.classList.contains('open')
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'))
    if (!isOpen) item.classList.add('open')
  }

  const wheelLabels = {
    'Rust': { label: 'Language', val: '6+', sub: 'Years with Rust' },
    'TypeScript': { label: 'Language', val: '9+', sub: 'Years with TS' },
    'Go': { label: 'Language', val: '5+', sub: 'Years with Go' },
    'React': { label: 'Frontend', val: '8+', sub: 'Years with React' },
    'WASM': { label: 'Frontend', val: '3+', sub: 'Years with WASM' },
    'Distributed Sys': { label: 'Backend', val: '8+', sub: 'Years at scale' },
    'PostgreSQL': { label: 'Backend', val: '10+', sub: 'Years with SQL' },
    'Ableton': { label: 'Creative', val: '7+', sub: 'Years producing' },
    'Modular Synth': { label: 'Creative', val: '4+', sub: 'Years patching' },
    'Long-form Writing': { label: 'Creative', val: '5+', sub: 'Years publishing' },
    'Python': { label: 'Language', val: '8+', sub: 'Years with Python' },
    'Kubernetes': { label: 'Backend', val: '6+', sub: 'Years deploying' }
  }

  const pickSkill = (el) => {
    document.querySelectorAll('.skill-tag').forEach(t => t.classList.remove('picked'))
    el.classList.add('picked')
    const name = el.textContent.trim()
    const info = wheelLabels[name] || { label: 'Skill', val: '—', sub: name }
    document.getElementById('wheelLabel').textContent = info.label
    document.getElementById('wheelVal').textContent = info.val
    document.getElementById('wheelSub').textContent = info.sub
  }

  return (
    <>
      {/* ════ NAV ════ */}
      <nav>
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="nav-logo-text">Stephane<span>.</span>Lubendo</span>
          </div>
        </div>
      </nav>

      {/* ════ HOME ════ */}
      <div id="home" className="page active">
        <section className="home-hero">
          <div className="home-hero-left">
            <div><div className="hero-eyebrow">Available for work</div></div>
            <div><h1 className="hero-name">Stephane<em>Lubendo</em></h1></div>
            <p className="hero-tagline">
              I'm a dedicated Full Stack Software Engineer with a passion for transforming ideas into real world applications. I specialize in building web solutions that are functional and scalable.
            </p>
            <p className="hero-tagline">
              My portfolio showcases a selection of applications I've developed. These apps reflect my commitment to web solutions, and professional development. A few of my favorite projects are featured below.
            </p>
            <div className="hero-bottom-row">
              <div className="hero-cta-group">
                <a href="#projects" className="btn-filled">View Work</a>
              </div>
            </div>
          </div>
          <div className="home-hero-right">
            <div className="hero-avatar-block">
              <div className="avatar-frame">
                <img src="/stephanelubendo.jpg" alt="Stephane Lubendo" />
              </div>
            </div>
            <div className="hero-stats-row">
              <div className="hs-item"><div className="hs-num">10+</div><div className="hs-label">Applications Built</div></div>
              <div className="hs-item"><div className="hs-num">5</div><div className="hs-label">Years experience as Software Engineer</div></div>
              <div className="hs-item"><div className="hs-num">3</div><div className="hs-label">Startups worked for</div></div>
            </div>
          </div>
        </section>

        <div className="marquee-strip">
          <div className="marquee-inner">
            <span>Software Engineering</span><span className="dot">✦</span><span>Javascript</span><span className="dot">✦</span><span>Node.js</span><span className="dot">✦</span><span>TypeScript</span><span className="dot">✦</span><span>MongoDB</span><span className="dot">✦</span><span>React</span><span className="dot">✦</span><span>CSS &amp; HTML</span><span className="dot">✦</span><span>Next</span>
            <span>Full-Stack Web Development</span><span className="dot">✦</span><span>Python</span><span className="dot">✦</span><span>Php</span><span className="dot">✦</span><span>SQL</span><span className="dot">✦</span><span>AWS</span><span className="dot">✦</span><span>Wordpress</span><span className="dot">✦</span><span>C# &amp; ASP.Net</span><span className="dot">✦</span><span>Available for Consulting</span><span className="dot">✦</span>
          </div>
        </div>

        {/* ── LANGUAGES & FRAMEWORKS ── */}
        <div className="music-process">
          <div className="process-grid">
            <div className="process-text">
              <h3>Languages &amp; frameworks<br /><em>I've worked with.</em></h3>
              <p>I've worked with a variety of programming languages depending on the needs of the company and project. I'm most comfortable with TypeScript, C#, and Python, and I regularly work with PostgreSQL as a primary database for building reliable, data-driven applications.</p>
              <p>Each language serves a different purpose in my workflow. I typically use C# for scalable, enterprise-level applications, TypeScript for quickly building full-stack MVPs and modern web interfaces, and Python for applications that process or analyze large datasets. This flexibility allows me to choose the right tool for the problem while maintaining clean, maintainable systems.</p>
              <div className="timeline">
                <div className="tl-head">Career Timeline</div>
                <div className="tl-item">
                  <div className="tl-dot" style={{ background: 'var(--rust)', borderColor: 'var(--rust)' }}></div>
                  <div><div className="tl-year">2023 → Present</div><div className="tl-role">Independent Contractor</div><div className="tl-co">OpenBankr</div></div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot" style={{ background: 'var(--ochre)', borderColor: 'var(--ochre)' }}></div>
                  <div><div className="tl-year">2023 → 2025</div><div className="tl-role">Software Engineer</div><div className="tl-co">Eye Photo Systems</div></div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot" style={{ background: 'var(--moss)', borderColor: 'var(--moss)' }}></div>
                  <div><div className="tl-year">2023 → 2024</div><div className="tl-role">Full-Stack Web Development</div><div className="tl-co">Evolve Creative Solutions</div></div>
                </div>
                <div className="tl-item">
                  <div className="tl-dot" style={{ background: 'var(--clay)', borderColor: 'var(--clay)' }}></div>
                  <div><div className="tl-year">2022 → 2023</div><div className="tl-role">Set Representative</div><div className="tl-co">BCIT</div></div>
                </div>
              </div>
            </div>

            <div className="skills-grid">
              <div className="skill-group">
                <div className="sg-head"><div className="sg-dot" style={{ background: 'var(--moss)' }}></div>Languages</div>
                {[['Javascript', 95], ['TypeScript', 92], ['Python', 80], ['C#', 75], ['Php', 92], ['Java', 92], ['C++', 92]].map(([name, pct]) => (
                  <div className="sk-row" key={name}><span>{name}</span><div className="sk-bar-bg"><div className="sk-bar-fill" style={{ width: `${pct}%`, background: 'var(--moss)' }}></div></div></div>
                ))}
              </div>
              <div className="skill-group">
                <div className="sg-head"><div className="sg-dot" style={{ background: 'var(--ochre)' }}></div>Frameworks</div>
                {[['React / Next.js', 94], ['ASP.Net', 78], ['Laravel', 88], ['Node.js', 70], ['Zustand', 78], ['Socket.io', 78], ['Vue', 78]].map(([name, pct]) => (
                  <div className="sk-row" key={name}><span>{name}</span><div className="sk-bar-bg"><div className="sk-bar-fill" style={{ width: `${pct}%`, background: 'var(--ochre)' }}></div></div></div>
                ))}
              </div>
              <div className="skill-group">
                <div className="sg-head"><div className="sg-dot" style={{ background: 'var(--rust)' }}></div>Database</div>
                {[['PostgreSQL', 85], ['MySQL', 82], ['MongoDB', 90], ['MariaDB', 78]].map(([name, pct]) => (
                  <div className="sk-row" key={name}><span>{name}</span><div className="sk-bar-bg"><div className="sk-bar-fill" style={{ width: `${pct}%`, background: 'var(--rust)' }}></div></div></div>
                ))}
              </div>
              <div className="skill-group">
                <div className="sg-head"><div className="sg-dot" style={{ background: 'var(--clay)' }}></div>Others</div>
                {[['AWS', 72], ['Azure', 88], ['Git', 60], ['HTML & CSS', 76], ['Kubernetes', 72], ['Docker', 72], ['Drizzle', 72]].map(([name, pct]) => (
                  <div className="sk-row" key={name}><span>{name}</span><div className="sk-bar-bg"><div className="sk-bar-fill" style={{ width: `${pct}%`, background: 'var(--clay)' }}></div></div></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PROJECTS STRIP ── */}
      <div className="home-counter-strip" id="projects">
          {[
            {
              title: 'IT Goals',
              label: 'Goal tracking app',
              path: '/goal-tracker',
              sub: 'Set milestones, track progress, and stay accountable. Built with streaks, categories, and visual completion charts.'
            },
            {
              title: 'IT Journal',
              label: 'Journaling app',
              path: '/journal-app',
              sub: 'A private, distraction-free space to write daily entries, reflect on the week, and search past thoughts.'
            },
            {
              title: 'IT Kanban',
              label: 'Kanban project manager app',
              path: '/kanban-tracker',
              sub: 'Drag-and-drop boards with customizable columns, priority labels, and deadline tracking for any project.'
            },
            {
              title: 'IT Meeting Notes',
              label: 'Note taking app',
              path: '/meeting-notes',
              sub: 'Capture action items, decisions, and attendees in one place. Organized by date with full-text search.'
            },
            {
              title: 'IT Recipe',
              label: 'Recipe sharing app',
              path: '/recipe-tracker',
              sub: 'Save, organize, and share your favorite recipes. Includes ingredient scaling and a built-in shopping list.'
            },
            {
              title: 'IT Study',
              label: 'Study timer app',
              path: '/study-tracker',
              sub: 'Pomodoro-based focus timer with session history, subject tagging, and weekly study hour summaries.'
            },
            {
              title: 'IT Task',
              label: 'Task managing app',
              path: '/task-flow',
              sub: 'Lightweight task manager with due dates, priority sorting, and a satisfying done-list to review your wins.'
            },
            {
              title: 'IT Planner',
              label: 'Weekly planning app',
              path: '/weekly-calendar',
              sub: 'Plan your week at a glance. Time-block your schedule, set recurring events, and keep your priorities visible.'
            },
            {
              title: 'IT Workout',
              label: 'Workout tracking app',
              path: '/workout-dashboard',
              sub: 'Log sets, reps, and weights for every session. Track personal records and visualize strength gains over time.'
            },
          ].map(({ title, label, path, sub }) => (
            <div className="hcs-item" key={path}>
              <div className="hcs-top">
                <div className="hcs-num">{title}</div>
                <Link to={path} target="_blank" rel="noreferrer">
                  <div className="hc-text"><h2><em>visit app</em></h2></div>
                </Link>
              </div>
              <div className="hcs-label">{label}</div>
              <div className="hcs-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── TESTIMONIALS ── */}
        <div className="press-section">
          <div className="press-inner">
            <div className="press-eyebrow">What people are saying</div>
            <div className="press-grid">
              <div className="press-card">
                <div className="press-quote">"His willingness to collaborate and communicate effectively within a team not only enhances the quality of his own work but also contributes to the success of the entire team."</div>
                <div className="press-source">— Armaan Dhanji</div>
              </div>
              <div className="press-card">
                <div className="press-quote">"Stephane's dedication and problem-solving skills enhanced our team's performance. He consistently approached challenges with a proactive attitude and played a crucial role in project success. I recommend Stephane for any role that demands a collaborator with solid backend development and database skills."</div>
                <div className="press-source">— Brett Gill</div>
              </div>
              <div className="press-card">
                <div className="press-quote">"Stephane stood out as an engaged student in my Web Data Technologies class, showcasing an impressive understanding of MySQL."</div>
                <div className="press-source">— Patrick Guichon</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTACT ── */}
        <div className="home-contact">
          <div className="hc-text process-text">
            <h3>Want to make something<br /><em>Let's connect</em></h3>
            <p>If you're building something meaningful, exploring an idea, or just want to connect with someone who shares your curiosity and drive — let's talk. I'm always open to thoughtful conversations, collaborations, and opportunities with like minded people.</p>
          </div>
          <ul className="social-list">
            <li className="social-item">
              <a href="https://www.linkedin.com/in/stephanelubendo/"  rel="noreferrer" className="social-link">
                <ion-icon name="logo-linkedin"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://github.com/slubendo" target="_blank" rel="noreferrer" className="social-link">
                <ion-icon name="logo-github"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="https://www.instagram.com/stephanelubendo/" target="_blank" rel="noreferrer" className="social-link">
                <ion-icon name="logo-instagram"></ion-icon>
              </a>
            </li>
            <li className="social-item">
              <a href="mailto:stephane.lubendo@gmail.com" className="social-link">
                <ion-icon name="mail"></ion-icon>
              </a>
            </li>
          </ul>
        </div>
      </div>{/* end #home */}
    </>
  )
}
