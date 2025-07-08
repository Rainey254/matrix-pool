
export const playMT5NotificationSound = () => {
  // Create an audio context for generating the MT5-style sound
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // MT5-style notification sound: a pleasant chime with two tones
  const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sine';
    
    // Smooth volume envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  const currentTime = audioContext.currentTime;
  
  // First tone (higher pitch)
  playTone(800, currentTime, 0.6, 0.3);
  
  // Second tone (lower pitch, slightly delayed)
  playTone(600, currentTime + 0.3, 0.8, 0.25);
  
  // Third tone (middle pitch for harmony)
  playTone(700, currentTime + 0.6, 0.6, 0.2);
};
