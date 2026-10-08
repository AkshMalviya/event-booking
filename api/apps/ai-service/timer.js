// ==UserScript==
// @name         Daily Status Stats
// @namespace    http://tampermonkey.net/
// @version      2026-10-01
// @description  Calculate daily work statistics
// @author       You
// @match        https://portal.bestpeers.com/daily_status_updates
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // Prevent duplicate initialization
  if (window.__dailyStatusStatsLoaded) {
    return;
  }

  window.__dailyStatusStatsLoaded = true;
  let clickedLink = null;

  // ==========================================
  // 1. Remember which info icon was clicked
  // ==========================================
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.info-icon-link');
    if (!link) {
      return;
    }
    clickedLink = link;
    console.log('Clicked:', link.href);
  });

  // ==========================================
  // 2. Wait for Bootstrap modal to finish opening
  // ==========================================
  const modal = document.getElementById('swipe_details_modal');
  if (!modal) {
    console.log('Swipe details modal not found');
    return;
  }

  modal.addEventListener('shown.bs.modal', () => {
    console.log('Modal fully opened');
    processModal();
  });

  // ==========================================
  // 3. Also watch modal content changes
  // ==========================================
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody) {
    const observer = new MutationObserver(() => {
      if (!clickedLink) {
        return;
      }
      processModal();
    });

    observer.observe(modalBody, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  // ==========================================
  // Process current modal
  // ==========================================
  let lastProcessedText = '';

  function processModal() {
    const body = modal.querySelector('.modal-body');
    if (!body) {
      return;
    }
    const text = body.innerText.trim();
    if (!text) {
      return;
    }
    // Don't process exactly the same content again
    if (text === lastProcessedText) {
      return;
    }

    // Extract punch times
    const timeRegex = /\b(0?[1-9]|1[0-2]):([0-5][0-9])\s*(AM|PM)\b/gi;
    const matches = [...text.matchAll(timeRegex)];
    const times = matches.map((match) => match[0]);

    if (times.length === 0) {
      return;
    }

    console.log('Modal text:', text);
    console.log('Times:', times);
    lastProcessedText = text;
    calculateAndShowStats(body, times);
  }

  // ==========================================
  // Calculate statistics
  // ==========================================
  function calculateAndShowStats(body, times) {
    const requiredMinutes = 8 * 60 + 40;
    const workedMinutes = calculateWorkedMinutes(times);
    const remainingMinutes = Math.max(0, requiredMinutes - workedMinutes);
    const hasOpenPunch = times.length % 2 !== 0;

    const currentIn = hasOpenPunch ? times[times.length - 1] : null;
    const expectedOut = currentIn
      ? addMinutesToTime(currentIn, remainingMinutes)
      : null;

    const stats = {
      requiredWork: formatMinutes(requiredMinutes),
      completedWork: formatMinutes(workedMinutes),
      remainingWork: formatMinutes(remainingMinutes),
      currentIn,
      expectedOut,
    };

    console.log('Stats:', stats);
    showStats(body, stats);
  }

  // ==========================================
  // Calculate worked minutes
  // ==========================================
  function calculateWorkedMinutes(times) {
    let total = 0;
    for (let i = 0; i + 1 < times.length; i += 2) {
      const inTime = timeToMinutes(times[i]);
      const outTime = timeToMinutes(times[i + 1]);
      total += outTime - inTime;
    }
    return total;
  }

  // ==========================================
  // Convert time to minutes
  // ==========================================
  function timeToMinutes(time) {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      throw new Error(`Invalid time: ${time}`);
    }
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }
    return hour * 60 + minute;
  }

  // ==========================================
  // Add minutes to time
  // ==========================================
  function addMinutesToTime(time, minutesToAdd) {
    const total = timeToMinutes(time) + minutesToAdd;
    const hour24 = Math.floor(total / 60) % 24;
    const minutes = total % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    let hour12 = hour24 % 12;
    if (hour12 === 0) {
      hour12 = 12;
    }
    return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  }

  // ==========================================
  // Format minutes
  // ==========================================
  function formatMinutes(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  // ==========================================
  // Convert expected OUT to today's Date
  // ==========================================
  function timeToDate(time) {
    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      return null;
    }
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === 'AM') {
      if (hour === 12) hour = 0;
    } else {
      if (hour !== 12) hour += 12;
    }

    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  }

  // ==========================================
  // Format countdown
  // ==========================================
  function formatCountdown(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  // ==========================================
  // Live countdown / overtime (UI LOGIC UPDATED)
  // ==========================================
  let countdownInterval = null;

  function startLiveCountdown(expectedOut) {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    if (!expectedOut) {
      return;
    }

    const expectedOutDate = timeToDate(expectedOut);
    if (!expectedOutDate) {
      return;
    }

    function updateCountdown() {
      const textElement = document.querySelector('#tm-live-countdown-text');
      const labelElement = document.querySelector('#tm-countdown-label');
      const cardElement = document.querySelector('#tm-live-countdown-card');
      const iconElement = document.querySelector('#tm-live-countdown-icon');

      if (!textElement || !labelElement || !cardElement) {
        return;
      }

      const now = new Date();
      let difference = Math.floor(
        (expectedOutDate.getTime() - now.getTime()) / 1000,
      );

      if (difference > 0) {
        // Normal Countdown
        cardElement.style.backgroundColor = '#faf5ff';
        cardElement.style.borderColor = '#e9d5ff';
        if (iconElement) {
          iconElement.style.backgroundColor = '#f3e8ff';
          iconElement.style.color = '#9333ea';
        }
        labelElement.innerText = 'Remaining Time';
        textElement.style.color = '#0f172a';
        textElement.innerText = formatCountdown(difference);
      } else {
        // Overtime
        difference = Math.abs(difference);
        cardElement.style.backgroundColor = '#fef2f2';
        cardElement.style.borderColor = '#fecaca';
        if (iconElement) {
          iconElement.style.backgroundColor = '#fee2e2';
          iconElement.style.color = '#dc2626';
        }
        labelElement.innerText = 'Overtime';
        labelElement.style.color = '#ef4444';
        textElement.style.color = '#dc2626';
        textElement.innerText = formatCountdown(difference);
      }
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  // ==========================================
  // Display stats (UI LOGIC COMPLETELY REWRITTEN FOR GRID)
  // ==========================================
  function showStats(body, stats) {
    const old = body.querySelector('#tm-work-stats');
    if (old) {
      old.remove();
    }

    const container = document.createElement('div');
    container.id = 'tm-work-stats';

    // SVGs for clean, scalable icons matching the reference
    const icons = {
      chart: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="4" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/><rect x="6" y="12" width="3" height="6" rx="1" fill="#10b981"/><rect x="10.5" y="6" width="3" height="12" rx="1" fill="#3b82f6"/><rect x="15" y="10" width="3" height="8" rx="1" fill="#f97316"/></svg>`,
      clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
      check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
      minus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
      user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
      exit: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
      hourglass: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`,
    };

    container.innerHTML = `
            <div style="margin-top: 20px; padding: 20px; border-radius: 12px; background: #ffffff; border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">


                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                    ${icons.chart}
                    <h5 style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">Work Statistics</h5>
                </div>


                <!-- Main Grid Layout -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">


                    <!-- Left Column (4 Main Stats) -->
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 18px;">


                        <!-- Required -->
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${icons.clock}
                            </div>
                            <div style="display: flex; flex-direction: column; line-height: 1.2;">
                                <span style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px;">Required Work</span>
                                <span style="font-size: 16px; color: #0f172a; font-weight: 600;">${stats.requiredWork}</span>
                            </div>
                        </div>


                        <!-- Completed -->
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${icons.check}
                            </div>
                            <div style="display: flex; flex-direction: column; line-height: 1.2;">
                                <span style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px;">Completed Work</span>
                                <span style="font-size: 16px; color: #0f172a; font-weight: 600;">${stats.completedWork}</span>
                            </div>
                        </div>


                        <!-- Remaining -->
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #fff7ed; color: #f97316; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${icons.minus}
                            </div>
                            <div style="display: flex; flex-direction: column; line-height: 1.2;">
                                <span style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px;">Remaining Work</span>
                                <span style="font-size: 16px; color: #0f172a; font-weight: 600;">${stats.remainingWork}</span>
                            </div>
                        </div>


                        <!-- Current IN -->
                        <div style="display: flex; align-items: center; gap: 14px;">
                            <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #f5f3ff; color: #8b5cf6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${icons.user}
                            </div>
                            <div style="display: flex; flex-direction: column; line-height: 1.2;">
                                <span style="font-size: 13px; color: #64748b; font-weight: 500; margin-bottom: 4px;">Current IN</span>
                                <span style="font-size: 16px; color: #0f172a; font-weight: 600;">${stats.currentIn || 'Not Punched In'}</span>
                            </div>
                        </div>
                    </div>


                    <!-- Right Column (Expected OUT + Countdown) -->
                    <div style="display: flex; flex-direction: column; gap: 16px;">


                        <!-- Expected OUT Card -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 14px; flex: 1;">
                            <div style="width: 40px; height: 40px; border-radius: 8px; background-color: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                ${icons.exit}
                            </div>
                            <div style="display: flex; flex-direction: column; line-height: 1.2;">
                                <span style="font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 6px;">Expected OUT</span>
                                <span style="font-size: 20px; color: #0f172a; font-weight: 600;">${stats.expectedOut || '--:--'}</span>
                            </div>
                        </div>


                        <!-- Live Countdown Card -->
                        ${
                          stats.expectedOut
                            ? `
                            <div id="tm-live-countdown-card" style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 14px; flex: 1; transition: all 0.2s ease;">
                                <div id="tm-live-countdown-icon" style="width: 40px; height: 40px; border-radius: 8px; background-color: #f3e8ff; color: #9333ea; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    ${icons.hourglass}
                                </div>
                                <div style="display: flex; flex-direction: column; line-height: 1.2; width: 100%;">
                                    <span id="tm-countdown-label" style="font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 6px;">Remaining Time</span>
                                    <span id="tm-live-countdown-text" style="font-size: 20px; color: #0f172a; font-weight: 600;">Calculating...</span>
                                </div>
                            </div>`
                            : `<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; display: flex; align-items: flex-start; gap: 14px; flex: 1; opacity: 0.6;">
                                <div style="width: 40px; height: 40px; border-radius: 8px; background-color: #f1f5f9; color: #94a3b8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    ${icons.hourglass}
                                </div>
                                <div style="display: flex; flex-direction: column; line-height: 1.2; width: 100%;">
                                    <span style="font-size: 14px; color: #64748b; font-weight: 500; margin-bottom: 6px;">Remaining Time</span>
                                    <span style="font-size: 20px; color: #64748b; font-weight: 600;">Punched Out</span>
                                </div>
                            </div>`
                        }
                    </div>
                </div>
            </div>
        `;

    body.appendChild(container);

    // ==========================================
    // Start live countdown if open punch exists
    // ==========================================
    if (stats.expectedOut) {
      startLiveCountdown(stats.expectedOut);
    }
  }
})();
