import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMusicPlayerStore } from '../useMusicPlayerStore';

// Mock Howler
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    seek: vi.fn(),
    volume: vi.fn(),
    playing: vi.fn().mockReturnValue(false),
    duration: vi.fn().mockReturnValue(180),
    unload: vi.fn(),
    on: vi.fn(),
  }))
}));

describe('useMusicPlayerStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useMusicPlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      volume: 0.8,
      progress: 0,
      duration: 0,
      howl: null,
    });
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    expect(result.current.currentTrack).toBe(null);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.volume).toBe(0.8);
    expect(result.current.progress).toBe(0);
    expect(result.current.duration).toBe(0);
    expect(result.current.howl).toBe(null);
  });

  it('plays a new track', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    const track = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      url: 'https://example.com/track.mp3',
    };
    
    act(() => {
      result.current.play(track);
    });
    
    expect(result.current.currentTrack).toEqual(track);
    expect(result.current.howl).toBeTruthy();
  });

  it('pauses playback', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    // First play a track
    const track = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      url: 'https://example.com/track.mp3',
    };
    
    act(() => {
      result.current.play(track);
    });
    
    // Then pause
    act(() => {
      result.current.pause();
    });
    
    expect(result.current.howl?.pause).toHaveBeenCalled();
  });

  it('stops playback and resets progress', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    // Setup a track
    const track = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      url: 'https://example.com/track.mp3',
    };
    
    act(() => {
      result.current.play(track);
      result.current.updateProgress(30);
    });
    
    expect(result.current.progress).toBe(30);
    
    // Stop playback
    act(() => {
      result.current.stop();
    });
    
    expect(result.current.howl?.stop).toHaveBeenCalled();
    expect(result.current.progress).toBe(0);
  });

  it('sets volume', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    act(() => {
      result.current.setVolume(0.5);
    });
    
    expect(result.current.volume).toBe(0.5);
  });

  it('seeks to specific time', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    // Setup a track
    const track = {
      id: '1',
      title: 'Test Track',
      artist: 'Test Artist',
      url: 'https://example.com/track.mp3',
    };
    
    act(() => {
      result.current.play(track);
    });
    
    // Seek to 60 seconds
    act(() => {
      result.current.seek(60);
    });
    
    expect(result.current.howl?.seek).toHaveBeenCalledWith(60);
    expect(result.current.progress).toBe(60);
  });

  it('unloads previous track when playing new track', () => {
    const { result } = renderHook(() => useMusicPlayerStore());
    
    // Play first track
    const track1 = {
      id: '1',
      title: 'Track 1',
      artist: 'Artist 1',
      url: 'https://example.com/track1.mp3',
    };
    
    act(() => {
      result.current.play(track1);
    });
    
    const firstHowl = result.current.howl;
    
    // Play second track
    const track2 = {
      id: '2',
      title: 'Track 2',
      artist: 'Artist 2',
      url: 'https://example.com/track2.mp3',
    };
    
    act(() => {
      result.current.play(track2);
    });
    
    expect(firstHowl?.unload).toHaveBeenCalled();
    expect(result.current.currentTrack).toEqual(track2);
  });
});