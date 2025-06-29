document.addEventListener('DOMContentLoaded', () => {
    const pet = document.querySelector('.pet');
    const sleepBtn = document.querySelector('.sleep-btn');
    const wakeBtn = document.querySelector('.wake-btn');
    let isSleeping = false;
    let isDragging = false;
    let lastX = null;
    let smileTimeout = null;
    let nightmareTimer = null;
    let isNightmare = false;
    let lastInteractionTime = 0;
    let idleTimer = null;
    let idleTimeout = null;
    let interactionCount = 0;
    const MAX_INTERACTIONS = 20;
    let tiredTimeout = null;



    // Globale Variablen für Albtraum-Fortschritt
    let progress = 0;
    let maxProgress = 100;
    let progressFill = null;
    let stopNightmare = null;

    pet.addEventListener('click', function () {
        if (isSleeping || isNightmare) return;
        
        // Sound abspielen
        const popSound = new Audio('beep-6-96243.mp3');
        popSound.volume = 0.3; // Lautstärke auf 30% setzen
        popSound.play().catch(e => console.log('Sound konnte nicht abgespielt werden:', e));
        
        // Herz erzeugen
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = '❤️';
        document.querySelector('.pet').appendChild(heart);
        heart.addEventListener('animationend', () => heart.remove());

        interactionCount++;
        if (interactionCount >= MAX_INTERACTIONS) {
            setTiredFace();
        }
    });

    pet.addEventListener('mousedown', function (e) {
        if (!isSleeping) return;
        isDragging = true;
        lastX = e.clientX;
        resetNightmareTimer();
    });

    pet.addEventListener('mousemove', function (e) {
        if (!isSleeping) return;
        if (isNightmare) return; // Kein Lächeln im Albtraummodus
        setMouthStandard(); // Sofort glücklich
        clearTimeout(smileTimeout);
        smileTimeout = setTimeout(() => {
            setMouthNeutral(); // Nach 1 Sekunde neutral
        }, 1000);
        resetNightmareTimer();
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
        lastX = null;
    });

    // Hilfsfunktion: Sterne erstellen
    function createStars() {
        const container = document.body;
        const cubyRect = document.querySelector('.pet').getBoundingClientRect();
        const padding = 60;
        const stars = 10;
        for (let i = 0; i < stars; i++) {
            let x, y;
            let tries = 0;
            do {
                x = Math.random() * window.innerWidth;
                y = Math.random() * window.innerHeight;
                tries++;
            } while (
                x > cubyRect.left - padding &&
                x < cubyRect.right + padding &&
                y > cubyRect.top - padding &&
                y < cubyRect.bottom + padding &&
                tries < 20
            );
            const star = document.createElement('div');
            star.className = 'star';
            star.textContent = '✨';
            star.style.left = `${x}px`;
            star.style.top = `${y}px`;
            const duration = 1.5 + Math.random();
            const delay = Math.random();
            star.style.animationDuration = `${duration}s`;
            star.style.animationDelay = `${delay}s`;
            star.style.position = 'fixed';
            container.appendChild(star);
        }
    }

    sleepBtn.addEventListener('click', function () {
        isSleeping = true;
        document.body.style.background = 'black';
        document.body.classList.add('sleep-mode');
        pet.classList.add('sleeping');
        sleepBtn.style.display = 'none';
        wakeBtn.style.display = 'flex';

        // Herzschlag-Sound im Loop abspielen
        const heartbeatAudio = new Audio('heartbeat-sound-effect-111218.mp3');
        heartbeatAudio.loop = true;
        heartbeatAudio.volume = 0.2;
        heartbeatAudio.playbackRate = 0.5;
        heartbeatAudio.play().catch(e => {});
        window.heartbeatAudio = heartbeatAudio;

        // Stoppe lebendige Animationen
        if (idleTimer) {
            clearInterval(idleTimer);
            idleTimer = null;
        }

        // Pet schläft (Augen zu)
        pet.querySelectorAll('.pupil').forEach(p => p.style.opacity = 0);
        setMouthNeutral();

        // Albtraum-Timer starten
        startNightmareTimer();

        // Sterne erstellen
        createStars();
    });

    wakeBtn.addEventListener('click', function () {
        isSleeping = false;
        isNightmare = false;
        document.body.style.background = 'white';
        document.body.classList.remove('sleep-mode');
        pet.classList.remove('sleeping');
        pet.classList.remove('nightmare');
        wakeBtn.style.display = 'none';
        sleepBtn.style.display = 'flex';
        interactionCount = 0;

        // Herzschlag-Sound stoppen
        if (window.heartbeatAudio) {
            window.heartbeatAudio.pause();
            window.heartbeatAudio.currentTime = 0;
            window.heartbeatAudio = null;
        }

        // Pet wacht auf (Augen auf)
        pet.querySelectorAll('.pupil').forEach(p => p.style.opacity = 1);
        setMouthStandard();

        // Albtraum-Timer stoppen
        clearTimeout(nightmareTimer);

        // Alle Sterne entfernen
        document.querySelectorAll('.star').forEach(star => star.remove());

        // Lebendige Animationen wieder starten
        startIdleAnimations();
    });

    // Albtraum-Timer starten
    function startNightmareTimer() {
        // Zufällige Zeit zwischen 8 und 30 Sekunden (8000 - 30000 ms)
        const randomTime = 8000 + Math.random() * 22000;
        nightmareTimer = setTimeout(() => {
            if (isSleeping && !isNightmare) {
                startNightmare();
            }
        }, randomTime);
    }

    // Albtraum-Timer zurücksetzen
    function resetNightmareTimer() {
        clearTimeout(nightmareTimer);
        if (isSleeping && !isNightmare) {
            startNightmareTimer();
        }
    }

    // Albtraum-Modus starten
    function startNightmare() {
        isNightmare = true;
        pet.classList.add('nightmare');
        clearTimeout(smileTimeout); // Lächel-Timeout abbrechen
        setMouthAngst(); // Mund sofort ängstlich
        
        // Herzschlag-Sound schneller abspielen
        if (window.heartbeatAudio) {
            window.heartbeatAudio.playbackRate = 1.5;
        }
        
        // Albtraum-Sound abspielen
        const nightmareAudio = new Audio('Marcello Del Monaco - Horror Genre Collection - Scary Atmosphere 01.wav');
        nightmareAudio.loop = true;
        nightmareAudio.volume = 0.5;
        nightmareAudio.playbackRate = 1;
        nightmareAudio.play().catch(e => console.log('Sound konnte nicht abgespielt werden:', e));
        // Speichere das Audio-Objekt global, damit es gestoppt werden kann
        window.nightmareAudio = nightmareAudio;
        // Timer für schnelleren Sound, wenn keine Interaktion
        let nightmareSpeedTimeout = null;
        function setNightmareSpeedFast() {
            if (window.nightmareAudio) {
                window.nightmareAudio.playbackRate = 1.5;
                window.nightmareAudio.volume = 1.0;
            }
        }
        function setNightmareSpeedNormal() {
            if (window.nightmareAudio) {
                window.nightmareAudio.playbackRate = 1;
                window.nightmareAudio.volume = 0.5;
            }
        }
        function resetNightmareSpeedTimer() {
            clearTimeout(nightmareSpeedTimeout);
            setNightmareSpeedNormal();
            nightmareSpeedTimeout = setTimeout(() => {
                setNightmareSpeedFast();
            }, 2000); // Nach 2 Sekunden ohne Interaktion schneller
        }
        // Bei jeder Interaktion im Albtraum-Modus Timer zurücksetzen
        const nightmareInteractionEvents = ['mousedown', 'mousemove', 'touchmove'];
        nightmareInteractionEvents.forEach(eventType => {
            pet.addEventListener(eventType, function nightmareSpeedHandler() {
                if (isNightmare) {
                    // Musik langsamer und leiser machen
                    if (window.nightmareAudio) {
                        window.nightmareAudio.playbackRate = 0.7;
                        // Lautstärke schrittweise verringern, aber nicht unter 0.1
                        if (window.nightmareAudio.volume > 0.11) {
                            window.nightmareAudio.volume -= 0.1;
                        } else {
                            window.nightmareAudio.volume = 0.1;
                        }
                    }
                    resetNightmareSpeedTimer();
                }
            });
        });
        // Timer beim Start setzen
        resetNightmareSpeedTimer();
        // Speichere Timeout für späteres Entfernen
        window.nightmareSpeedTimeout = nightmareSpeedTimeout;
        
        // Wake-Button verstecken
        wakeBtn.style.display = 'none';
        
        // Alle Sterne entfernen
        document.querySelectorAll('.star').forEach(star => star.remove());
        
        // Hintergrundbild für Albtraum hinzufügen
        const nightmareBg = document.createElement('div');
        nightmareBg.className = 'nightmare-background';
        nightmareBg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('image.jpg');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: -1;
            opacity: 0.3;
        `;
        document.body.appendChild(nightmareBg);
        
        // Fortschrittsbalken erstellen
        const progressBar = document.createElement('div');
        progressBar.className = 'nightmare-progress';
        progressBar.innerHTML = `
            <div class="progress-fill"></div>
        `;
        document.querySelector('.pet-buttons').appendChild(progressBar);
        
        // Fortschrittsvariablen global setzen
        progress = 0;
        maxProgress = 100;
        progressFill = progressBar.querySelector('.progress-fill');

        // Mund zu einem besorgten Ausdruck ändern
        const mouth = document.querySelector('.mouth');
        mouth.style.border = 'none';
        mouth.style.borderBottom = 'none';
        mouth.style.borderTop = 'none';
        mouth.style.width = '80px';
        mouth.style.height = '20px';
        mouth.style.position = 'absolute';
        mouth.style.bottom = '40px';
        mouth.style.left = '50%';
        mouth.style.transform = 'translateX(-50%) scaleY(-1)';
        mouth.style.background = 'none';
        mouth.style.borderBottom = '3px solid #747474';
        mouth.style.borderRadius = '0 0 40px 40px';
        mouth.style.transition = 'all 0.5s ease';

        // Kontinuierlicher Schwarz-Weiß-Flackereffekt für das Hintergrundbild
        let isVisible = true;
        const flashInterval = setInterval(() => {
            if (!isNightmare) {
                clearInterval(flashInterval);
                return;
            }
            
            const nightmareBg = document.querySelector('.nightmare-background');
            if (nightmareBg) {
                if (isVisible) {
                    nightmareBg.style.opacity = '0.8';
                } else {
                    nightmareBg.style.opacity = '0.1';
                }
                isVisible = !isVisible;
            }
        }, 300);

        // Fortschritt durch Streicheln langsam erhöhen
        stopNightmare = function() {
            if (isNightmare) {
                isNightmare = false;
                pet.classList.remove('nightmare');
                clearInterval(flashInterval);
                document.body.style.background = 'black';
                // Mund-Styles zurücksetzen, damit CSS-Animation greift
                const mouth = document.querySelector('.mouth');
                mouth.removeAttribute('style');
                // Hintergrundbild entfernen
                const nightmareBg = document.querySelector('.nightmare-background');
                if (nightmareBg) {
                    nightmareBg.remove();
                }
                // Fortschrittsbalken entfernen
                const progressBar = document.querySelector('.nightmare-progress');
                if (progressBar) {
                    progressBar.remove();
                }
                // Herzschlag-Sound wieder langsam abspielen
                if (window.heartbeatAudio) {
                    window.heartbeatAudio.playbackRate = 0.5;
                }
                // Albtraum-Sound stoppen
                if (window.nightmareAudio) {
                    // Fade-Out Effekt
                    const fadeOutInterval = setInterval(() => {
                        if (!window.nightmareAudio) {
                            clearInterval(fadeOutInterval);
                            return;
                        }
                        if (window.nightmareAudio.volume > 0.05) {
                            window.nightmareAudio.volume -= 0.05;
                        } else {
                            window.nightmareAudio.volume = 0;
                            window.nightmareAudio.pause();
                            window.nightmareAudio.currentTime = 0;
                            window.nightmareAudio = null;
                            clearInterval(fadeOutInterval);
                        }
                    }, 50);
                }
                // Speed-Timer (aufräumen) 
                if (window.nightmareSpeedTimeout) {
                    clearTimeout(window.nightmareSpeedTimeout);
                    window.nightmareSpeedTimeout = null;
                }
                // Wake-Button wieder anzeigen
                wakeBtn.style.display = 'flex';
                // Mund zurück zum neutralen Schlafzustand
                setMouthNeutral();
                // Event-Listener entfernen
                pet.removeEventListener('mousedown', increaseProgress);
                pet.removeEventListener('mousemove', increaseProgress);
                pet.removeEventListener('touchmove', increaseProgress);
                // Albtraum-Timer neu starten für nächsten Albtraum erst nach Cooldown
                const nightmareCooldown = 40000; // 40 Sekunden Cooldown
                setTimeout(() => {
                    startNightmareTimer();
                }, nightmareCooldown);
                // Sterne wieder erstellen
                createStars();
            }
        };

        pet.addEventListener('mousedown', increaseProgress);
        pet.addEventListener('mousemove', increaseProgress);
        pet.addEventListener('touchmove', increaseProgress);
    }

    // Hilfsfunktion: Mund neutral (gerade Linie)
    function setMouthNeutral() {
        if (isNightmare) {
            setMouthAngst();
            return;
        }
        const mouth = document.querySelector('.mouth');
        mouth.style.height = '6px';
        mouth.style.width = '80px';
        mouth.style.borderRadius = '0px';
        mouth.style.background = '#747474';
        mouth.style.marginTop = '';
        mouth.style.borderBottom = 'none';
        mouth.style.borderTop = 'none';
        mouth.style.transition = 'all 1s ease-out';
    }

    // Hilfsfunktion: Mund Standard (CSS .mouth)
    function setMouthStandard() {
        if (isNightmare) {
            setMouthAngst();
            return;
        }
        const mouth = document.querySelector('.mouth');
        mouth.removeAttribute('style');
    }

    // Lebendige Bewegungen im Wachmodus
    function startIdleAnimations() {
        if (isSleeping || isNightmare) return;
        
        idleTimer = setInterval(() => {
            if (isSleeping || isNightmare) return;
            
            // Zufällige sanfte Bewegungen
            const randomMove = Math.random();
            if (randomMove < 0.3) {
                pet.style.transform = 'translateX(2px)';
                setTimeout(() => {
                    if (!isSleeping && !isNightmare) {
                        pet.style.transform = 'translateX(0)';
                    }
                }, 200);
            } else if (randomMove < 0.6) {
                pet.style.transform = 'translateX(-2px)';
                setTimeout(() => {
                    if (!isSleeping && !isNightmare) {
                        pet.style.transform = 'translateX(0)';
                    }
                }, 200);
            }
        }, 4000); // Alle 4 Sekunden
    }

    // Starte lebendige Animationen
    startIdleAnimations();

    // Augen folgen der Maus
    document.addEventListener('mousemove', function(e) {
        if (isSleeping || isNightmare) return;
        const pupils = document.querySelectorAll('.pupil');
        const petRect = pet.getBoundingClientRect();
        const petCenterX = petRect.left + petRect.width / 2;
        const petCenterY = petRect.top + petRect.height / 2;
        const deltaX = e.clientX - petCenterX;
        const deltaY = e.clientY - petCenterY;
        const maxMoveX = 8;
        const maxMoveY = 12;
        const moveX = Math.max(-maxMoveX, Math.min(maxMoveX, deltaX * 0.2));
        const moveY = Math.max(-maxMoveY, Math.min(maxMoveY, deltaY * 0.25));
        // Transition-Dauer je nach Modus
        let transitionTime = pet.classList.contains('tired') ? '1.5s' : '0.2s';
        pupils.forEach(pupil => {
            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            pupil.style.transition = `transform ${transitionTime} ease-out`;
        });
    });

    function setIdleFace() {
        pet.classList.add('idle');
        setMouthNeutral();
    }

    function resetIdleFace() {
        pet.classList.remove('idle');
        setMouthStandard();
    }

    function resetIdleTimer() {
        clearTimeout(idleTimeout);
        if (isSleeping || isNightmare) return;
        idleTimeout = setTimeout(() => {
            setIdleFace();
        }, 10000); // 10 Sekunden
    }

    // Bei jeder Interaktion Timer zurücksetzen und ggf. Idle-Mimik beenden
    ['click', 'mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, () => {
            resetIdleTimer();
            if (pet.classList.contains('idle')) {
                resetIdleFace();
            }
        }, true);
    });

    // Timer beim Start setzen
    resetIdleTimer();

    function setTiredFace() {
        pet.classList.add('tired');
        setMouthNeutral();
        sleepBtn.style.display = 'flex';
    }

    function resetTiredFace() {
        pet.classList.remove('tired');
        setMouthStandard();
        interactionCount = 0;
    }

    // Nach dem Schlafmodus Müdigkeit zurücksetzen
    wakeBtn.addEventListener('click', function () {
        resetTiredFace();
    });

    function resetTiredInactivityTimer() {
        clearTimeout(tiredTimeout);
        if (isSleeping || isNightmare) return;
        tiredTimeout = setTimeout(() => {
            setTiredFace();
        }, 20000); // 20 Sekunden
    }

    // Bei jeder Interaktion auch den Müde-Timer zurücksetzen
    ['click', 'mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, () => {
            resetTiredInactivityTimer();
        }, true);
    });

    // Timer beim Start setzen
    resetTiredInactivityTimer();

    function setMouthAngst() {
        const mouth = document.querySelector('.mouth');
        mouth.style.height = '20px';
        mouth.style.width = '80px';
        mouth.style.borderRadius = '0 0 40px 40px';
        mouth.style.background = 'none';
        mouth.style.borderBottom = '3px solid #747474';
        mouth.style.borderTop = 'none';
        mouth.style.marginTop = '';
        mouth.style.position = 'absolute';
        mouth.style.bottom = '40px';
        mouth.style.left = '50%';
        mouth.style.transform = 'translateX(-50%) scaleY(-1)';
        mouth.style.transition = 'all 0.5s ease';
    }

    // Fortschritt durch Streicheln im Albtraummodus auch auf Touch-Geräten
    let isTouchingPet = false;
    pet.addEventListener('touchstart', function(e) {
        if (isNightmare) {
            isTouchingPet = true;
            if (typeof increaseProgress === 'function') increaseProgress();
        }
    });
    pet.addEventListener('touchend', function(e) {
        isTouchingPet = false;
    });
    pet.addEventListener('touchcancel', function(e) {
        isTouchingPet = false;
    });

    function increaseProgress() {
        if (isNightmare && progressFill) {
            progress += 0.5; // 0.5% pro Interaktion (viel langsamer)
            if (progress > maxProgress) progress = maxProgress;
            progressFill.style.width = `${progress}%`;
            if (progress >= maxProgress && typeof stopNightmare === 'function') {
                stopNightmare();
            }
        }
    }

    // Touch-Event für Streicheln im Schlafmodus (wie mousemove)
    pet.addEventListener('touchmove', function (e) {
        if (!isSleeping) return;
        if (isNightmare) return; // Kein Lächeln im Albtraummodus
        setMouthStandard(); // Sofort glücklich
        clearTimeout(smileTimeout);
        smileTimeout = setTimeout(() => {
            setMouthNeutral(); // Nach 1 Sekunde neutral
        }, 1000);
        resetNightmareTimer();
    }, {passive: true});

    // Augen folgen dem Finger auf Touch-Geräten (nur wach)
    document.addEventListener('touchmove', function(e) {
        if (isSleeping || isNightmare) return;
        if (!e.touches || e.touches.length === 0) return;
        const touch = e.touches[0];
        const pupils = document.querySelectorAll('.pupil');
        const petRect = pet.getBoundingClientRect();
        const petCenterX = petRect.left + petRect.width / 2;
        const petCenterY = petRect.top + petRect.height / 2;
        const deltaX = touch.clientX - petCenterX;
        const deltaY = touch.clientY - petCenterY;
        const maxMoveX = 8;
        const maxMoveY = 12;
        const moveX = Math.max(-maxMoveX, Math.min(maxMoveX, deltaX * 0.2));
        const moveY = Math.max(-maxMoveY, Math.min(maxMoveY, deltaY * 0.25));
        let transitionTime = pet.classList.contains('tired') ? '1.5s' : '0.2s';
        pupils.forEach(pupil => {
            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
            pupil.style.transition = `transform ${transitionTime} ease-out`;
        });
    }, {passive: true});

    // Vibration bei Klick auf Cuby im Schlafmodus direkt im Handler
    pet.addEventListener('click', function () {
        if (isSleeping && window.navigator.vibrate) {
            window.navigator.vibrate([60, 200, 60]);
        }
    });

    // Vibration bei Touch auf Cuby im Schlafmodus direkt im Handler
    pet.addEventListener('touchstart', function () {
        if (isSleeping && window.navigator.vibrate) {
            window.navigator.vibrate([60, 200, 60]);
        }
    });
});

