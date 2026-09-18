export default async function handler(req, res) {
  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || '').trim();
  if (!checkoutUrl || !/^https?:\/\//i.test(checkoutUrl)) {
    return res.redirect(302, '/pro.html?checkout=missing');
  }

  const source = String((req.query && req.query.source) || 'project-x').slice(0, 120);
  const url = new URL(checkoutUrl);
  url.searchParams.set('source', source);
  url.searchParams.set('product', 'project-x-report-pro');

  return res.redirect(302, url.toString());
}
