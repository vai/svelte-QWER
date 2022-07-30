import type { TOC } from '$lib/types/toc';
export namespace Post {
  export type Post = {
    slug: string;
    title: stinrg;
    summary?: string;
    content?: string;
    html?: string;
    published: string;
    updated: string;
    created: string;
    cover?: string;
    coverStyle?: CoverStyle | string;
    options?: Array<string>;
    prev?: string;
    next?: string;
    toc?: TOC.Heading[];
    tags?: Array<>;
  };

  export enum CoverStyle {
    TOP = 'TOP',
    RIGHT = 'RIGHT',
    BOT = 'BOT',
    LEFT = 'LEFT',
    IN = 'IN',
  }
}
