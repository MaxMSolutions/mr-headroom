// MrHeadroom99 OS - Windows 95-style ARG Game System

class OS95 {
    constructor() {
        this.systemState = {
            bootComplete: false,
            startMenuOpen: false,
            activeWindow: null,
            windows: [],
            notifications: [],
            shutdownInProgress: false,
            time: new Date(),
            currentUser: 'User',
            version: 'MrHeadroom99 OS v1.0',
            lastLogin: 'Never',
            powerStatus: 'on'
        };
        
        this.fileSystem = {
            files: {},
            directories: ['C:', 'C:/SYSTEM', 'C:/PROGRAMS', 'C:/DOCUMENTS']
        };
        
        this.programs = {
            'My Computer': {
                icon: 'computer',
                launch: () => this.openMyComputer(),
                type: 'system'
            },
            'Notepad': {
                icon: 'notepad',
                launch: () => this.openNotepad(),
                type: 'program'
            },
            'Calculator': {
                icon: 'calculator',
                launch: () => this.openCalculator(),
                type: 'program'
            },
            'Terminal': {
                icon: 'terminal',
                launch: () => this.openTerminal(),
                type: 'program'
            },
            'Internet': {
                icon: 'internet',
                launch: () => this.openInternet(),
                type: 'program'
            }
        };
        
        this.settings = {
            theme: 'default',
            soundEnabled: true,
            screenSaverTimeout: 300000, // 5 minutes
            clockFormat: '12h'
        };
        
        this.init();
    }
    
    init() {
        // Initialize the file system with default files
        this.setupFileSystem();
        
        // Start the boot sequence
        this.bootSystem();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start the clock
        this.startClock();
    }
    
    setupFileSystem() {
        // Add default files
        this.fileSystem.files['README.TXT'] = {
            content: 'Welcome to MrHeadroom99 OS!\n\nThis system contains several puzzles and secrets to discover.\n\nYour first task is to find the hidden files in the system.\n\nGood luck!',
            type: 'text',
            created: new Date(),
            modified: new Date(),
            attributes: { readonly: false, hidden: false, system: false }
        };
        
        this.fileSystem.files['SYSTEM.INI'] = {
            content: '[System]\nBootDir=C:\\\nBootFile=IO.SYS\nBootVer=4.00.950\n\n[Password]\nHint=The year the system was created\n\n[MrHeadroom]\nSecretCode=VGhlIHBhc3N3b3JkIGlzICJoZWFkcm9vbTk5Ig==',
            type: 'text',
            created: new Date(),
            modified: new Date(),
            attributes: { readonly: true, hidden: false, system: true }
        };
        
        // Add a secret file that will be part of a puzzle
        this.fileSystem.files['SECRET.DAT'] = {
            content: 'VGhlIHBhc3N3b3JkIGlzOiBNUkhFQURST09NOTk=', // Base64 encoded: "The password is: MRHEADROOM99"
            type: 'binary',
            created: new Date(),
            modified: new Date(),
            attributes: { readonly: false, hidden: true, system: false }
        };
    }
    
    bootSystem() {
        // Show boot screen
        const bootScreen = document.querySelector('.boot-screen');
        const bootProgressBar = document.querySelector('.boot-progress-bar');
        const bootMessage = document.querySelector('.boot-message');
        const desktop = document.querySelector('.desktop');
        
        // Set initial boot message
        bootMessage.textContent = 'Starting MrHeadroom99 OS...';
        
        // Simulate boot progress
        let progress = 0;
        const bootInterval = setInterval(() => {
            progress += 5;
            bootProgressBar.style.width = `${progress}%`;
            
            // Update boot messages
            if (progress === 20) {
                bootMessage.textContent = 'Loading system files...';
            } else if (progress === 40) {
                bootMessage.textContent = 'Initializing file system...';
            } else if (progress === 60) {
                bootMessage.textContent = 'Loading user interface...';
            } else if (progress === 80) {
                bootMessage.textContent = 'Preparing desktop...';
            } else if (progress >= 100) {
                bootMessage.textContent = 'Boot complete!';
                clearInterval(bootInterval);
                
                // Complete boot sequence
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                    desktop.style.display = 'flex';
                    this.systemState.bootComplete = true;
                    
                    // Create desktop icons
                    this.createDesktopIcons();
                    
                    // Show welcome message
                    setTimeout(() => {
                        this.showNotification('Welcome to MrHeadroom99 OS!');
                    }, 1000);
                }, 500);
            }
        }, 100);
    }
    
    setupEventListeners() {
        // Start button click
        const startButton = document.querySelector('.start-button');
        const startMenu = document.querySelector('.start-menu');
        
        startButton.addEventListener('click', () => {
            this.toggleStartMenu();
        });
        
        // Close start menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (this.systemState.startMenuOpen && 
                !e.target.closest('.start-menu') && 
                !e.target.closest('.start-button')) {
                this.closeStartMenu();
            }
        });
        
        // Start menu items
        const startMenuItems = document.querySelectorAll('.start-menu-item');
        startMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                this.handleStartMenuAction(action);
            });
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt+Tab to switch between windows
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
            
            // Ctrl+Alt+Del for "task manager"
            if (e.ctrlKey && e.altKey && e.key === 'Delete') {
                e.preventDefault();
                this.openTaskManager();
            }
            
            // Secret key combination: Ctrl+Alt+H
            if (e.ctrlKey && e.altKey && e.key === 'h') {
                if (window.mrHeadroom99) {
                    window.mrHeadroom99.triggerEasterEgg('keyCombo');
                }
            }
        });
    }
    
    startClock() {
        // Update the clock in the taskbar
        const updateClock = () => {
            const now = new Date();
            this.systemState.time = now;
            
            const clockElement = document.querySelector('.clock');
            if (clockElement) {
                let timeString;
                
                if (this.settings.clockFormat === '12h') {
                    const hours = now.getHours();
                    const minutes = now.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const displayHours = hours % 12 || 12;
                    timeString = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
                } else {
                    timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                }
                
                clockElement.textContent = timeString;
            }
        };
        
        // Update immediately and then every minute
        updateClock();
        setInterval(updateClock, 60000);
    }
    
    createDesktopIcons() {
        const desktopIcons = document.querySelector('.desktop-icons');
        
        // Add program icons
        for (const [name, program] of Object.entries(this.programs)) {
            if (program.type !== 'hidden') {
                const iconContainer = document.createElement('div');
                iconContainer.className = 'icon-container';
                iconContainer.innerHTML = `
                    <div class="icon ${program.icon}"></div>
                    <div class="icon-label">${name}</div>
                `;
                
                desktopIcons.appendChild(iconContainer);
                
                // Add click event
                iconContainer.addEventListener('click', () => {
                    this.launchProgram(name);
                });
            }
        }
        
        // Add README.TXT file icon
        const readmeIcon = document.createElement('div');
        readmeIcon.className = 'icon-container';
        readmeIcon.innerHTML = `
            <div class="icon document-yellow"></div>
            <div class="icon-label">README.TXT</div>
        `;
        
        desktopIcons.appendChild(readmeIcon);
        
        // Add click event for README.TXT
        readmeIcon.addEventListener('click', () => {
            this.openNotepad('README.TXT');
            
            // Mark puzzle progress if mrHeadroom99 game is initialized
            if (window.mrHeadroom99) {
                window.mrHeadroom99.markPuzzleProgress('findReadme');
            }
        });
    }
    
    toggleStartMenu() {
        const startMenu = document.querySelector('.start-menu');
        
        if (this.systemState.startMenuOpen) {
            startMenu.style.display = 'none';
            this.systemState.startMenuOpen = false;
        } else {
            startMenu.style.display = 'block';
            this.systemState.startMenuOpen = true;
        }
    }
    
    closeStartMenu() {
        const startMenu = document.querySelector('.start-menu');
        startMenu.style.display = 'none';
        this.systemState.startMenuOpen = false;
    }
    
    handleStartMenuAction(action) {
        this.closeStartMenu();
        
        switch (action) {
            case 'programs':
                // Open programs menu
                break;
                
            case 'documents':
                // Open documents folder
                break;
                
            case 'settings':
                // Open settings
                break;
                
            case 'shutdown':
                this.showShutdownDialog();
                break;
                
            default:
                if (this.programs[action]) {
                    this.launchProgram(action);
                }
        }
    }
    
    launchProgram(programName) {
        if (this.programs[programName]) {
            this.programs[programName].launch();
        }
    }
    
    createWindow(title, content, width = 400, height = 300, left = 'auto', top = 'auto') {
        // Generate a unique ID for the window
        const windowId = `window-${Date.now()}`;
        
        // Create window element
        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.id = windowId;
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;
        
        // Position the window
        if (left === 'center') {
            windowElement.style.left = `calc(50% - ${width / 2}px)`;
        } else if (left === 'auto') {
            // Cascade windows
            const offset = this.systemState.windows.length * 20;
            windowElement.style.left = `${50 + offset}px`;
        } else {
            windowElement.style.left = left;
        }
        
        if (top === 'center') {
            windowElement.style.top = `calc(50% - ${height / 2}px)`;
        } else if (top === 'auto') {
            // Cascade windows
            const offset = this.systemState.windows.length * 20;
            windowElement.style.top = `${50 + offset}px`;
        } else {
            windowElement.style.top = top;
        }
        
        // Create window structure
        windowElement.innerHTML = `
            <div class="window-title-bar">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <div class="window-control minimize"></div>
                    <div class="window-control maximize"></div>
                    <div class="window-control close"></div>
                </div>
            </div>
            <div class="window-content">${content}</div>
        `;
        
        // Add to desktop
        document.querySelector('.desktop-content').appendChild(windowElement);
        
        // Add to windows array
        this.systemState.windows.push({
            id: windowId,
            title: title,
            element: windowElement
        });
        
        // Make this the active window
        this.setActiveWindow(windowId);
        
        // Add to taskbar
        this.addTaskbarItem(windowId, title);
        
        // Setup window controls
        this.setupWindowControls(windowId);
        
        // Make window draggable
        this.makeWindowDraggable(windowId);
        
        // Return the window ID
        return windowId;
    }
    
    setActiveWindow(windowId) {
        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(win => {
            win.classList.remove('active');
            win.style.zIndex = '10';
        });
        
        // Remove active class from all taskbar items
        document.querySelectorAll('.taskbar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Set the active window
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.classList.add('active');
            windowElement.style.zIndex = '100';
            this.systemState.activeWindow = windowId;
            
            // Set the active taskbar item
            const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
            if (taskbarItem) {
                taskbarItem.classList.add('active');
            }
        }
    }
    
    closeWindow(windowId) {
        // Find the window in the array
        const windowIndex = this.systemState.windows.findIndex(win => win.id === windowId);
        
        if (windowIndex !== -1) {
            // Remove the window element
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                windowElement.remove();
            }
            
            // Remove from windows array
            this.systemState.windows.splice(windowIndex, 1);
            
            // Remove from taskbar
            const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
            if (taskbarItem) {
                taskbarItem.remove();
            }
            
            // Set a new active window if there are any left
            if (this.systemState.windows.length > 0) {
                this.setActiveWindow(this.systemState.windows[this.systemState.windows.length - 1].id);
            } else {
                this.systemState.activeWindow = null;
            }
        }
    }
    
    addTaskbarItem(windowId, title) {
        const taskbarItems = document.querySelector('.taskbar-items');
        
        const taskbarItem = document.createElement('div');
        taskbarItem.className = 'taskbar-item';
        taskbarItem.setAttribute('data-window', windowId);
        taskbarItem.textContent = title;
        
        taskbarItems.appendChild(taskbarItem);
        
        // Add click event
        taskbarItem.addEventListener('click', () => {
            const windowElement = document.getElementById(windowId);
            
            if (windowElement) {
                if (this.systemState.activeWindow === windowId) {
                    // Minimize/restore window
                    if (windowElement.style.display === 'none') {
                        windowElement.style.display = 'flex';
                        this.setActiveWindow(windowId);
                    } else {
                        windowElement.style.display = 'none';
                        taskbarItem.classList.remove('active');
                        this.systemState.activeWindow = null;
                    }
                } else {
                    // Make this the active window
                    windowElement.style.display = 'flex';
                    this.setActiveWindow(windowId);
                }
            }
        });
    }
    
    setupWindowControls(windowId) {
        const windowElement = document.getElementById(windowId);
        
        if (windowElement) {
            // Close button
            const closeButton = windowElement.querySelector('.window-control.close');
            closeButton.addEventListener('click', () => {
                this.closeWindow(windowId);
            });
            
            // Minimize button
            const minimizeButton = windowElement.querySelector('.window-control.minimize');
            minimizeButton.addEventListener('click', () => {
                windowElement.style.display = 'none';
                
                // Update taskbar
                const taskbarItem = document.querySelector(`.taskbar-item[data-window="${windowId}"]`);
                if (taskbarItem) {
                    taskbarItem.classList.remove('active');
                }
                
                // Set a new active window if there are any visible
                const visibleWindows = this.systemState.windows.filter(win => 
                    document.getElementById(win.id).style.display !== 'none'
                );
                
                if (visibleWindows.length > 0) {
                    this.setActiveWindow(visibleWindows[visibleWindows.length - 1].id);
                } else {
                    this.systemState.activeWindow = null;
                }
            });
            
            // Maximize button (not fully implemented)
            const maximizeButton = windowElement.querySelector('.window-control.maximize');
            maximizeButton.addEventListener('click', () => {
                // Toggle maximize state
                if (windowElement.classList.contains('maximized')) {
                    windowElement.classList.remove('maximized');
                    windowElement.style.width = windowElement.getAttribute('data-prev-width') || '400px';
                    windowElement.style.height = windowElement.getAttribute('data-prev-height') || '300px';
                    windowElement.style.left = windowElement.getAttribute('data-prev-left') || '50px';
                    windowElement.style.top = windowElement.getAttribute('data-prev-top') || '50px';
                } else {
                    // Save current dimensions
                    windowElement.setAttribute('data-prev-width', windowElement.style.width);
                    windowElement.setAttribute('data-prev-height', windowElement.style.height);
                    windowElement.setAttribute('data-prev-left', windowElement.style.left);
                    windowElement.setAttribute('data-prev-top', windowElement.style.top);
                    
                    // Maximize
                    windowElement.classList.add('maximized');
                    windowElement.style.width = 'calc(100% - 4px)';
                    windowElement.style.height = 'calc(100% - 4px)';
                    windowElement.style.left = '0';
                    windowElement.style.top = '0';
                }
            });
            
            // Window title bar click (activate window)
            const titleBar = windowElement.querySelector('.window-title-bar');
            titleBar.addEventListener('mousedown', () => {
                this.setActiveWindow(windowId);
            });
        }
    }
    
    makeWindowDraggable(windowId) {
        const windowElement = document.getElementById(windowId);
        const titleBar = windowElement.querySelector('.window-title-bar');
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        titleBar.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            
            // Get the mouse cursor position at startup
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            
            // Calculate the new cursor position
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // Don't allow dragging if maximized
            if (!windowElement.classList.contains('maximized')) {
                // Set the element's new position
                windowElement.style.top = (windowElement.offsetTop - pos2) + 'px';
                windowElement.style.left = (windowElement.offsetLeft - pos1) + 'px';
            }
        }
        
        function closeDragElement() {
            // Stop moving when mouse button is released
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    
    cycleWindows() {
        const visibleWindows = this.systemState.windows.filter(w => 
            document.getElementById(w.id).style.display !== 'none'
        );
        
        if (visibleWindows.length <= 1) return;
        
        const currentIndex = visibleWindows.findIndex(w => w.id === this.systemState.activeWindow);
        const nextIndex = (currentIndex + 1) % visibleWindows.length;
        
        this.setActiveWindow(visibleWindows[nextIndex].id);
    }
    
    showNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'system-notification';
        notification.innerHTML = `
            <div class="notification-icon"></div>
            <div class="notification-message">${message}</div>
        `;
        
        // Add to desktop
        document.querySelector('.desktop-content').appendChild(notification);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.add('notification-hide');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, duration);
    }
    
    showErrorDialog(message) {
        const errorContent = `
            <div class="error-dialog">
                <div class="error-icon"></div>
                <div class="error-message">${message}</div>
                <button class="error-button">OK</button>
            </div>
        `;
        
        const dialogElement = document.createElement('div');
        dialogElement.className = 'dialog-overlay';
        dialogElement.innerHTML = errorContent;
        
        // Add to desktop
        document.querySelector('.desktop-content').appendChild(dialogElement);
        
        // Add click event to OK button
        const okButton = dialogElement.querySelector('.error-button');
        okButton.addEventListener('click', () => {
            dialogElement.remove();
        });
    }
    
    showShutdownDialog() {
        const shutdownContent = `
            <div class="shutdown-dialog">
                <div class="shutdown-message">Are you sure you want to shut down the computer?</div>
                <div class="shutdown-buttons">
                    <button class="shutdown-button" id="shutdown-yes">Yes</button>
                    <button class="shutdown-button" id="shutdown-no">No</button>
                </div>
            </div>
        `;
        
        const windowId = this.createWindow('Shut Down', shutdownContent, 300, 150, 'center', 'center');
        
        // Add click events to buttons
        const windowElement = document.getElementById(windowId);
        const yesButton = windowElement.querySelector('#shutdown-yes');
        const noButton = windowElement.querySelector('#shutdown-no');
        
        yesButton.addEventListener('click', () => {
            this.shutdownSystem();
        });
        
        noButton.addEventListener('click', () => {
            this.closeWindow(windowId);
        });
    }
    
    shutdownSystem() {
        // Set shutdown flag
        this.systemState.shutdownInProgress = true;
        
        // Close all windows
        [...this.systemState.windows].forEach(win => {
            this.closeWindow(win.id);
        });
        
        // Show shutdown screen
        const desktop = document.querySelector('.desktop');
        const bootScreen = document.querySelector('.boot-screen');
        const bootMessage = document.querySelector('.boot-message');
        
        bootMessage.textContent = 'Shutting down...';
        desktop.style.display = 'none';
        bootScreen.style.display = 'flex';
        
        // Simulate shutdown
        setTimeout(() => {
            bootMessage.textContent = 'It is now safe to turn off your computer.';
        }, 2000);
    }
    
    // Program-specific methods
    openMyComputer() {
        const content = `
            <div class="file-explorer">
                <div class="file-explorer-header">
                    <div class="file-explorer-path">My Computer</div>
                </div>
                <div class="file-explorer-content">
                    <div class="file-explorer-item">
                        <div class="icon drive"></div>
                        <div class="file-label">C: Drive</div>
                    </div>
                    <div class="file-explorer-item">
                        <div class="icon floppy"></div>
                        <div class="file-label">A: Drive</div>
                    </div>
                </div>
            </div>
        `;
        
        const windowId = this.createWindow('My Computer', content, 400, 300);
        
        // Add event listeners to items
        setTimeout(() => {
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                const driveItems = windowElement.querySelectorAll('.file-explorer-item');
                driveItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const driveName = item.querySelector('.file-label').textContent;
                        if (driveName === 'C: Drive') {
                            this.openCDrive();
                        } else if (driveName === 'A: Drive') {
                            this.showErrorDialog('Disk not formatted');
                        }
                    });
                });
            }
        }, 100);
    }
    
    openCDrive() {
        const content = `
            <div class="file-explorer">
                <div class="file-explorer-header">
                    <div class="file-explorer-path">C: Drive</div>
                </div>
                <div class="file-explorer-content">
                    <div class="file-explorer-item">
                        <div class="icon folder"></div>
                        <div class="file-label">SYSTEM</div>
                    </div>
                    <div class="file-explorer-item">
                        <div class="icon folder"></div>
                        <div class="file-label">PROGRAMS</div>
                    </div>
                    <div class="file-explorer-item">
                        <div class="icon folder"></div>
                        <div class="file-label">DOCUMENTS</div>
                    </div>
                </div>
            </div>
        `;
        
        const windowId = this.createWindow('C: Drive', content, 400, 300);
        
        // Add event listeners to folders
        setTimeout(() => {
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                const folderItems = windowElement.querySelectorAll('.file-explorer-item');
                folderItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const folderName = item.querySelector('.file-label').textContent;
                        this.openFolder(`C:/${folderName}`);
                    });
                });
            }
        }, 100);
    }
    
    openFolder(path) {
        let content = '';
        let title = path.split('/').pop();
        
        if (path === 'C:/SYSTEM') {
            content = `
                <div class="file-explorer">
                    <div class="file-explorer-header">
                        <div class="file-explorer-path">${path}</div>
                    </div>
                    <div class="file-explorer-content">
                        <div class="file-explorer-item">
                            <div class="icon document-system"></div>
                            <div class="file-label">SYSTEM.INI</div>
                        </div>
                    </div>
                </div>
            `;
        } else if (path === 'C:/PROGRAMS') {
            content = `
                <div class="file-explorer">
                    <div class="file-explorer-header">
                        <div class="file-explorer-path">${path}</div>
                    </div>
                    <div class="file-explorer-content">
                        <div class="file-explorer-empty">No files found.</div>
                    </div>
                </div>
            `;
        } else if (path === 'C:/DOCUMENTS') {
            content = `
                <div class="file-explorer">
                    <div class="file-explorer-header">
                        <div class="file-explorer-path">${path}</div>
                    </div>
                    <div class="file-explorer-content">
                        <div class="file-explorer-item">
                            <div class="icon document-yellow"></div>
                            <div class="file-label">README.TXT</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="file-explorer">
                    <div class="file-explorer-header">
                        <div class="file-explorer-path">${path}</div>
                    </div>
                    <div class="file-explorer-content">
                        <div class="file-explorer-empty">No files found.</div>
                    </div>
                </div>
            `;
        }
        
        const windowId = this.createWindow(title, content, 400, 300);
        
        // Add event listeners to files
        setTimeout(() => {
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                const fileItems = windowElement.querySelectorAll('.file-explorer-item');
                fileItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const fileName = item.querySelector('.file-label').textContent;
                        if (fileName === 'SYSTEM.INI') {
                            this.openNotepad('SYSTEM.INI');
                        } else if (fileName === 'README.TXT') {
                            this.openNotepad('README.TXT');
                        }
                    });
                });
            }
        }, 100);
    }
    
    openNotepad(filename = null) {
        let content = '';
        let fileContent = '';
        
        if (filename && this.fileSystem.files[filename]) {
            fileContent = this.fileSystem.files[filename].content;
        }
        
        content = `
            <div class="notepad-menu">
                <div class="menu-item">File</div>
                <div class="menu-item">Edit</div>
                <div class="menu-item">Help</div>
            </div>
            <textarea class="notepad-textarea">${fileContent}</textarea>
        `;
        
        const windowId = this.createWindow(filename ? `Notepad - ${filename}` : 'Untitled - Notepad', content, 400, 300);
        
        // Add event listener to save content when window is closed
        const windowElement = document.getElementById(windowId);
        const textarea = windowElement.querySelector('.notepad-textarea');
        
        // If this is a system file, make it readonly
        if (filename && this.fileSystem.files[filename] && this.fileSystem.files[filename].attributes.readonly) {
            textarea.setAttribute('readonly', 'readonly');
        }
        
        // Save content when window is closed
        const closeButton = windowElement.querySelector('.window-control.close');
        closeButton.addEventListener('click', () => {
            if (filename && this.fileSystem.files[filename] && !this.fileSystem.files[filename].attributes.readonly) {
                this.fileSystem.files[filename].content = textarea.value;
                this.fileSystem.files[filename].modified = new Date();
            }
        });
    }
    
    openCalculator() {
        const content = `
            <div class="calculator">
                <div class="calculator-display">0</div>
                <div class="calculator-buttons">
                    <div class="calculator-row">
                        <button class="calculator-button">7</button>
                        <button class="calculator-button">8</button>
                        <button class="calculator-button">9</button>
                        <button class="calculator-button operator">/</button>
                    </div>
                    <div class="calculator-row">
                        <button class="calculator-button">4</button>
                        <button class="calculator-button">5</button>
                        <button class="calculator-button">6</button>
                        <button class="calculator-button operator">*</button>
                    </div>
                    <div class="calculator-row">
                        <button class="calculator-button">1</button>
                        <button class="calculator-button">2</button>
                        <button class="calculator-button">3</button>
                        <button class="calculator-button operator">-</button>
                    </div>
                    <div class="calculator-row">
                        <button class="calculator-button">0</button>
                        <button class="calculator-button">.</button>
                        <button class="calculator-button equals">=</button>
                        <button class="calculator-button operator">+</button>
                    </div>
                    <div class="calculator-row">
                        <button class="calculator-button clear">C</button>
                    </div>
                </div>
            </div>
        `;
        
        const windowId = this.createWindow('Calculator', content, 250, 300);
        
        // Setup calculator functionality
        const windowElement = document.getElementById(windowId);
        const display = windowElement.querySelector('.calculator-display');
        const buttons = windowElement.querySelectorAll('.calculator-button');
        
        let currentValue = '0';
        let storedValue = null;
        let operator = null;
        let waitingForOperand = false;
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const value = button.textContent;
                
                // Check for special case: 1999
                if (currentValue === '1999' && value === '=') {
                    // Trigger the secret
                    if (window.mrHeadroom99) {
                        window.mrHeadroom99.secretDiscovered('calculator1999');
                    }
                }
                
                if (value === 'C') {
                    // Clear
                    currentValue = '0';
                    storedValue = null;
                    operator = null;
                    waitingForOperand = false;
                } else if (value === '=') {
                    // Calculate result
                    if (operator && storedValue !== null) {
                        switch (operator) {
                            case '+':
                                currentValue = String(parseFloat(storedValue) + parseFloat(currentValue));
                                break;
                            case '-':
                                currentValue = String(parseFloat(storedValue) - parseFloat(currentValue));
                                break;
                            case '*':
                                currentValue = String(parseFloat(storedValue) * parseFloat(currentValue));
                                break;
                            case '/':
                                currentValue = String(parseFloat(storedValue) / parseFloat(currentValue));
                                break;
                        }
                        
                        storedValue = null;
                        operator = null;
                        waitingForOperand = true;
                    }
                } else if (['+', '-', '*', '/'].includes(value)) {
                    // Operator
                    if (storedValue === null) {
                        storedValue = currentValue;
                    } else if (operator) {
                        // Chain operations
                        switch (operator) {
                            case '+':
                                storedValue = String(parseFloat(storedValue) + parseFloat(currentValue));
                                break;
                            case '-':
                                storedValue = String(parseFloat(storedValue) - parseFloat(currentValue));
                                break;
                            case '*':
                                storedValue = String(parseFloat(storedValue) * parseFloat(currentValue));
                                break;
                            case '/':
                                storedValue = String(parseFloat(storedValue) / parseFloat(currentValue));
                                break;
                        }
                        currentValue = storedValue;
                    }
                    
                    operator = value;
                    waitingForOperand = true;
                } else if (value === '.') {
                    // Decimal point
                    if (waitingForOperand) {
                        currentValue = '0.';
                        waitingForOperand = false;
                    } else if (!currentValue.includes('.')) {
                        currentValue += '.';
                    }
                } else {
                    // Number
                    if (currentValue === '0' || waitingForOperand) {
                        currentValue = value;
                        waitingForOperand = false;
                    } else {
                        currentValue += value;
                    }
                }
                
                // Update display
                display.textContent = currentValue;
            });
        });
    }
    
    openTerminal() {
        const content = `
            <div class="terminal-container">
                <div class="terminal-output">
                    <div class="terminal-line">MrHeadroom99 Terminal</div>
                    <div class="terminal-line">Type 'help' for a list of commands.</div>
                    <div class="terminal-line">></div>
                </div>
                <div class="terminal-input-container">
                    <span class="terminal-prompt"></span>
                    <input type="text" class="terminal-input" autofocus>
                </div>
            </div>
        `;
        
        const windowId = this.createWindow('Terminal', content, 500, 300);
        
        // Setup terminal functionality
        const windowElement = document.getElementById(windowId);
        const terminalOutput = windowElement.querySelector('.terminal-output');
        const terminalInput = windowElement.querySelector('.terminal-input');
        
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';
                
                // Add command to output
                const commandLine = document.createElement('div');
                commandLine.className = 'terminal-line';
                commandLine.textContent = `> ${command}`;
                terminalOutput.appendChild(commandLine);
                
                // Process command
                this.processTerminalCommand(command, terminalOutput);
                
                // Add new prompt
                const promptLine = document.createElement('div');
                promptLine.className = 'terminal-line';
                promptLine.textContent = '>';
                terminalOutput.appendChild(promptLine);
                
                // Scroll to bottom
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
            }
        });
    }
    
    processTerminalCommand(command, outputElement) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        const addOutput = (text) => {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.textContent = text;
            outputElement.appendChild(line);
        };
        
        switch (cmd) {
            case 'help':
                addOutput('Available commands:');
                addOutput('  help - Show this help');
                addOutput('  dir - List files');
                addOutput('  type [filename] - Show file contents');
                addOutput('  secret [password] - Access secret area');
                addOutput('  cls - Clear screen');
                break;
                
            case 'dir':
                addOutput('Directory listing:');
                for (const filename in this.fileSystem.files) {
                    if (!this.fileSystem.files[filename].attributes.hidden) {
                        const file = this.fileSystem.files[filename];
                        const date = file.modified.toLocaleDateString();
                        addOutput(`  ${filename}  ${date}  ${file.content.length} bytes`);
                    }
                }
                break;
                
            case 'type':
                if (args.length === 0) {
                    addOutput('Error: Missing filename');
                } else {
                    const filename = args[0];
                    if (this.fileSystem.files[filename]) {
                        const content = this.fileSystem.files[filename].content;
                        const lines = content.split('\n');
                        lines.forEach(line => addOutput(line));
                    } else {
                        addOutput(`Error: File '${filename}' not found`);
                    }
                }
                break;
                
            case 'secret':
                if (args.length === 0) {
                    addOutput('Error: Missing password');
                } else {
                    const password = args[0];
                    if (password === 'headroom99') {
                        addOutput('Access granted!');
                        addOutput('Unlocking secret terminal...');
                        
                        // Trigger secret discovery
                        if (window.mrHeadroom99) {
                            window.mrHeadroom99.secretDiscovered('terminalPassword');
                        }
                    } else {
                        addOutput('Error: Invalid password');
                    }
                }
                break;
                
            case 'cls':
                // Clear terminal output except for the first two lines
                while (outputElement.childNodes.length > 2) {
                    outputElement.removeChild(outputElement.lastChild);
                }
                break;
                
            default:
                addOutput(`Error: Unknown command '${cmd}'`);
                break;
        }
    }
    
    openInternet() {
        const content = `
            <div class="browser">
                <div class="browser-toolbar">
                    <button class="browser-button back">Back</button>
                    <button class="browser-button forward">Forward</button>
                    <button class="browser-button refresh">Refresh</button>
                    <div class="browser-address-bar">
                        <input type="text" class="browser-address" value="about:blank">
                    </div>
                    <button class="browser-button go">Go</button>
                </div>
                <div class="browser-content">
                    <div class="browser-page">
                        <h1>Welcome to the Internet</h1>
                        <p>Enter a URL in the address bar to navigate.</p>
                        <p>Try visiting: <a href="#" class="browser-link" data-url="www.mrheadroom.com">www.mrheadroom.com</a></p>
                    </div>
                </div>
            </div>
        `;
        
        const windowId = this.createWindow('Internet Browser', content, 600, 400);
        
        // Setup browser functionality
        const windowElement = document.getElementById(windowId);
        const addressBar = windowElement.querySelector('.browser-address');
        const browserContent = windowElement.querySelector('.browser-content');
        const goButton = windowElement.querySelector('.browser-button.go');
        
        // History
        const history = ['about:blank'];
        let currentHistoryIndex = 0;
        
        // Navigation buttons
        const backButton = windowElement.querySelector('.browser-button.back');
        const forwardButton = windowElement.querySelector('.browser-button.forward');
        const refreshButton = windowElement.querySelector('.browser-button.refresh');
        
        // Update navigation buttons
        const updateNavButtons = () => {
            backButton.disabled = currentHistoryIndex === 0;
            forwardButton.disabled = currentHistoryIndex === history.length - 1;
        };
        
        updateNavButtons();
        
        // Handle navigation
        const navigateTo = (url) => {
            // Add to history if it's a new navigation (not back/forward)
            if (currentHistoryIndex === history.length - 1) {
                history.push(url);
                currentHistoryIndex++;
            } else {
                // Replace forward history
                history.splice(currentHistoryIndex + 1);
                history.push(url);
                currentHistoryIndex = history.length - 1;
            }
            
            updateNavButtons();
            addressBar.value = url;
            loadPage(url);
        };
        
        // Load page content
        const loadPage = (url) => {
            let pageContent = '';
            
            // Handle different URLs
            if (url === 'about:blank') {
                pageContent = `
                    <h1>Welcome to the Internet</h1>
                    <p>Enter a URL in the address bar to navigate.</p>
                    <p>Try visiting: <a href="#" class="browser-link" data-url="www.mrheadroom.com">www.mrheadroom.com</a></p>
                `;
            } else if (url === 'www.mrheadroom.com') {
                pageContent = `
                    <h1>MrHeadroom99</h1>
                    <p>Welcome to the official website of MrHeadroom99!</p>
                    <p>This website is under construction.</p>
                    <p>Check back later for more content.</p>
                    <p><!-- Secret page: www.mrheadroom.com/secret --></p>
                `;
            } else if (url === 'www.mrheadroom.com/secret') {
                pageContent = `
                    <h1>Secret Page</h1>
                    <p>Congratulations on finding the secret page!</p>
                    <p>The next clue is: Use the calculator to find the significant year.</p>
                `;
                
                // Trigger secret discovery
                if (window.mrHeadroom99) {
                    window.mrHeadroom99.secretDiscovered('secretWebpage');
                }
            } else {
                pageContent = `
                    <h1>404 Not Found</h1>
                    <p>The page you requested could not be found.</p>
                `;
            }
            
            // Update browser content
            browserContent.innerHTML = `<div class="browser-page">${pageContent}</div>`;
            
            // Add event listeners to links
            const links = browserContent.querySelectorAll('.browser-link');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = link.getAttribute('data-url');
                    navigateTo(url);
                });
            });
        };
        
        // Go button
        goButton.addEventListener('click', () => {
            navigateTo(addressBar.value);
        });
        
        // Address bar enter key
        addressBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                navigateTo(addressBar.value);
            }
        });
        
        // Back button
        backButton.addEventListener('click', () => {
            if (currentHistoryIndex > 0) {
                currentHistoryIndex--;
                addressBar.value = history[currentHistoryIndex];
                loadPage(history[currentHistoryIndex]);
                updateNavButtons();
            }
        });
        
        // Forward button
        forwardButton.addEventListener('click', () => {
            if (currentHistoryIndex < history.length - 1) {
                currentHistoryIndex++;
                addressBar.value = history[currentHistoryIndex];
                loadPage(history[currentHistoryIndex]);
                updateNavButtons();
            }
        });
        
        // Refresh button
        refreshButton.addEventListener('click', () => {
            loadPage(addressBar.value);
        });
        
        // Initial page load
        loadPage('about:blank');
    }
}

// Game-specific functionality
class MrHeadroom99Game {
    constructor(os) {
        this.os = os;
        this.gameState = {
            puzzlesSolved: 0,
            totalPuzzles: 5,
            currentStage: 'intro',
            inventory: [],
            flags: {},
            discoveredSecrets: [],
            progress: 0
        };
        this.puzzles = {
            'findReadme': {
                solved: false,
                hint: 'Look for a text file on the desktop',
                solution: 'openReadme',
                reward: 'First clue discovered'
            },
            'decodeSecret': {
                solved: false,
                hint: 'Find the hidden file with encoded data',
                solution: 'decodeBase64',
                reward: 'Password discovered'
            },
            'terminalPassword': {
                solved: false,
                hint: 'Use the terminal with the correct password',
                solution: 'enterPassword',
                reward: 'Terminal access granted'
            },
            'findWebPage': {
                solved: false,
                hint: 'Find the secret webpage',
                solution: 'visitSecretPage',
                reward: 'Web clue discovered'
            },
            'calculator1999': {
                solved: false,
                hint: 'Calculate the significant year',
                solution: 'calculate1999',
                reward: 'Final secret unlocked'
            }
        };
        this.init();
    }

    init() {
        // Initialize game-specific elements
        this.setupSecrets();
        this.setupPuzzles();
        this.setupEventListeners();
    }

    setupSecrets() {
        // Hidden files and secrets to discover
        this.os.fileSystem.files['HIDDEN.TXT'] = {
            content: 'You found the first secret. Look for the password in the system files.',
            type: 'text',
            created: new Date(),
            modified: new Date(),
            attributes: { readonly: false, hidden: true, system: false }
        };
        
        // Add more hidden files and secrets
        this.os.fileSystem.files['CLUE.TXT'] = {
            content: 'The secret lies in the terminal. Try the command "secret" with the right password.',
            type: 'text',
            created: new Date(),
            modified: new Date(),
            attributes: { readonly: false, hidden: true, system: false }
        };
    }

    setupPuzzles() {
        // Setup puzzle triggers and event listeners
        document.addEventListener('click', (e) => {
            // Check if README.TXT was opened
            if (e.target.closest('.icon-container') && 
                e.target.closest('.icon-container').querySelector('.icon-label').textContent === 'README.TXT') {
                this.markPuzzleProgress('findReadme');
            }
        });
    }
    
    setupEventListeners() {
        // Listen for specific events that might trigger puzzle progress
        document.addEventListener('keydown', (e) => {
            // Secret key combination: Ctrl+Alt+H
            if (e.ctrlKey && e.altKey && e.key === 'h') {
                this.triggerEasterEgg('keyCombo');
            }
        });
    }

    markPuzzleProgress(puzzleId) {
        if (this.puzzles[puzzleId] && !this.puzzles[puzzleId].solved) {
            this.puzzles[puzzleId].solved = true;
            this.gameState.puzzlesSolved++;
            this.gameState.progress = (this.gameState.puzzlesSolved / this.gameState.totalPuzzles) * 100;
            
            // Show notification
            this.os.showNotification(`Puzzle solved: ${this.puzzles[puzzleId].reward}`);
            
            // Check for game progression
            this.checkGameProgression();
        }
    }

    checkGameProgression() {
        // Update game stage based on puzzles solved
        if (this.puzzles['findReadme'].solved && this.gameState.currentStage === 'intro') {
            this.progressStory('foundFirstClue');
        } else if (this.puzzles['decodeSecret'].solved && this.gameState.currentStage === 'foundFirstClue') {
            this.progressStory('foundPassword');
        }
        
        // Check if all puzzles are solved
        if (this.gameState.puzzlesSolved === this.gameState.totalPuzzles) {
            this.progressStory('finalStage');
        }
    }

    secretDiscovered(secretId) {
        // Track discovered secrets
        if (!this.gameState.discoveredSecrets.includes(secretId)) {
            this.gameState.discoveredSecrets.push(secretId);
            
            // Handle specific secrets
            switch (secretId) {
                case 'terminalPassword':
                    this.markPuzzleProgress('terminalPassword');
                    this.progressStory('terminalAccess');
                    break;
                    
                case 'secretWebpage':
                    this.markPuzzleProgress('findWebPage');
                    break;
                    
                case 'calculator1999':
                    this.markPuzzleProgress('calculator1999');
                    this.progressStory('finalStage');
                    break;
            }
        }
    }
    
    triggerEasterEgg(eggId) {
        console.log(`Easter egg triggered: ${eggId}`);
        
        switch (eggId) {
            case 'keyCombo':
                // Show a hidden message
                this.os.showNotification('You found a secret key combination!');
                
                // Add a hidden file to the desktop
                setTimeout(() => {
                    this.addSecretFileToDesktop('EASTER_EGG.TXT', 'Congratulations on finding this easter egg! Try looking for more secrets in the system.');
                }, 2000);
                break;
        }
    }
    
    progressStory(newStage) {
        this.gameState.currentStage = newStage;
        
        // Trigger events based on story progression
        switch (newStage) {
            case 'foundFirstClue':
                // Add a new email to inbox
                setTimeout(() => {
                    this.os.systemState.notifications.push('You have a new email');
                }, 30000); // 30 seconds delay
                break;
                
            case 'foundPassword':
                // Make a file appear on the desktop
                this.addSecretFileToDesktop();
                break;
                
            case 'terminalAccess':
                // Unlock a new area
                this.unlockSecretArea();
                break;
                
            case 'finalStage':
                // Show final message
                this.showFinalMessage();
                break;
        }
    }
    
    addSecretFileToDesktop(filename = 'SECRET.TXT', content = 'This file appeared mysteriously. What could it mean?') {
        // Add file to file system
        this.os.fileSystem.files[filename] = {
            content: content,
            type: 'text',
            created: new Date(),
            modified: new Date(),
            attributes: { readonly: false, hidden: false, system: false }
        };
        
        // Create icon on desktop
        const desktopIcons = document.querySelector('.desktop-icons');
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        iconContainer.innerHTML = `
            <div class="icon document-yellow"></div>
            <div class="icon-label">${filename}</div>
        `;
        
        desktopIcons.appendChild(iconContainer);
        
        // Add click event
        iconContainer.addEventListener('click', () => {
            this.os.openNotepad(filename);
        });
        
        // Show notification
        this.os.showNotification(`A new file has appeared: ${filename}`);
    }
    
    unlockSecretArea() {
        // Add a new program to the system
        this.os.programs['Secret Terminal'] = {
            icon: 'terminal',
            launch: () => this.openSecretTerminal(),
            type: 'hidden'
        };
        
        // Add icon to desktop
        const desktopIcons = document.querySelector('.desktop-icons');
        const iconContainer = document.createElement('div');
        iconContainer.className = 'icon-container';
        iconContainer.innerHTML = `
            <div class="icon terminal secret"></div>
            <div class="icon-label">Secret Terminal</div>
        `;
        
        desktopIcons.appendChild(iconContainer);
        
        // Add click event
        iconContainer.addEventListener('click', () => {
            this.os.launchProgram('Secret Terminal');
        });
        
        // Show notification
        this.os.showNotification('A new program has been unlocked!');
    }
    
    openSecretTerminal() {
        const terminalContent = `
            <div class="terminal-container secret-terminal">
                <div class="terminal-output">
                    <div class="terminal-line">MrHeadroom99 Secret Terminal</div>
                    <div class="terminal-line">Access Granted</div>
                    <div class="terminal-line"></div>
                    <div class="terminal-line">Congratulations on finding the secret terminal!</div>
                    <div class="terminal-line">You're getting closer to the final secret.</div>
                    <div class="terminal-line"></div>
                    <div class="terminal-line">Try using the calculator to find the significant year.</div>
                    <div class="terminal-line">></div>
                </div>
                <div class="terminal-input-container">
                    <span class="terminal-prompt"></span>
                    <input type="text" class="terminal-input" autofocus>
                </div>
            </div>
        `;
        
        this.os.createWindow('Secret Terminal', terminalContent, 500, 300);
    }
    
    showFinalMessage() {
        const finalContent = `
            <div class="final-message">
                <h2>Congratulations!</h2>
                <p>You have solved all the puzzles and uncovered the secrets of MrHeadroom99 OS.</p>
                <p>This is just a demo of what's possible with this ARG framework.</p>
                <p>You can extend it with more puzzles, secrets, and interactive elements.</p>
                <p>Thank you for playing!</p>
            </div>
        `;
        
        this.os.createWindow('Game Complete', finalContent, 400, 300, 'center', 'center');
    }
}

// Initialize the OS and game when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const os = new OS95();
    window.mrHeadroom99 = new MrHeadroom99Game(os);
});