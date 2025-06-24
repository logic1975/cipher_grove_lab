import { create } from 'zustand';
import { Howl } from 'howler';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

interface MusicPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  howl: Howl | null;
  
  // Actions
  play: (track?: Track) => void;
  pause: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  updateProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  howl: null,
  
  play: (track) => {
    const state = get();
    
    // If a new track is provided, set it up
    if (track && (!state.currentTrack || track.id !== state.currentTrack.id)) {
      // Stop current track if playing
      if (state.howl) {
        state.howl.unload();
      }
      
      // Create new Howl instance
      const howl = new Howl({
        src: [track.url],
        volume: state.volume,
        onplay: () => {
          set({ isPlaying: true });
          // Update progress periodically
          const updateProgress = () => {
            if (howl.playing()) {
              const seek = howl.seek() as number;
              const duration = howl.duration();
              set({ 
                progress: seek,
                duration: duration 
              });
              requestAnimationFrame(updateProgress);
            }
          };
          updateProgress();
        },
        onpause: () => set({ isPlaying: false }),
        onstop: () => set({ isPlaying: false, progress: 0 }),
        onend: () => set({ isPlaying: false, progress: 0 }),
        onloaderror: () => {
          console.error('Failed to load track');
          set({ isPlaying: false });
        },
      });
      
      set({ 
        currentTrack: track, 
        howl,
        progress: 0,
        duration: 0 
      });
      
      howl.play();
    } else if (state.howl) {
      // Resume current track
      state.howl.play();
    }
  },
  
  pause: () => {
    const { howl } = get();
    if (howl) {
      howl.pause();
    }
  },
  
  stop: () => {
    const { howl } = get();
    if (howl) {
      howl.stop();
      set({ progress: 0 });
    }
  },
  
  setVolume: (volume) => {
    const { howl } = get();
    set({ volume });
    if (howl) {
      howl.volume(volume);
    }
  },
  
  seek: (time) => {
    const { howl } = get();
    if (howl) {
      howl.seek(time);
      set({ progress: time });
    }
  },
  
  updateProgress: (progress) => set({ progress }),
  
  setDuration: (duration) => set({ duration }),
}));