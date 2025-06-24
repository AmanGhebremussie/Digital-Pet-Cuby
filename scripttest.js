Warum kann ich in nicht antippen im Anfangsmodus? 
document.addEventListener('DOMContentLoaded', () => {
    const pet = document.querySelector('.pet');
    const container = document.getElementById('container');
    const statusText = document.querySelector('h1');
    const touchHint = document.querySelector('.touch-hint');
    const progressFill = document.querySelector('.progress-fill');
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 5000;
    let progress = 0;
    const PROGRESS_INCREMENT = 5;
    let lastMouseX = 0;
    let isStroking = false;
    let nightmareTimer;
    const NIGHTMARE_TIMEOUT = 15000;
    let isHolding = false;
    let hasBeenHeld = false;
    let happyMouthTimer = null;
    let tapCount = 0;
    const TAPS_TO_WAKE = 5;
    let strokingTime = 0;
    const STROKING_TIME_TO_WAKE = 3000;
    let strokingInterval;
    //const heartbeatSound = document.getElementById('heartbeatSound');
    let isNightmareCooldown = false;
    let isTired = false;
    let tiredTimer;
    const sleepButton = document.querySelector('.sleep-btn');
    const wakeButton = document.querySelector('.wake-btn');
    let interactionCount = 0;
    const MAX_INTERACTIONS = 5;
    // --- Neu: Mode-State ---
    let currentMode = "active"; // "active", "tired", "sleeping", "nightmare" usw.

    touchHint.textContent = 'Tippe auf mich';

    function createHeart() {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.innerHTML = '❤️';
        const petRect = pet.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        heart.style.top = (petRect.top - containerRect.top) + 'px';
        return heart;
    }

    function animateHeart(heart) {
        heart.style.animation = 'heartFloat 1.5s ease-out forwards';
        setTimeout(() => {
            heart.remove();
        }, 1500);

        if (!pet.classList.contains('sleeping')) {
            const popSound = document.getElementById('popSound');
            if (popSound) {
                popSound.currentTime = 0;
                popSound.play().catch(e => {});
            }
        }
    }

    function animatePet() {
        if (pet.classList.contains('sleeping')) {
            return;
        }
        pet.classList.add('happy');
        pet.style.animation = 'petHappy 0.5s ease';
        setTimeout(() => {
            pet.style.animation = '';
            pet.classList.remove('happy');
        }, 500);
    }


    function handleStroke(event) {
        if (pet.classList.contains('sleeping')) {
            return;
        }
        if (!pet.classList.contains('nightmare')) return;

        const currentX = event.clientX;

        if (!isStroking) {
            isStroking = true;
            lastMouseX = currentX;
            return;
        }

        const movement = Math.abs(currentX - lastMouseX);

        if (movement > 20) {
            progress += PROGRESS_INCREMENT;
            progressFill.style.width = `${Math.min(progress, 100)}%`;
            lastMouseX = currentX;

            if (progress >= 100) {
                endNightmare();
                progress = 0;
                progressFill.style.width = '0%';
                isStroking = false;
            }
        }
    }

    function sleepAnimation() {
        pet.classList.add('sleeping');
        const heartbeatSound = document.getElementById('heartbeat');
        if(heartbeatSound) {
            heartbeatSound.volume = 0.3;
            heartbeatSound.playbackRate = 0.8;
            heartbeatSound.loop = true;
            heartbeatSound.currentTime = 0;
            heartbeatSound.play().catch(e => {});
        }
        

        nightmareTimer = setTimeout(startNightmare, NIGHTMARE_TIMEOUT);
    }

    function startNightmare() {
        if (!pet.classList.contains('sleeping') || isNightmareCooldown) return;
        const heartbeatSound = document.getElementById('heartbeat');
        if(heartbeatSound){
            heartbeatSound.playbackRate = 1.5;
            heartbeatSound.volume = 0.3;
            heartbeatSound.loop = true;
            heartbeatSound.currentTime = 0;
            heartbeatSound.play().catch(e => {});
        }
        pet.classList.remove('sleeping');
        pet.classList.add('nightmare');
        const phoneScreen = document.querySelector('.phone-screen');
        phoneScreen.classList.remove('nightmare-flash');
        phoneScreen.classList.add('nightmare-flash');
        const flashingEyes = document.querySelector('.flashing-evil-eyes');
        const pumpkinSvg = document.querySelector('.pumpkin-svg');
        if(flashingEyes) flashingEyes.classList.add('hidden');
        if(pumpkinSvg) pumpkinSvg.style.opacity = '0';
        touchHint.textContent = 'Beruhige mich!';
        progress = 0;
        progressFill.style.width = '0%';

        isNightmareCooldown = true;
        setTimeout(() => {
            isNightmareCooldown = false;
        }, 15000);
    }

    function endNightmare() {
        pet.classList.remove('nightmare');
        pet.classList.add('sleeping');
        document.querySelector('.phone-screen').classList.remove('nightmare-flash');
        const flashingEyes = document.querySelector('.flashing-evil-eyes');
        const pumpkinSvg = document.querySelector('.pumpkin-svg');
        if(flashingEyes) flashingEyes.classList.add('hidden');
        if(pumpkinSvg) pumpkinSvg.style.opacity = '0';
        progress = 0;
        progressFill.style.width = '0%';
        const heartbeatSound = document.getElementById('heartbeat');
        if(heartbeatSound){
            heartbeatSound.volume = 0.3;
            heartbeatSound.playbackRate = 0.8;
            heartbeatSound.loop = true;
            heartbeatSound.currentTime = 0;
            heartbeatSound.play().catch(e => {});
        }
        let holdTime = 0;
        const HOLD_TIME_TO_WAKE = 5000;
        let holdInterval;
        const holdHandler = () => {
            if (!isHolding) {
                isHolding = true;
                holdTime = 0;
                holdInterval = setInterval(() => {
                    holdTime += 100;
                    if (holdTime >= HOLD_TIME_TO_WAKE) {
                        clearInterval(holdInterval);
                        wakeUp();
                    }
                }, 100);
            }
        };
        const releaseHandler = () => {
            if (isHolding) {
                isHolding = false;
                if (holdInterval) {
                    clearInterval(holdInterval);
                }
            }
        };
        pet.addEventListener('mousedown', holdHandler);
        pet.addEventListener('mouseup', releaseHandler);
        pet.addEventListener('mouseleave', releaseHandler);
        setTimeout(() => {
            pet.removeEventListener('mousedown', holdHandler);
            pet.removeEventListener('mouseup', releaseHandler);
            pet.removeEventListener('mouseleave', releaseHandler);
            if (holdInterval) {
                clearInterval(holdInterval);
            }
            touchHint.textContent = "Halte mich gedrückt";
        }, 10000);
    }

    function wakeUp(isAnnoyed = false) {
        setTimeout(() => {
            pet.classList.remove('sleeping');
            pet.classList.remove('nightmare');
            pet.classList.remove('being-held');
            hasBeenHeld = false;
            tapCount = 0;
            const heartbeatSound = document.getElementById('heartbeat');
            if(heartbeatSound){
                heartbeatSound.pause();
                heartbeatSound.currentTime = 0;
            }
            resetTiredness();
            currentMode = "active";
            statusText && (statusText.textContent = '');
            touchHint.textContent = 'Tippe auf mich';
        }, 500);
        clearTimeout(nightmareTimer);
    }

    // --- Tipp-Handler mit Müdigkeit/State-Logik ---
    pet.addEventListener('click', (e) => {
        if (currentMode === "tired" || pet.classList.contains('nightmare') || pet.classList.contains('sleeping')) return;
        interactionCount++;
        updateTiredness();
        // Augenanimation und Herz wie gehabt
        const eyes = pet.querySelectorAll('.eye');
        const pupils = pet.querySelectorAll('.pupil');
        let animDuration = 0.3;
        if (interactionCount === 3) animDuration = 0.7;
        if (interactionCount === 4) animDuration = 1.1;
        if (interactionCount >= 5) animDuration = 1.6;
        eyes.forEach(eye => {
            eye.style.transitionDuration = animDuration + 's';
        });
        pupils.forEach(pupil => {
            pupil.style.transitionDuration = animDuration + 's';
        });
        if (interactionCount >= MAX_INTERACTIONS) {
            currentMode = "tired";
            setTired();
            return;
        }
        const heart = createHeart();
        container.appendChild(heart);
        animateHeart(heart);
        animatePet();
    });
    

    pet.addEventListener('mousemove', handleStroke);

    setInterval(() => {
        if (pet.classList.contains('nightmare')) {
            triggerScreenFlicker();
        }
    }, 10000);

    function triggerScreenFlicker() {
        if (!pet.classList.contains('nightmare')) return;
        const phoneScreen = document.querySelector('.phone-screen');
        const flashingEyes = document.querySelector('.flashing-evil-eyes');
        const pumpkinSvg = document.querySelector('.pumpkin-svg');
        const thunderSound = document.getElementById('heavy-thunder');
        phoneScreen.classList.add('screen-flicker');
        if(flashingEyes) flashingEyes.classList.remove('hidden');
        if(pumpkinSvg) pumpkinSvg.style.opacity = '1';
        if(thunderSound){
            try {
                thunderSound.currentTime = 0;
                thunderSound.play().catch(e => {});
            } catch (error) {}
        }
        setTimeout(() => {
            phoneScreen.classList.remove('screen-flicker');
            if(flashingEyes) flashingEyes.classList.add('hidden');
            if(pumpkinSvg) pumpkinSvg.style.opacity = '0';
        }, 3000);
    }

    function updateTiredness() {
        for (let i = 1; i <= MAX_INTERACTIONS; i++) {
            pet.classList.remove('tired-' + i);
        }
        if (interactionCount > 0 && interactionCount < MAX_INTERACTIONS) {
            pet.classList.add('tired-' + interactionCount);
        }
        if (interactionCount >= MAX_INTERACTIONS) {
            setTired();
        }
    }

    function setTired() {
        isTired = true;
        sleepButton.disabled = false;
        sleepButton.classList.add('tired');
        pet.classList.add('tired');
        sleepButton.style.display = "inline-block";
    }

    function resetTiredness() {
        isTired = false;
        interactionCount = 0;
        sleepButton.disabled = true;
        sleepButton.classList.remove('tired');
        pet.classList.remove('tired');
        sleepButton.style.display = "none";
        for (let i = 1; i <= MAX_INTERACTIONS; i++) {
            pet.classList.remove('tired-' + i);
        }
    }

    sleepButton.style.display = "none";
    sleepButton.disabled = true;
    // --- Müdenmodus: Schlaf-Button aktiviert jetzt ---
    sleepButton.addEventListener('click', () => {
        if (currentMode === "tired" && !pet.classList.contains('sleeping')) {
            sleepAnimation();
            resetTiredness();
            currentMode = "sleeping";
        }
    });

    wakeButton.addEventListener('click', () => {
        if (pet.classList.contains('sleeping')) {
            wakeUp();
            currentMode = "active";
        }
    });

    // --- Verbesserte Streichelfunktion im Schlafmodus ---
    let sleepPetHappyTimeout = null;
    let sleepPetLastX = null;
    let sleepPetLastDirection = null;
    let sleepPetStrokeSwitches = 0;
    let sleepPetStrokeResetTimeout = null;
    const SLEEP_PET_STROKE_DIST = 30;
    const SLEEP_PET_STROKE_SWITCHES_FOR_HAPPY = 2;
    const SLEEP_PET_STROKE_RESET_MS = 900;

    pet.addEventListener('mousemove', (e) => {
        if (pet.classList.contains('sleeping')) {
            const rect = pet.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (sleepPetLastX !== null) {
                const dx = x - sleepPetLastX;
                if (Math.abs(dx) > SLEEP_PET_STROKE_DIST) {
                    const dir = dx > 0 ? 'right' : 'left';
                    if (sleepPetLastDirection && dir !== sleepPetLastDirection) {
                        sleepPetStrokeSwitches++;
                    }
                    sleepPetLastDirection = dir;
                    sleepPetLastX = x;
                    if (sleepPetStrokeResetTimeout) clearTimeout(sleepPetStrokeResetTimeout);
                    sleepPetStrokeResetTimeout = setTimeout(() => {
                        sleepPetStrokeSwitches = 0;
                        sleepPetLastX = null;
                        sleepPetLastDirection = null;
                    }, SLEEP_PET_STROKE_RESET_MS);
                    if (sleepPetStrokeSwitches >= SLEEP_PET_STROKE_SWITCHES_FOR_HAPPY && !pet.classList.contains('happy')) {
                        pet.classList.add('happy');
                        pet.style.animation = 'petHappy 0.5s ease';
                        if (sleepPetHappyTimeout) clearTimeout(sleepPetHappyTimeout);
                        sleepPetHappyTimeout = setTimeout(() => {
                            pet.style.animation = '';
                            pet.classList.remove('happy');
                        }, 1000);
                        sleepPetStrokeSwitches = 0;
                        sleepPetLastX = null;
                        sleepPetLastDirection = null;
                    }
                }
            } else {
                sleepPetLastX = x;
            }
        } else {
            sleepPetLastX = null;
            sleepPetLastDirection = null;
            sleepPetStrokeSwitches = 0;
        }
    });

    // --- Inaktivitäts-Timer für Müdenmodus ---
    function resetInactivityTimer() {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (currentMode === "active") {
                currentMode = "tired";
                setTired();
            }
        }, 30000); // 30 Sekunden
    }

    // Timer bei jeder Interaktion zurücksetzen
    ["click", "mousemove", "touchstart", "keydown"].forEach(eventType => {
        document.addEventListener(eventType, resetInactivityTimer, true);
    });
    resetInactivityTimer();

    // --- Pulsierende Buttons nach 10 Sekunden ---
    let pulseTimeout = null;
    function startPulseOnButton(btn) {
        if (pulseTimeout) clearTimeout(pulseTimeout);
        btn.classList.remove('pulse-btn');
        pulseTimeout = setTimeout(() => {
            btn.classList.add('pulse-btn');
        }, 10000);
    }
    function stopPulseOnButton(btn) {
        btn.classList.remove('pulse-btn');
        if (pulseTimeout) clearTimeout(pulseTimeout);
    }

    // Sleep-Button: Pulsieren, wenn sichtbar
    const observer = new MutationObserver(() => {
        if (sleepButton.offsetParent !== null && sleepButton.style.display !== 'none') {
            startPulseOnButton(sleepButton);
        } else {
            stopPulseOnButton(sleepButton);
        }
        if (wakeButton.offsetParent !== null && wakeButton.style.display !== 'none') {
            startPulseOnButton(wakeButton);
        } else {
            stopPulseOnButton(wakeButton);
        }
    });
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });
});

