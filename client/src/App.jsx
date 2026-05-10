import { Match, Switch } from 'solid-js'
import { useLocation } from '@solidjs/router'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Publish from './pages/Publish.jsx'
import Review from './pages/Review.jsx'
import Distribution from './pages/Distribution.jsx'
import Engagement from './pages/Engagement.jsx'
import Monetization from './pages/Monetization.jsx'
import TrafficRules from './pages/TrafficRules.jsx'
import Analytics from './pages/Analytics.jsx'

export default function App() {
  const location = useLocation()

  return (
    <div class="app-container">
      <Sidebar />
      <main class="main-content">
        <Switch>
          <Match when={location.pathname === '/' || location.pathname === '/dashboard'}>
            <Dashboard />
          </Match>
          <Match when={location.pathname === '/publish'}>
            <Publish />
          </Match>
          <Match when={location.pathname === '/review'}>
            <Review />
          </Match>
          <Match when={location.pathname === '/distribution'}>
            <Distribution />
          </Match>
          <Match when={location.pathname === '/engagement'}>
            <Engagement />
          </Match>
          <Match when={location.pathname === '/monetization'}>
            <Monetization />
          </Match>
          <Match when={location.pathname === '/traffic-rules'}>
            <TrafficRules />
          </Match>
          <Match when={location.pathname === '/analytics'}>
            <Analytics />
          </Match>
        </Switch>
      </main>
    </div>
  )
}
