import { createReactMicroApp } from '@microtsm/react'
import './index.css'
import App from './App.tsx'
import './router'

export const { mount, unmount } = createReactMicroApp(App, {
  el: '#root',
})
