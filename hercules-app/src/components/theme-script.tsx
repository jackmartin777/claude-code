/**
 * Applies the persisted theme before first paint so there is no flash.
 * Runs ahead of hydration, hence the inline script.
 */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('hercules-theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t!=='light'&&m)){document.documentElement.classList.add('dark')}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
