import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFS,
} from "@/lib/accessibility/preferences";

/** Script que aplica las preferencias guardadas antes del primer pintado. */
export function AccessibilityScript() {
  const code = `(function(){try{var d=${JSON.stringify(DEFAULT_ACCESSIBILITY_PREFS)};var p=JSON.parse(localStorage.getItem('${ACCESSIBILITY_STORAGE_KEY}')||'{}');var e=document.documentElement;Object.keys(d).forEach(function(k){e.dataset[k]=p[k]||d[k];});}catch(_){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
