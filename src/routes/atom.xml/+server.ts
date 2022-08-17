import type { RequestHandler } from '@sveltejs/kit';
import { siteConfig } from '$config/site';
import type { Post } from '$lib/types/post';
import postsjson from '$generated/posts.json';
import tagsjson from '$generated/tags.json';
import LZString from 'lz-string';

const _allposts = (postsjson as [string, Post.Post][]).filter((e) => {
  return !(e[1].options && e[1].options.includes('unlisted'));
});

const _alltags = Array.from(Object.entries(tagsjson as { [key: string]: { [key: string]: number } }));

const render = async (): Promise<string> => `<?xml version='1.0' encoding='utf-8'?>
<feed xmlns="http://www.w3.org/2005/Atom" ${siteConfig.lang ? `xml:lang="${siteConfig.lang}"` : ''}>
<id>${siteConfig.url}/</id>
<title><![CDATA[${siteConfig.title}]]></title>
${
  siteConfig.subtitle
    ? `<subtitle>
<![CDATA[${siteConfig.subtitle}]]>
</subtitle>`
    : ''
}
<icon>${siteConfig.url}/favicon.png</icon>
<link href="${siteConfig.url}"/>
<link href="${siteConfig.url}atom.xml" rel="self" type="application/atom+xml"/>
<updated>${new Date().toJSON()}</updated>
<author>
  <name><![CDATA[${siteConfig.author.name}]]></name>
</author>
${_alltags
  .map((t) => {
    const [key, value] = Object.entries(t);
    if (key[1] === 'tags') {
      return Array.from(Object.keys(value[1])).map((tag) => {
        return `<category term="${tag}" scheme="${siteConfig.url}/?tags=${encodeURI(tag)}" />`;
      });
    }
    return Array.from(Object.keys(value[1])).map((tag) => {
      const formattedTag = `tags-${key[1]}=${tag}`;
      return `<category term="${key[1]}-${tag}" scheme=${siteConfig.url}/?${encodeURI(formattedTag)}" />`;
    });
  })
  .flat()
  .join('\n')}
${_allposts
  .map((p) => {
    return `<entry>
    <title type="html"><![CDATA[${p[1].title}]]></title>
    <author><name><![CDATA[${siteConfig.author.name}]]></name></author>
    <link href="${siteConfig.url}${p[1].slug}" />
    <id>${siteConfig.url}${p[1].slug}</id>
    <published>${new Date(p[1].published).toJSON()}</published>
    <updated>${new Date(p[1].updated).toJSON()}</updated>
    <summary type="html"><![CDATA[${p[1].summary}]]></summary>
    <content type="html"><![CDATA[${LZString.decompressFromBase64(p[1].html ?? '') ?? ''}]]></content>
    ${p[1].tags
      ?.map((t: string | string[] | { string: string } | { string: string[] }) => {
        if (typeof t === 'string') return `<category term="${t}" scheme="${siteConfig.url}/?tags=${encodeURI(t)}" />`;
        if (Array.isArray(t)) {
          return t.map((v) => {
            return `<category term="${v}" scheme="${siteConfig.url}/?tags=${encodeURI(v)}" />`;
          });
        }
        const [key, value] = Object.entries(t)[0];
        if (Array.isArray(value)) {
          return value.map((t) => {
            return `<category term="${key}-${t}" scheme="${siteConfig.url}/?${key}=${encodeURI(t)}" />`;
          });
        }
        return `<category term="${key}-${value}" scheme="${siteConfig.url}/?${key}=${encodeURI(value)}" />`;
      })
      .flat()
      .join('\n')}
    </entry>`;
  })
  .join('\n')}
</feed>
`;

export const GET: RequestHandler = async () => {
  return new Response(await render(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
};
