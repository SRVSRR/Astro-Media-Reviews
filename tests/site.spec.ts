import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://srvsrr.dev';

const STATIC_PAGES: Array<[string, string]> = [
  ['/', "Rohan Nandan - Data Scientist & Data Engineer"],
  ['/projects', 'Projects'],
  ['/skills', 'Skills & Expertise'],
  ['/about', 'About'],
  ['/articles', 'Articles'],
  ['/articles/browse', 'Browse'],
];

const SAMPLE_ARTICLES: Array<[string, string]> = [
  ['cs324-a1-distributed-job-processing-system', 'Peer Discovery, Leader Election, and Thread Safety'],
  ['cs324-assignment-2-distributed-job-processing-grpc', 'Leader Election, Progress Streaming, and Failure Recovery'],
  ['aog-zero', 'Honeywell AOG Zero: Building an APU Health Monitoring System in a Week'],
];

function canonical(page: Page) {
  return page.locator('link[rel="canonical"]').getAttribute('href');
}

test.describe('navigation', () => {
  for (const [path, heading] of STATIC_PAGES) {
    test(`renders ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('footer')).toBeVisible();
      if (path === '/skills') {
        await expect(page.locator('h2').first()).toContainText('Skills');
      } else if (path !== '/') {
        await expect(page.locator('h1').first()).toContainText(heading.split(' - ')[0]);
      }
    });
  }

  test('navbar links route to every main page', async ({ page }) => {
    await page.goto('/');
    for (const [label, path] of [
      ['Home', '/'],
      ['Projects', '/projects'],
      ['Articles', '/articles'],
      ['Skills', '/skills'],
      ['About', '/about'],
    ] as const) {
      await page.locator('nav').getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`));
    }
  });

  test('footer exposes categories, series and external profiles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer').getByRole('link', { name: /View all categories/ })).toHaveAttribute('href', '/articles/browse#categories');
    await expect(page.locator('footer').getByRole('link', { name: /View all series/ })).toHaveAttribute('href', '/articles/browse#series');
    await expect(page.locator('footer').getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/SRVSRR');
  });
});

test.describe('home page', () => {
  test('shows skills, resume and highlighted builds', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Preview Resume/ })).toHaveAttribute('href', '/rohan-nandan-resume.pdf');
    await expect(page.locator('h2', { hasText: 'Highlighted Builds' })).toBeVisible();
    await expect(page.locator('section').filter({ hasText: 'Highlighted Builds' }).getByRole('link', { name: /AOG Zero/ })).toHaveAttribute('href', 'https://github.com/SRVSRR/aog-zero');
    await expect(page.locator('section').filter({ hasText: 'Highlighted Builds' }).getByRole('link', { name: /Student Administration System/ })).toHaveAttribute('href', 'https://github.com/SRVSRR/student-administration-system');
  });

  test('lists exactly 6 latest articles', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.flex.flex-col.gap-4 > a[href^="/articles/"]')).toHaveCount(6);
    await expect(page.getByRole('link', { name: 'Browse all' })).toHaveAttribute('href', '/articles');
  });
});

test.describe('projects page', () => {
  test('every project links source code and case studies', async ({ page }) => {
    await page.goto('/projects');
    const cards = page.locator('article');
    await expect(cards).toHaveCount(6);
    expect(await page.locator('a', { hasText: 'Source code' }).count()).toBe(6);
    await expect(page.getByRole('link', { name: 'Read part 1 (RMI) →' })).toHaveAttribute('href', '/articles/cs324-a1-distributed-job-processing-system');
    await expect(page.getByRole('link', { name: 'Read part 2 (gRPC) →' })).toHaveAttribute('href', '/articles/cs324-assignment-2-distributed-job-processing-grpc');
  });
});

test.describe('skills page', () => {
  test('groups skills and links featured projects', async ({ page }) => {
    await page.goto('/skills');
    await expect(page.locator('h3', { hasText: 'Languages' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'View project' })).toHaveCount(4);
  });
});

test.describe('articles listing and pagination', () => {
  test('first page shows 6 cards with working next link', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.locator('.text-sm.text-muted', { hasText: /\d+ posts/ })).toBeVisible();
    await expect(page.locator('.flex.flex-col.gap-4 > a[href^="/articles/"]')).toHaveCount(6);
    await expect(page.getByRole('link', { name: 'Next', exact: true })).toHaveAttribute('href', '/articles/page/2');
  });

  for (const n of [2, 3, 4]) {
    test(`page ${n} renders 6 cards and self-canonical`, async ({ page }) => {
      await page.goto(`/articles/page/${n}`);
      await expect(page.locator('.flex.flex-col.gap-4 > a[href^="/articles/"]')).toHaveCount(6);
      expect(await canonical(page)).toBe(`${SITE}/articles/page/${n}`);
    });
  }

  test('last page disables next and prev navigates to page 3', async ({ page }) => {
    await page.goto('/articles/page/4');
    await expect(page.getByRole('link', { name: 'Next', exact: true })).toHaveClass(/pointer-events-none/);
    await page.getByRole('link', { name: 'Previous', exact: true }).click();
    await expect(page).toHaveURL(/\/articles\/page\/3$/);
  });
});

test.describe('article pages', () => {
  for (const [slug, titlePart] of SAMPLE_ARTICLES) {
    test(`${slug} renders full article shell`, async ({ page }) => {
      await page.goto(`/articles/${slug}`);
      await expect(page.locator('#article-content h1')).toContainText(titlePart);
      await expect(page.getByText(/min read/)).toBeVisible();
      await expect(page.locator('img[alt="Article Image"]')).toBeVisible();
      await expect(page.locator('a.tag-link').first()).toHaveAttribute('href', /\/articles\/tag\//);
    });

    test(`${slug} emits correct SEO meta`, async ({ page }) => {
      await page.goto(`/articles/${slug}`);
      expect(await canonical(page)).toBe(`${SITE}/articles/${slug}`);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
      await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute('content', /\d{4}-\d{2}-\d{2}/);
      const jsonLd = await page.locator('script[type="application/ld+json"]').last().textContent();
      expect(jsonLd).toContain('BlogPosting');
      expect(jsonLd).toContain('BreadcrumbList');
    });

    test(`${slug} has noindex only when appropriate`, async ({ page }) => {
      await page.goto(`/articles/${slug}`);
      await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    });
  }

  test('RMI article has share buttons, related/series box and code copy buttons', async ({ page }) => {
    await page.goto('/articles/cs324-a1-distributed-job-processing-system');
    await expect(page.getByRole('link', { name: 'Post on X' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Share on LinkedIn' })).toBeVisible();
    await expect(page.getByText(/Part of the/)).toBeVisible();
    await expect(page.locator('.copy-code-button').first()).toBeVisible();
    await expect(page.locator('a[href^="/articles/"]:not([href*="/articles/tag/"])').first()).toBeVisible();
  });

  test('gRPC article cross-links the RMI repo and series', async ({ page }) => {
    await page.goto('/articles/cs324-assignment-2-distributed-job-processing-grpc');
    await expect(page.locator('article').getByRole('link', { name: /github\.com\/SRVSRR\/distributed-job-processing-system/ })).toBeVisible();
    await expect(page.getByText('"Distributed Job Processing"')).toBeVisible();
  });
});

test.describe('browse page', () => {
  test('lists categories and both series with anchors', async ({ page }) => {
    await page.goto('/articles/browse');
    await expect(page.locator('#categories')).toBeVisible();
    await expect(page.locator('#series')).toBeVisible();
    await expect(page.locator('#series-expense-tracker-engineering')).toBeVisible();
    await expect(page.locator('#series-distributed-job-processing')).toBeVisible();
    await expect(page.locator('a[href^="/articles/tag/"]').first()).toBeVisible();
  });

  test('series entries link to their posts in part order', async ({ page }) => {
    await page.goto('/articles/browse#series-distributed-job-processing');
    const seriesBlock = page.locator('#series-distributed-job-processing');
    await expect(seriesBlock.getByRole('link', { name: /Java RMI/ })).toBeVisible();
    await expect(seriesBlock.getByRole('link', { name: /gRPC/ })).toBeVisible();
  });
});

test.describe('tag pages', () => {
  for (const [tag, label] of [
    ['agile', 'Agile'],
    ['machine-learning', 'Machine Learning'],
    ['software-engineering', 'Software Engineering'],
  ] as const) {
    test(`tag ${tag} lists at least one post`, async ({ page }) => {
      await page.goto(`/articles/tag/${tag}`);
      await expect(page.locator('main h1')).toContainText('#' + label);
      await expect(page.locator('.flex.flex-col.gap-4 > a[href^="/articles/"]').first()).toBeVisible();
    });
  }
});

test.describe('search', () => {
  test('search form submits and returns results', async ({ page }) => {
    await page.goto('/articles');
    await page.fill('#query', 'grpc');
    await page.click('#search-form button[type="submit"]');
    await expect(page).toHaveURL(/\/articles\/search\?query=grpc$/);
    await expect(page.locator('.flex.flex-col.gap-4 > a[href^="/articles/"]').first()).toBeVisible();
  });

  test('search page is noindexed', async ({ page }) => {
    await page.goto('/articles/search?query=grpc');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  });

  test('empty search redirects to articles', async ({ page }) => {
    await page.goto('/articles/search');
    await expect(page).toHaveURL(/\/articles$/);
  });
});

test.describe('SEO infrastructure', () => {
  test('self-canonicals match the request path exactly', async ({ page }) => {
    for (const path of ['/', '/projects', '/articles', '/articles/browse', '/articles/tag/agile']) {
      await page.goto(path);
      expect(await canonical(page), `canonical for ${path}`).toBe(path === '/' ? `${SITE}` : `${SITE}${path}`);
    }
  });

  test('articles are not noindexed and hub pages carry no noindex', async ({ page }) => {
    await page.goto('/articles');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  });

  test('rss feed is valid xml with slashless canonical links', async ({ request }) => {
    const res = await request.get('/rss.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');
    const xml = await res.text();
    expect(xml).toContain('<rss');
    expect(xml).toContain(`<link>${SITE}/articles/aog-zero</link>`);
    expect(xml).not.toMatch(/https:\/\/srvsrr\.dev\/articles\/[^<]+\/<\/link>/);
  });

  test('sitemap lists canonical urls only', async () => {
    const index = readFileSync(join(process.cwd(), 'dist/client/sitemap-index.xml'), 'utf8');
    expect(index).toContain('https://srvsrr.dev/sitemap-0.xml');
    const sitemap = readFileSync(join(process.cwd(), 'dist/client/sitemap-0.xml'), 'utf8');
    const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThanOrEqual(28);
    expect(locs).toContain(`${SITE}/articles/aog-zero`);
    expect(locs.every((loc) => !loc.includes('?'))).toBe(true);
    expect(locs.every((loc) => loc === `${SITE}/` || !/\/$/.test(loc))).toBe(true);
    expect(locs.some((loc) => loc.includes('/articles/tags'))).toBe(false);
    expect(locs.some((loc) => loc.includes('/articles/search'))).toBe(false);
  });

  test('robots.txt points at the sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Sitemap: https://srvsrr.dev/sitemap-index.xml');
  });

  test('key assets resolve', async ({ request }) => {
    const favicon = await request.get('/favicon.svg');
    expect(favicon.status()).toBe(200);
    const resume = await request.get('/rohan-nandan-resume.pdf');
    expect(resume.status()).toBe(200);
    expect(resume.headers()['content-type']).toContain('pdf');
    const cover = await request.get('/images/cover-cs324-a1-distributed-job-processing-system.webp');
    expect(cover.status()).toBe(200);
  });
});

test.describe('404 page', () => {
  test('unknown route renders the not-found page', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res?.status() ?? 404).toBe(404);
    await expect(page.locator('main h1')).toContainText('Page Not Found');
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Articles' }).first()).toBeVisible();
  });
});
