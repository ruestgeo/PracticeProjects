import { InjectionToken, Renderer2, RendererFactory2, inject } from "@angular/core";

export const DEFAULT_RENDERER = new InjectionToken<Renderer2>(
    'A Renderer2 for global services',
    {   
        providedIn: 'root',
        factory: () => inject(RendererFactory2).createRenderer(null, null),
    },
);

/* source: https://github.com/angular/angular/issues/17824#issuecomment-643801506 */