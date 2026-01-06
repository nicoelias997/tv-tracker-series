import { h } from 'preact';
import { Route, Switch } from 'wouter';
import AppBar from './AppBar';
import BrowseView from '../views/BrowseView';
import WantToWatchView from '../views/WantToWatchView';
import WatchingView from '../views/WatchingView';
import CompletedView from '../views/CompletedView';

/**
 * App Shell Component
 *
 * This is the persistent shell of the SPA that never unmounts.
 * Contains:
 * - AppBar (always visible, persistent across routes)
 * - Router with view components
 * - Modal portal root (managed by Portal component)
 *
 * Navigation is client-side only - no page reloads.
 */
export default function AppShell() {
  return (
    <div className="min-h-screen">
      {/* Persistent App Bar - never unmounts */}
      <AppBar />

      {/* Router - switches between views client-side */}
      <Switch>
        <Route path="/">
          {() => <BrowseView key="browse" />}
        </Route>
        <Route path="/want-to-watch">
          {() => <WantToWatchView key="want-to-watch" />}
        </Route>
        <Route path="/watching">
          {() => <WatchingView key="watching" />}
        </Route>
        <Route path="/completed">
          {() => <CompletedView key="completed" />}
        </Route>

        {/* 404 fallback */}
        <Route>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎬</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
              <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
              <a
                href="/"
                className="inline-block px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Go to Browse
              </a>
            </div>
          </div>
        </Route>
      </Switch>
    </div>
  );
}
