// app.js - Core functionality & localStorage helpers

const DB = {
  getUsers: () => JSON.parse(localStorage.getItem("campus_users")) || [],
  getListings: () => JSON.parse(localStorage.getItem("campus_listings")) || [],
  getFavorites: () => JSON.parse(localStorage.getItem("campus_favorites")) || [],
  getCurrentUser: () => JSON.parse(localStorage.getItem("campusCurrentUser")),
  
  saveUser(user) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem("campus_users", JSON.stringify(users));
  },
  
  updateUser(updatedUser) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if(index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem("campus_users", JSON.stringify(users));
      if(updatedUser.id === this.getCurrentUser()?.id) {
        localStorage.setItem("campusCurrentUser", JSON.stringify({id: updatedUser.id, name: updatedUser.name, email: updatedUser.email}));
      }
    }
  },

  saveListing(listing) {
    const listings = this.getListings();
    listings.unshift(listing);
    localStorage.setItem("campus_listings", JSON.stringify(listings));
  },

  updateListing(updatedListing) {
     const listings = this.getListings();
     const idx = listings.findIndex(l => l.id === updatedListing.id);
     if(idx > -1) {
       listings[idx] = updatedListing;
       localStorage.setItem("campus_listings", JSON.stringify(listings));
     }
  },

  deleteListing(id) {
    const listings = this.getListings().filter(l => l.id !== id);
    localStorage.setItem("campus_listings", JSON.stringify(listings));
  },

  toggleFavorite(id) {
    let favs = this.getFavorites();
    if (favs.includes(id)) {
      favs = favs.filter(f => f !== id);
    } else {
      favs.push(id);
    }
    localStorage.setItem("campus_favorites", JSON.stringify(favs));
    return favs.includes(id);
  },

  logout() {
    localStorage.removeItem("campusCurrentUser");
    window.location.href = getRootPath() + "auth.html";
  }
};

function getRootPath() {
  return window.location.pathname.includes('/pages/') ? '../' : '';
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 5);
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " mins ago";
  return Math.floor(seconds) + " secs ago";
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function initSeedData() {
  const existing = localStorage.getItem("campus_listings");
  if (existing && JSON.parse(existing).length > 0) return;

  const sellers = [
    { name: "Kwame Mensah", email: "kwame@st.knust.edu.gh", phone: "0241234567" },
    { name: "Abena Osei", email: "abena@st.knust.edu.gh", phone: "0209876543" },
    { name: "Kofi Annan", email: "kofi@st.knust.edu.gh", phone: "0271122334" }
  ];

  // Seed Dummy Users so seller functionality works smoothly
  const existingUsers = localStorage.getItem("campus_users");
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    const seedUsers = sellers.map((s, i) => ({
      id: "seed_u" + i,
      name: s.name,
      email: s.email,
      phone: s.phone,
      password: "password123", // Dummy password
      programme: "Computer Science",
      profilePic: null, level: "300", hall: "Unity Hall", bio: "Proud Techimantian! Always selling quality student items.",
      createdAt: new Date().toISOString()
    }));
    localStorage.setItem("campus_users", JSON.stringify(seedUsers));
  }

  const seedListings = [];
  const locs = ["University Hall", "Unity Hall", "Africa Hall", "Ayeduase", "SRC Canteen", "Gaza"];

  const catData = {
    "Textbooks": { titles: ["Engineering Math Vol 2", "Calculus 10th Ed", "Physics for Scientists", "Chemistry by Chang", "Biology 8th Ed", "Economics Principles", "African Studies Notes", "KNUST Branded Notebook", "Literature Anthology", "Accounting Text"], basePrice: 40 },
    "Electronics": { titles: ["MacBook Air M1", "HP EliteBook 840", "Dell XPS 13", "iPhone 12 Pro", "Samsung S21", "JBL Bluetooth Speaker", "Sony Headphones", "Monitor 24 inch", "Power Bank 20000mAh", "External Hard Drive 1TB"], basePrice: 500 },
    "Services": { titles: ["Laptop Repair", "Graphic Design Flyer", "Hair Braiding", "Photography Session", "Video Editing", "Programming Tutor", "Essay Proofreading", "Custom T-Shirts", "Shoe Cleaning", "Delivery Errands"], basePrice: 50 },
    "Accommodation": { titles: ["1 in a room Ayeduase", "2 in a room Gaza", "Bed space at Brunei", "Hostel room transfer Kotei", "Evandy Hostel Bed", "Gaza 3 in a room", "SRC Hostel Transfer", "Wagobila Room", "Ayeduase Self Contain", "Bomso Single Room"], basePrice: 2500 },
    "Lost & Found": { titles: ["Lost Student ID", "Found Dell Charger", "Lost Note 10 Case", "Found Keys at CCB", "Lost Glasses", "Found Wallet", "Lost Flash Drive", "Found Umbrella", "Lost Notebook", "Found Calculator"], basePrice: null }
  };

  let idCounter = Date.now();

  // Create 10 items for each category
  Object.keys(catData).forEach(cat => {
    catData[cat].titles.forEach((title, i) => {
      const seller = sellers[i % sellers.length];
      const isLostFound = cat === 'Lost & Found';
      const isService = cat === 'Services';
      const price = isLostFound ? null : catData[cat].basePrice + Math.floor(Math.random() * 50);
      const condition = (isLostFound || isService) ? null : (i % 2 === 0 ? "Used 📦" : "New ✨");

      // Make a clean short title for placeholder image
      const shortText = title.split(' ').slice(0, 2).join('...');

      seedListings.push({
        id: (idCounter++).toString(),
        title: title,
        category: cat,
        condition: condition,
        price: price,
        description: `This is a pre-seeded listing for ${title}. Perfect for KNUST students. Feel free to contact via WhatsApp or Email if interested. Price is slightly negotiable.`,
        location: locs[i % locs.length],
        phone: seller.phone,
        contactEmail: seller.email,
        image: `https://via.placeholder.com/400x300/1a1a1a/6c63ff?text=${encodeURIComponent(shortText)}`,
        sellerName: seller.name,
        sellerEmail: seller.email,
        createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
        sold: false
      });
    });
  });

  localStorage.setItem("campus_listings", JSON.stringify(seedListings));
}

// Global UI initializations
document.addEventListener('DOMContentLoaded', () => {
  // Ensure we boot up the system with the templates directly on all pages
  initSeedData();

  // Setup User Navbar state
  const user = DB.getCurrentUser();
  const navActions = document.getElementById('nav-actions');
  
  if (navActions) {
    if (user) {
      navActions.innerHTML = `
        <a href="post.html" class="btn btn-primary"><i class='bx bx-plus'></i> Post</a>
        <a href="profile.html" class="avatar" title="Profile">${user.name.charAt(0)}</a>
        <button onclick="DB.logout()" class="btn btn-outline" style="padding: 8px; border-radius: 50%;"><i class='bx bx-log-out'></i></button>
      `;
    } else {
       navActions.innerHTML = `
        <a href="auth.html" class="btn btn-outline">Sign In</a>
        <a href="auth.html" class="btn btn-primary">Get Started</a>
      `;
    }
  }

  // Handle Logout buttons manually if placed globally
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => DB.logout());
  });
});
