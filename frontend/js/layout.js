// Inject common layout: topbar + sidebar
function renderLayout(activePage) {
  Auth.requireAuth();
  const user = Auth.getUser();

  const navItems = [
    { href: 'dashboard.html',  icon: '📊', label: 'Dashboard',  section: 'Main' },
    { href: 'orders.html',     icon: '📋', label: 'Orders',     section: 'Main' },
    { href: 'tables.html',     icon: '🪑', label: 'Tables',     section: 'Main' },
    { href: 'menu.html',       icon: '🍛', label: 'Menu',       section: 'Main' },
    { href: 'billing.html',    icon: '🧾', label: 'Billing',    section: 'Finance' },
    { href: 'inventory.html',  icon: '📦', label: 'Inventory',  section: 'Operations' },
    { href: 'staff.html',      icon: '👤', label: 'Staff',      section: 'Admin', roles: ['admin','manager'] },
  ];

  let sidebarHtml = '';
  let lastSection = null;
  for (const item of navItems) {
    if (item.roles && !item.roles.includes(user?.role)) continue;
    if (item.section !== lastSection) {
      sidebarHtml += `<div class="nav-section-label">${item.section}</div>`;
      lastSection = item.section;
    }
    const active = activePage === item.href ? 'active' : '';
    sidebarHtml += `<a href="${item.href}" class="nav-item ${active}"><span class="nav-icon">${item.icon}</span>${item.label}</a>`;
  }

  document.body.innerHTML = `
    <div class="app-layout">
      <header class="topbar">
        <div class="topbar-brand"><span class="logo-icon">🍽️</span> Restaurant MS</div>
        <div class="topbar-user">
          <span>${user?.name || 'User'}</span>
          <span class="user-badge">${user?.role || ''}</span>
          <button class="btn-logout" onclick="Auth.logout()">Logout</button>
        </div>
      </header>
      <nav class="sidebar">${sidebarHtml}</nav>
      <main class="main-content" id="main-content"></main>
    </div>
  ` + document.body.innerHTML;
}
