import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Shield, 
  HeartPulse, 
  AlertTriangle,
  ChevronRight,
  Crosshair
} from 'lucide-react';
// import backgroundVideo from '../assets/grok-video-feecd6ca-18da-4e9b-9e9e-e7e1cf6d5629.mp4';
import { createTimeline, splitText, stagger, createLayout, utils } from 'animejs';

const HomePage = () => {
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const featuresRef = useRef(null);
  const dialogRef = useRef(null);
  const modalLayoutRef = useRef(null);

  useEffect(() => {
    // 1. Hero Text Animation
    const heroTitle = heroTitleRef.current;
    const heroSubtitle = heroSubtitleRef.current;

    if (heroTitle && heroSubtitle && !heroTitle.querySelector('.char')) {
      try {
        const titleSplit = splitText(heroTitle);
        const subtitleSplit = splitText(heroSubtitle);
        
        createTimeline({
          defaults: { ease: 'outQuad', duration: 800 },
        })
        .add(titleSplit.chars, {
          opacity: [0, 1],
          y: [20, 0],
          rotateX: [-90, 0],
          delay: stagger(30),
        }, 200)
        .add(subtitleSplit.words, {
          opacity: [0, 1],
          scale: [0.9, 1],
          delay: stagger(50),
        }, '-=400');
      } catch (err) {
        console.error("Text animation error:", err);
      }
    }

    // 2. Features Layout Animation
    if (featuresRef.current) {
      const layout = createLayout(featuresRef.current, {
        duration: 250,
        ease: 'outQuad',
        enterFrom: {
          transform: 'translateY(50px) scale(.8)',
          opacity: 0,
          duration: 400,
          ease: 'out(3)'
        }
      });
      
      // Trigger initial entrance - callback is mandatory in v4 update
      layout.update(() => {});
    }

    // 3. Modal Layout Initialization
    if (dialogRef.current) {
      modalLayoutRef.current = createLayout(dialogRef.current, {
        children: ['.card-clone', 'h3', 'p', '.icon-wrapper'],
        properties: ['--overlay-alpha'],
      });
    }
  }, []);

  const openModal = (feature, e) => {
    const $target = e.currentTarget;
    const $dialog = dialogRef.current;
    
    // Create a clone for the animation
    const $clone = $target.cloneNode(true);
    $clone.classList.add('card-clone', 'w-full', 'max-w-md', 'bg-white', 'p-8', 'rounded-2xl', 'shadow-2xl');
    $clone.classList.remove('hover-lift', 'shadow-card');
    
    $dialog.innerHTML = '';
    $dialog.appendChild($clone);

    modalLayoutRef.current.update(() => {
      $dialog.showModal();
      $target.classList.add('is-open'); // Hide original
    }, {
      duration: 500
    });
  };

  const closeModal = () => {
    const $dialog = dialogRef.current;
    modalLayoutRef.current.update(() => {
      $dialog.close();
      const $openItem = document.querySelector('.feature-card.is-open');
      if ($openItem) $openItem.classList.remove('is-open');
    });
  };
  const features = [
    {
      title: "Real-Time Location",
      description: "Find emergency services near your current location",
      icon: <Crosshair className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50/50 border border-blue-100"
    },
    {
      title: "Instant SOS",
      description: "One-tap emergency alert with your location",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      color: "bg-red-50/50 border border-red-100"
    },
    {
      title: "Comprehensive Directory",
      description: "Hospitals, police stations, and more in one place",
      icon: <Shield className="w-6 h-6 text-teal-600" />,
      color: "bg-teal-50/50 border border-teal-100"
    },
    {
      title: "Direct Contact",
      description: "Call emergency services directly from the app",
      icon: <Phone className="w-6 h-6 text-indigo-600" />,
      color: "bg-indigo-50/50 border border-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 py-16 relative overflow-hidden">
        {/* Premium Background Design */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[var(--primary-color)] transition-colors duration-500"></div>
          <div className="absolute inset-0 opacity-40 mix-blend-overlay">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[120%] bg-[radial-gradient(circle,var(--secondary-color)_0%,transparent_70%)] blur-[120px] animate-pulse-slow"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[110%] bg-[radial-gradient(circle,var(--primary-color)_0%,transparent_70%)] blur-[100px] brightness-150"></div>
          </div>
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--secondary-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--primary-color)]/20 to-[var(--background-color)]"></div>
        </div>

        {/* Decorative elements - theme aware */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-400/5 blur-3xl pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 dark:bg-teal-400/5 blur-3xl pointer-events-none z-0"></div>

        <div className="mb-12 relative z-10 w-full max-w-5xl">
          <div className="flex justify-center mb-10">
            <div className="w-20 h-20 bg-[var(--primary-color)] rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-6 transition-transform hover:rotate-0 duration-500">
               <HeartPulse className="w-10 h-10 text-[var(--secondary-color)]" />
            </div>
          </div>
          <h1 
            ref={heroTitleRef}
            className="text-6xl md:text-9xl font-black mb-10 tracking-tighter text-white italic leading-[0.9]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Real-Time <br />
            <span className="text-[var(--secondary-color)] not-italic">Emergency</span> <br />
            Connect
          </h1>
          <p
            ref={heroSubtitleRef}
            className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Experience the future of public safety. Connecting communities with emergency services when every second counts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mb-20 relative z-10 uppercase tracking-widest text-xs font-black">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/map"
              className="inline-flex items-center justify-center px-12 py-5 bg-[var(--secondary-color)] text-[var(--primary-color)] rounded-full shadow-2xl hover:bg-white transition-all duration-300"
            >
              <MapPin className="w-5 h-5 mr-3" />
              Launch Radar
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-12 py-5 bg-transparent border-2 border-white/30 text-white rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-3" />
              Browse Services
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-white/70 text-sm relative z-10"
        >
          <span>Built for public safety &mdash; <Link to="/about" className="underline hover:text-blue-600">Learn more</Link></span>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <span className="text-[var(--secondary-color)] text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Our Impact</span>
          <h2 className="text-5xl md:text-6xl font-black text-[var(--primary-color)] tracking-tighter italic">
            How We Help in <span className="not-italic text-[var(--text-color)]">Emergencies</span>
          </h2>
        </div>
        <div 
          ref={featuresRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 layout-container"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card bg-white p-12 rounded-[2.5rem] shadow-xl hover-lift group relative overflow-hidden cursor-pointer border border-[var(--border-color)] transition-all duration-500 hover:shadow-2xl"
              onClick={(e) => openModal(feature, e)}
            >
              <div className={`icon-wrapper w-20 h-20 rounded-3xl flex items-center justify-center mb-10 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-3xl font-bold text-[var(--primary-color)] mb-6 tracking-tighter" style={{ fontFamily: 'var(--font-serif)' }}>
                {feature.title}
              </h3>
              <p className="text-[var(--text-muted)] leading-relaxed text-lg font-medium">
                {feature.description}
              </p>
              <div className="mt-8 flex items-center text-[var(--secondary-color)] font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Learn More <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Callout */}
      <div className="bg-[var(--surface-color)] border-y border-[var(--border-color)] py-24 sm:py-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-10">
            <div className="w-24 h-24 bg-red-500/10 rounded-[2rem] flex items-center justify-center border border-red-500/20">
              <AlertTriangle className="w-10 h-10 text-red-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-5xl md:text-7xl font-black text-[var(--primary-color)] mb-8 tracking-tighter italic" style={{ fontFamily: 'var(--font-serif)' }}>
            In an <span className="not-italic text-[var(--text-color)]">Emergency?</span>
          </h3>
          <p className="text-xl text-[var(--text-muted)] mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            If you're in immediate danger, do not hesitate. Every second matters. Access immediate help below.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a
              href="tel:112"
              className="btn btn-primary px-16"
            >
              <Phone className="w-5 h-5 mr-3" />
              Call Emergency (112)
            </a>
            <Link
              to="/help"
              className="btn btn-outline px-16"
            >
              <AlertTriangle className="w-5 h-5 mr-3" />
              Help Directory
            </Link>
          </div>
        </div>
      </div>
      {/* Animation Dialog */}
      <dialog 
        ref={dialogRef}
        className="modal-dialog outline-none bg-transparent"
        onClick={closeModal}
        onCancel={closeModal}
      >
      </dialog>

      <style>{`
        .feature-card.is-open {
          opacity: 0;
          pointer-events: none;
        }
        .modal-dialog::backdrop {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
        }
        .card-clone h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        .card-clone p {
          font-size: 1.125rem;
          line-height: 1.75;
        }
      `}</style>
    </div>
  );
};

export default HomePage;