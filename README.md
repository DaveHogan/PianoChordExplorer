# Piano Chord Explorer

A simple web application that displays piano chords and their inversions with sound playback.
It was built mostly with Claude 3.7 Sonnet and Cursor so expect AI noise and garbage. 
This was put together solely to provide quick visuals for another project I'm working on.
It is a very rough proof of concept and requires significant work to be meaningful, but could be useful on its own.

**GitHub Repository:** [https://github.com/DaveHogan/PianoChordExplorer](https://github.com/DaveHogan/PianoChordExplorer)

## Project Status

⚠️ **Alpha Version**: This project is in early development stage and is not intended for production use.

Contributions are welcome, but please note that this is primarily a personal project with limited ongoing support. See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more information.

## Features

- Display major, minor, diminished, augmented, and 7th chords
- View chord inversions (root position, first inversion, second inversion, third inversion)
- Interactive piano keyboard visualization
- Select different root notes for chords
- Play chord sounds with Web Audio API
- Auto-play option for hearing chords as you select them
- Play individual notes by clicking on piano keys
- Toggle note labels on/off

## How to Use

1. Open `index.html` in your web browser
2. Select a root note from the dropdown menu
3. Choose a chord type (Major, Minor, etc.)
4. Select an inversion type if desired
5. The chord will be displayed on the piano keyboard
6. Click "Play Chord" to hear the chord sounds
7. Toggle "Auto-play on change" to automatically hear chords when selections change
8. Click individual piano keys to hear single notes

## Technologies Used

- HTML
- CSS
- JavaScript (Vanilla)
- Web Audio API

## Possible Future Improvements

### Enhanced Features
- Add more chord types (9th, 11th, 13th, suspended, etc.)
- Improve sound quality with better synthesis or samples
- Add responsive design for mobile devices
- Save favorite chords
- Display chord notation in music theory format
- Add option to save or export chord progressions

### Technical Improvements
- Replace hardcoded pixel values with CSS variables or percentage-based positioning
- Add keyboard navigation support for accessibility
- Implement full responsive design for different screen sizes
- Add error handling for notes outside the keyboard range
- Provide audio fallback for browsers without Web Audio API support
- Fix black key positioning to be more reliable across different screen sizes
- Improve color contrast for better accessibility
- Implement browser compatibility testing for musical symbols
- Fix event listener handling to prevent memory leaks
- Add touch support optimizations for mobile devices
- Create a proper build system with minification

### Educational Enhancements
- Add chord progression recommendations
- Include voice leading examples between chords
- Provide music theory explanations for each chord type
- Show chord usage examples in popular songs
- Include optional staff notation view

## Implementing Staff Notation

Adding musical staff notation would require the following components:

### Core Requirements
- **Staff Rendering System**: Implementation of the five-line staff with proper spacing
- **Clef Display**: Support for both treble and bass clefs (grand staff for piano)
- **Note Rendering**: Capability to draw different note types with correct positioning
- **Accidental Handling**: Display sharps, flats, and naturals correctly

### Technical Approaches
1. **Canvas-Based Drawing**: Using HTML5 Canvas for custom rendering
2. **SVG-Based Approach**: Using SVG for better scaling and manipulation
3. **Music Notation Library**: Utilizing existing libraries like VexFlow or abc.js

### Data Transformation
- Convert chord data to appropriate notation format
- Determine correct staff placement (treble/bass clef)
- Handle proper enharmonic spelling based on key context

### User Interface Considerations
- Add new section in the UI to display the notation
- Create toggle to show/hide notation
- Implement highlighting between notation and piano keys

### Accessibility Requirements
- Provide alternative text descriptions
- Ensure keyboard navigation
- Maintain proper contrast for readability 