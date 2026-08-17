import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

if (Capacitor.isNativePlatform()) {
  window.__SALA13_NATIVE__ = true;
  document.documentElement.classList.add('sala13-native');

  const setupBars = async () => {
    try { await StatusBar.setOverlaysWebView({ overlay: false }); } catch (_) {}
    try { await StatusBar.setStyle({ style: Style.Light }); } catch (_) {}
    try { await StatusBar.setBackgroundColor({ color: '#050711' }); } catch (_) {}
  };
  setupBars();

  let lastImpact = 0;
  document.addEventListener('pointerdown', event => {
    const target = event.target?.closest?.('button,.ctl,.btn,.caseBtn,.upgrade,[role="button"]');
    if (!target) return;
    const now = performance.now();
    if (now - lastImpact < 45) return;
    lastImpact = now;
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  }, { passive: true });

  App.addListener('backButton', () => {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (page !== 'index.html') {
      location.href = './index.html';
      return;
    }
    App.exitApp().catch(() => {});
  });

  App.addListener('resume', () => setupBars());
}
