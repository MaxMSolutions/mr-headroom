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

    // Placeholder for actual icon actions
    const myComputer = document.getElementById('my-computer-icon');
    const recycleBin = document.getElementById('recycle-bin-icon');
    const mysteriousFolder = document.getElementById('mysterious-folder-icon');

    myComputer.addEventListener('dblclick', () => alert('My Computer: Contains all your drives and hardware. (Not really, this is a demo!)'));
    recycleBin.addEventListener('dblclick', () => alert('Recycle Bin: Stores deleted files. (Currently empty, or is it...?)'));
    mysteriousFolder.addEventListener('dblclick', () => {
        alert('Top Secret: Access Denied. Further attempts will be logged.');
        // This is a good place to start adding ARG elements!
        // Maybe change the icon, or open a fake error message, or a cryptic text file.
    });

});
