document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('word-cloud-container');
    const jsonInput = document.getElementById('json-input');
    const updateBtn = document.getElementById('update-btn');
    const jsonStatus = document.getElementById('json-status');
    const formatBtn = document.getElementById('format-btn');
    const editorContainer = document.getElementById('codemirror-editor');
    
    // Initialize CodeMirror editor
    const editor = CodeMirror(editorContainer, {
        value: jsonInput.value,
        mode: "application/json",
        theme: "dracula",
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        gutters: ["CodeMirror-lint-markers"],
        lint: true,
        viewportMargin: Infinity,
        indentUnit: 2,
        tabSize: 2,
        smartIndent: true,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-Enter": function() { updateVisualization(); }
        }
    });
    
    // Set editor height
    editor.setSize(null, 150);
    
    // Add event listener for editor changes
    editor.on("change", function() {
        validateJSON();
        // Update the hidden textarea value for any code that might reference it
        jsonInput.value = editor.getValue();
    });
    
    // Format JSON button
    formatBtn.addEventListener('click', function() {
        formatJSON();
    });
    
    // Function to validate JSON
    function validateJSON() {
        try {
            const jsonText = editor.getValue();
            if (!jsonText.trim()) {
                updateJsonStatus("empty", "Please enter JSON data");
                return false;
            }
            
            const parsed = JSON.parse(jsonText);
            
            // Check if it's an object with key-value pairs
            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                updateJsonStatus("invalid", "JSON must be an object with key-value pairs");
                return false;
            }
            
            // Check if values are numbers
            let allValuesAreNumbers = true;
            for (const key in parsed) {
                if (typeof parsed[key] !== 'number') {
                    allValuesAreNumbers = false;
                    break;
                }
            }
            
            if (!allValuesAreNumbers) {
                updateJsonStatus("warning", "All values should be numbers");
                return false;
            }
            
            updateJsonStatus("valid", "Valid JSON");
            return true;
        } catch (error) {
            updateJsonStatus("invalid", error.message);
            return false;
        }
    }
    
    // Update JSON status indicator
    function updateJsonStatus(status, message) {
        jsonStatus.textContent = message;
        jsonStatus.className = "text-sm font-medium";
        
        switch (status) {
            case "valid":
                jsonStatus.classList.add("text-green-600");
                break;
            case "invalid":
                jsonStatus.classList.add("text-red-600");
                break;
            case "warning":
                jsonStatus.classList.add("text-amber-500");
                break;
            case "empty":
                jsonStatus.classList.add("text-gray-500");
                break;
        }
    }
    
    // Format JSON nicely
    function formatJSON() {
        try {
            const jsonText = editor.getValue();
            const parsed = JSON.parse(jsonText);
            const formatted = JSON.stringify(parsed, null, 2);
            editor.setValue(formatted);
            validateJSON();
        } catch (error) {
            // If can't parse, don't format
            updateJsonStatus("invalid", "Cannot format invalid JSON");
        }
    }
    
    // Update visualization with current JSON
    function updateVisualization() {
        if (validateJSON()) {
            const jsonText = editor.getValue();
            const data = JSON.parse(jsonText);
            createWordCloud(data);
        }
    }
    
    // Track which circle is being dragged
    let draggedElement = null;
    let offsetX = 0;
    let offsetY = 0;
    
    // Store manually positioned circles
    let savedPositions = {};
    let circleColors = {};
    
    // Generate a random pastel color
    function getRandomPastelColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 80%)`;
    }

    // Calculate circle positions to allow more overlap
    function calculateCirclePositions(data) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const padding = 20;
        const minSize = 60;
        const maxSize = 180;
        
        // Find the highest value to scale accordingly
        const values = Object.values(data);
        const maxValue = Math.max(...values);
        
        const circles = [];
        
        Object.entries(data).forEach(([key, value]) => {
            // Calculate size based on value
            const sizeRatio = value / maxValue;
            const size = minSize + (maxSize - minSize) * sizeRatio;
            
            let posX, posY, color;
            
            // Check if we have saved position for this key
            if (savedPositions[key]) {
                // Use saved position
                posX = savedPositions[key].x;
                posY = savedPositions[key].y;
                // Use saved color if available
                color = circleColors[key] || getRandomPastelColor();
            } else {
                // Try to find a position with minimal overlaps
                let attempts = 0;
                let overlap = true;
                
                while (overlap && attempts < 100) {
                    posX = padding + size/2 + Math.random() * (containerWidth - size - padding * 2);
                    posY = padding + size/2 + Math.random() * (containerHeight - size - padding * 2);
                    
                    overlap = false;
                    
                    // Check overlap with existing circles
                    for (const circle of circles) {
                        const dx = posX - circle.x;
                        const dy = posY - circle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDistance = (size / 2) + (circle.size / 2) - 30; // Increased overlap allowance
                        
                        if (distance < minDistance) {
                            overlap = true;
                            break;
                        }
                    }
                    
                    attempts++;
                }
                
                // Generate a new color or use saved one
                color = circleColors[key] || getRandomPastelColor();
                // Save the color for future use
                circleColors[key] = color;
            }
            
            circles.push({
                word: key,
                value: value,
                size: size,
                x: posX,
                y: posY,
                color: color
            });
        });
        
        return circles;
    }

    // Create and position the circles
    function createWordCloud(data) {
        // Clear the container
        container.innerHTML = '';
        
        try {
            // Calculate positions
            const circles = calculateCirclePositions(data);
            
            // Create and add circles to DOM
            circles.forEach(circle => {
                const element = document.createElement('div');
                element.className = 'word-circle';
                element.setAttribute('data-word', circle.word);
                element.style.width = `${circle.size}px`;
                element.style.height = `${circle.size}px`;
                element.style.left = `${circle.x - circle.size/2}px`;
                element.style.top = `${circle.y - circle.size/2}px`;
                element.style.backgroundColor = circle.color;
                element.style.fontSize = `${Math.max(12, circle.size / 6)}px`;
                
                // Create a label with word and value
                element.innerHTML = `<div>${circle.word}<br>${circle.value}</div>`;
                
                // Add dragging functionality to each circle
                element.addEventListener('mousedown', function(e) {
                    // Prevent default browser drag behavior
                    e.preventDefault();
                    
                    // Calculate the offset of the mouse click relative to the circle
                    const rect = element.getBoundingClientRect();
                    offsetX = e.clientX - rect.left;
                    offsetY = e.clientY - rect.top;
                    
                    // Set the current element as the one being dragged
                    draggedElement = element;
                    
                    // Add the dragging class for visual feedback
                    element.classList.add('dragging');
                    
                    // Bring to front during drag
                    element.style.zIndex = '100';
                });
                
                // Add to container
                container.appendChild(element);
            });
        } catch (error) {
            console.error('Error creating word cloud:', error);
            container.innerHTML = '<p class="error">Error creating visualization. Please check your JSON format.</p>';
        }
    }

    // Handle mouse movement for dragging
    document.addEventListener('mousemove', function(e) {
        if (draggedElement) {
            // Calculate new position based on mouse coordinates and offset
            const containerRect = container.getBoundingClientRect();
            const x = e.clientX - containerRect.left - offsetX;
            const y = e.clientY - containerRect.top - offsetY;
            
            // Set new position
            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;
        }
    });
    
    // Handle mouse up to end dragging
    document.addEventListener('mouseup', function() {
        if (draggedElement) {
            // Save the position of this circle for future updates
            const word = draggedElement.getAttribute('data-word');
            const rect = draggedElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate and save the center position of the circle relative to the container
            savedPositions[word] = {
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top + rect.height / 2
            };
            
            // Remove the dragging class
            draggedElement.classList.remove('dragging');
            // Reset z-index to normal, but keep it slightly elevated
            draggedElement.style.zIndex = '10';
            // Reset the dragged element
            draggedElement = null;
        }
    });

    // Reset all saved positions
    function resetPositions() {
        savedPositions = {};
        circleColors = {};
        updateVisualization();
    }

    // Download the word cloud as a PNG with transparency
    function downloadWordCloud() {
        // Temporarily make the container background transparent
        container.classList.add('transparent-for-export');
        
        // Use html2canvas to capture the word cloud container
        html2canvas(container, {
            backgroundColor: null, // Transparent background
            scale: 2, // Higher resolution
            removeContainer: false, // Don't remove the container
            allowTaint: false,
            useCORS: true,
            logging: false,
            onclone: function(clonedDoc) {
                // Make sure the cloned element is also transparent
                clonedDoc.getElementById('word-cloud-container').style.backgroundColor = 'transparent';
                clonedDoc.getElementById('word-cloud-container').style.boxShadow = 'none';
            }
        }).then(canvas => {
            // Create a download link
            const link = document.createElement('a');
            link.download = 'word-cloud.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // Remove the transparent class after download
            setTimeout(() => {
                container.classList.remove('transparent-for-export');
            }, 100);
        }).catch(error => {
            console.error("Error generating image:", error);
            alert("There was a problem generating the image. Please try again.");
            container.classList.remove('transparent-for-export');
        });
    }

    // Initial validation
    validateJSON();
    
    // Initial creation
    updateVisualization();

    // Update on button click
    updateBtn.addEventListener('click', updateVisualization);

    // Handle window resize
    window.addEventListener('resize', updateVisualization);

    // Add download button functionality
    document.getElementById('download-btn').addEventListener('click', downloadWordCloud);
    
    // Add reset positions button
    document.getElementById('reset-btn').addEventListener('click', resetPositions);
});