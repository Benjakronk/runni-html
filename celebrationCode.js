// completion.js - JavaScript for gratulasjonsseksjonen

/**
 * CompletionHandler - Håndterer gratulasjonsseksjonen og progresstracking
 */
const CompletionHandler = {
    // Konfigurasjon av alle moduler og leksjoner
    moduleConfig: {
        modul0: {
            name: 'Oppsett og verktøy',
            icon: '🛠️',
            lessons: [
                'modul0_leksjon1_completed',
                'modul0_leksjon2_completed',
                'modul0_leksjon3_completed',
                'modul0_leksjon4_completed',
                'modul0_leksjon5_completed'
            ]
        },
        modul1: {
            name: 'HTML Grunnleggende',
            icon: '📚',
            lessons: [
                'modul1_completed',
                'modul1_kommentarer_completed',
                'modul1_bilder_completed',
                'modul1_videre_completed',
                'modul1_tabeller_completed'
            ]
        },
        modul2: {
            name: 'CSS Styling',
            icon: '🎨',
            lessons: [
                'modul2_css_intro_completed',
                'modul2_selektorer_completed',
                'modul2_layout_completed',
                'modul2_responsive_completed'
            ]
        },
        modul3: {
            name: 'JavaScript',
            icon: '⚡',
            lessons: [
                'modul3_js_intro_completed',
                'modul3_dom_completed',
                'modul3_events_completed',
                'modul3_projects_completed'
            ]
        },
        modul4: {
            name: 'Avanserte teknikker',
            icon: '🎮',
            lessons: [
                'modul4_flexbox_completed',
                'modul4_animasjoner_completed',
                'modul4_tastatur_completed',
                'modul4_spill_completed'
            ]
        },
        modul5: {
            name: 'API og Asynkron JS',
            icon: '🔥',
            lessons: [
                'modul5_api_intro_completed',
                'modul5_async_js_completed',
                'modul5_data_processing_completed',
                'modul5_local_storage_completed',
                'modul5_api_app_completed'
            ]
        }
    },

    // Cache for å unngå gjentatt beregning
    cache: {
        totalLessons: null,
        completedCount: null,
        lastCheck: null
    },

    /**
     * Hent alle leksjons-nøkler fra alle moduler
     */
    getAllLessonKeys() {
        if (this.cache.totalLessons) {
            return this.cache.totalLessons;
        }

        const allLessons = [];
        for (const moduleKey in this.moduleConfig) {
            allLessons.push(...this.moduleConfig[moduleKey].lessons);
        }
        
        this.cache.totalLessons = allLessons;
        return allLessons;
    },

    /**
     * Tell antall fullførte leksjoner
     */
    getCompletedLessonsCount() {
        const now = Date.now();
        
        // Bruk cache hvis mindre enn 1 sekund siden siste sjekk
        if (this.cache.completedCount !== null && 
            this.cache.lastCheck && 
            (now - this.cache.lastCheck) < 1000) {
            return this.cache.completedCount;
        }

        const allLessons = this.getAllLessonKeys();
        const completedCount = allLessons.filter(lesson => 
            localStorage.getItem(lesson) === 'true'
        ).length;

        // Oppdater cache
        this.cache.completedCount = completedCount;
        this.cache.lastCheck = now;

        return completedCount;
    },

    /**
     * Sjekk om en spesifikk modul er fullført
     */
    isModuleCompleted(moduleKey) {
        const moduleConfig = this.moduleConfig[moduleKey];
        if (!moduleConfig) {
            console.warn(`Module ${moduleKey} not found in configuration`);
            return false;
        }

        return moduleConfig.lessons.every(lesson => 
            localStorage.getItem(lesson) === 'true'
        );
    },

    /**
     * Sjekk om alle moduler er fullført
     */
    areAllModulesCompleted() {
        const allLessons = this.getAllLessonKeys();
        const completedCount = this.getCompletedLessonsCount();
        
        return completedCount === allLessons.length;
    },

    /**
     * Hent detaljert fremgangsstatus
     */
    getDetailedProgress() {
        const moduleProgress = {};
        let totalLessons = 0;
        let totalCompleted = 0;

        for (const moduleKey in this.moduleConfig) {
            const moduleConfig = this.moduleConfig[moduleKey];
            const completedLessons = moduleConfig.lessons.filter(lesson => 
                localStorage.getItem(lesson) === 'true'
            ).length;

            moduleProgress[moduleKey] = {
                name: moduleConfig.name,
                icon: moduleConfig.icon,
                completed: completedLessons,
                total: moduleConfig.lessons.length,
                isComplete: completedLessons === moduleConfig.lessons.length,
                percentage: Math.round((completedLessons / moduleConfig.lessons.length) * 100)
            };

            totalLessons += moduleConfig.lessons.length;
            totalCompleted += completedLessons;
        }

        return {
            modules: moduleProgress,
            overall: {
                completed: totalCompleted,
                total: totalLessons,
                percentage: Math.round((totalCompleted / totalLessons) * 100),
                allComplete: totalCompleted === totalLessons
            }
        };
    },

    /**
     * Vis gratulasjonsseksjonen
     */
    showCompletionSection() {
        const completionSection = document.getElementById('completion-section');
        if (!completionSection) {
            console.error('Completion section not found in DOM');
            return;
        }

        completionSection.classList.remove('hidden');
        completionSection.classList.add('visible');
        
        // Oppdater statistikk
        this.updateCompletionStats();
        
        // Animer modulkortene
        this.animateModuleCards();
        
        // Lagre at gratulasjonsseksjonen er låst opp
        localStorage.setItem('completion_section_unlocked', 'true');
        localStorage.setItem('completion_unlocked_timestamp', Date.now().toString());
        
        // Trigger event for andre deler av applikasjonen
        document.dispatchEvent(new CustomEvent('courseCompleted', {
            detail: { timestamp: Date.now() }
        }));

        console.log('🎉 Gratulasjonsseksjonen er nå synlig!');
    },

    /**
     * Skjul gratulasjonsseksjonen
     */
    hideCompletionSection() {
        const completionSection = document.getElementById('completion-section');
        if (!completionSection) return;

        completionSection.classList.add('hidden');
        completionSection.classList.remove('visible');
        
        localStorage.removeItem('completion_section_unlocked');
        localStorage.removeItem('completion_unlocked_timestamp');
    },

    /**
     * Oppdater statistikk i gratulasjonsseksjonen
     */
    updateCompletionStats() {
        const progress = this.getDetailedProgress();
        
        // Oppdater leksjonsteller
        const lessonsCountElement = document.getElementById('completed-lessons-count');
        if (lessonsCountElement) {
            this.animateNumber(lessonsCountElement, progress.overall.completed);
        }

        // Oppdater moduler-teller (alltid 6)
        const modulesCountElement = document.getElementById('completed-modules-count');
        if (modulesCountElement) {
            this.animateNumber(modulesCountElement, 6);
        }

        console.log('Statistikk oppdatert:', progress.overall);
    },

    /**
     * Animer tall i statistikk-kortene
     */
    animateNumber(element, targetNumber, duration = 1500) {
        const startNumber = 0;
        const increment = targetNumber / (duration / 16); // 60 FPS
        let currentNumber = startNumber;

        const timer = setInterval(() => {
            currentNumber += increment;
            
            if (currentNumber >= targetNumber) {
                currentNumber = targetNumber;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(currentNumber);
        }, 16);
    },

    /**
     * Animer modulkortene når de vises
     */
    animateModuleCards() {
        const moduleCards = document.querySelectorAll('.completed-module');
        
        moduleCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = `moduleCardSlideIn 0.6s ease-out both`;
            }, index * 100);
        });
    },

    /**
     * Hovedfunksjonen som sjekker og håndterer fullføring
     */
    checkAndHandleCompletion() {
        const isComplete = this.areAllModulesCompleted();
        const completionSection = document.getElementById('completion-section');
        
        if (!completionSection) {
            console.warn('Completion section not found - make sure HTML is loaded');
            return false;
        }

        if (isComplete) {
            // Sjekk om seksjonen allerede er synlig
            const isCurrentlyVisible = completionSection.classList.contains('visible');
            
            if (!isCurrentlyVisible) {
                console.log('🎉 Alle moduler fullført! Viser gratulasjonsseksjon...');
                this.showCompletionSection();
            }
            return true;
        } else {
            // Skjul hvis den ikke skulle være synlig
            const progress = this.getDetailedProgress();
            console.log(`📚 Fremgang: ${progress.overall.completed}/${progress.overall.total} leksjoner (${progress.overall.percentage}%)`);
            
            if (completionSection.classList.contains('visible')) {
                this.hideCompletionSection();
            }
            return false;
        }
    },

    /**
     * Belønningsfunksjoner
     */
    generateCertificate() {
        const progress = this.getDetailedProgress();
        const completionDate = localStorage.getItem('completion_unlocked_timestamp');
        const date = completionDate ? new Date(parseInt(completionDate)) : new Date();
        
        alert(`🎉 Kursbevis generert!
        
Gratulerer med fullført webutviklingskurs!
        
📊 Statistikk:
• ${progress.overall.completed} leksjoner fullført
• ${Object.keys(this.moduleConfig).length} moduler mestret
• Fullført: ${date.toLocaleDateString('no-NO')}

Dette beviset bekrefter at du har tilegnet deg grunnleggende ferdigheter i HTML, CSS, JavaScript og moderne webutvikling.

💡 Tips: Ta skjermbilde av denne meldingen som midlertidig bevis, eller implementer en ordentlig PDF-generator!`);
    },

    unlockAdvancedProjects() {
        // Sett flag for avanserte prosjekter
        localStorage.setItem('advanced_projects_unlocked', 'true');
        localStorage.setItem('advanced_projects_unlock_date', Date.now().toString());
        
        alert(`🚀 Avanserte prosjekter låst opp!

Du har nå tilgang til:
• Portfolio-bygger med React
• E-handelsnettsted med database
• Real-time chat-applikasjon
• API-basert værapp
• Avansert spillutvikling

Sjekk prosjekt-seksjonen for nye utfordringer!`);
        
        // Trigger event for å oppdatere prosjekt-seksjonen
        document.dispatchEvent(new CustomEvent('advancedProjectsUnlocked'));
    },

    unlockMentorMode() {
        localStorage.setItem('mentor_mode_unlocked', 'true');
        localStorage.setItem('mentor_unlock_date', Date.now().toString());
        
        alert(`👨‍🏫 Mentor-modus aktivert!

Du kan nå:
• Hjelpe nye studenter med spørsmål
• Dele din kunnskap og erfaring
• Få tilgang til lærerressurser
• Delta i mentor-programmet

Takk for at du vil bidra til læringsfelleskapet!`);
    },

    createPortfolio() {
        const progress = this.getDetailedProgress();
        
        alert(`💼 Portfolio-generator startet!

Basert på dine fullførte moduler vil vi lage en profesjonell portfolio som viser:

📚 Ferdigheter:
• HTML5 og semantisk markup
• CSS3 og responsiv design  
• JavaScript og DOM-manipulering
• API-integrasjon og asynkron programmering
• Moderne webutvikling-teknikker

🎨 Inkluderte prosjekter:
• Alle dine kursprosjekter
• Interaktive demoer
• Kodeeksempler
• Tekniske ferdigheter

Dette vil hjelpe deg å vise fram kunnskapene dine til potensielle arbeidsgivere!`);
        
        localStorage.setItem('portfolio_generated', 'true');
    },

    /**
     * Debugging og testfunksjoner
     */
    debugInfo() {
        const progress = this.getDetailedProgress();
        console.log('=== COMPLETION HANDLER DEBUG INFO ===');
        console.log('Modulkonfigurasjon:', this.moduleConfig);
        console.log('Fremgangsstatus:', progress);
        console.log('Alle leksjoner:', this.getAllLessonKeys());
        console.log('Fullførte leksjoner:', this.getCompletedLessonsCount());
        console.log('Alle moduler fullført:', this.areAllModulesCompleted());
        console.log('LocalStorage completion flags:', {
            unlocked: localStorage.getItem('completion_section_unlocked'),
            timestamp: localStorage.getItem('completion_unlocked_timestamp')
        });
    },

    simulateCompletion() {
        console.log('🧪 Simulerer fullføring av alle moduler...');
        
        const allLessons = this.getAllLessonKeys();
        allLessons.forEach(lesson => {
            localStorage.setItem(lesson, 'true');
        });
        
        // Trigger immediate check
        this.clearCache();
        this.checkAndHandleCompletion();
        
        console.log('✅ Simulering fullført!');
    },

    resetAllProgress() {
        if (!confirm('Er du sikker på at du vil nullstille ALL fremgang? Dette kan ikke angres!')) {
            return;
        }
        
        console.log('🔄 Nullstiller all fremgang...');
        
        const allLessons = this.getAllLessonKeys();
        allLessons.forEach(lesson => {
            localStorage.removeItem(lesson);
        });
        
        // Fjern completion flags
        localStorage.removeItem('completion_section_unlocked');
        localStorage.removeItem('completion_unlocked_timestamp');
        localStorage.removeItem('advanced_projects_unlocked');
        localStorage.removeItem('mentor_mode_unlocked');
        localStorage.removeItem('portfolio_generated');
        
        this.clearCache();
        this.hideCompletionSection();
        
        console.log('✅ All fremgang nullstilt!');
    },

    clearCache() {
        this.cache = {
            totalLessons: null,
            completedCount: null,
            lastCheck: null
        };
    },

    /**
     * Initialiseringsfunksjoner
     */
    init() {
        console.log('🚀 Initialiserer CompletionHandler...');
        
        // Sjekk om gratulasjonsseksjonen allerede er låst opp
        if (localStorage.getItem('completion_section_unlocked') === 'true') {
            // Vent til DOM er klar, deretter vis seksjonen
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.showCompletionSection();
                });
            } else {
                this.showCompletionSection();
            }
        }
        
        // Legg til CSS-animasjoner dynamisk
        this.addDynamicStyles();
        
        console.log('✅ CompletionHandler initialisert');
    },

    addDynamicStyles() {
        // Legg til ekstra CSS-animasjoner som trengs
        const style = document.createElement('style');
        style.textContent = `
            @keyframes moduleCardSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-20px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Event listeners for automatisk sjekking
document.addEventListener('DOMContentLoaded', function() {
    CompletionHandler.init();
    CompletionHandler.checkAndHandleCompletion();
});

// Lytt etter endringer i localStorage (fra andre tabs/vinduer)
window.addEventListener('storage', function(e) {
    if (e.key && e.key.includes('_completed')) {
        CompletionHandler.clearCache();
        setTimeout(() => CompletionHandler.checkAndHandleCompletion(), 100);
    }
});

// Eksporter for global tilgang
window.CompletionHandler = CompletionHandler;

// Konsoll-kommandoer for testing (kun i development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debugCompletion = CompletionHandler.debugInfo.bind(CompletionHandler);
    window.simulateCompletion = CompletionHandler.simulateCompletion.bind(CompletionHandler);
    window.resetProgress = CompletionHandler.resetAllProgress.bind(CompletionHandler);
    
    console.log('🛠️ Development mode: Bruk debugCompletion(), simulateCompletion(), eller resetProgress() i konsollen');
}