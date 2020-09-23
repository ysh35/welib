declare module '*.less';
declare module '*.css';

type ArgumentTypes<F> = F extends (...args: infer A) => any ? A : never;
type FuncReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

declare module '*.svg';
declare module '*.png';
declare module 'markdown-it';
declare module '*.gif';
declare module '*.json';
declare module '@iktakahiro/markdown-it-katex';
declare module 'markdown-it-katex';
declare module 'markdown-it-prism';

interface DocumentOrShadowRoot {
  adoptedStyleSheets?: any;
  appendChild: any;
}

interface CSSStyleSheet {
  replace: any;
  replaceSync: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    'x-sidebar': any;
  }
}

declare const google: {
  maps: {
    Map: any;
    Circle: any;
    InfoWindow: any;
    Marker: any;
    LatLngBounds: any;
    LatLng: any;
    GeocoderResult: any;
    Geocoder: any;
    GeocoderStatus: any;
  };
};
