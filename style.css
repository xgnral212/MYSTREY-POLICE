/* Custom font: Cairo from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');

:root {
    --primary-bg: #2c2c2c; /* Dark grey background */
    --secondary-bg: #3a3a3a; /* Slightly lighter dark grey */
    --header-bg: #4a4a4a;   /* Darker grey for header */
    --accent-color: #FFD700; /* Gold/Light Yellow accent */
    --success-color: #8BC34A; /* Green for success/add */
    --warning-color: #FFC107; /* Amber for warnings */
    --danger-color: #F44336; /* Red for danger/delete */
    --text-light: #f0f0f0; /* Light text color */
    --text-dark: #333;   /* Dark text color (for white backgrounds) */
    --border-color: #555555; /* Border color */
    --input-bg: #444444; /* Input field background */
}

body {
    font-family: 'Cairo', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--primary-bg);
    color: var(--text-light);
    direction: rtl; /* Right-to-left direction for Arabic */
    text-align: right; /* Align text to the right for RTL */
    line-height: 1.6;
    overflow-y: scroll; /* Always show scrollbar to prevent layout shifts */
}

.container {
    max-width: 1400px;
    margin: 20px auto;
    background-color: var(--secondary-bg);
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 40px);
}

/* Header Styles */
header {
    background-color: var(--header-bg);
    padding: 15px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap; /* Allow wrapping on smaller screens */
    gap: 15px; /* Space between items */
}

.logo {
    font-size: 32px;
    font-weight: 700;
    color: var(--accent-color);
    flex-shrink: 0; /* Prevent shrinking */
}

nav {
    display: flex;
    flex-wrap: wrap;
    gap: 10px; /* Space between nav buttons */
    justify-content: flex-end; /* Align to right for RTL */
    flex-grow: 1; /* Allow nav to take available space */
}

.nav-btn {
    background: none;
    border: none;
    color: var(--text-light);
    font-family: 'Cairo', sans-serif;
    font-size: 17px;
    padding: 10px 18px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.2s ease;
    border-radius: 8px;
    white-space: nowrap; /* Prevent text wrapping */
}

.nav-btn:hover,
.nav-btn.active-nav {
    background-color: var(--accent-color);
    color: var(--text-dark); /* Dark text on yellow background */
    transform: translateY(-2px);
}

.user-info {
    font-size: 18px;
    font-weight: 700;
    color: var(--success-color);
    white-space: nowrap;
    flex-shrink: 0;
}

/* Page Sections */
.page-section {
    padding: 40px 30px;
    flex-grow: 1;
    display: none; /* Hidden by default */
}

.page-section.active {
    display: block; /* Show active section */
}

h2 {
    color: var(--accent-color);
    margin-bottom: 30px;
    text-align: center;
    font-size: 32px;
}

h3 {
    color: var(--success-color);
    margin-top: 30px;
    margin-bottom: 20px;
    font-size: 24px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
}

h4 {
    color: var(--warning-color);
    margin-top: 25px;
    margin-bottom: 15px;
    font-size: 20px;
}

/* Form Styles */
.form-group {
    margin-bottom: 25px;
    text-align: right;
}

.form-group label {
    display: block;
    margin-bottom: 10px;
    font-size: 18px;
    color: var(--text-light);
    font-weight: 700;
}

.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="url"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 14px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background-color: var(--input-bg);
    color: var(--text-light);
    font-family: 'Cairo', sans-serif;
    font-size: 16px;
    box-sizing: border-box; /* Include padding in width */
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
    border-color: var(--accent-color);
    outline: none;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.4); /* Yellow shadow */
}

.btn {
    border: none;
    padding: 12px 28px;
    font-size: 18px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    display: inline-block;
    margin-left: 15px; /* Spacing for RTL buttons */
    font-family: 'Cairo', sans-serif;
    font-weight: 700;
}

.btn:last-child {
    margin-left: 0;
}

.btn.primary-btn {
    background-color: var(--accent-color);
    color: var(--text-dark); /* Dark text on yellow button */
}

.btn.primary-btn:hover {
    background-color: #FFEA00; /* Lighter yellow on hover */
    transform: translateY(-2px);
}

.btn.secondary-btn {
    background-color: #6a6a6a; /* Darker grey for secondary */
    color: #fff;
}

.btn.secondary-btn:hover {
    background-color: #8a8a8a;
    transform: translateY(-2px);
}

.btn.success-btn {
    background-color: var(--success-color);
    color: #fff;
}

.btn.success-btn:hover {
    background-color: #A5D6A7;
    transform: translateY(-2px);
}

.btn.danger-btn {
    background-color: var(--danger-color);
    color: #fff;
}

.btn.danger-btn:hover {
    background-color: #E57373;
    transform: translateY(-2px);
}

.btn.warning-btn {
    background-color: var(--warning-color);
    color: var(--text-dark); /* Dark text on amber button */
}

.btn.warning-btn:hover {
    background-color: #FFEB3B;
    transform: translateY(-2px);
}

.section-actions {
    margin-top: 20px;
    margin-bottom: 30px;
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: flex-end; /* Align to right for RTL */
}

/* Messages */
.message {
    margin-top: 15px;
    font-size: 16px;
    text-align: center;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 700;
}

.message.error-message {
    color: var(--danger-color);
    background-color: rgba(244, 67, 54, 0.2);
    border: 1px solid var(--danger-color);
}

.message.success-message {
    color: var(--success-color);
    background-color: rgba(139, 195, 74, 0.2);
    border: 1px solid var(--success-color);
}

.message.info-message {
    color: var(--warning-color);
    background-color: rgba(255, 193, 7, 0.2);
    border: 1px solid var(--warning-color);
}

hr {
    border: 0;
    height: 1px;
    background-color: var(--border-color);
    margin: 40px 0;
}

.small-text {
    font-size: 14px;
    color: #aaa;
    margin-top: 10px;
    text-align: center;
}

/* Login/Auth specific styles */
.auth-form {
    background-color: var(--primary-bg);
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
    width: 500px;
    max-width: 90%;
    margin: 30px auto; /* Center the form */
    text-align: right;
}
.auth-form .btn {
    width: auto; /* Buttons inside form will auto size based on content */
    margin-top: 20px;
}
.auth-form h3 {
    text-align: center;
    color: var(--accent-color);
    font-size: 28px;
    margin-bottom: 30px;
}

/* MDT System Specific Styles */
.mdt-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    justify-content: flex-end; /* Align to right for RTL */
    flex-wrap: wrap;
}

.mdt-header input[type="text"] {
    flex-grow: 1; /* Allow search input to take available space */
}

.citizen-details {
    background-color: var(--primary-bg);
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    margin-top: 20px;
    border-right: 5px solid var(--accent-color); /* Accent border */
    display: none; /* Hidden by default */
}

.profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px dashed var(--border-color);
}

.profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-left: 25px; /* Adjust for RTL */
    border: 4px solid var(--success-color);
    box-shadow: 0 0 15px rgba(139, 195, 74, 0.3);
}

.profile-info h3 {
    margin: 0;
    color: var(--accent-color);
    font-size: 28px;
    border: none;
    padding: 0;
}

.profile-info p {
    margin: 8px 0;
    color: var(--text-light);
    font-size: 17px;
}

.profile-actions {
    margin-top: 30px;
    border-top: 1px solid var(--border-color);
    padding-top: 25px;
    text-align: right; /* Align buttons to the right for RTL */
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: flex-end;
}

.records-section {
    margin-top: 40px;
}

.records-list .record-item {
    background-color: var(--input-bg);
    padding: 18px;
    border-radius: 10px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    border-right: 6px solid; /* For color coding */
}

.record-item.charge {
    border-color: var(--danger-color);
}

.record-item.asset {
    border-color: var(--success-color);
}

.record-info {
    flex-grow: 1;
}

.record-info p {
    margin: 5px 0;
    font-size: 16px;
    color: var(--text-light);
}

.record-info strong {
    color: #fff;
    font-weight: 700;
}

.record-actions {
    display: flex;
    gap: 10px;
    margin-right: 20px; /* Adjust for RTL */
    flex-shrink: 0;
}

/* Overlay Styles (Popups) */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    display: none; /* Hidden by default */
    padding: 20px;
    box-sizing: border-box;
}

.overlay-content {
    background-color: var(--secondary-bg);
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
    width: 600px;
    max-width: 95%;
    text-align: right;
    max-height: 90vh; /* Limit height for scrollability */
    overflow-y: auto; /* Enable scrolling for long forms */
    position: relative; /* For the close button if added */
}

.overlay-content h3 {
    color: var(--accent-color);
    margin-bottom: 35px;
    text-align: center;
    font-size: 30px;
    border: none;
    padding: 0;
}

.overlay-content .btn {
    width: auto;
    margin-top: 25px;
    margin-left: 15px;
}

/* Officer & User Lists (General Styles for lists of people/users) */
.officer-list, .case-list, .ranks-list {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.officer-item, .case-item, .rank-item {
    background-color: var(--input-bg);
    padding: 15px 20px;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    border-right: 5px solid var(--success-color); /* Default border */
}
.officer-item.offline {
    border-right-color: var(--danger-color); /* Red for offline */
}

.case-item {
    border-right-color: var(--warning-color);
}
.case-item.completed {
    border-right-color: var(--success-color);
}
.case-item.failed {
    border-right-color: var(--danger-color);
}

.item-info {
    flex-grow: 1;
}

.item-info p {
    margin: 5px 0;
    font-size: 16px;
    color: var(--text-light);
}

.item-info strong {
    color: #fff;
}

.item-actions {
    display: flex;
    gap: 10px;
    margin-left: 20px; /* Adjust for RTL */
    flex-shrink: 0;
}

/* Specific styles for Ranks & Points */
.my-rank-points {
    background-color: var(--primary-bg);
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    border-right: 5px solid var(--accent-color);
    margin-top: 20px;
    text-align: center;
}

.my-rank-points p {
    font-size: 18px;
    margin: 10px 0;
}

.my-rank-points h3 {
    border: none;
    padding: 0;
    margin-bottom: 20px;
    font-size: 26px;
    color: var(--success-color);
}

.ranks-list p {
    background-color: var(--input-bg);
    padding: 12px 18px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 17px;
    border-right: 4px solid var(--primary-bg); /* Subtle border */
}

/* Ops Center display */
#opCenterDisplay {
    background-color: var(--primary-bg);
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    border-right: 5px solid var(--warning-color);
    margin-bottom: 30px;
    text-align: center;
}

#opCenterDisplay p {
    font-size: 20px;
    margin: 10px 0;
}

#opCenterDisplay strong {
    color: #fff;
}

/* Announcement Bar */
.announcement-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: var(--warning-color);
    color: var(--text-dark);
    text-align: center;
    padding: 10px 20px;
    font-size: 20px;
    font-weight: 700;
    z-index: 1001; /* Above overlays if needed */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    display: none; /* Hidden by default */
    animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
}

/* Responsive Adjustments */
@media (max-width: 992px) {
    header {
        flex-direction: column;
        align-items: flex-end; /* Align header items to the right in RTL */
    }
    nav {
        width: 100%;
        justify-content: flex-end; /* Ensure buttons stay right-aligned */
        margin-top: 15px;
    }
    .user-info {
        margin-top: 15px;
        width: 100%;
        text-align: right;
    }
    .mdt-header {
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
    }
    .mdt-header input {
        width: 100%;
    }
    .citizen-details {
        padding: 20px;
    }
    .profile-header {
        flex-direction: column;
        align-items: flex-end;
        text-align: right;
    }
    .profile-image {
        margin-left: 0;
        margin-bottom: 20px;
    }
    .profile-actions, .section-actions {
        justify-content: flex-end;
    }
    .record-item, .officer-item, .case-item, .rank-item {
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
        text-align: right;
    }
    .record-actions, .item-actions {
        width: 100%;
        justify-content: flex-end;
        margin-right: 0;
    }
}

@media (max-width: 576px) {
    .container {
        margin: 10px auto;
        border-radius: 0;
    }
    header {
        padding: 10px 15px;
    }
    .logo {
        font-size: 26px;
    }
    .nav-btn {
        padding: 8px 12px;
        font-size: 15px;
    }
    .page-section {
        padding: 20px 15px;
    }
    .auth-form, .overlay-content {
        padding: 25px;
        width: 100%;
        border-radius: 0;
    }
    .btn {
        padding: 10px 20px;
        font-size: 16px;
        margin-left: 10px;
    }
}
