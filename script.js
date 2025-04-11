document.addEventListener('DOMContentLoaded', function() {
    // Piano configuration
    const octaves = 2; // 2 octaves
    const startOctave = 3; // Base octave
    const startNote = 'C';  // Start from C3
    const endNote = 'G';    // End at G5
    const endOctave = 5;
    
    // Define notes in an octave
    const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const notesWithFlats = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    
    // Define which keys should use flats vs sharps (based on the circle of fifths)
    const useFlats = {
        'F': true,
        'B♭': true,
        'E♭': true,
        'A♭': true,
        'D♭': true,
        'G♭': true,
        'C♭': true
    };
    
    // Get DOM elements
    const pianoElement = document.querySelector('.piano');
    const rootNoteSelect = document.getElementById('root-note');
    const chordTypeSelect = document.getElementById('chord-type');
    const inversionSelect = document.getElementById('inversion');
    const chordNameElement = document.getElementById('chord-name');
    const chordNotesElement = document.getElementById('chord-notes');
    const chordFingeringElement = document.getElementById('chord-fingering');
    const showLabelsCheckbox = document.getElementById('show-labels');
    const playChordButton = document.getElementById('play-chord');
    const autoPlayCheckbox = document.getElementById('auto-play');
    
    // Initialize Web Audio API
    let audioContext;
    let currentOscillators = [];
    
    // Initialize audio context on first user interaction
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    // Create piano keyboard
    createPianoKeyboard();
    
    // Initial chord display
    updateChord();
    
    // Event listeners for controls
    rootNoteSelect.addEventListener('change', handleControlChange);
    chordTypeSelect.addEventListener('change', function() {
        // Update inversion options based on chord type
        updateInversionOptions();
        handleControlChange();
    });
    inversionSelect.addEventListener('change', handleControlChange);
    showLabelsCheckbox.addEventListener('change', toggleNoteLabels);
    playChordButton.addEventListener('click', function() {
        initAudioContext();
        playCurrentChord();
    });
    
    // Function to handle control changes
    function handleControlChange() {
        updateChord();
        if (autoPlayCheckbox.checked) {
            initAudioContext();
            playCurrentChord();
        }
    }
    
    // Function to toggle note labels visibility
    function toggleNoteLabels() {
        const labels = document.querySelectorAll('.note-label');
        const isVisible = showLabelsCheckbox.checked;
        
        labels.forEach(label => {
            label.style.display = isVisible ? 'block' : 'none';
        });
    }
    
    // No need for setTimeout since labels are hidden by CSS default
    // Apply label visibility immediately if checkbox is checked
    if (showLabelsCheckbox.checked) {
        toggleNoteLabels();
    }
    
    // Function to create a more piano-like sound
    function playPianoNote(frequency, time = 0, duration = 1, velocity = 0.7) {
        // Create audio nodes
        const oscillator1 = audioContext.createOscillator(); // Main tone
        const oscillator2 = audioContext.createOscillator(); // Harmonic 1
        const oscillator3 = audioContext.createOscillator(); // Harmonic 2
        
        const gainNode = audioContext.createGain(); // Main gain
        const gainNode1 = audioContext.createGain(); // Gain for main tone
        const gainNode2 = audioContext.createGain(); // Gain for harmonic 1
        const gainNode3 = audioContext.createGain(); // Gain for harmonic 2
        
        // Create filter for piano-like sound
        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;
        
        // Set oscillator types and frequencies
        oscillator1.type = 'triangle'; // More piano-like than sine
        oscillator1.frequency.value = frequency;
        
        oscillator2.type = 'sine';
        oscillator2.frequency.value = frequency * 2; // One octave up
        
        oscillator3.type = 'sine';
        oscillator3.frequency.value = frequency * 3; // Perfect fifth above octave
        
        // Set gains for harmonics
        gainNode1.gain.value = 0.6 * velocity;
        gainNode2.gain.value = 0.25 * velocity;
        gainNode3.gain.value = 0.15 * velocity;
        
        // Connect oscillators to their gain nodes
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        
        // Connect all gain nodes to the filter
        gainNode1.connect(filter);
        gainNode2.connect(filter);
        gainNode3.connect(filter);
        
        // Connect filter to main gain
        filter.connect(gainNode);
        
        // Connect main gain to output
        gainNode.connect(audioContext.destination);
        
        // Apply a piano-like envelope
        const now = audioContext.currentTime;
        
        // Attack
        gainNode.gain.setValueAtTime(0, now + time);
        gainNode.gain.linearRampToValueAtTime(velocity, now + time + 0.02);
        
        // Initial decay
        gainNode.gain.linearRampToValueAtTime(velocity * 0.8, now + time + 0.05);
        
        // Sustain and release
        gainNode.gain.linearRampToValueAtTime(velocity * 0.6, now + time + duration * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + time + duration);
        
        // Start and stop oscillators
        oscillator1.start(now + time);
        oscillator2.start(now + time);
        oscillator3.start(now + time);
        
        oscillator1.stop(now + time + duration);
        oscillator2.stop(now + time + duration);
        oscillator3.stop(now + time + duration);
        
        return {
            oscillators: [oscillator1, oscillator2, oscillator3],
            gainNodes: [gainNode, gainNode1, gainNode2, gainNode3],
            filter: filter
        };
    }
    
    // Function to convert a note name to frequency
    function noteToFrequency(noteName) {
        // A4 is 440Hz
        const A4 = 440;
        const A4NoteIndex = notes.indexOf('A') + (4 * 12);
        
        const noteOnly = noteName.replace(/\d+/, '');
        const octave = parseInt(noteName.match(/\d+/));
        const noteIndex = notes.indexOf(noteOnly) + (octave * 12);
        
        // Calculate semitone difference from A4
        const semitonesDiff = noteIndex - A4NoteIndex;
        
        // Calculate frequency using equal temperament formula
        // f = 440 * 2^(n/12) where n is semitone difference from A4
        return A4 * Math.pow(2, semitonesDiff / 12);
    }
    
    // Function to play the current chord
    function playCurrentChord() {
        // Stop any currently playing oscillators
        stopAllOscillators();
        
        // Get current chord notes
        const rootNote = rootNoteSelect.value + "4"; // Always use C4 as default octave
        const chordType = chordTypeSelect.value;
        const inversion = inversionSelect.value;
        const chordNotes = getChordNotes(rootNote, chordType, inversion);
        
        // Play each note in the chord with slight staggering for arpeggiation effect
        chordNotes.forEach((note, index) => {
            const frequency = noteToFrequency(note);
            const delay = index * 0.05; // Stagger each note by 50ms
            const noteDuration = 2 - delay; // Longer duration for better sustain
            const velocity = 0.7 - (index * 0.05); // Slight velocity reduction for lower notes
            
            const sound = playPianoNote(frequency, delay, noteDuration, velocity);
            currentOscillators.push(sound);
        });
    }
    
    // Function to stop all currently playing oscillators
    function stopAllOscillators() {
        const now = audioContext?.currentTime || 0;
        
        currentOscillators.forEach(sound => {
            if (sound.gainNodes && sound.gainNodes[0]) {
                sound.gainNodes[0].gain.cancelScheduledValues(now);
                sound.gainNodes[0].gain.linearRampToValueAtTime(0, now + 0.05);
            }
        });
        
        // Clear the oscillators array after a short delay
        setTimeout(() => {
            currentOscillators = [];
        }, 100);
    }
    
    // Function to create the piano keyboard
    function createPianoKeyboard() {
        // Create all white keys first
        // Process each octave
        for (let octave = startOctave; octave <= endOctave; octave++) {
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                
                // Skip notes before startNote in first octave
                if (octave === startOctave && i < notes.indexOf(startNote)) {
                    continue;
                }
                
                // Stop after endNote in last octave
                if (octave === endOctave && i > notes.indexOf(endNote)) {
                    break;
                }
                
                // Only create white keys
                if (!note.includes('♯')) {
                    const keyElement = document.createElement('div');
                    const noteWithOctave = note + octave;
                    
                    keyElement.dataset.note = noteWithOctave;
                    keyElement.classList.add('key', 'white-key');
                    
                    // Add note letter at the bottom of the key
                    const noteLabel = document.createElement('div');
                    noteLabel.classList.add('note-label');
                    noteLabel.textContent = noteWithOctave;
                    keyElement.appendChild(noteLabel);
                    
                    // Add click event to play the note
                    keyElement.addEventListener('click', function() {
                        initAudioContext();
                        const frequency = noteToFrequency(noteWithOctave);
                        playPianoNote(frequency, 0, 1);
                        
                        // Add temporary highlighting
                        this.classList.add('clicked');
                        
                        // Remove the clicked class after animation completes
                        setTimeout(() => {
                            this.classList.remove('clicked');
                        }, 300);
                    });
                    
                    pianoElement.appendChild(keyElement);
                }
            }
        }
        
        // Wait for white keys to be rendered before adding black keys
        setTimeout(() => {
            addBlackKeys();
        }, 0);
    }
    
    // Function to add black keys with accurate positioning
    function addBlackKeys() {
        const whiteKeys = document.querySelectorAll('.white-key');
        
        // Map of which white keys should have black keys after them
        // E and B don't have black keys after them
        const hasBlackKeyAfter = {
            'C': true,
            'D': true,
            'E': false,
            'F': true,
            'G': true,
            'A': true,
            'B': false
        };
        
        // Map for flat/sharp pairs
        const enharmonicPairs = {
            'C♯': 'D♭',
            'D♯': 'E♭',
            'F♯': 'G♭',
            'G♯': 'A♭',
            'A♯': 'B♭'
        };
        
        // Process all white keys except the last one
        for (let i = 0; i < whiteKeys.length - 1; i++) {
            const whiteKey = whiteKeys[i];
            const note = whiteKey.dataset.note.charAt(0);
            const octave = whiteKey.dataset.note.substring(1);
            
            // Skip if this white key doesn't have a black key after it
            if (!hasBlackKeyAfter[note]) {
                continue;
            }
            
            // Find the next white key to position the black key correctly
            const nextWhiteKey = whiteKeys[i + 1];
            
            // Only add black key if we have a next white key to align with
            if (nextWhiteKey) {
                // Find the sharp note that comes after this white key
                const blackKeyNote = notes[notes.indexOf(note) + 1];
                const blackKeyNoteWithOctave = blackKeyNote + octave;
                
                const blackKey = document.createElement('div');
                blackKey.dataset.note = blackKeyNoteWithOctave;
                blackKey.classList.add('key', 'black-key');
                
                // Calculate position to center between white keys
                const whiteKeyRect = whiteKey.getBoundingClientRect();
                const nextWhiteKeyRect = nextWhiteKey.getBoundingClientRect();
                
                // Position should be right edge of current white key minus half the black key width
                const leftEdge = whiteKeyRect.right - 12 + 10; // 12 is half the black key width (24px)
                const pianoLeft = pianoElement.getBoundingClientRect().left;
                const position = leftEdge - pianoLeft;
                
                blackKey.style.left = `${position}px`;
                
                // Add label container to black key (we'll update the actual text later)
                const noteLabel = document.createElement('div');
                noteLabel.classList.add('note-label');
                
                // Store both versions of the note name as data attributes for easy switching
                blackKey.dataset.sharpName = blackKeyNote + octave;
                blackKey.dataset.flatName = enharmonicPairs[blackKeyNote] + octave;
                
                // Default label text - will be updated by updateKeyLabels
                noteLabel.textContent = blackKeyNote + octave;
                
                blackKey.appendChild(noteLabel);
                
                // Add click event to play the note
                blackKey.addEventListener('click', function() {
                    initAudioContext();
                    const frequency = noteToFrequency(blackKeyNoteWithOctave);
                    playPianoNote(frequency, 0, 1);
                    
                    // Add temporary highlighting
                    this.classList.add('clicked');
                    
                    // Remove the clicked class after animation completes
                    setTimeout(() => {
                        this.classList.remove('clicked');
                    }, 300);
                });
                
                pianoElement.appendChild(blackKey);
            }
        }
    }
    
    // Function to update all black key labels based on chord context
    function updateKeyLabels(useFlatsContext) {
        const blackKeys = document.querySelectorAll('.black-key');
        
        blackKeys.forEach(key => {
            const label = key.querySelector('.note-label');
            if (useFlatsContext) {
                label.textContent = key.dataset.flatName;
            } else {
                label.textContent = key.dataset.sharpName;
            }
        });
    }
    
    // Function to get chord notes based on root, type, and inversion
    function getChordNotes(rootNote, chordType, inversion) {
        const rootNoteOnly = rootNote.replace(/\d+/, ''); // Remove octave number if present
        
        // Adjust octave based on root note to keep chords in a comfortable range
        let centerOctave = 4;
        
        // For notes from G to B, use octave 3 to prevent the chord from going too high
        if (['G', 'G♯', 'A', 'A♯', 'B', 'A♭', 'B♭'].includes(rootNoteOnly)) {
            centerOctave = 3;
        }
        
        // Convert flat to sharp for internal processing if needed
        let normalizedRootNote = rootNoteOnly;
        if (normalizedRootNote.includes('♭')) {
            // Find the equivalent sharp note
            const flatIndex = notesWithFlats.indexOf(normalizedRootNote);
            if (flatIndex !== -1) {
                normalizedRootNote = notes[flatIndex];
            }
        }
        
        // Get the index of the root note in the notes array
        const rootIndex = notes.indexOf(normalizedRootNote);
        
        // Define intervals for different chord types (in semitones)
        const chordIntervals = {
            major: [0, 4, 7],         // Root, Major 3rd, Perfect 5th
            minor: [0, 3, 7],         // Root, Minor 3rd, Perfect 5th
            diminished: [0, 3, 6],    // Root, Minor 3rd, Diminished 5th
            augmented: [0, 4, 8],     // Root, Major 3rd, Augmented 5th
            dominant7: [0, 4, 7, 10], // Root, Major 3rd, Perfect 5th, Minor 7th
            major7: [0, 4, 7, 11],    // Root, Major 3rd, Perfect 5th, Major 7th
            minor7: [0, 3, 7, 10]     // Root, Minor 3rd, Perfect 5th, Minor 7th
        };
        
        // Get the intervals for the selected chord type
        const intervals = chordIntervals[chordType];
        
        // Calculate the notes of the chord
        let chordNotes = intervals.map(interval => {
            const noteIndex = (rootIndex + interval) % 12;
            let octaveOffset = Math.floor((rootIndex + interval) / 12);
            return notes[noteIndex] + (centerOctave + octaveOffset);
        });
        
        // Apply inversion if specified
        const inversionValue = parseInt(inversion);
        if (inversionValue > 0) {
            // Move the first 'inversionValue' notes to the end of the array
            // and increase their octave
            for (let i = 0; i < inversionValue; i++) {
                const note = chordNotes.shift();
                const noteName = note.replace(/\d+/, '');
                const noteOctave = parseInt(note.match(/\d+/));
                chordNotes.push(noteName + (noteOctave + 1));
            }
        }
        
        return chordNotes;
    }
    
    // Function to get fingering based on chord type and inversion
    function getChordFingering(chordType, inversion) {
        // Define fingering patterns for different chord types and inversions
        const fingeringPatterns = {
            major: {
                0: { left: '5-3-1', right: '1-3-5' },       // Root position
                1: { left: '5-2-1', right: '1-2-5' },       // First inversion
                2: { left: '5-3-1', right: '1-4-5' }        // Second inversion
            },
            minor: {
                0: { left: '5-3-1', right: '1-3-5' },       // Root position
                1: { left: '5-2-1', right: '1-2-5' },       // First inversion
                2: { left: '5-3-1', right: '1-4-5' }        // Second inversion
            },
            diminished: {
                0: { left: '5-3-1', right: '1-3-5' },
                1: { left: '5-2-1', right: '1-2-5' },
                2: { left: '5-3-1', right: '1-4-5' }
            },
            augmented: {
                0: { left: '5-3-1', right: '1-3-5' },
                1: { left: '5-2-1', right: '1-2-5' },
                2: { left: '5-3-1', right: '1-4-5' }
            },
            dominant7: {
                0: { left: '5-3-2-1', right: '1-2-3-5' },   // Root position
                1: { left: '5-3-2-1', right: '1-2-4-5' },   // First inversion
                2: { left: '5-3-2-1', right: '1-3-4-5' },   // Second inversion
                3: { left: '5-3-2-1', right: '1-2-4-5' }    // Third inversion
            },
            major7: {
                0: { left: '5-3-2-1', right: '1-2-3-5' },
                1: { left: '5-3-2-1', right: '1-2-4-5' },
                2: { left: '5-3-2-1', right: '1-3-4-5' },
                3: { left: '5-3-2-1', right: '1-2-4-5' }
            },
            minor7: {
                0: { left: '5-3-2-1', right: '1-2-3-5' },
                1: { left: '5-3-2-1', right: '1-2-4-5' },
                2: { left: '5-3-2-1', right: '1-3-4-5' },
                3: { left: '5-3-2-1', right: '1-2-4-5' }
            }
        };

        // Get the appropriate fingering pattern based on chord type and inversion
        const inversionInt = parseInt(inversion);
        const pattern = fingeringPatterns[chordType]?.[inversionInt] || 
                        { left: '-', right: '-' }; // Default if not found
        
        return pattern;
    }
    
    // Function to convert flat notes to sharps when appropriate
    function formatNoteNames(noteNames, rootNote) {
        // Determine if we should use flats based on the root note
        const rootNoteOnly = rootNote.replace(/\d+/, '');
        const shouldUseFlats = useFlats[rootNoteOnly] || rootNoteOnly.includes('♭');
        
        return noteNames.map(noteName => {
            if (shouldUseFlats && noteName.includes('♯')) {
                // Convert sharp to flat - find index in notes array
                const noteIndex = notes.indexOf(noteName);
                if (noteIndex !== -1) {
                    return notesWithFlats[noteIndex];
                }
            }
            
            return noteName;
        });
    }
    
    // Map sharp/flat equivalents for keyboard highlighting
    const enharmonicEquivalents = {
        'D♭': 'C♯',
        'E♭': 'D♯',
        'G♭': 'F♯',
        'A♭': 'G♯',
        'B♭': 'A♯'
    };
    
    // Function to update the displayed chord
    function updateChord() {
        // Get selected values
        const selectedRoot = rootNoteSelect.value;
        const rootNote = selectedRoot + "4"; // Always use C4 as default octave
        const chordType = chordTypeSelect.value;
        const inversion = inversionSelect.value;
        
        // Determine if we should use flats for this chord
        const shouldUseFlats = useFlats[selectedRoot] || selectedRoot.includes('♭');
        
        // Update keyboard labels based on chord context
        updateKeyLabels(shouldUseFlats);
        
        // Get chord notes
        const chordNotes = getChordNotes(rootNote, chordType, inversion);
        
        // Update chord name display
        const inversionText = inversion === '0' ? '' : 
                             inversion === '1' ? ' (First Inversion)' : 
                             inversion === '2' ? ' (Second Inversion)' :
                             ' (Third Inversion)';
        chordNameElement.textContent = `${selectedRoot} ${chordType.charAt(0).toUpperCase() + chordType.slice(1)}${inversionText}`;
        
        // Update chord notes display with appropriate enharmonic spelling
        const noteNames = chordNotes.map(note => note.replace(/\d+/, ''));
        const formattedNotes = formatNoteNames(noteNames, selectedRoot);
        chordNotesElement.textContent = `Notes: ${formattedNotes.join(' - ')}`;
        
        // Update fingering display
        const fingering = getChordFingering(chordType, inversion);
        chordFingeringElement.textContent = `Left Hand: ${fingering.left} | Right Hand: ${fingering.right}`;
        
        // Reset all keys
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('active');
            key.classList.remove('alternative');
        });
        
        // Highlight the chord notes on the piano
        chordNotes.forEach(note => {
            let noteName = note;
            const noteOnly = note.replace(/\d+/, '');
            const octave = note.match(/\d+/)[0];
            
            // If the note is a flat, convert to sharp for keyboard highlighting
            if (noteOnly.includes('♭') && enharmonicEquivalents[noteOnly]) {
                noteName = enharmonicEquivalents[noteOnly] + octave;
            }
            
            const keyElement = document.querySelector(`.key[data-note="${noteName}"]`);
            if (keyElement) {
                keyElement.classList.add('active');
            } else {
                console.log(`Note ${noteName} not found on keyboard`);
            }
        });
    }
    
    // Function to update inversion options based on chord type
    function updateInversionOptions() {
        const chordType = chordTypeSelect.value;
        
        // Clear existing options
        inversionSelect.innerHTML = '';
        
        // Add root position and inversions
        const rootOption = document.createElement('option');
        rootOption.value = '0';
        rootOption.textContent = 'Root Position';
        inversionSelect.appendChild(rootOption);
        
        const firstOption = document.createElement('option');
        firstOption.value = '1';
        firstOption.textContent = 'First Inversion';
        inversionSelect.appendChild(firstOption);
        
        const secondOption = document.createElement('option');
        secondOption.value = '2';
        secondOption.textContent = 'Second Inversion';
        inversionSelect.appendChild(secondOption);
        
        // Third inversion removed as requested
    }
    
    // Initial setup of inversion options
    updateInversionOptions();
}); 