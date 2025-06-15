import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Howl } from 'howler';

export interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  coverArt?: string;
  duration?: number;
}

interface MusicPlayerState {
  // Current playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  
  // Playlist state
  playlist: Track[];
  currentIndex: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  
  // Howler instance
  howl: Howl | null;
  
  // Actions
  play: (track?: Track) => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: 'none' | 'one' | 'all') => void;
  setPlaylist: (tracks: Track[], startIndex?: number) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: number) => void;
  clearPlaylist: () => void;
  
  // Internal actions
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useMusicPlayerStore = create<MusicPlayerState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      isPlaying: false,
      isLoading: false,
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      playlist: [],
      currentIndex: -1,
      shuffle: false,
      repeat: 'none',
      howl: null,

      // Play action
      play: (track?: Track) => {
        const state = get();
        
        if (track && track.id !== state.currentTrack?.id) {
          // Playing a new track
          if (state.howl) {
            state.howl.unload();
          }

          set({ isLoading: true, currentTrack: track });

          const newHowl = new Howl({
            src: [track.url],
            html5: true,
            volume: state.volume,
            onplay: () => {
              set({ isPlaying: true, isLoading: false });
            },
            onpause: () => {
              set({ isPlaying: false });
            },
            onstop: () => {
              set({ isPlaying: false, currentTime: 0 });
            },
            onend: () => {
              const currentState = get();
              if (currentState.repeat === 'one') {
                newHowl.play();
              } else {
                currentState.next();
              }
            },
            onload: () => {
              set({ 
                duration: newHowl.duration() || 0,
                isLoading: false 
              });
            },
            onloaderror: (id, error) => {
              console.error('Audio load error:', error);
              set({ isLoading: false, isPlaying: false });
            }
          });

          set({ howl: newHowl });
          newHowl.play();
          
          // Update playlist index if track is in playlist
          const playlistIndex = state.playlist.findIndex(t => t.id === track.id);
          if (playlistIndex !== -1) {
            set({ currentIndex: playlistIndex });
          }
        } else if (state.howl && state.currentTrack) {
          // Resume current track
          state.howl.play();
        }
      },

      // Pause action
      pause: () => {
        const state = get();
        if (state.howl) {
          state.howl.pause();
        }
      },

      // Stop action
      stop: () => {
        const state = get();
        if (state.howl) {
          state.howl.stop();
        }
        set({ currentTime: 0 });
      },

      // Next track
      next: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        let nextIndex: number;
        
        if (state.shuffle) {
          // Random next track
          do {
            nextIndex = Math.floor(Math.random() * state.playlist.length);
          } while (nextIndex === state.currentIndex && state.playlist.length > 1);
        } else {
          // Sequential next track
          nextIndex = (state.currentIndex + 1) % state.playlist.length;
          
          // If repeat is 'none' and we're at the end, stop
          if (state.repeat === 'none' && state.currentIndex === state.playlist.length - 1) {
            get().stop();
            return;
          }
        }

        const nextTrack = state.playlist[nextIndex];
        if (nextTrack) {
          set({ currentIndex: nextIndex });
          get().play(nextTrack);
        }
      },

      // Previous track
      previous: () => {
        const state = get();
        if (state.playlist.length === 0) return;

        // If more than 3 seconds into track, restart current track
        if (state.currentTime > 3) {
          get().seek(0);
          return;
        }

        let prevIndex: number;
        
        if (state.shuffle) {
          // Random previous track
          do {
            prevIndex = Math.floor(Math.random() * state.playlist.length);
          } while (prevIndex === state.currentIndex && state.playlist.length > 1);
        } else {
          // Sequential previous track
          prevIndex = state.currentIndex - 1;
          if (prevIndex < 0) {
            prevIndex = state.repeat === 'all' ? state.playlist.length - 1 : 0;
          }
        }

        const prevTrack = state.playlist[prevIndex];
        if (prevTrack) {
          set({ currentIndex: prevIndex });
          get().play(prevTrack);
        }
      },

      // Seek to specific time
      seek: (time: number) => {
        const state = get();
        if (state.howl) {
          state.howl.seek(time);
          set({ currentTime: time });
        }
      },

      // Set volume
      setVolume: (volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        const state = get();
        
        if (state.howl) {
          state.howl.volume(clampedVolume);
        }
        
        set({ volume: clampedVolume });
      },

      // Set shuffle mode
      setShuffle: (shuffle: boolean) => {
        set({ shuffle });
      },

      // Set repeat mode
      setRepeat: (repeat: 'none' | 'one' | 'all') => {
        set({ repeat });
      },

      // Set playlist
      setPlaylist: (tracks: Track[], startIndex = 0) => {
        set({ 
          playlist: tracks, 
          currentIndex: startIndex 
        });
        
        if (tracks.length > 0 && startIndex < tracks.length) {
          get().play(tracks[startIndex]);
        }
      },

      // Add track to playlist
      addToPlaylist: (track: Track) => {
        const state = get();
        const existingIndex = state.playlist.findIndex(t => t.id === track.id);
        
        if (existingIndex === -1) {
          set({ playlist: [...state.playlist, track] });
        }
      },

      // Remove track from playlist
      removeFromPlaylist: (trackId: number) => {
        const state = get();
        const newPlaylist = state.playlist.filter(t => t.id !== trackId);
        const removedIndex = state.playlist.findIndex(t => t.id === trackId);
        
        let newCurrentIndex = state.currentIndex;
        
        if (removedIndex <= state.currentIndex && state.currentIndex > 0) {
          newCurrentIndex = state.currentIndex - 1;
        }
        
        if (newCurrentIndex >= newPlaylist.length) {
          newCurrentIndex = newPlaylist.length - 1;
        }

        set({ 
          playlist: newPlaylist, 
          currentIndex: newCurrentIndex 
        });

        // If removed track was currently playing, play next or stop
        if (state.currentTrack?.id === trackId) {
          if (newPlaylist.length > 0 && newCurrentIndex >= 0) {
            get().play(newPlaylist[newCurrentIndex]);
          } else {
            get().stop();
            set({ currentTrack: null });
          }
        }
      },

      // Clear entire playlist
      clearPlaylist: () => {
        get().stop();
        set({ 
          playlist: [], 
          currentIndex: -1, 
          currentTrack: null 
        });
      },

      // Internal state setters
      setCurrentTime: (time: number) => set({ currentTime: time }),
      setDuration: (duration: number) => set({ duration }),
      setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'music-player-store',
    }
  )
);

// Hook for tracking playback progress
export const usePlaybackProgress = () => {
  const { howl, setCurrentTime } = useMusicPlayerStore();

  React.useEffect(() => {
    if (!howl) return;

    const updateProgress = () => {
      if (howl.playing()) {
        setCurrentTime(howl.seek() || 0);
      }
    };

    const intervalId = setInterval(updateProgress, 1000);
    return () => clearInterval(intervalId);
  }, [howl, setCurrentTime]);
};