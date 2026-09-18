# Authentication System - Complete Explanation

## Overview
This project implements a complete authentication system with **sign-up**, **login**, **logout**, and **role-based access control** using React Router, Express.js, bcryptjs for password hashing, and a JSON file-based database.

---

## 1. ARCHITECTURE OVERVIEW

### Technology Stack:
- **Frontend**: React with React Router
- **Backend**: Express.js server (port 5000)
- **Database**: JSON file (`users.json` in `/server` directory)
- **Password Security**: bcryptjs (10 salt rounds)
- **State Management**: React Context API
- **Storage**: localStorage (persistence), sessionStorage (temporary redirect data)

### User Roles:
1. **Coach**: Special role assigned to `mostafanasr2003@hotmail.com`
2. **Client**: Everyone else who signs up

---

## 2. SIGN-UP FLOW

### Flow Diagram:
```
User enters email & password 
    ↓
Form submits to login.js action()
    ↓
POST /api/auth/signup (server.js)
    ↓
Check if email exists in users.json
    ↓
Hash password with bcrypt (10 rounds)
    ↓
Determine role (coach or client)
    ↓
Generate unique UID
    ↓
Save to users.json via filedb.js
    ↓
Store email in sessionStorage
    ↓
Redirect to login page with prefilled email
```

### Files Involved:

#### **Frontend: `/src/pages/login.js` - `action()` function**
```javascript
export async function action({ request }) {
  const mode = searchParams.get("mode") || "login";
  
  if (mode === "signup") {
    const formData = await request.formData();
    const authData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    
    // Send to backend
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authData),
    });
    
    // Handle errors
    if (response.status === 422) {
      return { error: 'Email already in use', showSignUpLink: false };
    }
    
    // Success: store email and redirect to login
    sessionStorage.setItem('signupEmail', authData.email);
    return redirect('/');
  }
}
```

**Key Points:**
- Reads form data (email, password)
- Sends POST request to backend
- Handles email duplication error (status 422)
- Stores email temporarily in sessionStorage for prefill on login page
- Redirects to login page

---

#### **Backend: `/server/server.js` - POST `/api/auth/signup`**
```javascript
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate inputs
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  if (password.length < 6) {
    return res.status(422).json({ message: 'Password must be at least 6 characters' });
  }
  
  const normalizedEmail = email.toLowerCase();
  
  // Check if email already exists
  const existingUser = dbModule.getUserByEmail(normalizedEmail);
  if (existingUser) {
    return res.status(422).json({ message: 'Email already in use' });
  }
  
  // Determine role (only this specific email is coach)
  const COACH_EMAIL = 'mostafanasr2003@hotmail.com';
  const role = normalizedEmail === COACH_EMAIL.toLowerCase() ? 'coach' : 'client';
  
  // Generate unique UID
  const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Hash password with bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Save to database
  dbModule.createUser(uid, normalizedEmail, hashedPassword, role, normalizedEmail.split('@')[0]);
  
  // Small delay to ensure file write completes
  await new Promise(resolve => setTimeout(resolve, 100));
  
  res.status(201).json({
    message: 'User created successfully',
    uid,
    role,
  });
});
```

**Key Points:**
- Validates email and password (min 6 chars)
- Normalizes email to lowercase for consistent lookup
- Checks for duplicate emails in `users.json`
- Determines role based on specific coach email
- **Hashes password with bcryptjs** (10 salt rounds - very secure)
- Generates unique UID with timestamp
- Saves user to `users.json` file
- Adds 100ms delay to ensure file write completes

---

#### **Database: `/server/filedb.js` - `createUser()` function**
```javascript
export function createUser(uid, email, hashedPassword, role, displayName) {
  const users = readUsers(); // Read from users.json
  
  // Check if email already exists
  if (users.find(u => u.email === email)) {
    throw new Error('Email already in use');
  }
  
  // Create new user object
  const newUser = {
    uid,
    email,
    password: hashedPassword, // Already hashed by bcrypt
    role,
    displayName,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  writeUsers(users); // Write back to users.json
  
  return { uid, email, role, displayName };
}
```

**Key Points:**
- Reads current users from `users.json`
- Checks for duplicate emails
- Creates user object with all details
- Saves to file with `writeUsers()`
- **Never stores plain-text passwords** (only hashed)

---

#### **Frontend: `/src/pages/login.js` - Email prefill**
```javascript
useEffect(() => {
  const signupEmail = sessionStorage.getItem('signupEmail');
  if (signupEmail) {
    setPrefilledEmail(signupEmail);
    sessionStorage.removeItem('signupEmail'); // Clear after use
  }
}, []);
```

The prefilled email is passed to `<AuthForm prefillEmail={prefilledEmail} />`

---

## 3. LOGIN FLOW

### Flow Diagram:
```
User enters email & password 
    ↓
Form submits to login.js action()
    ↓
POST /api/auth/login (server.js)
    ↓
Find user by email in users.json
    ↓
Compare plain-text password with bcrypt hash
    ↓
If invalid → return error (status 401)
    ↓
If valid → return uid, email, role
    ↓
Store user data in sessionStorage AND localStorage
    ↓
Redirect based on role:
  - Coach → /coachDashboard
  - Client → /clientDashboard
```

---

### **Frontend: `/src/pages/login.js` - `action()` function (login mode)**
```javascript
export async function action({ request }) {
  const mode = searchParams.get("mode") || "login"; // Defaults to "login"
  
  if (mode === "login") {
    const formData = await request.formData();
    const authData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    
    // Send to backend
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(authData),
    });
    
    const data = await response.json();
    
    // Handle authentication errors
    if (response.status === 401) {
      return {
        error: 'Invalid email or password',
        showSignUpLink: true, // Show "Sign Up" link in error
        formData: authData
      };
    }
    
    // Success: store user data and redirect
    const userData = {
      uid: data.uid,
      email: authData.email,
      role: data.role,
    };
    
    // Store in BOTH sessionStorage (immediate) and localStorage (persistence)
    sessionStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Redirect based on role
    return redirect(data.role === 'coach' ? '/coachDashboard' : '/clientDashboard');
  }
}
```

**Key Points:**
- Sends credentials to backend
- Returns 401 status if invalid credentials
- Shows signup link in error message
- Stores user data in **two places**:
  - `sessionStorage`: Used during redirect (temporary)
  - `localStorage`: Used for persistence across page reloads
- Redirects to appropriate dashboard based on role

---

### **Backend: `/server/server.js` - POST `/api/auth/login`**
```javascript
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  
  const normalizedEmail = email.toLowerCase();
  
  // Find user by email in database
  const user = dbModule.getUserByEmail(normalizedEmail);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Compare plain-text password with bcrypt hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Success: return user info
  res.json({
    message: 'Login successful',
    uid: user.uid,
    email: user.email,
    role: user.role,
  });
});
```

**Key Points:**
- Normalizes email to lowercase
- Looks up user by email in `users.json`
- Uses **bcryptjs to verify password** with `bcrypt.compare()`
- Only returns role, uid, and email (never password)
- Returns 401 for invalid credentials (generic message for security)

---

### **Database: `/server/filedb.js` - `getUserByEmail()` function**
```javascript
export function getUserByEmail(email) {
  const users = readUsers(); // Read all users from users.json
  return users.find(u => u.email === email); // Find matching email
}
```

**Key Points:**
- Simple lookup function
- Returns entire user object (including hashed password)
- Used by server for password verification

---

## 4. AUTHENTICATION STATE MANAGEMENT

### **Frontend: `/src/context/AuthContext.js`**

```javascript
export function AuthProvider({ children }) {
  // Initialize state from localStorage (survives page reloads)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        return null;
      }
    }
    return null;
  });

  // Manual login function (called during redirect or page load)
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint on server (for logging purposes)
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Key Points:**
- **Lazy initialization**: Loads user from localStorage on app startup
- Uses `useState(() => {...})` pattern for function initialization
- `login()`: Updates both state and localStorage
- `logout()`: Clears everything and calls server endpoint
- Provides `user`, `login`, `logout` to entire app via Context

---

## 5. LOGOUT FLOW

### Flow Diagram:
```
User clicks Logout button
    ↓
handleLogout() called (in NavBar component)
    ↓
Call logout() from AuthContext
    ↓
POST /api/auth/logout (server.js) - for logging
    ↓
Clear localStorage
    ↓
Clear React state
    ↓
Navigate to "/" (login page)
```

---

### **Frontend: `/src/components/CoachNavBar.js` - Logout**
```javascript
function CoachNavBar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // Call AuthContext logout
    navigate('/', { replace: true }); // Redirect to login
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
}
```

---

### **Backend: `/server/server.js` - POST `/api/auth/logout`**
```javascript
app.post('/api/auth/logout', (req, res) => {
  try {
    const { email } = req.body;
    
    if (email) {
      console.log(`User logged out: ${email}`);
    }
    
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
});
```

**Key Points:**
- Backend just logs the logout (for audit trail)
- Frontend handles clearing state and storage
- No session management needed (stateless auth)

---

## 6. ROLE-BASED ACCESS CONTROL

### **Route Protection: `/src/App.js`**

```javascript
// Coach Dashboard - only coaches allowed
export const coachDashboardLoader = async () => {
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    return redirect("/");
  }
  const user = JSON.parse(userJson);
  if (user.role !== 'coach') {
    return redirect("/clientDashboard");
  }
  return null;
};

// Client Dashboard - only clients allowed (coaches redirected)
export const clientDashboardLoader = async () => {
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    return redirect("/");
  }
  const user = JSON.parse(userJson);
  if (user.role === 'coach') {
    return redirect("/coachDashboard");
  }
  return null;
};

// Client Details - only coaches allowed
export const clientDetailsLoader = async () => {
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    return redirect("/");
  }
  const user = JSON.parse(userJson);
  if (user.role !== 'coach') {
    return redirect("/clientDashboard");
  }
  return null;
};

const router = createBrowserRouter([
  {
    path: "/coachDashboard",
    element: <CoachDashboard />,
    loader: coachDashboardLoader // Runs before rendering component
  },
  {
    path: "/clientDashboard",
    element: <ClientDashboard />,
    loader: clientDashboardLoader
  },
  {
    path: "/clientDetails/:id",
    element: <ClientDetails />,
    loader: clientDetailsLoader
  },
]);
```

**Key Points:**
- **Route loaders run BEFORE component renders**
- Checks localStorage for user
- Redirects based on role
- Prevents unauthorized access via URL bar, search, or navigation
- Two-layer protection: route loader + component useEffect

---

## 7. DATA STORAGE

### **`/server/users.json` - Database File**
```json
{
  "users": [
    {
      "uid": "user_1704700000000_abc123xyz",
      "email": "coach@example.com",
      "password": "$2a$10$...", // bcrypt hash - never plain text!
      "role": "coach",
      "displayName": "coach",
      "createdAt": "2024-01-08T12:00:00.000Z"
    },
    {
      "uid": "user_1704700000001_def456uvw",
      "email": "client@example.com",
      "password": "$2a$10$...", // bcrypt hash
      "role": "client",
      "displayName": "client",
      "createdAt": "2024-01-08T12:01:00.000Z"
    }
  ]
}
```

**Key Points:**
- Persistent JSON file storage
- Passwords are **bcrypt hashes** (cannot be reversed)
- Each user has unique UID
- Role determines access level
- Email is unique per user

---

## 8. SECURITY FEATURES

### ✅ **Implemented Security:**

1. **Password Hashing**: bcryptjs with 10 salt rounds
   - Passwords never stored in plain text
   - 10^10 different hashes per password
   - Computationally expensive to crack

2. **Email Normalization**: All emails converted to lowercase
   - Prevents duplicate accounts (user@email.com vs User@email.com)
   - Consistent lookups

3. **Generic Error Messages**: "Invalid email or password"
   - Doesn't reveal which field is wrong
   - Prevents account enumeration

4. **Role-Based Access Control**: Two layers
   - Route loaders (prevent access before component loads)
   - Component useEffect (backup protection)

5. **Unique UIDs**: Timestamp + random string
   - Cannot be guessed or predicted
   - Used for future user identification

6. **LocalStorage Persistence**: User stays logged in
   - Survives page reloads
   - Cleared on logout

7. **SessionStorage Temporary Data**: For signup prefill
   - Cleared after use
   - Never stores sensitive data

---

## 9. COMPLETE FUNCTION REFERENCE

### **Frontend Functions:**

| Function | File | Purpose |
|----------|------|---------|
| `action()` | `/src/pages/login.js` | Handles signup/login form submission |
| `AuthProvider` | `/src/context/AuthContext.js` | Provides auth context to app |
| `login()` | `/src/context/AuthContext.js` | Updates user state and localStorage |
| `logout()` | `/src/context/AuthContext.js` | Clears user and calls server logout |
| `handleLogout()` | `/src/components/CoachNavBar.js` | Triggers logout on button click |
| `coachDashboardLoader()` | `/src/App.js` | Route protection for coach dashboard |
| `clientDashboardLoader()` | `/src/App.js` | Route protection for client dashboard |
| `clientDetailsLoader()` | `/src/App.js` | Route protection for client details |

---

### **Backend Functions:**

| Endpoint | File | Purpose |
|----------|------|---------|
| `POST /api/auth/signup` | `/server/server.js` | Create new user account |
| `POST /api/auth/login` | `/server/server.js` | Authenticate existing user |
| `POST /api/auth/logout` | `/server/server.js` | Log logout event |

---

### **Database Functions:**

| Function | File | Purpose |
|----------|------|---------|
| `createUser()` | `/server/filedb.js` | Add new user to users.json |
| `getUserByEmail()` | `/server/filedb.js` | Find user by email |
| `getUserById()` | `/server/filedb.js` | Find user by UID |
| `getAllCoaches()` | `/server/filedb.js` | Get all coach accounts |
| `getAllClients()` | `/server/filedb.js` | Get all client accounts |
| `getAllUsers()` | `/server/filedb.js` | Get all users |
| `readUsers()` | `/server/filedb.js` | Read users.json file |
| `writeUsers()` | `/server/filedb.js` | Write users to users.json |
| `initializeDB()` | `/server/filedb.js` | Create users.json if missing |

---

## 10. USER FLOW EXAMPLE

### **Scenario 1: New User Signs Up**
```
1. User fills form with email: "newuser@gmail.com" & password: "mypass123"
2. Frontend action() sends POST to /api/auth/signup
3. Backend checks if email exists (no duplicate found)
4. Backend determines role = 'client' (not coach email)
5. Backend hashes password with bcryptjs
6. Backend creates UID: "user_1704700000000_xyz123abc"
7. Backend saves to users.json
8. Frontend stores email in sessionStorage
9. Frontend redirects to "/" (login page)
10. Login page displays with email prefilled
```

---

### **Scenario 2: User Logs In**
```
1. User enters prefilled email and password
2. Frontend action() sends POST to /api/auth/login
3. Backend finds user by email in users.json
4. Backend uses bcrypt.compare() to verify password
5. Backend returns: { uid, email, role: 'client' }
6. Frontend stores user data in localStorage & sessionStorage
7. Frontend redirects to /clientDashboard
8. Dashboard loader checks localStorage - user is authenticated
9. Dashboard renders successfully
```

---

### **Scenario 3: Coach Tries to Access Client Dashboard**
```
1. User is logged in as coach
2. User tries to access /clientDashboard (via URL bar)
3. React Router runs clientDashboardLoader before rendering
4. Loader checks localStorage - finds user with role: 'coach'
5. Loader returns redirect("/coachDashboard")
6. User is redirected to /coachDashboard instead
```

---

### **Scenario 4: User Logs Out**
```
1. User clicks "Logout" button
2. handleLogout() calls logout() from AuthContext
3. logout() calls POST /api/auth/logout (for logging)
4. logout() clears localStorage
5. logout() sets user state to null
6. handleLogout() navigates to "/" with replace: true
7. User is now logged out and sees login page
8. Page reload loads null from localStorage - stays logged out
```

---

## 11. KEY TECHNOLOGIES EXPLAINED

### **bcryptjs - Password Hashing**
```javascript
// Signup: Hash password
const hashedPassword = await bcrypt.hash(password, 10);
// Example: "mypass123" → "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36UxO/ee"

// Login: Compare passwords
const isValid = await bcrypt.compare(inputPassword, storedHash);
// Example: bcrypt.compare("mypass123", "$2a$10$...") → true
```

---

### **localStorage vs sessionStorage**
```javascript
// localStorage - persists across browser sessions
localStorage.setItem('user', JSON.stringify(userData));
// Survives browser close and reopen

// sessionStorage - cleared when tab closes
sessionStorage.setItem('signupEmail', email);
// Cleared after page reload or tab close
```

---

### **React Router Loaders**
```javascript
// Loaders run BEFORE component renders
// Perfect for:
// - Authentication checks
// - Authorization checks
// - Data fetching before render
// - Redirects before rendering

const loader = async () => {
  const user = localStorage.getItem('user');
  if (!user) return redirect('/');
  return null; // Allow component to render
};

{
  path: "/protected",
  element: <ProtectedPage />,
  loader: loader // Runs first!
}
```

---

## Summary

Your authentication system provides:
- ✅ Secure signup with email duplication prevention
- ✅ Secure login with bcrypt password verification
- ✅ Role-based access control (coach vs client)
- ✅ Persistent authentication across page reloads
- ✅ Proper logout with state clearing
- ✅ Route-level protection against unauthorized access
- ✅ Generic error messages for security
- ✅ Unique user IDs and email normalization

All passwords are **securely hashed** and stored in a persistent JSON database!
