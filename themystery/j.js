document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const desktopIcons = document.querySelectorAll('.desktop-icon');

    // Toggle Start Menu
    startButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent click from closing menu immediately
        const isExpanded = startButton.getAttribute('aria-expanded') === 'true';
        startButton.setAttribute('aria-expanded', !isExpanded);
        startMenu.classList.toggle('open');
        if (startMenu.classList.contains('open')) {
            startMenu.querySelector('[role="menuitem"]').focus(); // Focus first item
        }
    });

    // Close Start Menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
            if (startMenu.classList.contains('open')) {
                startButton.setAttribute('aria-expanded', 'false');
                startMenu.classList.remove('open');
            }
        }
    });

    // Handle keyboard navigation for Start Menu
    startMenu.addEventListener('keydown', (event) => {
        if (!startMenu.classList.contains('open')) return;

        const items = Array.from(startMenu.querySelectorAll('[role="menuitem"]'));
        const activeElement = document.activeElement;
        let currentIndex = items.indexOf(activeElement);

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].focus();
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            items[currentIndex].focus();
        } else if (event.key === 'Escape' || event.key === 'Tab') {
            event.preventDefault();
            startButton.setAttribute('aria-expanded', 'false');
            startMenu.classList.remove('open');
            startButton.focus();
        } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            activeElement.click(); // Simulate click on the focused item
            // Potentially close menu or open a new window/dialog here
            startButton.setAttribute('aria-expanded', 'false');
            startMenu.classList.remove('open');
            startButton.focus();
        }
    });

    // Desktop Icon Interaction (Placeholder for actual functionality)
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            console.log(`${icon.getAttribute('aria-label')} clicked`);
            // Placeholder: Open a window or perform an action
            // Example: openWindow(icon.id, icon.querySelector('span').textContent);
        });

        icon.addEventListener('dblclick', () => {
            console.log(`${icon.getAttribute('aria-label')} double-clicked`);
            // Placeholder: Open a window or perform an action, typically the primary action
        });

        icon.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                icon.click(); // Or dblclick() depending on desired behavior
            }
        });

        // Basic Draggability (Simplified - for more robust solution, use a library or more complex logic)
        makeDraggable(icon);
    });

    // --- Placeholder for Windowing System ---
    // function openWindow(id, title) {
    //     // Logic to create/show a window div
    //     // This would involve creating DOM elements for the window, header, controls, body
    //     console.log(`Opening window for: ${title} (id: ${id})`);
    //     // Example: create a new window element, append to desktop, make it draggable etc.
    // }

    // --- Basic Draggable Functionality ---
    function makeDraggable(element) {
        let offsetX, offsetY, isDragging = false;
        const taskbarHeight = document.getElementById('taskbar').offsetHeight;

        element.addEventListener('mousedown', (e) => {
            // Prevent dragging if the click is on a button or interactive element within the draggable element
            if (e.target.closest('button, a, input, textarea')) {
                return;
            }
            isDragging = true;
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            element.style.cursor = 'grabbing';
            element.style.zIndex = getMaxZIndex() + 1; // Bring to front
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault(); // Prevent text selection during drag

            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;

            // Constrain to viewport (simple version)
            const desktop = document.getElementById('desktop');
            const maxX = desktop.clientWidth - element.offsetWidth;
            const maxY = desktop.clientHeight - element.offsetHeight - taskbarHeight;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            element.style.left = `${newX}px`;
            element.style.top = `${newY}px`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.style.cursor = 'pointer'; // Or 'grab' if you prefer
            }
        });

        // Prevent dragging from starting if the element is focused and space/enter is pressed
        element.addEventListener('keydown', (e) => {
            if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === element) {
                isDragging = false; // Ensure not to trigger drag
            }
        });
    }

    function getMaxZIndex() {
        return Array.from(document.querySelectorAll('#desktop > *, .window'))
            .reduce((max, el) => Math.max(max, parseInt(window.getComputedStyle(el).zIndex) || 0), 0);
    }

    // Mystery icon actions and random outcomes
    const oracleIcon = document.getElementById('oracle-icon');
    const codexIcon = document.getElementById('codex-icon');
    const anomalyIcon = document.getElementById('anomaly-icon');
    const signalIcon = document.getElementById('signal-icon');
    const cooltermIcon = document.getElementById('coolterm-icon');
    const voidIcon = document.getElementById('void-icon');

    // Define the 5 mysterious outcomes that can happen
    const mysteriousOutcomes = [
        {
            name: 'Cryptic Message',
            action: () => {
                const messages = [
                    'The answer lies between the 3rd and 7th dimensions.',
                    'When the clock strikes 13, look to the northwest corner.',
                    'They are watching. They have always been watching.',
                    'The pattern repeats every 23 days. Today is day 17.',
                    'Coordinates received: 37.2431° N, 115.7930° W',
                    'Sequence incomplete: 3, 1, 4, 1, 5, 9, 2, 6, ?',
                    'The key is hidden where light cannot reach.',
                    'Mirror the message to reveal its true meaning.',
                    'Look behind the eyes of the one who sees all.',
                    'The password was under your nose all along: BLUEBOOK'
                ];
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                createCrypticMessageWindow(randomMessage);
            }
        },
        {
            name: 'Glitch Effect',
            action: () => {
                // Create a full-screen glitch effect
                const glitchOverlay = document.createElement('div');
                glitchOverlay.className = 'glitch-overlay';
                document.body.appendChild(glitchOverlay);
                
                // Add random colored blocks
                for (let i = 0; i < 50; i++) {
                    const glitchBlock = document.createElement('div');
                    glitchBlock.className = 'glitch-block';
                    glitchBlock.style.left = `${Math.random() * 100}%`;
                    glitchBlock.style.top = `${Math.random() * 100}%`;
                    glitchBlock.style.width = `${Math.random() * 200}px`;
                    glitchBlock.style.height = `${Math.random() * 50}px`;
                    glitchBlock.style.backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                    glitchBlock.style.opacity = Math.random() * 0.7;
                    glitchOverlay.appendChild(glitchBlock);
                }
                
                // Make screen shake
                document.body.classList.add('screen-shake');
                
                // Remove after a short time
                setTimeout(() => {
                    glitchOverlay.remove();
                    document.body.classList.remove('screen-shake');
                }, 2000);
            }
        },
        {
            name: 'Mysterious Audio',
            action: () => {
                // Create and play a mysterious sound
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create oscillator for eerie sound
                const oscillator = audioContext.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                
                // Add weird frequency modulation
                oscillator.frequency.exponentialRampToValueAtTime(
                    880, audioContext.currentTime + 0.5
                );
                oscillator.frequency.exponentialRampToValueAtTime(
                    110, audioContext.currentTime + 1
                );
                oscillator.frequency.exponentialRampToValueAtTime(
                    440, audioContext.currentTime + 2
                );
                
                // Add gain node for volume control
                const gainNode = audioContext.createGain();
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
                
                // Connect and start
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 2);
                
                // Show a subtle notification
                const audioNotification = document.createElement('div');
                audioNotification.className = 'audio-notification';
                audioNotification.textContent = 'Signal detected...';
                document.body.appendChild(audioNotification);
                
                setTimeout(() => {
                    audioNotification.remove();
                }, 2000);
            }
        },
        {
            name: 'Binary Message',
            action: () => {
                // Create a window with scrolling binary code
                const binaryWindow = document.createElement('div');
                binaryWindow.className = 'binary-window';
                document.body.appendChild(binaryWindow);
                
                // Generate random binary
                let binaryContent = '';
                for (let i = 0; i < 1000; i++) {
                    binaryContent += Math.round(Math.random());
                    if (i % 8 === 7) binaryContent += ' ';
                    if (i % 64 === 63) binaryContent += '\n';
                }
                
                // Hide a secret message in the binary
                const secretMessages = [
                    'HELP ME',
                    'THEY KNOW',
                    'FIND US',
                    'LOOK UP',
                    'RUN NOW'
                ];
                const secretMessage = secretMessages[Math.floor(Math.random() * secretMessages.length)];
                
                // Convert secret message to binary
                let binaryMessage = '';
                for (let i = 0; i < secretMessage.length; i++) {
                    const binary = secretMessage.charCodeAt(i).toString(2).padStart(8, '0');
                    binaryMessage += binary + ' ';
                }
                
                // Insert the binary message at a random position
                const insertPosition = Math.floor(Math.random() * (binaryContent.length - binaryMessage.length));
                binaryContent = binaryContent.substring(0, insertPosition) + 
                               binaryMessage + 
                               binaryContent.substring(insertPosition + binaryMessage.length);
                
                binaryWindow.textContent = binaryContent;
                
                // Auto-scroll effect
                let scrollPos = 0;
                const scrollInterval = setInterval(() => {
                    scrollPos += 2;
                    binaryWindow.scrollTop = scrollPos;
                    if (scrollPos > binaryWindow.scrollHeight) {
                        clearInterval(scrollInterval);
                        setTimeout(() => binaryWindow.remove(), 500);
                    }
                }, 50);
                
                // Close on click
                binaryWindow.addEventListener('click', () => {
                    clearInterval(scrollInterval);
                    binaryWindow.remove();
                });
            }
        },
        {
            name: 'System Takeover',
            action: () => {
                // Create a fake system takeover effect
                const takeoverOverlay = document.createElement('div');
                takeoverOverlay.className = 'takeover-overlay';
                document.body.appendChild(takeoverOverlay);
                
                // Add typing effect text
                const terminalText = document.createElement('div');
                terminalText.className = 'terminal-text';
                takeoverOverlay.appendChild(terminalText);
                
                const messages = [
                    'INITIATING SYSTEM OVERRIDE...',
                    'BYPASSING SECURITY PROTOCOLS...',
                    'ACCESSING RESTRICTED FILES...',
                    'DOWNLOADING SENSITIVE DATA...',
                    'CORRUPTING SYSTEM32...',
                    'INSTALLING BACKDOOR...',
                    'ERASING LOGS...',
                    'SYSTEM COMPROMISED.',
                    'DISCONNECTING...',
                    'CONNECTION TERMINATED.'
                ];
                
                let messageIndex = 0;
                let charIndex = 0;
                
                const typeInterval = setInterval(() => {
                    if (messageIndex >= messages.length) {
                        clearInterval(typeInterval);
                        setTimeout(() => takeoverOverlay.remove(), 1500);
                        return;
                    }
                    
                    if (charIndex < messages[messageIndex].length) {
                        terminalText.textContent += messages[messageIndex][charIndex];
                        charIndex++;
                    } else {
                        terminalText.textContent += '\n';
                        messageIndex++;
                        charIndex = 0;
                    }
                }, 50);
            }
        }
    ];

    // Function to get a random outcome
    function getRandomOutcome() {
        return mysteriousOutcomes[Math.floor(Math.random() * mysteriousOutcomes.length)];
    }

    // Helper function to create a cryptic message window
    function createCrypticMessageWindow(message) {
        const messageWindow = document.createElement('div');
        messageWindow.className = 'message-window';
        messageWindow.innerHTML = `
            <div class="window-header">
                <span>INCOMING TRANSMISSION</span>
                <button class="close-button">u00d7</button>
            </div>
            <div class="window-content">
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(messageWindow);
        
        // Center the window
        messageWindow.style.left = `${(window.innerWidth - messageWindow.offsetWidth) / 2}px`;
        messageWindow.style.top = `${(window.innerHeight - messageWindow.offsetHeight) / 2}px`;
        
        // Make it draggable
        makeDraggable(messageWindow);
        
        // Close button functionality
        messageWindow.querySelector('.close-button').addEventListener('click', () => {
            messageWindow.remove();
        });
    }

    // Create a simple terminal window
    function createTerminalWindow() {
        const terminalWindow = document.createElement('div');
        terminalWindow.className = 'terminal-window';
        terminalWindow.innerHTML = `
            <div class="window-header">
                <span>Cool Terminal</span>
                <button class="minimize-button">-</button>
                <button class="maximize-button">u25a1</button>
                <button class="close-button">u00d7</button>
            </div>
            <div class="terminal-content">
                <div class="terminal-output">
                    <p>Cool Terminal [Version 1.0.1995]</p>
                    <p>(c) 1995 Mystery Corp. All rights reserved.</p>
                    <p>&nbsp;</p>
                    <p>Type 'help' for a list of commands.</p>
                </div>
                <div class="terminal-input-line">
                    <span class="prompt">C:\>&nbsp;</span>
                    <input type="text" class="terminal-input" autofocus>
                </div>
            </div>
        `;
        document.body.appendChild(terminalWindow);
        
        // Center the window
        terminalWindow.style.left = `${(window.innerWidth - 600) / 2}px`;
        terminalWindow.style.top = `${(window.innerHeight - 400) / 2}px`;
        terminalWindow.style.width = '600px';
        terminalWindow.style.height = '400px';
        
        // Make it draggable
        makeDraggable(terminalWindow);
        
        // Terminal functionality
        const terminalOutput = terminalWindow.querySelector('.terminal-output');
        const terminalInput = terminalWindow.querySelector('.terminal-input');
        const prompt = terminalWindow.querySelector('.prompt');
        
        terminalInput.focus();
        
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim().toLowerCase();
                
                // Add command to output
                const commandLine = document.createElement('p');
                commandLine.innerHTML = `<span class="prompt">${prompt.textContent}</span>${command}`;
                terminalOutput.appendChild(commandLine);
                
                // Process command
                processTerminalCommand(command, terminalOutput);
                
                // Clear input and scroll to bottom
                terminalInput.value = '';
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        });
        
        // Window controls
        terminalWindow.querySelector('.close-button').addEventListener('click', () => {
            terminalWindow.remove();
        });
        
        terminalWindow.querySelector('.minimize-button').addEventListener('click', () => {
            // Just a visual effect for now
            terminalWindow.style.opacity = '0.5';
            setTimeout(() => terminalWindow.style.opacity = '1', 300);
        });
        
        terminalWindow.querySelector('.maximize-button').addEventListener('click', () => {
            // Toggle between normal and maximized
            if (!terminalWindow.classList.contains('maximized')) {
                terminalWindow.dataset.prevWidth = terminalWindow.style.width;
                terminalWindow.dataset.prevHeight = terminalWindow.style.height;
                terminalWindow.dataset.prevLeft = terminalWindow.style.left;
                terminalWindow.dataset.prevTop = terminalWindow.style.top;
                
                terminalWindow.style.width = '100%';
                terminalWindow.style.height = `calc(100% - ${document.getElementById('taskbar').offsetHeight}px)`;
                terminalWindow.style.left = '0';
                terminalWindow.style.top = '0';
                terminalWindow.classList.add('maximized');
            } else {
                terminalWindow.style.width = terminalWindow.dataset.prevWidth;
                terminalWindow.style.height = terminalWindow.dataset.prevHeight;
                terminalWindow.style.left = terminalWindow.dataset.prevLeft;
                terminalWindow.style.top = terminalWindow.dataset.prevTop;
                terminalWindow.classList.remove('maximized');
            }
        });
        
        // Focus input when clicking anywhere in the terminal
        terminalWindow.querySelector('.terminal-content').addEventListener('click', () => {
            terminalInput.focus();
        });
        
        return terminalWindow;
    }
    
    // Process terminal commands
    function processTerminalCommand(command, outputElement) {
        const response = document.createElement('p');
        
        switch(command) {
            case 'help':
                response.innerHTML = `
                    Available commands:<br>
                    - help: Display this help message<br>
                    - echo [text]: Display text<br>
                    - time: Display current time<br>
                    - date: Display current date<br>
                    - cls: Clear the screen<br>
                    - dir: List directory contents<br>
                    - secret: ???<br>
                    - exit: Close the terminal
                `;
                break;
                
            case 'cls':
                // Clear all but keep the last line (input)
                while (outputElement.children.length > 1) {
                    outputElement.removeChild(outputElement.firstChild);
                }
                return; // Don't add a response
                
            case 'time':
                const time = new Date().toLocaleTimeString();
                response.textContent = `Current time: ${time}`;
                break;
                
            case 'date':
                const date = new Date().toLocaleDateString();
                response.textContent = `Current date: ${date}`;
                break;
                
            case 'dir':
                response.innerHTML = `
                    Volume in drive C has no label.<br>
                    Volume Serial Number is 1337-CAFE<br><br>
                    Directory of C:\<br><br>
                    SYSTEM     &lt;DIR&gt;        01-01-1995  12:00 AM<br>
                    WINDOWS    &lt;DIR&gt;        01-01-1995  12:00 AM<br>
                    PROGRAM    &lt;DIR&gt;        01-01-1995  12:00 AM<br>
                    USERS      &lt;DIR&gt;        01-01-1995  12:00 AM<br>
                    SECRETS    &lt;DIR&gt;        01-01-1995  12:00 AM<br>
                    README.TXT        512    01-01-1995  12:00 AM<br>
                    PORTAL.EXE       1,024    01-01-1995  12:00 AM<br>
                    HIDDEN.SYS     13,337    01-01-1995  12:00 AM<br><br>
                    8 File(s)     14,873 bytes<br>
                    5 Dir(s)  1,073,741,824 bytes free
                `;
                break;
                
            case 'secret':
                response.innerHTML = `<span style="color: #ff0000;">ACCESS GRANTED. INITIATING SEQUENCE...</span>`;
                // Trigger a random outcome after a delay
                setTimeout(() => {
                    getRandomOutcome().action();
                }, 1500);
                break;
                
            case 'exit':
                // Find and close the terminal window
                const terminalWindow = outputElement.closest('.terminal-window');
                if (terminalWindow) {
                    setTimeout(() => terminalWindow.remove(), 500);
                }
                response.textContent = 'Terminating session...';
                break;
                
            default:
                if (command.startsWith('echo ')) {
                    response.textContent = command.substring(5);
                } else if (command === '') {
                    return; // Don't add a response for empty command
                } else {
                    response.textContent = `'${command}' is not recognized as an internal or external command, operable program or batch file.`;
                }
        }
        
        outputElement.appendChild(response);
    }

    // Set up icon click events
    oracleIcon.addEventListener('dblclick', () => {
        getRandomOutcome().action();
    });

    codexIcon.addEventListener('dblclick', () => {
        getRandomOutcome().action();
    });

    anomalyIcon.addEventListener('dblclick', () => {
        getRandomOutcome().action();
    });

    signalIcon.addEventListener('dblclick', () => {
        getRandomOutcome().action();
    });

    cooltermIcon.addEventListener('dblclick', () => {
        createTerminalWindow();
    });

    voidIcon.addEventListener('dblclick', () => {
        getRandomOutcome().action();
    });
});