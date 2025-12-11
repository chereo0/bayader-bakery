module.exports = function notFound(req, res, next) {
  console.log('[NOT-FOUND] ⚠️ Route not found:', { method: req.method, path: req.path, url: req.url });
  // CRITICAL: Always set JSON content type
  res.set('Content-Type', 'application/json');
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.path,
    method: req.method,
    data: null
  });
};
