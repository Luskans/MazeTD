import {Howl, Howler} from 'howler';

export class AudioService {
  private static instance: AudioService;
  
  private sfxVolume: number = parseFloat(localStorage.getItem('sfxVolume') || '0.5');
  private musicVolume: number = parseFloat(localStorage.getItem('musicVolume') || '0.3');
  
  private sounds: Map<string, Howl> = new Map();
  private currentMusic: Howl | null = null;

  private constructor() {
    this.load('connect', '/sounds/sfx/connect.wav');
    this.load('disconnect', '/sounds/sfx/disconnect.wav');
    this.load('hover', '/sounds/sfx/hover.wav');
    this.load('open', '/sounds/sfx/open.wav');
    this.load('close', '/sounds/sfx/close.wav');
    this.load('confirm', '/sounds/sfx/confirm3.wav');
    this.load('chat', '/sounds/sfx/back.wav');
    this.load('back', '/sounds/sfx/back2.wav');
    this.load('countdown', '/sounds/sfx/countdown2.wav')
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public load(key: string, path: string, isMusic: boolean = false) {
    this.sounds.set(key, new Howl({
      src: [path],
      html5: isMusic, // Utilise le streaming pour les fichiers lourds (musique)
      volume: isMusic ? this.musicVolume : this.sfxVolume,
      loop: isMusic
    }));
  }

  public playSFX(key: string) {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.volume(this.sfxVolume);
      sound.play();
    }
  }

  public playMusic(key: string) {
    if (this.currentMusic) this.currentMusic.stop();
    
    const music = this.sounds.get(key);
    if (music) {
      this.currentMusic = music;
      music.volume(this.musicVolume);
      music.play();
    }
  }

  public setSFXVolume(val: number) {
    this.sfxVolume = val;
    localStorage.setItem('sfxVolume', val.toString());
    // Met à jour les sons déjà chargés si besoin
  }

  public setMusicVolume(val: number) {
    this.musicVolume = val;
    if (this.currentMusic) this.currentMusic.volume(val);
    localStorage.setItem('musicVolume', val.toString());
  }
}