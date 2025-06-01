# Task Instructions: Implement Boot Sequence

## Overview
Your task is to implement a boot sequence for the MrHeadroom99 operating system. This will be the first screen users see when they load the application, creating an authentic retro computer experience.

## Requirements
1. Create a boot animation that displays before the main desktop appears
2. Design a simple MrHeadroom99 OS logo
3. Add a loading progress bar
4. Implement the transition from boot screen to desktop

## Detailed Steps

### 1. Create Boot Screen HTML Structure
Add a new div with class `boot-screen` to the index.html file, positioned above the existing desktop content. This should initially be visible, while the desktop content is hidden.

```html
<div class="boot-screen">
    <div class="boot-logo">MrHeadroom99</div>
    <div class="boot-message">Starting up...</div>
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>
</div>
```

### 2. Add CSS Styling
Add styles for the boot screen in styles.css. Use the existing color scheme variables to maintain consistency.

```css
/* Boot Screen Styles */
.boot-screen {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--bg-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.boot-logo {
    font-size: 24px;
    color: var(--border-pink);
    font-weight: bold;
    margin-bottom: 20px;
    text-shadow: 0 0 10px var(--glow-pink);
    letter-spacing: 2px;
}

.boot-message {
    color: var(--border-blue);
    margin-bottom: 20px;
    text-shadow: 0 0 5px var(--glow-blue);
}

.progress-bar {
    width: 200px;
    height: 20px;
    border: 2px solid var(--border-pink);
    box-shadow: 0 0 8px var(--glow-pink);
    position: relative;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    width: 0%;
    background-color: var(--border-blue);
    box-shadow: 0 0 10px var(--glow-blue);
    transition: width 0.1s ease-in-out;
}
```

### 3. Implement JavaScript for Boot Sequence
Create the JavaScript code to animate the boot sequence. Add this to the beginning of script.js:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Boot sequence
    const bootScreen = document.querySelector('.boot-screen');
    const progressFill = document.querySelector('.progress-fill');
    const bootMessage = document.querySelector('.boot-message');
    const desktop = document.querySelector('.monitor-inner');
    
    // Initially hide the desktop
    desktop.style.opacity = '0';
    
    // Boot messages to display
    const bootMessages = [
        'Initializing system...',
        'Loading MrHeadroom99 OS...',
        'Checking system integrity...',
        'Starting up...',
        'Welcome to MrHeadroom99'
    ];
    
    let progress = 0;
    let messageIndex = 0;
    
    // Update progress bar and messages
    const bootInterval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = `${progress}%`;
        
        // Update boot message occasionally
        if (progress > messageIndex * 20 && messageIndex < bootMessages.length) {
            bootMessage.textContent = bootMessages[messageIndex];
            messageIndex++;
        }
        
        // When boot sequence completes
        if (progress === 100) {
            clearInterval(bootInterval);
            
            // Wait a moment at 100% before transitioning
            setTimeout(() => {
                // Fade out boot screen
                bootScreen.style.opacity = '0';
                bootScreen.style.transition = 'opacity 1s ease-in-out';
                
                // Fade in desktop
                desktop.style.opacity = '1';
                desktop.style.transition = 'opacity 1s ease-in-out';
                
                // Remove boot screen after transition
                setTimeout(() => {
                    bootScreen.style.display = 'none';
                }, 1000);
            }, 800);
        }
    }, 100);
});
```

### 4. Add Transition Styles
Ensure smooth transitions by adding these styles to the CSS:

```css
.monitor-inner {
    /* Keep existing styles */
    transition: opacity 1s ease-in-out;
}

.boot-screen {
    /* Keep existing styles */
    transition: opacity 1s ease-in-out;
}
```

## Testing
1. Open the index.html file in a browser
2. Verify that the boot screen appears first
3. Check that the progress bar fills up gradually
4. Confirm that boot messages change during the sequence
5. Ensure the transition to the desktop is smooth

## Completion Criteria
- Boot screen appears when the page loads
- Progress bar animates from 0% to 100%
- Boot messages change during the loading sequence
- Smooth transition from boot screen to desktop
- All animations work without errors

Complete only this task. Do not implement any other features from the backlog at this time.