document.addEventListener('DOMContentLoaded', () => {
    // --- Global State Variables ---
    let isLoggedIn = false;
    let loggedInUsername = ''; // To store the username of the logged-in user
    let playerPoints = parseInt(localStorage.getItem('policeRPPoints') || '0');
    let peopleData = JSON.parse(localStorage.getItem('policeRPPeopleData')) || {};

    // Initialize users data: 'itex' is the admin, others are regular officers
    // Structure: { username: { password: "hashed_or_plain_for_demo", role: "admin" | "officer" }}
    let users = JSON.parse(localStorage.getItem('policeRPUsers')) || {
        'itex': { password: '7777', role: 'admin' } // 'إيتكس الذيب' account
    };
    // Save initial admin user if it's a new setup
    if (!localStorage.getItem('policeRPUsers')) {
        localStorage.setItem('policeRPUsers', JSON.stringify(users));
    }


    // --- DOM Elements ---
    const pageSections = document.querySelectorAll('.page-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const loginNavBtn = document.getElementById('loginNavBtn');
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    const playerPointsDisplay = document.getElementById('playerPoints');
    const addPersonBtn = document.getElementById('addPersonBtn'); // For adding people to MDT
    const newPersonOverlay = document.getElementById('newPersonOverlay');
    const createPersonBtn = document.getElementById('createPersonBtn');
    const cancelPersonBtn = document.getElementById('cancelPersonBtn');
    const searchInput = document.getElementById('searchInput');
    const profileDetails = document.getElementById('profileDetails');
    const noProfileFoundMessage = document.getElementById('noProfileFound');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginMessage = document.getElementById('loginMessage');

    // New elements for Admin Panel
    const adminPanelNavBtn = document.getElementById('adminPanelNavBtn');
    const adminPanelSection = document.getElementById('admin-panel');
    const addUserOverlay = document.getElementById('addUserOverlay');
    const createUserBtn = document.getElementById('createUserBtn');
    const cancelCreateUserBtn = document.getElementById('cancelCreateUserBtn');
    const newUsernameInput = document.getElementById('newUsernameInput');
    const newUserPasswordInput = document.getElementById('newUserPasswordInput');
    const userListDiv = document.getElementById('userList');
    const addUserBtn = document.getElementById('addUserBtn'); // Button inside admin panel to open add user form

    // --- Helper Functions ---
    function updatePointsDisplay() {
        playerPointsDisplay.textContent = `Points: ${playerPoints}`;
        localStorage.setItem('policeRPPoints', playerPoints);
    }

    function savePeopleData() {
        localStorage.setItem('policeRPPeopleData', JSON.stringify(peopleData));
    }

    function saveUsersData() {
        localStorage.setItem('policeRPUsers', JSON.stringify(users));
    }

    function showSection(targetId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');

        // Update active nav button
        navButtons.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.add('active-nav');
            } else {
                btn.classList.remove('active-nav');
            }
        });

        // Handle MDT specific UI
        if (targetId === 'mdt-system' && isLoggedIn) {
            addPersonBtn.style.display = 'block';
            searchInput.value = ''; // Clear search on section change
            profileDetails.innerHTML = ''; // Clear profile on section change
            noProfileFoundMessage.style.display = 'block'; // Show "no profile found"
        } else {
            addPersonBtn.style.display = 'none';
        }

        // Handle Admin Panel specific UI
        if (targetId === 'admin-panel' && isLoggedIn && users[loggedInUsername]?.role === 'admin') {
            renderUserList();
        }
    }

    function updateLoginUI() {
        if (isLoggedIn) {
            loginNavBtn.style.display = 'none';
            logoutNavBtn.style.display = 'inline-block';
            playerPointsDisplay.style.display = 'block';
            updatePointsDisplay();

            // Show Admin Panel button only for admin
            if (users[loggedInUsername]?.role === 'admin') {
                adminPanelNavBtn.style.display = 'inline-block';
            } else {
                adminPanelNavBtn.style.display = 'none';
            }

            showSection('mdt-system'); // Go to MDT on successful login
        } else {
            loggedInUsername = ''; // Clear logged in user
            loginNavBtn.style.display = 'inline-block';
            logoutNavBtn.style.display = 'none';
            playerPointsDisplay.style.display = 'none';
            adminPanelNavBtn.style.display = 'none'; // Hide admin panel button on logout
            showSection('login'); // Go to login on logout/initial load
        }
    }

    // Function to render the list of users in the Admin Panel
    function renderUserList() {
        userListDiv.innerHTML = '';
        let hasUsers = false;
        for (const userKey in users) {
            hasUsers = true;
            const user = users[userKey];
            const userDiv = document.createElement('div');
            userDiv.classList.add('user-item');
            userDiv.innerHTML = `
                <span>Username: <strong>${userKey}</strong> (Role: ${user.role})</span>
                <button class="btn delete-user-btn" data-username="${userKey}">Delete</button>
            `;
            // Disable delete for the admin itself
            if (userKey === 'itex') { // Assuming 'itex' is the primary admin
                 userDiv.querySelector('.delete-user-btn').disabled = true;
                 userDiv.querySelector('.delete-user-btn').textContent = 'Cannot Delete Admin';
                 userDiv.querySelector('.delete-user-btn').style.backgroundColor = '#555';
            }
            userListDiv.appendChild(userDiv);
        }

        if (!hasUsers) {
            userListDiv.innerHTML = '<p class="no-records">No users in the system yet. Add one!</p>';
        }

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-user-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const usernameToDelete = e.target.dataset.username;
                if (confirm(`Are you sure you want to delete user '${usernameToDelete}'?`)) {
                    delete users[usernameToDelete];
                    saveUsersData();
                    renderUserList(); // Re-render the list
                    alert(`User '${usernameToDelete}' deleted.`);
                }
            });
        });
    }


    // --- Event Listeners ---
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            if (target === 'logout') {
                isLoggedIn = false;
                loggedInUsername = '';
                alert('You have logged out.');
                updateLoginUI();
            } else if (target === 'mdt-system' && !isLoggedIn) {
                alert('Please login to access the MDT System.');
                showSection('login');
            } else if (target === 'admin-panel' && (users[loggedInUsername]?.role !== 'admin' || !isLoggedIn)) {
                alert('You do not have administrative privileges to access this panel.');
                showSection('home'); // Or current section
            }
             else {
                showSection(target);
            }
        });
    });

    loginBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (users[username] && users[username].password === password) {
            isLoggedIn = true;
            loggedInUsername = username;
            playerPoints += 5; // Add 5 points on login
            loginMessage.textContent = 'Login successful!';
            usernameInput.value = '';
            passwordInput.value = '';
            updateLoginUI();
        } else {
            loginMessage.textContent = 'Invalid username or password.';
        }
    });

    // Add Person to MDT (Civilian/Citizen)
    addPersonBtn.addEventListener('click', () => {
        newPersonOverlay.style.display = 'flex';
        // Clear form fields
        document.getElementById('personName').value = '';
        document.getElementById('personID').value = '';
        document.getElementById('personImage').value = '';
        document.getElementById('personAge').value = '';
        document.getElementById('personPhone').value = '';
    });

    cancelPersonBtn.addEventListener('click', () => {
        newPersonOverlay.style.display = 'none';
    });

    createPersonBtn.addEventListener('click', () => {
        const name = document.getElementById('personName').value.trim();
        const id = document.getElementById('personID').value.trim();
        const image = document.getElementById('personImage').value.trim();
        const age = document.getElementById('personAge').value.trim();
        const phone = document.getElementById('personPhone').value.trim();

        if (name && id) {
            if (peopleData[id]) {
                alert('Person with this ID already exists!');
                return;
            }
            peopleData[id] = {
                name: name,
                id: id,
                image: image || 'https://via.placeholder.com/120/333333/FFFFFF?text=No+Image', // Default image
                age: age || 'N/A',
                phone: phone || 'N/A',
                charges: [],
                violations: [],
                assets: []
            };
            savePeopleData();
            alert(`Person '${name}' with ID '${id}' added to the system!`);
            newPersonOverlay.style.display = 'none';
            // Optionally, display the newly created profile
            searchInput.value = name; // Auto-fill search
            searchAndDisplayProfile();
        } else {
            alert('Name and ID are required!');
        }
    });

    searchInput.addEventListener('input', searchAndDisplayProfile);


    // --- Admin Panel User Management Logic ---
    if (addUserBtn) { // Check if the button exists before adding listener
        addUserBtn.addEventListener('click', () => {
            addUserOverlay.style.display = 'flex';
            newUsernameInput.value = '';
            newUserPasswordInput.value = '';
        });
    }

    if (cancelCreateUserBtn) { // Check if the button exists
        cancelCreateUserBtn.addEventListener('click', () => {
            addUserOverlay.style.display = 'none';
        });
    }

    if (createUserBtn) { // Check if the button exists
        createUserBtn.addEventListener('click', () => {
            const newUsername = newUsernameInput.value.trim();
            const newUserPassword = newUserPasswordInput.value.trim();

            if (newUsername && newUserPassword) {
                if (users[newUsername]) {
                    alert('Username already exists. Please choose a different one.');
                    return;
                }
                users[newUsername] = {
                    password: newUserPassword,
                    role: 'officer' // New accounts are regular officers by default
                };
                saveUsersData();
                alert(`User '${newUsername}' created successfully!`);
                addUserOverlay.style.display = 'none';
                renderUserList(); // Update the list of users
            } else {
                alert('Username and password are required!');
            }
        });
    }


    // --- MDT Profile Display & Edit Logic ---
    function searchAndDisplayProfile() {
        const searchTerm = searchInput.value.toLowerCase();
        profileDetails.innerHTML = ''; // Clear previous profile
        noProfileFoundMessage.style.display = 'none'; // Hide default message

        let foundPerson = null;
        for (const id in peopleData) {
            if (peopleData[id].name.toLowerCase().includes(searchTerm) || id.toLowerCase().includes(searchTerm)) {
                foundPerson = peopleData[id];
                break;
            }
        }

        if (foundPerson) {
            displayPersonProfile(foundPerson);
        } else {
            noProfileFoundMessage.style.display = 'block'; // Show message if not found
        }
    }

    function displayPersonProfile(person) {
        profileDetails.innerHTML = `
            <div class="profile-card">
                <img src="${person.image}" alt="${person.name}">
                <h3>${person.name}</h3>
                <div class="profile-info">
                    <p><strong>ID:</strong> <span>${person.id}</span></p>
                    <p><strong>Age:</strong> <span>${person.age}</span></p>
                    <p><strong>Phone:</strong> <span>${person.phone}</span></p>
                </div>

                <h4 class="profile-section-title">Charges</h4>
                <div id="chargesList">
                    ${person.charges.length > 0 ? person.charges.map((c, i) => `<div class="record-item"><strong>Charge ${i+1}:</strong> ${c} <button class="btn delete-record-btn" data-type="charge" data-index="${i}">Delete</button></div>`).join('') : '<p class="no-records">No charges on record.</p>'}
                </div>
                <div class="add-item-form">
                    <input type="text" id="newChargeInput" placeholder="Add new charge">
                    <button class="btn add-record-btn" data-type="charge">Add Charge</button>
                </div>

                <h4 class="profile-section-title">Violations</h4>
                <div id="violationsList">
                    ${person.violations.length > 0 ? person.violations.map((v, i) => `<div class="record-item"><strong>Violation ${i+1}:</strong> ${v} <button class="btn delete-record-btn" data-type="violation" data-index="${i}">Delete</button></div>`).join('') : '<p class="no-records">No violations on record.</p>'}
                </div>
                <div class="add-item-form">
                    <input type="text" id="newViolationInput" placeholder="Add new violation">
                    <button class="btn add-record-btn" data-type="violation">Add Violation</button>
                </div>

                <h4 class="profile-section-title">Assets</h4>
                <div id="assetsList">
                    ${person.assets.length > 0 ? person.assets.map((a, i) => `<div class="record-item"><strong>Asset ${i+1}:</strong> ${a} <button class="btn delete-record-btn" data-type="asset" data-index="${i}">Delete</button></div>`).join('') : '<p class="no-records">No assets on record.</p>'}
                </div>
                <div class="add-item-form">
                    <input type="text" id="newAssetInput" placeholder="Add new asset">
                    <button class="btn add-record-btn" data-type="asset">Add Asset</button>
                </div>
            </div>
        `;

        // Add event listeners for new buttons created above
        document.querySelectorAll('.add-record-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                let inputElement;
                if (type === 'charge') inputElement = document.getElementById('newChargeInput');
                else if (type === 'violation') inputElement = document.getElementById('newViolationInput');
                else if (type === 'asset') inputElement = document.getElementById('newAssetInput');

                const value = inputElement.value.trim();
                if (value) {
                    peopleData[person.id][`${type}s`].push(value);
                    savePeopleData();
                    displayPersonProfile(peopleData[person.id]); // Re-render profile to show new item
                }
            });
        });

        document.querySelectorAll('.delete-record-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                const index = parseInt(e.target.dataset.index);
                if (confirm(`Are you sure you want to delete this ${type}?`)) {
                    peopleData[person.id][`${type}s`].splice(index, 1);
                    savePeopleData();
                    displayPersonProfile(peopleData[person.id]); // Re-render profile
                }
            });
        });
    }

    // --- Initial Load ---
    updateLoginUI(); // Check login status and update UI on page load
});
