'use client';

import { useEffect } from 'react';

export default function AudioPlayerInit() {
  useEffect(() => {
    const audio = document.getElementById('audioElement');
    const playPauseBtn = document.getElementById('playPauseBtn');
    if (!audio || !playPauseBtn) return;

    const playIcon = playPauseBtn.querySelector('.play-icon');
    const pauseIcon = playPauseBtn.querySelector('.pause-icon');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const progressHandle = document.getElementById('progressHandle');
    const muteBtn = document.getElementById('muteBtn');
    const volumeIcon = muteBtn?.querySelector('.volume-icon');
    const muteIcon = muteBtn?.querySelector('.mute-icon');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedBtn = document.getElementById('speedBtn');
    const speedMenu = document.getElementById('speedMenu');

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    const handlePlayPause = () => {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    };

    const handlePlay = () => {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    };

    const handlePause = () => {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    };

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (progress) progress.style.width = pct + '%';
        if (progressHandle) progressHandle.style.left = pct + '%';
        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(audio.currentTime);
      }
    };

    const handleMetadata = () => {
      if (durationSpan) durationSpan.textContent = formatTime(audio.duration);
    };

    const handleProgressClick = (e) => {
      const clickX = e.offsetX;
      const width = progressBar.offsetWidth;
      audio.currentTime = (clickX / width) * audio.duration;
    };

    const handleMute = () => {
      if (audio.muted) {
        audio.muted = false;
        if (volumeIcon) volumeIcon.style.display = 'block';
        if (muteIcon) muteIcon.style.display = 'none';
        if (volumeSlider) volumeSlider.value = audio.volume * 100;
      } else {
        audio.muted = true;
        if (volumeIcon) volumeIcon.style.display = 'none';
        if (muteIcon) muteIcon.style.display = 'block';
      }
    };

    const handleVolumeChange = () => {
      audio.volume = volumeSlider.value / 100;
      if (audio.volume === 0) {
        audio.muted = true;
        if (volumeIcon) volumeIcon.style.display = 'none';
        if (muteIcon) muteIcon.style.display = 'block';
      } else {
        audio.muted = false;
        if (volumeIcon) volumeIcon.style.display = 'block';
        if (muteIcon) muteIcon.style.display = 'none';
      }
    };

    const handleSpeedClick = (e) => {
      if (e.target.dataset.speed) {
        const speed = parseFloat(e.target.dataset.speed);
        audio.playbackRate = speed;
        speedBtn.textContent = speed + 'x';
        speedMenu.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
      }
    };

    playPauseBtn.addEventListener('click', handlePlayPause);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetadata);
    if (progressBar) progressBar.addEventListener('click', handleProgressClick);
    if (muteBtn) muteBtn.addEventListener('click', handleMute);
    if (volumeSlider) volumeSlider.addEventListener('input', handleVolumeChange);
    if (speedMenu) speedMenu.addEventListener('click', handleSpeedClick);

    return () => {
      playPauseBtn.removeEventListener('click', handlePlayPause);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetadata);
      if (progressBar) progressBar.removeEventListener('click', handleProgressClick);
      if (muteBtn) muteBtn.removeEventListener('click', handleMute);
      if (volumeSlider) volumeSlider.removeEventListener('input', handleVolumeChange);
      if (speedMenu) speedMenu.removeEventListener('click', handleSpeedClick);
    };
  }, []);

  return null;
}
