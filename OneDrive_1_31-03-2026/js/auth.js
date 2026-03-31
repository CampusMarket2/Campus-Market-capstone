// auth.js - Auth guards and session handling

function requireAuth() {
  const user = DB.getCurrentUser();
  if (!user) {
    window.location.href = getRootPath() + "auth.html";
  }
  return user;
}

// In case this script is loaded on a guarded page
if (document.querySelector('meta[name="require-auth"]')) {
    requireAuth();
}
