
/* ==========================================
   SARATHI CODE HUB
   Main JavaScript + Supabase Authentication
========================================== */

// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL = "https://uojfdfaapxnpnyacmmkw.supabase.co";

// Replace this with your actual Supabase publishable key.
const SUPABASE_KEY = "sb_publishable_HNVy1EGXq8r2BkUUB5Us_A_gVoTaYxK";

if (!window.supabase) {
  throw new Error("Supabase library failed to load. Check your internet connection.");
}

if (
  !SUPABASE_URL.startsWith("https://") ||
  SUPABASE_KEY === "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE" ||
  !SUPABASE_KEY
) {
  throw new Error("Please add your Supabase project publishable key in script.js.");
}

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ==========================================
// 2. ELEMENTS
// ==========================================

const $ = id => document.getElementById(id);

const searchInput = $("searchInput");
const filterSelect = $("filterSelect");
const emptyState = $("emptyState");
const toast = $("toast");

const authActions = $("authActions");
const accountArea = $("accountArea");

const loginBtn = $("loginBtn");
const signupBtn = $("signupBtn");
const logoutBtn = $("logoutBtn");
const accountBtn = $("accountBtn");

const authModal = $("authModal");
const authForm = $("authForm");

const usernameInput = $("usernameInput");
const emailInput = $("emailInput");
const passwordInput = $("passwordInput");

const authTitle = $("authTitle");
const authDescription = $("authDescription");
const authSubmit = $("authSubmit");
const authMessage = $("authMessage");
const switchAuth = $("switchAuth");
const closeAuth = $("closeAuth");

const profileModal = $("profileModal");

// ==========================================
// 3. NOTIFICATIONS
// ==========================================

let toastTimer;

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ==========================================
// 4. PROJECT SEARCH AND FILTER
// ==========================================

const projectCards = [
  ...document.querySelectorAll(".project-card")
];

let selectedLanguage = "All";

function filterProjects() {
  const search = searchInput.value.toLowerCase().trim();
  const type = filterSelect.value;

  let visible = 0;

  projectCards.forEach(card => {
    const matchesLanguage =
      selectedLanguage === "All" ||
      card.dataset.language === selectedLanguage;

    const matchesType =
      type === "All" ||
      card.dataset.type === type;

    const matchesSearch =
      card.innerText.toLowerCase().includes(search);

    const show =
      matchesLanguage && matchesType && matchesSearch;

    card.hidden = !show;

    if (show) visible++;
  });

  emptyState.hidden = visible > 0;
}

searchInput.addEventListener("input", filterProjects);
filterSelect.addEventListener("change", filterProjects);

// ==========================================
// 5. CATEGORY BUTTONS
// ==========================================

document.querySelectorAll(".category-card").forEach(button => {
  button.addEventListener("click", () => {
    selectedLanguage = button.dataset.filter;

    filterProjects();

    $("projects").scrollIntoView({
      behavior: "smooth"
    });

    showToast("Showing " + selectedLanguage + " projects");
  });
});

// ==========================================
// 6. FREE PROJECTS
// ==========================================

$("freeButton").addEventListener("click", () => {
  filterSelect.value = "Free";
  selectedLanguage = "All";
  filterProjects();
});

// ==========================================
// 7. PROJECT DETAILS
// ==========================================

document.querySelectorAll("[data-project]").forEach(button => {
  button.addEventListener("click", () => {
    showToast(
      button.dataset.project + " details will be available soon."
    );
  });
});

// ==========================================
// 8. MOBILE NAVIGATION
// ==========================================

const menuToggle = $("menuToggle");
const navLinks = $("navLinks");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});

// ==========================================
// 9. AUTHENTICATION MODE
// ==========================================

let authMode = "login";

function setAuthMessage(message, type = "") {
  authMessage.textContent = message;
  authMessage.className = type;
}

function clearAuthMessage() {
  setAuthMessage("");
}

function updateAuthForm() {
  const isSignup = authMode === "signup";

  authTitle.textContent = isSignup
    ? "Create your account"
    : "Welcome back!";

  authDescription.textContent = isSignup
    ? "Join SARATHI CODE HUB and start building."
    : "Login to continue your coding journey.";

  usernameInput.hidden = !isSignup;
  usernameInput.required = isSignup;

  usernameInput.autocomplete = isSignup
    ? "username"
    : "off";

  passwordInput.autocomplete = isSignup
    ? "new-password"
    : "current-password";

  authSubmit.textContent = isSignup
    ? "Create Account"
    : "Login";

  switchAuth.textContent = isSignup
    ? "Already have an account? Login"
    : "Don't have an account? Sign Up";
}

function openAuth(mode) {
  authMode = mode;
  authForm.reset();
  clearAuthMessage();
  updateAuthForm();

  authModal.hidden = false;
}

function closeAuthModal() {
  authModal.hidden = true;
  authForm.reset();
  clearAuthMessage();
}

// ==========================================
// 10. OPEN AND CLOSE AUTH MODAL
// ==========================================

loginBtn.addEventListener("click", () => {
  openAuth("login");
});

signupBtn.addEventListener("click", () => {
  openAuth("signup");
});

closeAuth.addEventListener("click", closeAuthModal);

authModal.addEventListener("click", event => {
  if (event.target === authModal) {
    closeAuthModal();
  }
});

switchAuth.addEventListener("click", () => {
  authMode = authMode === "login" ? "signup" : "login";

  authForm.reset();
  clearAuthMessage();
  updateAuthForm();
});

// ==========================================
// 11. SIGN UP AND LOGIN
// ==========================================

authForm.addEventListener("submit", async event => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const username = usernameInput.value.trim();

  if (!email || !password) {
    setAuthMessage("Please enter your email and password.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Password must contain at least 6 characters.", "error");
    return;
  }

  if (authMode === "signup" && !username) {
    setAuthMessage("Please enter your username.", "error");
    return;
  }

  authSubmit.disabled = true;
  authSubmit.textContent = "Please wait...";

  try {
    if (authMode === "signup") {

      // CREATE ACCOUNT

      const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (error) throw error;

      if (data.session) {
        closeAuthModal();
        showToast("Welcome to SARATHI CODE HUB!");
      } else {
        setAuthMessage(
          "Account created! Check your email for the verification link before logging in.",
          "success"
        );
      }

    } else {

      // LOGIN ACCOUNT

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      closeAuthModal();
      showToast("Login successful! Welcome back.");

    }

  } catch (error) {
    console.error("Authentication error:", error);

    setAuthMessage(
      error.message || "Something went wrong. Please try again.",
      "error"
    );

  } finally {
    authSubmit.disabled = false;
    updateAuthForm();
  }
});

// ==========================================
// 12. DISPLAY USER ACCOUNT
// ==========================================

function updateUserInterface(user) {
  if (user) {
    const username =
      user.user_metadata?.username ||
      user.email?.split("@")[0] ||
      "User";

    authActions.hidden = true;
    accountArea.hidden = false;

    $("headerUsername").textContent = username;
    $("avatar").textContent = username.charAt(0).toUpperCase();

    $("profileName").textContent = username;
    $("profileEmail").textContent = user.email || "";
    $("profileAvatar").textContent = username.charAt(0).toUpperCase();

  } else {
    authActions.hidden = false;
    accountArea.hidden = true;
    profileModal.hidden = true;
  }
}

// ==========================================
// 13. PROFILE MODAL
// ==========================================

accountBtn.addEventListener("click", () => {
  profileModal.hidden = false;
});

$("closeProfile").addEventListener("click", () => {
  profileModal.hidden = true;
});

$("profileCloseBtn").addEventListener("click", () => {
  profileModal.hidden = true;
});

profileModal.addEventListener("click", event => {
  if (event.target === profileModal) {
    profileModal.hidden = true;
  }
});

// ==========================================
// 14. LOGOUT
// ==========================================

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) throw error;

    showToast("You have logged out successfully.");

  } catch (error) {
    showToast(error.message || "Logout failed.");
    console.error("Logout error:", error);

  } finally {
    logoutBtn.disabled = false;
  }
});

// ==========================================
// 15. AUTH SESSION
// ==========================================

// Listen for login, logout and session changes.

supabaseClient.auth.onAuthStateChange((event, session) => {
  updateUserInterface(session?.user || null);
});

// Restore existing login session.

async function initializeAuth() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) throw error;

    updateUserInterface(data.session?.user || null);

  } catch (error) {
    console.error("Session loading error:", error);
    showToast("Unable to restore login session.");
  }
}

initializeAuth();

// ==========================================
// 16. INITIAL FILTER
// ==========================================

filterProjects();

console.log("SARATHI CODE HUB loaded successfully.");
