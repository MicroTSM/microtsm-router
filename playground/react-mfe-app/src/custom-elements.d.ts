import React from 'react';

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'router-view': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        'router-link': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          to?: string;
        };
      }
    }
  }
}

// Untuk kompatibilitas mundur jika tsconfig menggunakan jsx: react
declare namespace JSX {
  interface IntrinsicElements {
    'router-view': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    'router-link': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      to?: string;
    };
  }
}
