export default async function handler(req, res) {
  const checkoutUrl = String(process.env.PRO_CHECKOUT_URL || '').trim();
  if (!checkoutUrl || !/^https?:\/\//i.test(checkoutUrl)) {
    return res.status(200).json({
      success: false,
      configured: false,
      error: 'Pagamento Report PRO non ancora configurato.'
    });
  }

  const source = String((req.query && req.query.source) || 'project-x').slice(0, 120);
  const url = new URL(checkoutUrl);
  url.searchParams.set('source', source);
  url.searchParams.set('product', 'project-x-report-pro');

  return res.redirect(302, url.toString());
}
