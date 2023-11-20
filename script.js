// This is part of the audio logic in the startNote function below.
const audioContext = new AudioContext()

const NOTE_DETAILS = [
  { note: "C", key: "Z", frequency: 261.626 },
  { note: "Db", key: "S", frequency: 277.183 },
  { note: "D", key: "X", frequency: 293.665 },
  { note: "Eb", key: "D", frequency: 311.127 },
  { note: "E", key: "C", frequency: 329.628 },
  { note: "F", key: "V", frequency: 349.228 },
  { note: "Gb", key: "G", frequency: 369.994 },
  { note: "G", key: "B", frequency: 391.995 },
  { note: "Ab", key: "H", frequency: 415.305 },
  { note: "A", key: "N", frequency: 440 },
  { note: "Bb", key: "J", frequency: 466.164 },
  { note: "B", key: "M", frequency: 493.883 },
]

// 1. Create event listener for keydown and keyup in order to control when the keys are played.
document.addEventListener("keydown", (e) => {
  //1b. As we can see in dev tools, when we hold down a key it just continues to call this key but we need it to be one continuous event to play the sound until the key is released. This is a 'guard clause' that prevents it from continuing in the function and must be at the beginning of the code block so it was moved up.
  if (e.repeat === true) return
  // 1a. To test if the eventListeners are working, we console.log as seen below.
  //   console.log("Down")
  //   console.log(e)
  // 2c. Here we get the keyCode from the dev tools and we are logging out the noteDetail by passing in the keyCode when we call the getNoteDetail funtion which will compare the key pressed with the note associated with that key.
  const keyboardKey = e.code
  const noteDetail = getNoteDetail(keyboardKey)
  //   console.log(noteDetail)

  // 3. Here we need to get back a note if it exists, otherwise we will get back undefined. Create a simple if statement that checks to see if the key and note exist and if not, return out since we do not want it to continue.
  if (noteDetail == null) return

  // 3a. We add this statement to handle if the noteDetail is true, we want to mark it as an active key that is being played. This adds the property 'active' to the key listed above in our NOTE_DETAILS and sets it to true since this is an actively being played key.
  noteDetail.active = true

  // 4. Here we call playNotes() which is the function below that holds the logic for making the sound come out of our speakers.
  playNotes()
})

document.addEventListener("keyup", (e) => {
  // 1a. Test if eventListener is working for keyup as well.
  // 1b. See 1b above.
  //   console.log("Up")
  //   console.log(e)
  // 5. Here we need to hook up our keyup so that when we play a note the sound doesn't just continue forever. We do similar to that as we did in keydown.
  const keyboardKey = e.code
  const noteDetail = getNoteDetail(keyboardKey)

  // 5a. Just as above, we want to check and see if this note detail exists.
  if (noteDetail == null) return

  // 5b. Here we copy down the active as well as the playNotes() function call in order to take the active and make it false and end the note playing as well as call the playNotes() function again in order to update the function call that the sound ends here.
  noteDetail.active = false
  playNotes()
})

// 2. Now we need to get the specific note we are play based on the key being pressed. We create a function that takes in the keyboard key that we are pressing.
function getNoteDetail(keyboardKey) {
  // 2b. Here we look in the dev tools console at the key code based on that assigned in the NOTE_Details. We call the find method as this will allow us to get the specific note from the array of notes. n = note details. We then take the key and append the note identified above to it using the template literal. Last, it checks if the key being pressed is equal to the keyboard key. If the key matches (boolean of true in the below statement) then it will return the note, otherwise it will return undefined.
  return NOTE_DETAILS.find((n) => `Key${n.key}` === keyboardKey)
}

// 4a. Function holding the logic to make the sound play in our speakers.
function playNotes() {
  // Here we do a console.log to log the message in the console of 'play notes' to show up if a key matches our list above, otherwise it will just return out via line 29.
  // console.log("play notes")

  // 6. In the styles.css, we have black.active and white.active in order to recolor the keys so that we can see which keys are being played at a time. We take the NOTE_DETAILS array and loop through each one of them to get each of the individual keys. In the HTML file, we have a data attribute that is set to the individaul notes we want to play.
  NOTE_DETAILS.forEach((n) => {
    // Get actual keys using the data attribute assigned in the HTML to each note. Check this against the NOTE_DETAILS listed in the array above. We call this our keyElement because this is the actual key of our keyboard.
    const keyElement = document.querySelector(`[data-note="${n.note}"]`)
    // To be sure this works, we console.log the keyElement to see if this works.
    // console.log(keyElement)

    // 6a. Now we apply the active class if the note is active. Before the '|| false' is added, n.active is actually being set to undefined because we do not have it defined in our NOTE_DETAILS. Since n.active is not technically false at this point, we add the '|| false' in order to convert if from undefined to false. The only other way to avoid it highlighting all the keys when one is played is to add 'active: false' to all of the items in the NOTE_DETAILS array. Doing it this way is less code.
    keyElement.classList.toggle("active", n.active || false)

    // 8a. Here we want to check if our noteDetail has an oscillator and if we do then we want to stop playing this. This is so that we can stop playing previously plaid notes and then restart playing them since there is an brand new oscillator being created for each note played so we want to completely stop playing them before we start playing them as soon as we get to the startNote function. (We called noteDetail 'n' in the loops below)
    if (n.oscillator != null) {
      n.oscillator.stop() // Stop the sound.
      n.oscillator.disconnect() // Completely remove this from our audio context so we do not have stored a bunch of dead oscillators.
    }
  })

  // 7. Get all active notes and make notes with them. We filter through all the notes and the one that is returned as true will be returned as one of the active notes here. (Getting all notes with active set to true)
  const activeNotes = NOTE_DETAILS.filter((n) => n.active)
  // 7a. Then we just loop through all of these. Here we want it to start playing a note.

  // 9. At the end, we are able to play of the notes, however the oscillators are stacking on top of each other. This means that every other key we hit after our first one gets 100% louder than the first. In order to control this and reduce the sounds so they all share 100%, we add the following logic. Then we take this gain and pass it into the startNote function call below which is what starts the play of the note.
  const gain = 1 / activeNotes.length

  activeNotes.forEach((n) => {
    startNote(n, gain) // 7b. The startNote function below is used in order to actually house the logic to play the audio sound for each note.
  })
}

// 8. Audio specific info and logic to play the active not over the speakers.
function startNote(noteDetail, gain) {
  // 9a. Here we determine the volume of an output with the below logic as well as passing 'gain' into the startNote function.
  const gainNode = audioContext.createGain()
  // 9b. Then we just set the gainNode equal to the gain.
  gainNode.gain.value = gain

  // Here we create an oscillator which allows us to play a noise at a specific frequency.
  const oscillator = audioContext.createOscillator()
  // Then we hook up the oscillator to all the noteDetails from out note for the specific frequency.
  oscillator.frequency.value = noteDetail.frequency
  // We also need to tell our oscillator how it is to behave. Sound waves like sine or sawtooth put out different types of sound.
  oscillator.type = "sine"
  // Now we have to connect our oscillator to our audioContext. The destination is telling it we need to play the note through our speakers. We also have to connect the 'gain' from above here as well so that it is connected to the oscillator.
  oscillator.connect(gainNode).connect(audioContext.destination)
  // Then we tell our oscillator to start playing by connecting it to our start function. This starts it and makes it create noises.
  oscillator.start()
  // At this point, we play a note but have no way to stop the sound. In order to do this, we need to save a reference of our oscillator on our noteDetail.
  noteDetail.oscillator = oscillator
}
