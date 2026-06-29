import {
  ACCESSIBILITY_STORAGE_KEY,
  DEFAULT_ACCESSIBILITY_PREFS,
} from "@/lib/accessibility/preferences";

/** Script que aplica preferencias guardadas (y del sistema) antes del primer pintado. */
export function AccessibilityScript() {
  const code = `(function(){
    try {
      var d=${JSON.stringify(DEFAULT_ACCESSIBILITY_PREFS)};
      var saved=JSON.parse(localStorage.getItem('${ACCESSIBILITY_STORAGE_KEY}')||'{}');
      var p={};
      Object.keys(d).forEach(function(k){ p[k]=saved[k]!==undefined?saved[k]:d[k]; });
      if(saved.motion===undefined&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) p.motion='reduced';
      if(saved.contrast===undefined&&window.matchMedia('(prefers-contrast: more)').matches) p.contrast='high';
      var e=document.documentElement;
      Object.keys(d).forEach(function(k){ e.dataset[k]=p[k]; });
    } catch(_) {}
  })();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
};
