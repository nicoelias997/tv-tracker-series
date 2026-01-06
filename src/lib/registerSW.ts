/**
 * Service Worker Registration
 * Registers the service worker for PWA offline functionality
 */

export async function registerServiceWorker(): Promise<void> {
  // Only register service worker in production and if supported
  if (!('serviceWorker' in navigator)) {
    console.log('Service workers are not supported in this browser');
    return;
  }

  // Don't register during development to avoid caching issues
  if (import.meta.env.DEV) {
    console.log('Service worker disabled in development mode');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration.scope);

    // Check for updates periodically
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('🔄 New version available! Reload to update.');

            // Optionally show a notification to user
            // You can add SweetAlert2 here to notify user of update
          }
        });
      }
    });

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

/**
 * Unregister all service workers (useful for debugging)
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('✅ Service Worker unregistered');
    }
  } catch (error) {
    console.error('❌ Failed to unregister service worker:', error);
  }
}
