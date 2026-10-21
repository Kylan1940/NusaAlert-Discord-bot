import { Activity, Bot } from 'lucide-react';

const INVITE_URL = 'https://top.gg/bot/1477553454288212221';
const GITHUB_URL = 'https://github.com/Kylan1940';
const GITHUB_HANDLE = '@Kylan1940';

export function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <a className="brand" href="/" aria-label="NusaAlert home">
          <span className="brand__logo" aria-hidden="true">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          <span className="brand__name">
            Nusa<span>Alert</span>
          </span>
        </a>

        <div className="navbar__actions">
          <a
            className="navbar__invite"
            href={INVITE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Invite the NusaAlert bot to your Discord server"
          >
            <Bot size={16} strokeWidth={2.5} aria-hidden="true" />
            <span>Invite Discord Bot</span>
          </a>

          <a
            className="navbar__github"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={`${GITHUB_HANDLE} on GitHub`}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="navbar__github-handle">{GITHUB_HANDLE}</span>
          </a>
        </div>
      </div>
    </header>
  );
}