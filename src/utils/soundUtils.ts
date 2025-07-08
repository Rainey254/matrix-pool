
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

export const playWithdrawalSound = () => {
  // Create an audio context for generating the withdrawal sound
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'triangle';
    
    // Smooth volume envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  const currentTime = audioContext.currentTime;
  
  // Withdrawal sound: descending tones to indicate money going out
  playTone(600, currentTime, 0.4, 0.3);
  playTone(500, currentTime + 0.2, 0.4, 0.25);
  playTone(400, currentTime + 0.4, 0.5, 0.2);
};

export const playMineClickSound = () => {
  // Create an audio context for generating the mine click sound
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const playTone = (frequency: number, startTime: number, duration: number, volume: number) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'square';
    
    // Quick attack and decay for click sound
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  };
  
  const currentTime = audioContext.currentTime;
  
  // Quick click sound - 1 second duration
  playTone(800, currentTime, 0.3, 0.4);
  playTone(1000, currentTime + 0.1, 0.2, 0.3);
  playTone(600, currentTime + 0.2, 0.8, 0.2);
};
