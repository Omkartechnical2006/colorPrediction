// middlewares/isAdmin.js

function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    req.flash('success', 'You do not have permission to access this page.');
    return res.redirect('/home');
}

module.exports = isAdmin;
