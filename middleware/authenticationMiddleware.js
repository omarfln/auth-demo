function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

function requireAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied. Functionality is only allowed for Admin user');
    }
}


module.exports = {
    requireAuth,
    requireAdmin
};