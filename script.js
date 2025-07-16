// --- Firebase SDK Imports ---
// استيراد الدوال الأساسية من مكتبات Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, setDoc, getDoc, arrayUnion, arrayRemove, orderBy } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
// Storage for images (optional for now, but good to have)
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";


// --- Your Web App's Firebase Configuration ---
// هذا هو كود إعداد مشروعك الخاص في Firebase الذي قدمته.
// تأكد أن هذه القيم هي نفسها الموجودة في لوحة تحكم Firebase Console لمشروعك.
const firebaseConfig = {
  apiKey: "AIzaSyAvvgL7711HOC1IHVqyNiNC7N3HIqP2JMo",
  authDomain: "policerp-a71c8.firebaseapp.com",
  projectId: "policerp-a71c8",
  storageBucket: "policerp-a71c8.firebasestorage.app",
  messagingSenderId: "569720054342",
  appId: "1:569720054342:web:8425b4229d906a1d9ca047"
};


// --- Initialize Firebase Services ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);      // خدمة قاعدة بيانات Firestore
const auth = getAuth(app);        // خدمة المصادقة
const storage = getStorage(app);    // خدمة التخزين

// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- Global State Variables ---
    // المتغيرات العامة التي تتبع حالة التطبيق
    let isLoggedIn = false;         // حالة تسجيل الدخول
    let loggedInUser = null;        // معلومات المستخدم المسجل دخوله (UID, اسم المستخدم, الدور/الرتبة)
    let currentPersonFirestoreId = null; // معرف وثيقة المواطن الحالي المعروض في MDT
    let editingRecordData = null;   // بيانات السجل الذي يتم تعديله حالياً
    let editingCaseData = null;     // بيانات الحالة التي يتم تعديله حالياً
    let policeBudget = 0;           // ميزانية الشرطة، سيتم تحميلها من Firebase

    // تعريف الرتب وتسلسلها الهرمي والنقاط المطلوبة لكل رتبة للترقية
    // هذا سيساعد في إدارة الرتب والنقاط
    const ranks = {
        'جندي': { order: 1, pointsNeeded: 0, type: 'عسكري' },
        'جندي أول': { order: 2, pointsNeeded: 500, type: 'عسكري' },
        'عريف': { order: 3, pointsNeeded: 1000, type: 'عسكري' },
        'وكيل رقيب': { order: 4, pointsNeeded: 2000, type: 'عسكري' },
        'رقيب': { order: 5, pointsNeeded: 3500, type: 'عسكري' },
        'رقيب أول': { order: 6, pointsNeeded: 5000, type: 'عسكري' },
        'ملازم': { order: 7, pointsNeeded: 7000, type: 'ضابط' },
        'ملازم أول': { order: 8, pointsNeeded: 9000, type: 'ضابط' },
        'نقيب': { order: 9, pointsNeeded: 12000, type: 'ضابط' },
        'رائد': { order: 10, pointsNeeded: 15000, type: 'ضابط' },
        'مقدم': { order: 11, pointsNeeded: 18000, type: 'ضابط' },
        'عقيد': { order: 12, pointsNeeded: 22000, type: 'ضابط' },
        'عميد': { order: 13, pointsNeeded: 26000, type: 'ضابط' },
        'لواء': { order: 14, pointsNeeded: 30000, type: 'ضابط' },
        'فريق': { order: 15, pointsNeeded: 35000, type: 'قائد' },
        'فريق أول': { order: 16, pointsNeeded: 40000, type: 'قائد' }
    };
    // تحويل الرتب إلى مصفوفة لسهولة الوصول إليها بالترتيب
    const orderedRanks = Object.keys(ranks).sort((a, b) => ranks[a].order - ranks[b].order);


    // --- DOM Elements ---
    // جلب كل العناصر التي سنتفاعل معها من الـ HTML
    const pageSections = document.querySelectorAll('.page-section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const loginNavBtn = document.getElementById('loginNavBtn');
    const logoutNavBtn = document.getElementById('logoutNavBtn');
    const loggedInUsernameDisplay = document.getElementById('loggedInUsername');
    const playerPointsDisplay = document.getElementById('playerPoints');

    // Login/Apply Section
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginMessage = document.getElementById('loginMessage');
    const applyUsernameInput = document.getElementById('applyUsernameInput');
    const applyPasswordInput = document.getElementById('applyPasswordInput');
    const applyReasonInput = document.getElementById('applyReasonInput');
    const applyBtn = document.getElementById('applyBtn');
    const applyMessage = document.getElementById('applyMessage');

    // MDT System Section
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const addCitizenBtn = document.getElementById('addCitizenBtn');
    const noCitizenFound = document.getElementById('noCitizenFound');
    const citizenDetails = document.getElementById('citizenDetails');

    // Overlays (Popups)
    const citizenOverlay = document.getElementById('citizenOverlay');
    const citizenOverlayTitle = document.getElementById('citizenOverlayTitle');
    const citizenIdInput = document.getElementById('citizenIdInput');
    const citizenNameInput = document.getElementById('citizenNameInput');
    const citizenContactInput = document.getElementById('citizenContactInput');
    const citizenImageUrlInput = document.getElementById('citizenImageUrlInput');
    const citizenNotesInput = document.getElementById('citizenNotesInput');
    const saveCitizenBtn = document.getElementById('saveCitizenBtn');
    const cancelCitizenBtn = document.getElementById('cancelCitizenBtn');

    const recordOverlay = document.getElementById('recordOverlay');
    const recordOverlayTitle = document.getElementById('recordOverlayTitle');
    const recordTypeSelect = document.getElementById('recordTypeSelect');
    const recordDescriptionInput = document.getElementById('recordDescriptionInput');
    const recordPointsInput = document.getElementById('recordPointsInput');
    const recordPointsGroup = document.getElementById('recordPointsGroup');
    const recordOfficerInput = document.getElementById('recordOfficerInput');
    const recordDateInput = document.getElementById('recordDateInput');
    const saveRecordBtn = document.getElementById('saveRecordBtn');
    const cancelRecordBtn = document.getElementById('cancelRecordBtn');

    const caseOverlay = document.getElementById('caseOverlay');
    const caseOverlayTitle = document.getElementById('caseOverlayTitle');
    const caseTypeSelect = document.getElementById('caseTypeSelect');
    const caseDescriptionInput = document.getElementById('caseDescriptionInput');
    const caseOfficerInput = document.getElementById('caseOfficerInput');
    const caseDateInput = document.getElementById('caseDateInput');
    const caseStatusSelect = document.getElementById('caseStatusSelect');
    const saveCaseBtn = document.getElementById('saveCaseBtn');
    const cancelCaseBtn = document.getElementById('cancelCaseBtn');

    const announcementOverlay = document.getElementById('announcementOverlay');
    const announcementTextInput = document.getElementById('announcementTextInput');
    const sendAnnouncementBtnConfirm = document.getElementById('sendAnnouncementBtnConfirm');
    const cancelAnnouncementBtn = document.getElementById('cancelAnnouncementBtn');
    const announcementBar = document.getElementById('announcementBar');
    const announcementText = document.getElementById('announcementText');

    const adjustPointsOverlay = document.getElementById('adjustPointsOverlay');
    const adjustPointsOfficerSelect = document.getElementById('adjustPointsOfficerSelect');
    const pointsAmountInput = document.getElementById('pointsAmountInput');
    const confirmAdjustPointsBtn = document.getElementById('confirmAdjustPointsBtn');
    const cancelAdjustPointsBtn = document.getElementById('cancelAdjustPointsBtn');

    const setOpsCenterOverlay = document.getElementById('setOpsCenterOverlay');
    const opsCenterNameInput = document.getElementById('opsCenterNameInput');
    const waveNumberInput = document.getElementById('waveNumberInput');
    const confirmSetOpsCenterBtn = document.getElementById('confirmSetOpsCenterBtn');
    const cancelSetOpsCenterBtn = document.getElementById('cancelSetOpsCenterBtn');

    const promoteDemoteOverlay = document.getElementById('promoteDemoteOverlay');
    const promoteDemoteOfficerSelect = document.getElementById('promoteDemoteOfficerSelect');
    const newRankSelect = document.getElementById('newRankSelect');
    const actionTypeSelect = document.getElementById('actionTypeSelect');
    const confirmPromoteDemoteBtn = document.getElementById('confirmPromoteDemoteBtn');
    const cancelPromoteDemoteBtn = document.getElementById('cancelPromoteDemoteBtn');

    // New Officer Creation Overlay
    const createOfficerOverlay = document.getElementById('createOfficerOverlay');
    const newOfficerUsernameInput = document.getElementById('newOfficerUsernameInput');
    const newOfficerPasswordInput = document.getElementById('newOfficerPasswordInput');
    const newOfficerRankSelect = document.getElementById('newOfficerRankSelect');
    const confirmCreateOfficerBtn = document.getElementById('confirmCreateOfficerBtn');
    const cancelCreateOfficerBtn = document.getElementById('cancelCreateOfficerBtn');


    // Navigation and Panels (لإظهار/إخفاء أزرار القوائم ولوحات التحكم حسب الرتبة)
    const opsCenterNavBtn = document.getElementById('opsCenterNavBtn');
    const casesNavBtn = document.getElementById('casesNavBtn');
    const ranksPointsNavBtn = document.getElementById('ranksPointsNavBtn');
    const adminPanelNavBtn = document.getElementById('adminPanelNavBtn');
    const leaderPanelNavBtn = document.getElementById('leaderPanelNavBtn');

    // Operations Center Section
    const currentOpsCenterDisplay = document.getElementById('currentOpsCenter');
    const currentWaveNumberDisplay = document.getElementById('currentWaveNumber');
    const onlineOfficersList = document.getElementById('onlineOfficersList');
    const toggleWorkStatusBtn = document.getElementById('toggleWorkStatusBtn');
    const opsCenterOfficerActions = document.getElementById('opsCenterOfficerActions'); // زر بدء/إنهاء العمل

    // Cases Section
    const addCaseBtn = document.getElementById('addCaseBtn');
    const casesList = document.getElementById('casesList');

    // Ranks & Points Section
    const myUsernameDisplay = document.getElementById('myUsernameDisplay');
    const myRankDisplay = document.getElementById('myRankDisplay');
    const myPointsDisplay = document.getElementById('myPointsDisplay');
    const allRanksList = document.getElementById('allRanksList');

    // Admin Panel Section
    const approveApplicantsBtn = document.getElementById('approveApplicantsBtn');
    const sendAnnouncementBtn = document.getElementById('sendAnnouncementBtn');
    const adjustPointsBtn = document.getElementById('adjustPointsBtn');
    const applicantsList = document.getElementById('applicantsList');
    const editCitizenSearchInput = document.getElementById('editCitizenSearchInput');
    const performEditCitizenSearchBtn = document.getElementById('performEditCitizenSearchBtn');
    const editCitizenDetailsContainer = document.getElementById('editCitizenDetailsContainer');

    // Leader Panel Section
    const promoteDemoteBtn = document.getElementById('promoteDemoteBtn');
    const setOpsCenterBtn = document.getElementById('setOpsCenterBtn');
    const createOfficerAccountBtn = document.getElementById('createOfficerAccountBtn'); // New button
    const policeBudgetDisplay = document.getElementById('policeBudget');
    const manageOfficersList = document.getElementById('manageOfficersList');


    // --- Configuration for username to email mapping ---
    const EMAIL_DOMAIN = 'police.leader@policemdtsystem.com'; // **غير هذا النطاق إلى ما تفضله!**

    // دالة مساعدة لتنظيف اسم المستخدم ليناسب صيغة البريد الإلكتروني
    // تستبدل المسافات والأحرف غير الصالحة بنقاط
    function sanitizeUsernameForEmail(username) {
        return username.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
    }


    // ----------------------------------------------------
    // Helper Functions (دوال مساعدة عامة)
    // ----------------------------------------------------

    // دالة لإخفاء جميع الأقسام وإظهار القسم المطلوب فقط
    function showSection(targetId) {
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(targetId).classList.add('active');

        // تحديث حالة الأزرار في شريط التنقل
        navButtons.forEach(btn => {
            if (btn.dataset.target === targetId) {
                btn.classList.add('active-nav');
            } else {
                btn.classList.remove('active-nav');
            }
        });

        // منطق خاص لكل قسم عند عرضه
        if (targetId === 'mdt-system' && isLoggedIn) {
            addCitizenBtn.style.display = 'block';
            searchInput.value = '';
            citizenDetails.innerHTML = '';
            noCitizenFound.style.display = 'block';
        } else {
            addCitizenBtn.style.display = 'none';
        }

        if (targetId === 'operations-center' && isLoggedIn) {
            if (loggedInUser.isWorking) {
                toggleWorkStatusBtn.textContent = 'إنهاء العمل كشرطي';
                toggleWorkStatusBtn.classList.remove('primary-btn');
                toggleWorkStatusBtn.classList.add('danger-btn');
            } else {
                toggleWorkStatusBtn.textContent = 'بدء العمل كشرطي';
                toggleWorkStatusBtn.classList.add('primary-btn');
                toggleWorkStatusBtn.classList.remove('danger-btn');
            }
            if (loggedInUser.roleType !== 'مقدم طلب') {
                 opsCenterOfficerActions.style.display = 'flex'; // أظهر زر بدء/إنهاء العمل للعساكر
                 loadOperationsCenterData(); // حمل بيانات مركز العمليات والعساكر المباشرين
            } else {
                opsCenterOfficerActions.style.display = 'none';
            }
           
        } else if (targetId === 'cases' && isLoggedIn) {
            loadCases(); // حمل الحالات عند فتح قسم الحالات
        } else if (targetId === 'ranks-points' && isLoggedIn) {
            updateMyRankAndPointsDisplay(); // تحديث نقاطي ورتبتي
            renderAllRanksList(); // عرض قائمة الرتب والعساكر
        } else if (targetId === 'admin-panel' && isLoggedIn && loggedInUser?.roleType === 'ضابط') {
            loadApplicants(); // تحميل طلبات التقديم
        } else if (targetId === 'leader-panel' && isLoggedIn && loggedInUser?.roleType === 'قائد') {
            loadPoliceBudget(); // تحميل ميزانية الشرطة
            loadOfficersForManagement(); // تحميل قائمة العساكر للإدارة (ترقية/فصل)
        }
    }

    // دالة لتحديث عرض نقاط العسكري واسمه في الهيدر
    function updateHeaderInfo() {
        if (isLoggedIn && loggedInUser) {
            loggedInUsernameDisplay.textContent = `${loggedInUser.username} (${loggedInUser.rank})`;
            playerPointsDisplay.textContent = `النقاط: ${loggedInUser.points || 0}`;
        } else {
            loggedInUsernameDisplay.textContent = '';
            playerPointsDisplay.textContent = 'النقاط: 0';
        }
    }

    // دالة لتحديث واجهة المستخدم بناءً على حالة تسجيل الدخول ودور المستخدم
    async function updateLoginUI() {
        if (isLoggedIn) {
            loginNavBtn.style.display = 'none';
            logoutNavBtn.style.display = 'inline-block';
            loggedInUsernameDisplay.style.display = 'inline';
            playerPointsDisplay.style.display = 'inline';

            // إظهار/إخفاء أزرار القوائم بناءً على نوع رتبة المستخدم
            opsCenterNavBtn.style.display = 'inline-block';
            casesNavBtn.style.display = 'inline-block';
            ranksPointsNavBtn.style.display = 'inline-block';

            if (loggedInUser?.roleType === 'ضابط' || loggedInUser?.roleType === 'قائد') {
                adminPanelNavBtn.style.display = 'inline-block';
            } else {
                adminPanelNavBtn.style.display = 'none';
            }

            if (loggedInUser?.roleType === 'قائد') {
                leaderPanelNavBtn.style.display = 'inline-block';
            } else {
                leaderPanelNavBtn.style.display = 'none';
            }

            // إذا كان مقدم طلب، يذهب لصفحة الرئيسية فقط
            if (loggedInUser.roleType === 'مقدم طلب') {
                 showSection('home');
                 alert('طلبك قيد المراجعة. لا يمكنك الوصول إلى جميع ميزات النظام حالياً.');
            } else {
                 showSection('home'); // يذهب لصفحة الرئيسية كافتراضي بعد تسجيل الدخول
            }
           
        } else {
            // المستخدم غير مسجل دخوله
            loggedInUser = null;
            loginNavBtn.style.display = 'inline-block';
            logoutNavBtn.style.display = 'none';
            loggedInUsernameDisplay.style.display = 'none';
            playerPointsDisplay.style.display = 'none';

            opsCenterNavBtn.style.display = 'none';
            casesNavBtn.style.display = 'none';
            ranksPointsNavBtn.style.display = 'none';
            adminPanelNavBtn.style.display = 'none';
            leaderPanelNavBtn.style.display = 'none';

            showSection('login'); // عرض شاشة تسجيل الدخول
        }
        updateHeaderInfo(); // تحديث معلومات الرأسية (اسم المستخدم والنقاط)
    }

    // دالة لعرض رسالة إعلان علوية تختفي بعد فترة
    function showAnnouncement(message) {
        announcementText.textContent = message;
        announcementBar.style.display = 'block';
        setTimeout(() => {
            announcementBar.style.display = 'none';
        }, 60000); // 1 دقيقة (60 ثانية * 1000 مللي ثانية)
    }


    // ----------------------------------------------------
    // Firebase Data Management Functions (دوال إدارة بيانات Firebase)
    // ----------------------------------------------------

    // دالة لإضافة/تعديل مواطن في Firestore
    async function saveCitizenToFirestore(citizenData, docId = null) {
        try {
            const citizensCollection = collection(db, "citizens");
            let citizenDocRef;

            // التحقق من وجود Citizen ID أو Full Name مكرر (فقط عند الإضافة أو عند تغيير ID في التعديل)
            if (!docId || (docId && citizenData.citizenId !== document.getElementById('citizenIdInput').dataset.originalId)) {
                const qId = query(citizensCollection, where("citizenId", "==", citizenData.citizenId));
                const qName = query(citizensCollection, where("fullName", "==", citizenData.fullName));

                const [idSnapshot, nameSnapshot] = await Promise.all([getDocs(qId), getDocs(qName)]);

                if (!idSnapshot.empty && idSnapshot.docs[0].id !== docId) {
                    alert('رقم الهوية موجود بالفعل. يرجى استخدام رقم هوية فريد.');
                    return null;
                }
                if (!nameSnapshot.empty && nameSnapshot.docs[0].id !== docId) {
                    alert('الاسم الكامل موجود بالفعل. يرجى استخدام اسم فريد.');
                    return null;
                }
            }

            if (docId) {
                // تعديل مواطن موجود
                citizenDocRef = doc(db, "citizens", docId);
                await updateDoc(citizenDocRef, citizenData);
                alert(`تم تحديث ملف المواطن '${citizenData.fullName}' بنجاح!`);
                
            } else {
                // إضافة مواطن جديد
                citizenDocRef = await addDoc(citizensCollection, {
                    ...citizenData,
                    points: 0, // النقاط الأولية للمواطن
                    records: [], // سجلات المواطن
                    createdAt: new Date().toISOString()
                });
                alert(`تمت إضافة المواطن '${citizenData.fullName}' بنجاح!`);
                // زيادة نقاط الشرطي الذي أضاف المواطن
                await updateUserPoints(loggedInUser.uid, 15);
            }
            return citizenDocRef.id;
        } catch (e) {
            console.error("خطأ في حفظ المواطن: ", e);
            alert("فشل في حفظ ملف المواطن. يرجى المحاولة مرة أخرى.");
            return null;
        }
    }

    // دالة للبحث عن مواطن في Firestore
    async function searchCitizenInFirestore(queryText) {
        const citizensCollection = collection(db, "citizens");
        let results = [];

        // بحث برقم الهوية
        const qId = query(citizensCollection, where("citizenId", "==", queryText));
        const idSnapshot = await getDocs(qId);
        idSnapshot.forEach(doc => {
            results.push({ id: doc.id, ...doc.data() });
        });

        // إذا لم يتم العثور على نتائج برقم الهوية، ابحث بالاسم الكامل
        if (results.length === 0) {
            const qName = query(citizensCollection, where("fullName", "==", queryText));
            const nameSnapshot = await getDocs(qName);
            nameSnapshot.forEach(doc => {
                results.push({ id: doc.id, ...doc.data() });
            });
        }
        
        // إذا لم يتم العثور على نتائج بالمطابقة التامة، قم ببحث جزئي (يتطلب قراءة كل المستندات)
        if (results.length === 0 && queryText.length > 2) { // نفذ البحث الجزئي فقط للاستعلامات الأطول
            const allCitizensSnapshot = await getDocs(citizensCollection);
            const lowerCaseQuery = queryText.toLowerCase();
            allCitizensSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.fullName && data.fullName.toLowerCase().includes(lowerCaseQuery)) {
                    results.push({ id: doc.id, ...data });
                }
            });
        }

        return results;
    }

    // دالة لحذف مواطن من Firestore
    async function deleteCitizenFromFirestore(citizenFirestoreId) {
        try {
            await deleteDoc(doc(db, "citizens", citizenFirestoreId));
            alert('تم حذف ملف المواطن بنجاح!');
            // زيادة نقاط الضابط الذي حذف المواطن
            await updateUserPoints(loggedInUser.uid, 10);
            citizenDetails.innerHTML = '';
            noCitizenFound.style.display = 'block';
            return true;
        } catch (e) {
            console.error("خطأ في حذف المواطن: ", e);
            alert("فشل في حذف ملف المواطن. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لإضافة سجل جديد لمواطن
    async function addRecordToCitizen(citizenFirestoreId, recordData) {
        try {
            const citizenDocRef = doc(db, "citizens", citizenFirestoreId);
            await updateDoc(citizenDocRef, {
                records: arrayUnion(recordData)
            });

            // تحديث نقاط المواطن إذا كان السجل "تهمة"
            if (recordData.type === 'charge') {
                const citizenSnap = await getDoc(citizenDocRef);
                const currentCitizenPoints = citizenSnap.data().points || 0;
                await updateDoc(citizenDocRef, { points: currentCitizenPoints + recordData.points });
            }
            // زيادة نقاط الضابط الذي أضاف السجل
            await updateUserPoints(loggedInUser.uid, 5); // 5 نقاط لكل سجل
            alert(`تمت إضافة السجل بنجاح!`);
            return true;
        } catch (e) {
            console.error("خطأ في إضافة السجل: ", e);
            alert("فشل في إضافة السجل. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لتعديل سجل موجود لمواطن
    async function updateRecordForCitizen(citizenFirestoreId, oldRecord, newRecord) {
        try {
            const citizenDocRef = doc(db, "citizens", citizenFirestoreId);
            await updateDoc(citizenDocRef, { records: arrayRemove(oldRecord) });
            await updateDoc(citizenDocRef, { records: arrayUnion(newRecord) });

            // تحديث نقاط المواطن إذا كانت تهمة
            if (newRecord.type === 'charge') {
                const oldPoints = oldRecord.type === 'charge' ? oldRecord.points : 0;
                const newPoints = newRecord.points;
                const pointsChange = newPoints - oldPoints;

                const citizenSnap = await getDoc(citizenDocRef);
                const currentCitizenPoints = citizenSnap.data().points || 0;
                await updateDoc(citizenDocRef, { points: currentCitizenPoints + pointsChange });
            }
            // زيادة نقاط الضابط الذي عدل السجل
            await updateUserPoints(loggedInUser.uid, 2); // 2 نقطة لتعديل سجل
            alert('تم تحديث السجل بنجاح!');
            return true;
        } catch (e) {
            console.error("خطأ في تحديث السجل: ", e);
            alert("فشل في تحديث السجل. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لحذف سجل من مواطن
    async function deleteRecordFromCitizen(citizenFirestoreId, recordToDelete) {
        try {
            const citizenDocRef = doc(db, "citizens", citizenFirestoreId);
            await updateDoc(citizenDocRef, { records: arrayRemove(recordToDelete) });

            // خصم النقاط من المواطن إذا كان السجل "تهمة"
            if (recordToDelete.type === 'charge') {
                const citizenSnap = await getDoc(citizenDocRef);
                const currentCitizenPoints = citizenSnap.data().points || 0;
                await updateDoc(citizenDocRef, { points: currentCitizenPoints - recordToDelete.points });
            }
            // زيادة نقاط الضابط الذي حذف السجل
            await updateUserPoints(loggedInUser.uid, 5); // 5 نقاط لحذف سجل
            alert('تم حذف السجل بنجاح!');
            return true;
        } catch (e) {
            console.error("خطأ في حذف السجل: ", e);
            alert("فشل في حذف السجل. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لإضافة/تحديث حالة ميدانية
    async function saveCaseToFirestore(caseData, caseId = null) {
        try {
            if (caseId) {
                const caseDocRef = doc(db, "cases", caseId);
                await updateDoc(caseDocRef, caseData);
                alert('تم تحديث الحالة بنجاح!');
            } else {
                await addDoc(collection(db, "cases"), {
                    ...caseData,
                    createdAt: new Date().toISOString(),
                    officerUID: loggedInUser.uid // لحفظ UID الضابط الذي أنشأ الحالة
                });
                alert('تمت إضافة الحالة بنجاح!');
                // زيادة نقاط الضابط الذي أنشأ الحالة
                await updateUserPoints(loggedInUser.uid, 8);
            }
            return true;
        }
        catch (e) {
            console.error("خطأ في حفظ الحالة: ", e);
            alert("فشل في حفظ الحالة. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لجلب جميع الحالات
    async function getCasesFromFirestore() {
        try {
            const q = query(collection(db, "cases"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("خطأ في جلب الحالات: ", e);
            return [];
        }
    }

    // دالة لحذف حالة
    async function deleteCaseFromFirestore(caseId) {
        try {
            await deleteDoc(doc(db, "cases", caseId));
            alert('تم حذف الحالة بنجاح!');
            // زيادة نقاط الضابط الذي حذف الحالة
            await updateUserPoints(loggedInUser.uid, 5);
            return true;
        } catch (e) {
            console.error("خطأ في حذف الحالة: ", e);
            alert("فشل في حذف الحالة. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لجلب معلومات مركز العمليات
    async function getOperationsCenterInfo() {
        try {
            const opsDocRef = doc(db, "settings", "operationsCenter");
            const opsSnap = await getDoc(opsDocRef);
            if (opsSnap.exists()) {
                return opsSnap.data();
            }
            return { name: 'غير معين', waveNumber: 'غير محدد' };
        } catch (e) {
            console.error("خطأ في جلب مركز العمليات: ", e);
            return { name: 'غير معين', waveNumber: 'غير محدد' };
        }
    }

    // دالة لتعيين مركز العمليات والموجة
    async function setOperationsCenterInfo(name, waveNumber) {
        try {
            const opsDocRef = doc(db, "settings", "operationsCenter");
            await setDoc(opsDocRef, { name, waveNumber }, { merge: true });
            alert('تم تعيين مركز العمليات والموجة بنجاح!');
            // زيادة نقاط القائد الذي عين مركز العمليات
            await updateUserPoints(loggedInUser.uid, 20);
            return true;
        } catch (e) {
            console.error("خطأ في تعيين مركز العمليات: ", e);
            alert("فشل في تعيين مركز العمليات. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لجلب ميزانية الشرطة
    async function getPoliceBudget() {
        try {
            const budgetDocRef = doc(db, "settings", "policeBudget");
            const budgetSnap = await getDoc(budgetDocRef);
            if (budgetSnap.exists()) {
                return budgetSnap.data().amount || 0;
            }
            // إذا لم تكن موجودة، قم بإنشائها بقيمة 0
            await setDoc(budgetDocRef, { amount: 0 });
            return 0;
        } catch (e) {
            console.error("خطأ في جلب الميزانية: ", e);
            return 0;
        }
    }

    // دالة لتحديث ميزانية الشرطة
    async function updatePoliceBudget(amountChange) {
        try {
            const budgetDocRef = doc(db, "settings", "policeBudget");
            const budgetSnap = await getDoc(budgetDocRef);
            let currentAmount = 0;
            if (budgetSnap.exists()) {
                currentAmount = budgetSnap.data().amount || 0;
            }
            const newAmount = currentAmount + amountChange;
            await setDoc(budgetDocRef, { amount: newAmount }, { merge: true });
            policeBudget = newAmount; // تحديث المتغير العام
            policeBudgetDisplay.textContent = `${policeBudget} ريال`; // تحديث العرض
            console.log(`تم تحديث الميزانية إلى: ${newAmount}`);
            return true;
        } catch (e) {
            console.error("خطأ في تحديث الميزانية: ", e);
            return false;
        }
    }

    // ----------------------------------------------------
    // User (Officer) Management Functions (إدارة المستخدمين/العساكر)
    // ----------------------------------------------------

    // دالة لإنشاء مستخدم جديد (مقدم طلب) في Firebase Auth و Firestore
    async function createNewApplicant(username, password, reason) {
        const sanitizedUsername = sanitizeUsernameForEmail(username); // تنظيف اسم المستخدم
        const email = sanitizedUsername + EMAIL_DOMAIN; // بناء البريد الإلكتروني للمصادقة
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // حفظ بيانات مقدم الطلب في Firestore
            await setDoc(doc(db, "users", user.uid), {
                username: username, // حفظ الاسم الأصلي
                email: email,
                rank: 'جندي تحت التدريب', // رتبة أولية لمقدم الطلب
                roleType: 'مقدم طلب', // الدور الأولي
                points: 0,
                isOnline: false, // غير متصل
                isWorking: false, // غير مباشر
                applicationReason: reason, // سبب التقديم
                appliedAt: new Date().toISOString(),
                uid: user.uid // حفظ UID داخل الوثيقة نفسها لتسهيل البحث
            });

            console.log("تم إنشاء مقدم طلب جديد:", user.uid);
            return { uid: user.uid, username: username, email: email, roleType: 'مقدم طلب' };
        } catch (error) {
            console.error("خطأ في إنشاء مقدم الطلب:", error);
            let errorMessage = "فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'اسم العسكري هذا (أو البريد الإلكتروني) مستخدم بالفعل. يرجى اختيار اسم آخر.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'صيغة اسم العسكري غير صحيحة. قد يحتوي على أحرف غير مدعومة أو مسافات في البداية/النهاية.';
            }
            alert(errorMessage);
            return null;
        }
    }

    // دالة لإنشاء حساب عسكري جديد بواسطة القائد
    async function createOfficerAccountByLeader(username, password, rank) {
        const sanitizedUsername = sanitizeUsernameForEmail(username); // تنظيف اسم المستخدم
        const email = sanitizedUsername + EMAIL_DOMAIN;
        try {
            // التحقق من أن الرتبة المختارة صالحة وأنها ليست أعلى من رتبة القائد الحالي
            if (!ranks[rank]) {
                alert('الرتبة المختارة غير صالحة.');
                return null;
            }
            if (ranks[rank].order > ranks[loggedInUser.rank].order) {
                alert('لا يمكنك تعيين رتبة أعلى من رتبتك كقائد.');
                return null;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                username: username, // حفظ الاسم الأصلي
                email: email,
                rank: rank,
                roleType: ranks[rank].type, // تعيين نوع الدور بناءً على الرتبة
                points: 0,
                isOnline: false,
                isWorking: false,
                createdAt: new Date().toISOString(),
                uid: user.uid
            });

            alert(`تم إنشاء حساب العسكري "${username}" برتبة "${rank}" بنجاح!`);
            await updateUserPoints(loggedInUser.uid, 30); // نقاط إضافية للقائد على إنشاء حساب
            return { uid: user.uid, username: username, rank: rank };
        } catch (error) {
            console.error("خطأ في إنشاء حساب العسكري بواسطة القائد:", error);
            let errorMessage = "فشل في إنشاء حساب العسكري. يرجى المحاولة مرة أخرى.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'اسم العسكري هذا (أو البريد الإلكتروني) مستخدم بالفعل. يرجى اختيار اسم آخر.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'صيغة اسم العسكري غير صحيحة. قد يحتوي على أحرف غير مدعومة أو مسافات في البداية/النهاية.';
            }
            alert(errorMessage);
            return null;
        }
    }


    // دالة لتعديل نقاط عسكري
    async function updateUserPoints(uid, pointsChange) {
        try {
            const userDocRef = doc(db, "users", uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
                const currentPoints = userSnap.data().points || 0;
                const newPoints = currentPoints + pointsChange;
                await updateDoc(userDocRef, { points: newPoints });

                // تحديث النقاط المعروضة في الهيدر إذا كان هو المستخدم المسجل دخوله
                if (loggedInUser && loggedInUser.uid === uid) {
                    loggedInUser.points = newPoints;
                    updateHeaderInfo();
                }
                console.log(`تم تحديث نقاط العسكري ${uid} إلى: ${newPoints}`);
                return true;
            }
            return false;
        } catch (e) {
            console.error("خطأ في تحديث نقاط العسكري: ", e);
            return false;
        }
    }

    // دالة لجلب جميع المستخدمين (العساكر)
    async function getAllUsers() {
        try {
            const usersCollection = collection(db, "users");
            const q = query(usersCollection, orderBy("username", "asc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("خطأ في جلب المستخدمين: ", e);
            return [];
        }
    }

    // دالة لجلب طلبات التقديم (المستخدمين الذين دورهم 'مقدم طلب')
    async function getApplicants() {
        try {
            const q = query(collection(db, "users"), where("roleType", "==", "مقدم طلب"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (e) {
            console.error("خطأ في جلب طلبات التقديم: ", e);
            return [];
        }
    }

    // دالة لقبول طلب عسكري
    async function approveApplicant(uid, username) {
        try {
            const userDocRef = doc(db, "users", uid);
            await updateDoc(userDocRef, {
                roleType: 'عسكري', // تغيير الدور
                rank: 'جندي', // إعطاء رتبة أولية
                isOnline: false,
                isWorking: false,
                applicationReason: null, // مسح سبب التقديم
                approvedAt: new Date().toISOString()
            });
            alert(`تم قبول العسكري ${username} بنجاح! رتبته الآن: جندي.`);
            // زيادة نقاط الضابط الذي قام بالقبول
            await updateUserPoints(loggedInUser.uid, 25);
            return true;
        } catch (e) {
            console.error("خطأ في قبول العسكري: ", e);
            alert("فشل في قبول العسكري. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لرفض (حذف) طلب عسكري
    async function rejectApplicant(uid, username) {
        try {
            // حذف وثيقة المستخدم من Firestore
            await deleteDoc(doc(db, "users", uid));
            // ملاحظة: لا يمكن حذف المستخدم من Firebase Auth مباشرة من العميل. يتطلب ذلك Cloud Function.
            alert(`تم رفض العسكري ${username} وحذف ملفه من النظام. (ملاحظة: لحذف حساب Firebase Authentication بشكل كامل، يتطلب ذلك وظيفة Cloud Function).`);
            // زيادة نقاط الضابط الذي قام بالرفض
            await updateUserPoints(loggedInUser.uid, 5);
            return true;
        } catch (e) {
            console.error("خطأ في رفض العسكري: ", e);
            alert("فشل في رفض العسكري. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }

    // دالة لترقية أو فصل عسكري
    async function updateOfficerRankOrStatus(uid, newRank = null, actionType) {
        try {
            const userDocRef = doc(db, "users", uid);
            if (actionType === 'promote') {
                if (!newRank || !ranks[newRank]) {
                    alert('رتبة غير صالحة.');
                    return false;
                }
                 // لا يمكن للقائد ترقية/فصل نفسه
                if (loggedInUser.uid === uid) {
                    alert('لا يمكنك ترقية/فصل نفسك!');
                    return false;
                }

                // منع ترقية شخص إلى رتبة أعلى من رتبة القائد الذي يقوم بالترقية
                const currentOfficerData = (await getDoc(userDocRef)).data();
                if (ranks[newRank].order > ranks[loggedInUser.rank].order) {
                    alert('لا يمكنك ترقية عسكري إلى رتبة أعلى من رتبتك.');
                    return false;
                }

                // التأكد من أن الرتبة الجديدة أعلى أو مساوية للرتبة الحالية للعسكري (إذا لم يكن خفضاً صريحاً)
                if (ranks[newRank].order < ranks[currentOfficerData.rank].order && !confirm(`هل أنت متأكد من خفض رتبة ${currentOfficerData.username} من ${currentOfficerData.rank} إلى ${newRank}؟`)) {
                    return false; // إلغاء إذا لم يتم التأكيد على الخفض
                }
                
                await updateDoc(userDocRef, {
                    rank: newRank,
                    roleType: ranks[newRank].type // تحديث نوع الدور بناءً على نوع الرتبة الجديدة
                });
                alert(`تم تعديل رتبة العسكري ${currentOfficerData.username} إلى ${newRank}.`);
                
                await updateUserPoints(loggedInUser.uid, 15); // نقاط للقائد على الترقية/الخفض
            } else if (actionType === 'terminate') {
                 // لا يمكن للقائد فصل نفسه
                if (loggedInUser.uid === uid) {
                    alert('لا يمكنك فصل نفسك من الخدمة!');
                    return false;
                }

                if (confirm(`هل أنت متأكد من فصل هذا العسكري من الخدمة؟ لن يتمكن من تسجيل الدخول بعد الآن.`)) {
                    // حذف وثيقة المستخدم من Firestore
                    await deleteDoc(userDocRef);
                    // هنا يمكن إضافة logic لحذف حساب Firebase Auth من خلال Cloud Functions
                    alert('تم فصل العسكري من الخدمة وحذف ملفه.');
                    await updateUserPoints(loggedInUser.uid, 20); // نقاط للقائد على الفصل
                } else {
                    return false;
                }
            }
            return true;
        } catch (e) {
            console.error("خطأ في ترقية/فصل العسكري: ", e);
            alert("فشل في تعديل حالة العسكري. يرجى المحاولة مرة أخرى.");
            return false;
        }
    }


    // ----------------------------------------------------
    // Render Functions (دوال عرض البيانات في الواجهة)
    // ----------------------------------------------------

    // دالة لعرض تفاصيل ملف المواطن
    function renderCitizenProfile(citizen) {
        currentPersonFirestoreId = citizen.id; // تخزين معرف وثيقة Firestore للمواطن الحالي

        citizenDetails.innerHTML = `
            <div class="profile-header">
                <img src="${citizen.imageUrl || 'https://via.placeholder.com/120?text=لا+صورة'}" alt="صورة المواطن" class="profile-image">
                <div class="profile-info">
                    <h3>${citizen.fullName} (رقم الهوية: ${citizen.citizenId})</h3>
                    <p>معلومات الاتصال: ${citizen.contactInfo || 'لا يوجد'}</p>
                    <p>إجمالي نقاط السوابق: <span id="citizenPointsDisplay">${citizen.points || 0}</span></p>
                </div>
            </div>
            <p><strong>ملاحظات:</strong> ${citizen.notes || 'لا توجد ملاحظات.'}</p>

            <div class="profile-actions">
                <button id="editCitizenProfileBtn" class="btn primary-btn">تعديل ملف المواطن</button>
                <button id="deleteCitizenProfileBtn" class="btn danger-btn">حذف ملف المواطن</button>
                <button id="addRecordToCitizenBtn" class="btn success-btn">إضافة سجل جديد</button>
            </div>

            <div class="records-section">
                <h4>التهم والمخالفات (${citizen.records ? citizen.records.filter(r => r.type === 'charge').length : 0})</h4>
                <div class="records-list" id="chargesList">
                    ${citizen.records && citizen.records.filter(r => r.type === 'charge').length > 0 ?
                        citizen.records.filter(r => r.type === 'charge').map((record, index) => `
                            <div class="record-item charge" data-index="${index}" data-record-data='${JSON.stringify(record)}'>
                                <div class="record-info">
                                    <p><strong>الوصف:</strong> ${record.description}</p>
                                    <p><strong>النقاط:</strong> ${record.points}</p>
                                    <p><strong>الضابط:</strong> ${record.officerName} بتاريخ ${record.date}</p>
                                </div>
                                <div class="record-actions">
                                    ${loggedInUser.roleType === 'ضابط' || loggedInUser.roleType === 'قائد' ? `
                                    <button class="btn primary-btn edit-record-btn">تعديل</button>
                                    <button class="btn danger-btn delete-record-btn">حذف</button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')
                        : '<p class="no-records info-message">لا توجد تهم/مخالفات مسجلة لهذا المواطن.</p>'
                    }
                </div>

                <h4>الأصول والممتلكات (${citizen.records ? citizen.records.filter(r => r.type === 'asset').length : 0})</h4>
                <div class="records-list" id="assetsList">
                    ${citizen.records && citizen.records.filter(r => r.type === 'asset').length > 0 ?
                        citizen.records.filter(r => r.type === 'asset').map((record, index) => `
                            <div class="record-item asset" data-index="${index}" data-record-data='${JSON.stringify(record)}'>
                                <div class="record-info">
                                    <p><strong>الوصف:</strong> ${record.description}</p>
                                    <p><strong>الضابط:</strong> ${record.officerName} بتاريخ ${record.date}</p>
                                </div>
                                <div class="record-actions">
                                    ${loggedInUser.roleType === 'ضابط' || loggedInUser.roleType === 'قائد' ? `
                                    <button class="btn primary-btn edit-record-btn">تعديل</button>
                                    <button class="btn danger-btn delete-record-btn">حذف</button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')
                        : '<p class="no-records info-message">لا توجد أصول/ممتلكات مسجلة لهذا المواطن.</p>'
                    }
                </div>
            </div>
        `;
        noCitizenFound.style.display = 'none';
        citizenDetails.style.display = 'block';

        // إضافة مستمعي الأحداث لأزرار تعديل/حذف المواطن وإضافة السجلات
        document.getElementById('editCitizenProfileBtn').addEventListener('click', () => {
            citizenOverlay.style.display = 'flex';
            citizenOverlayTitle.textContent = 'تعديل ملف المواطن';
            citizenIdInput.value = citizen.citizenId;
            citizenIdInput.dataset.originalId = citizen.citizenId; // حفظ ID الأصلي
            citizenIdInput.disabled = loggedInUser.roleType !== 'قائد'; // فقط القادة يمكنهم تعديل رقم الهوية
            citizenNameInput.value = citizen.fullName;
            citizenContactInput.value = citizen.contactInfo || '';
            citizenImageUrlInput.value = citizen.imageUrl || '';
            citizenNotesInput.value = citizen.notes || '';
            saveCitizenBtn.textContent = 'تحديث المواطن';
            saveCitizenBtn.dataset.mode = 'edit';
            saveCitizenBtn.dataset.docId = citizen.id;
        });

        document.getElementById('deleteCitizenProfileBtn').addEventListener('click', async () => {
             // فقط الضباط والقادة يمكنهم الحذف
            if (loggedInUser.roleType !== 'ضابط' && loggedInUser.roleType !== 'قائد') {
                alert('لا تملك صلاحية حذف المواطنين.');
                return;
            }
            if (confirm(`هل أنت متأكد من حذف ملف المواطن ${citizen.fullName}؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
                await deleteCitizenFromFirestore(currentPersonFirestoreId);
            }
        });

        document.getElementById('addRecordToCitizenBtn').addEventListener('click', () => {
            recordOverlay.style.display = 'flex';
            recordOverlayTitle.textContent = 'إضافة سجل جديد';
            recordTypeSelect.value = 'charge';
            recordDescriptionInput.value = '';
            recordPointsInput.value = '0';
            recordPointsGroup.style.display = 'block'; // أظهر حقل النقاط للتهم
            recordOfficerInput.value = loggedInUser?.username || 'ضابط غير معروف';
            recordDateInput.value = new Date().toLocaleDateString('en-CA'); // تنسيق YYYY-MM-DD
            saveRecordBtn.textContent = 'حفظ السجل';
            saveRecordBtn.dataset.mode = 'add';
            editingRecordData = null; // مسح حالة التعديل
        });

        // مستمعي الأحداث لأزرار تعديل وحذف السجلات
        document.querySelectorAll('.edit-record-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const record = JSON.parse(e.target.closest('.record-item').dataset.recordData);
                recordOverlay.style.display = 'flex';
                recordOverlayTitle.textContent = 'تعديل السجل';
                recordTypeSelect.value = record.type;
                recordDescriptionInput.value = record.description;
                recordPointsInput.value = record.points || 0;
                recordPointsGroup.style.display = (record.type === 'charge' ? 'block' : 'none');
                recordOfficerInput.value = record.officerName;
                recordDateInput.value = record.date;
                saveRecordBtn.textContent = 'تحديث السجل';
                saveRecordBtn.dataset.mode = 'edit';
                editingRecordData = record; // حفظ بيانات السجل الأصلي للتعديل
            });
        });

        document.querySelectorAll('.delete-record-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const recordToDelete = JSON.parse(e.target.closest('.record-item').dataset.recordData);
                if (confirm(`هل أنت متأكد من حذف هذا السجل (${recordToDelete.description})؟`)) {
                    await deleteRecordFromCitizen(currentPersonFirestoreId, recordToDelete);
                    const updatedCitizen = (await searchCitizenInFirestore(`ID:${citizen.citizenId}`))[0];
                    if (updatedCitizen) renderCitizenProfile(updatedCitizen);
                }
            });
        });
    }

    // دالة لعرض بيانات مركز العمليات والعساكر المباشرين
    async function loadOperationsCenterData() {
        const opsInfo = await getOperationsCenterInfo();
        currentOpsCenterDisplay.textContent = opsInfo.name;
        currentWaveNumberDisplay.textContent = opsInfo.waveNumber;

        onlineOfficersList.innerHTML = '';
        const allUsers = await getAllUsers();
        const onlineUsers = allUsers.filter(user => user.isWorking && user.roleType !== 'مقدم طلب');

        if (onlineUsers.length === 0) {
            onlineOfficersList.innerHTML = '<p class="info-message">لا يوجد عساكر مباشرين حالياً.</p>';
            return;
        }

        onlineUsers.forEach(user => {
            const officerDiv = document.createElement('div');
            officerDiv.classList.add('officer-item');
            officerDiv.innerHTML = `
                <div class="item-info">
                    <p><strong>اسم العسكري:</strong> ${user.username}</p>
                    <p><strong>الرتبة:</strong> ${user.rank}</p>
                    <p><strong>الكود العسكري:</strong> ${user.militaryCode || 'غير محدد'}</p>
                </div>
            `;
            onlineOfficersList.appendChild(officerDiv);
        });
    }

    // دالة لعرض الحالات الميدانية
    async function loadCases() {
        casesList.innerHTML = '';
        const cases = await getCasesFromFirestore();

        if (cases.length === 0) {
            casesList.innerHTML = '<p class="info-message">لا توجد حالات مسجلة حالياً.</p>';
            return;
        }

        cases.forEach(c => {
            const caseDiv = document.createElement('div');
            caseDiv.classList.add('case-item');
            if (c.status === 'تم إنهائها') {
                caseDiv.classList.add('completed');
            } else if (c.status === 'فشلت') {
                caseDiv.classList.add('failed');
            }
            
            caseDiv.innerHTML = `
                <div class="item-info">
                    <p><strong>النوع:</strong> ${c.type}</p>
                    <p><strong>الوصف:</strong> ${c.description}</p>
                    <p><strong>الضابط المبلغ:</strong> ${c.officerName} بتاريخ ${c.date}</p>
                    <p><strong>الحالة:</strong> ${c.status}</p>
                </div>
                <div class="item-actions">
                    <button class="btn primary-btn edit-case-btn" data-case-id="${c.id}" data-case-data='${JSON.stringify(c)}'>تعديل</button>
                    <button class="btn danger-btn delete-case-btn" data-case-id="${c.id}">حذف</button>
                </div>
            `;
            casesList.appendChild(caseDiv);
        });

        // إضافة مستمعي الأحداث لأزرار تعديل وحذف الحالات
        document.querySelectorAll('.edit-case-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const caseId = e.target.dataset.caseId;
                const caseData = JSON.parse(e.target.dataset.caseData);
                caseOverlay.style.display = 'flex';
                caseOverlayTitle.textContent = 'تعديل الحالة';
                caseTypeSelect.value = caseData.type;
                caseDescriptionInput.value = caseData.description;
                caseOfficerInput.value = caseData.officerName;
                caseDateInput.value = caseData.date;
                caseStatusSelect.value = caseData.status;
                saveCaseBtn.textContent = 'تحديث الحالة';
                saveCaseBtn.dataset.mode = 'edit';
                saveCaseBtn.dataset.caseId = caseId;
                editingCaseData = caseData; // حفظ بيانات الحالة الأصلية للتعديل
            });
        });

        document.querySelectorAll('.delete-case-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const caseId = e.target.dataset.caseId;
                if (confirm('هل أنت متأكد من حذف هذه الحالة؟')) {
                    await deleteCaseFromFirestore(caseId);
                    loadCases(); // إعادة تحميل الحالات بعد الحذف
                }
            });
        });
    }

    // دالة لتحديث عرض رتبتي ونقاطي
    function updateMyRankAndPointsDisplay() {
        if (loggedInUser) {
            myUsernameDisplay.textContent = loggedInUser.username;
            myRankDisplay.textContent = loggedInUser.rank;
            myPointsDisplay.textContent = loggedInUser.points || 0;
        }
    }

    // دالة لعرض قائمة الرتب و العساكر الحاصلين عليها
    async function renderAllRanksList() {
        allRanksList.innerHTML = '';
        const allUsers = await getAllUsers();
        
        // تجميع العساكر حسب الرتبة
        const usersByRank = {};
        orderedRanks.forEach(rankName => {
            usersByRank[rankName] = [];
        });

        allUsers.forEach(user => {
            if (user.rank && usersByRank[user.rank]) {
                usersByRank[user.rank].push(user.username);
            }
        });

        orderedRanks.forEach(rankName => {
            const rankDiv = document.createElement('div');
            rankDiv.classList.add('rank-item');
            const rankType = ranks[rankName].type;
            const rankUsers = usersByRank[rankName].length > 0 ? usersByRank[rankName].join(', ') : 'لا يوجد عساكر حالياً';
            rankDiv.innerHTML = `
                <div class="item-info">
                    <p><strong>الرتبة:</strong> ${rankName} (${rankType})</p>
                    <p><strong>الحاصلون عليها:</strong> ${rankUsers}</p>
                </div>
            `;
            allRanksList.appendChild(rankDiv);
        });
    }

    // دالة لعرض طلبات التقديم في لوحة الضباط
    async function loadApplicants() {
        applicantsList.innerHTML = '';
        const applicants = await getApplicants();

        if (applicants.length === 0) {
            applicantsList.innerHTML = '<p class="info-message">لا توجد طلبات تقديم جديدة حالياً.</p>';
            return;
        }

        applicants.forEach(applicant => {
            const applicantDiv = document.createElement('div');
            applicantDiv.classList.add('officer-item');
            applicantDiv.innerHTML = `
                <div class="item-info">
                    <p><strong>اسم العسكري:</strong> ${applicant.username}</p>
                    <p><strong>سبب التقديم:</strong> ${applicant.applicationReason || 'لا يوجد'}</p>
                    <p><strong>تاريخ التقديم:</strong> ${new Date(applicant.appliedAt).toLocaleDateString()}</p>
                </div>
                <div class="item-actions">
                    <button class="btn success-btn approve-applicant-btn" data-uid="${applicant.uid}" data-username="${applicant.username}">قبول</button>
                    <button class="btn danger-btn reject-applicant-btn" data-uid="${applicant.uid}" data-username="${applicant.username}">رفض</button>
                </div>
            `;
            applicantsList.appendChild(applicantDiv);
        });

        document.querySelectorAll('.approve-applicant-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const uid = e.target.dataset.uid;
                const username = e.target.dataset.username;
                if (confirm(`هل أنت متأكد من قبول العسكري ${username}؟`)) {
                    await approveApplicant(uid, username);
                    loadApplicants(); // إعادة تحميل القائمة
                }
            });
        });

        document.querySelectorAll('.reject-applicant-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const uid = e.target.dataset.uid;
                const username = e.target.dataset.username;
                if (confirm(`هل أنت متأكد من رفض العسكري ${username}؟ سيتم حذف طلبه بشكل دائم.`)) {
                    await rejectApplicant(uid, username);
                    loadApplicants(); // إعادة تحميل القائمة
                }
            });
        });
    }

    // دالة لملء قائمة العساكر في نافذة تعديل النقاط
    async function populateAdjustPointsOfficerSelect() {
        adjustPointsOfficerSelect.innerHTML = '<option value="">-- اختر عسكري --</option>';
        const allUsers = await getAllUsers();
        allUsers.filter(u => u.roleType !== 'مقدم طلب').forEach(user => {
            const option = document.createElement('option');
            option.value = user.uid;
            option.textContent = `${user.username} (${user.rank})`;
            adjustPointsOfficerSelect.appendChild(option);
        });
    }

    // دالة لملء قائمة العساكر في نافذة الترقية/الفصل
    async function loadOfficersForManagement() {
        manageOfficersList.innerHTML = '';
        promoteDemoteOfficerSelect.innerHTML = '<option value="">-- اختر عسكري --</option>';
        newRankSelect.innerHTML = ''; // مسح الرتب القديمة

        // ملء خيارات الرتب الجديدة
        orderedRanks.forEach(rankName => {
            const option = document.createElement('option');
            option.value = rankName;
            option.textContent = rankName;
            newRankSelect.appendChild(option);
        });

        const allUsers = await getAllUsers();
        // تصفية المستخدمين غير مقدمي الطلبات وغير القائد نفسه
        const manageableUsers = allUsers.filter(u => u.roleType !== 'مقدم طلب' && u.uid !== loggedInUser.uid);

        if (manageableUsers.length === 0) {
            manageOfficersList.innerHTML = '<p class="info-message">لا يوجد عساكر لإدارتهم.</p>';
            return;
        }

        manageableUsers.forEach(user => {
            // إضافة للوحة الإدارة
            const officerDiv = document.createElement('div');
            officerDiv.classList.add('officer-item');
            officerDiv.innerHTML = `
                <div class="item-info">
                    <p><strong>اسم العسكري:</strong> ${user.username}</p>
                    <p><strong>الرتبة:</strong> ${user.rank}</p>
                    <p><strong>النقاط:</strong> ${user.points || 0}</p>
                </div>
            `;
            manageOfficersList.appendChild(officerDiv);

            // إضافة لقائمة الاختيار في النافذة المنبثقة
            const option = document.createElement('option');
            option.value = user.uid;
            option.textContent = `${user.username} (${user.rank})`;
            promoteDemoteOfficerSelect.appendChild(option);
        });
    }

    // دالة لتحميل وعرض ميزانية الشرطة
    async function loadPoliceBudget() {
        policeBudget = await getPoliceBudget();
        policeBudgetDisplay.textContent = `${policeBudget} ريال`;
    }

    // ----------------------------------------------------
    // Event Listeners (مستمعي الأحداث)
    // ----------------------------------------------------

    // مستمعي الأحداث لأزرار التنقل الرئيسية
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.target;
            if (target === 'logout') {
                signOut(auth).then(() => {
                    isLoggedIn = false;
                    loggedInUser = null;
                    alert('تم تسجيل الخروج بنجاح!');
                    updateLoginUI();
                }).catch((error) => {
                    console.error("خطأ في تسجيل الخروج:", error);
                    alert("فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.");
                });
            } else if (target === 'mdt-system' && !isLoggedIn) {
                alert('الرجاء تسجيل الدخول للوصول إلى نظام MDT.');
                showSection('login');
            } else if (target === 'admin-panel' && (!isLoggedIn || loggedInUser?.roleType !== 'ضابط' && loggedInUser?.roleType !== 'قائد')) {
                alert('لا تملك صلاحيات الضباط للوصول إلى هذه اللوحة.');
                showSection('home');
            } else if (target === 'leader-panel' && (!isLoggedIn || loggedInUser?.roleType !== 'قائد')) {
                alert('لا تملك صلاحيات القيادة للوصول إلى هذه اللوحة.');
                showSection('home');
            } else if (target === 'operations-center' || target === 'cases' || target === 'ranks-points') {
                if (!isLoggedIn) {
                     alert('الرجاء تسجيل الدخول للوصول إلى هذا القسم.');
                     showSection('login');
                } else if (loggedInUser.roleType === 'مقدم طلب') {
                     alert('طلبك قيد المراجعة، لا يمكنك الوصول إلى هذا القسم بعد.');
                     showSection('home');
                } else {
                     showSection(target);
                }
            }
            else {
                showSection(target);
            }
        });
    });

    // تسجيل الدخول
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const email = sanitizeUsernameForEmail(username) + EMAIL_DOMAIN; // استخدام الدالة المساعدة

        if (!username || !password) {
            loginMessage.textContent = 'الرجاء إدخال اسم العسكري وكلمة المرور.';
            loginMessage.classList.add('error-message');
            loginMessage.classList.remove('success-message');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // جلب معلومات المستخدم من Firestore
            const userDocSnap = await getDoc(doc(db, "users", user.uid));
            if (userDocSnap.exists()) {
                loggedInUser = { id: user.uid, ...userDocSnap.data() };
                // تحديث roleType بناءً على الرتبة المخزنة في Firestore
                loggedInUser.roleType = ranks[loggedInUser.rank]?.type || 'عسكري'; 
                isLoggedIn = true;
                loginMessage.textContent = 'تم تسجيل الدخول بنجاح!';
                loginMessage.classList.remove('error-message');
                loginMessage.classList.add('success-message');
                usernameInput.value = '';
                passwordInput.value = '';
                updateLoginUI();
            } else {
                // إذا لم يتم العثور على وثيقة المستخدم في Firestore، قد يكون هذا حساب تم إنشاؤه خارجياً
                // أو أنه مقدم طلب ولم يتم إنشاء بياناته في Firestore بشكل صحيح
                await signOut(auth); // تسجيل الخروج لمنع الوصول
                loginMessage.textContent = 'عذراً، لا يوجد حساب عسكري مرتبط بهذا المستخدم أو طلبك قيد المراجعة.';
                loginMessage.classList.add('error-message');
                loginMessage.classList.remove('success-message');
            }
        } catch (error) {
            console.error("خطأ في تسجيل الدخول:", error);
            let errorMessage = "خطأ في تسجيل الدخول. تأكد من اسم العسكري وكلمة المرور.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                errorMessage = "اسم العسكري أو كلمة المرور غير صحيحة.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "صيغة اسم العسكري غير صحيحة. قد يحتوي على أحرف غير مدعومة أو مسافات في البداية/النهاية.";
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = "خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.";
            }
            loginMessage.textContent = errorMessage;
            loginMessage.classList.add('error-message');
            loginMessage.classList.remove('success-message');
        }
    });

    // تقديم طلب عسكرية
    applyBtn.addEventListener('click', async () => {
        const username = applyUsernameInput.value.trim();
        const password = applyPasswordInput.value.trim();
        const reason = applyReasonInput.value.trim();

        if (!username || !password || !reason) {
            applyMessage.textContent = 'الرجاء ملء جميع حقول التقديم.';
            applyMessage.classList.add('error-message');
            applyMessage.classList.remove('success-message');
            return;
        }
        if (password.length < 6) {
             applyMessage.textContent = 'كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.';
            applyMessage.classList.add('error-message');
            applyMessage.classList.remove('success-message');
            return;
        }

        const applicant = await createNewApplicant(username, password, reason);
        if (applicant) {
            applyMessage.textContent = 'تم تقديم طلبك بنجاح! سيتم مراجعته من قبل الضباط.';
            applyMessage.classList.remove('error-message');
            applyMessage.classList.add('success-message');
            applyUsernameInput.value = '';
            applyPasswordInput.value = '';
            applyReasonInput.value = '';
        } else {
            // رسالة الخطأ يتم عرضها داخل دالة createNewApplicant
            applyMessage.textContent = 'فشل في تقديم الطلب. يرجى التحقق من الرسالة أعلاه.';
            applyMessage.classList.add('error-message');
            applyMessage.classList.remove('success-message');
        }
    });

    // MDT System Buttons
    searchBtn.addEventListener('click', async () => {
        if (!isLoggedIn || loggedInUser.roleType === 'مقدم طلب') {
             alert('لا تملك صلاحية الوصول إلى هذه الميزة.');
             return;
        }
        const queryText = searchInput.value.trim();
        if (queryText) {
            const results = await searchCitizenInFirestore(queryText);
            if (results && results.length > 0) {
                renderCitizenProfile(results[0]); // عرض أول نتيجة
                if (results.length > 1) {
                    alert(`تم العثور على ${results.length} نتائج. يتم عرض أول نتيجة. كن أكثر تحديداً.`);
                }
                // زيادة نقاط الضابط الذي قام بالبحث
                await updateUserPoints(loggedInUser.uid, 2);
            } else {
                citizenDetails.innerHTML = '';
                noCitizenFound.style.display = 'block';
                alert('لم يتم العثور على مواطن بهذا الرقم أو الاسم.');
            }
        } else {
            alert('الرجاء إدخال رقم هوية أو اسم للبحث.');
        }
    });

    addCitizenBtn.addEventListener('click', () => {
        if (!isLoggedIn || loggedInUser.roleType === 'مقدم طلب') {
             alert('لا تملك صلاحية إضافة مواطنين.');
             return;
        }
        citizenOverlay.style.display = 'flex';
        citizenOverlayTitle.textContent = 'إضافة مواطن جديد';
        citizenIdInput.value = '';
        citizenIdInput.disabled = false; // تمكين حقل رقم الهوية للمواطن الجديد
        citizenNameInput.value = '';
        citizenContactInput.value = '';
        citizenImageUrlInput.value = '';
        citizenNotesInput.value = '';
        saveCitizenBtn.textContent = 'حفظ المواطن';
        saveCitizenBtn.dataset.mode = 'add';
        saveCitizenBtn.dataset.docId = '';
    });

    cancelCitizenBtn.addEventListener('click', () => {
        citizenOverlay.style.display = 'none';
    });

    saveCitizenBtn.addEventListener('click', async () => {
        const mode = saveCitizenBtn.dataset.mode;
        const docId = saveCitizenBtn.dataset.docId;
        const citizenId = citizenIdInput.value.trim();
        const fullName = citizenNameInput.value.trim();
        const contactInfo = citizenContactInput.value.trim();
        const imageUrl = citizenImageUrlInput.value.trim();
        const notes = citizenNotesInput.value.trim();

        if (!citizenId || !fullName) {
            alert('رقم الهوية والاسم الكامل مطلوبان!');
            return;
        }

        const citizenData = { citizenId, fullName, contactInfo, imageUrl, notes };

        const successId = await saveCitizenToFirestore(citizenData, mode === 'edit' ? docId : null);
        if (successId) {
            citizenOverlay.style.display = 'none';
            // إعادة عرض ملف المواطن المحدث أو الجديد
            const updatedCitizen = (await searchCitizenInFirestore(`ID:${citizenId}`))[0];
            if (updatedCitizen) renderCitizenProfile(updatedCitizen);
        }
    });

    // Record Overlay (سجلات المواطن)
    recordTypeSelect.addEventListener('change', () => {
        if (recordTypeSelect.value === 'charge') {
            recordPointsGroup.style.display = 'block';
        } else {
            recordPointsGroup.style.display = 'none';
            recordPointsInput.value = '0'; // إعادة تعيين النقاط إذا لم تكن تهمة
        }
    });

    cancelRecordBtn.addEventListener('click', () => {
        recordOverlay.style.display = 'none';
    });

    saveRecordBtn.addEventListener('click', async () => {
        if (!currentPersonFirestoreId) {
            alert('الرجاء اختيار مواطن أولاً.');
            return;
        }
         // فقط الضباط والقادة يمكنهم إضافة/تعديل السجلات
        if (loggedInUser.roleType !== 'ضابط' && loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية إضافة/تعديل السجلات.');
            return;
        }

        const mode = saveRecordBtn.dataset.mode;
        const recordType = recordTypeSelect.value;
        const description = recordDescriptionInput.value.trim();
        const points = parseInt(recordPointsInput.value) || 0;
        const officerName = loggedInUser?.username || 'ضابط غير معروف';
        const date = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

        if (!description) {
            alert('الوصف مطلوب للسجل!');
            return;
        }

        const recordData = {
            type: recordType,
            description: description,
            points: recordType === 'charge' ? points : 0,
            officerName: officerName,
            date: date
        };

        let success = false;
        if (mode === 'add') {
            success = await addRecordToCitizen(currentPersonFirestoreId, recordData);
        } else if (mode === 'edit' && editingRecordData) {
            success = await updateRecordForCitizen(currentPersonFirestoreId, editingRecordData, recordData);
        }

        if (success) {
            recordOverlay.style.display = 'none';
            // إعادة جلب المواطن وتحديث عرضه بعد إضافة/تعديل السجل
            const updatedCitizenDoc = await getDoc(doc(db, "citizens", currentPersonFirestoreId));
            if (updatedCitizenDoc.exists()) {
                renderCitizenProfile({ id: updatedCitizenDoc.id, ...updatedCitizenDoc.data() });
            }
        }
    });

    // Case Overlay (الحالات الميدانية)
    addCaseBtn.addEventListener('click', () => {
        if (!isLoggedIn || loggedInUser.roleType === 'مقدم طلب') {
             alert('لا تملك صلاحية إضافة حالات.');
             return;
        }
        caseOverlay.style.display = 'flex';
        caseOverlayTitle.textContent = 'إضافة حالة جديدة';
        caseTypeSelect.value = 'طلب وحدات دعم';
        caseDescriptionInput.value = '';
        caseOfficerInput.value = loggedInUser?.username || 'ضابط غير معروف';
        caseDateInput.value = new Date().toLocaleDateString('en-CA');
        caseStatusSelect.value = 'قيد العمل عليها';
        saveCaseBtn.textContent = 'حفظ الحالة';
        saveCaseBtn.dataset.mode = 'add';
        saveCaseBtn.dataset.caseId = '';
        editingCaseData = null;
    });

    cancelCaseBtn.addEventListener('click', () => {
        caseOverlay.style.display = 'none';
    });

    saveCaseBtn.addEventListener('click', async () => {
        const mode = saveCaseBtn.dataset.mode;
        const caseId = saveCaseBtn.dataset.caseId;
        const type = caseTypeSelect.value;
        const description = caseDescriptionInput.value.trim();
        const officerName = loggedInUser?.username || 'ضابط غير معروف';
        const date = new Date().toLocaleDateString('en-CA');
        const status = caseStatusSelect.value;

        if (!description) {
            alert('الوصف مطلوب للحالة!');
            return;
        }

        const caseData = { type, description, officerName, date, status };

        const success = await saveCaseToFirestore(caseData, mode === 'edit' ? caseId : null);
        if (success) {
            caseOverlay.style.display = 'none';
            loadCases(); // إعادة تحميل قائمة الحالات
            // إذا كانت الحالة قد تم إنجازها، زد ميزانية الشرطة
            if (status === 'تم إنهائها' && mode === 'add') { // فقط عند إنشاء حالة جديدة وتم إنهائها
                await updatePoliceBudget(500); // 500 ريال لكل حالة منجزة
            }
            if (status === 'تم إنهائها' && mode === 'edit' && editingCaseData.status !== 'تم إنهائها') { // إذا كانت معدلة إلى منتهية
                await updatePoliceBudget(500);
            }
        }
    });

    // Operations Center (مركز العمليات)
    toggleWorkStatusBtn.addEventListener('click', async () => {
        if (!loggedInUser || loggedInUser.roleType === 'مقدم طلب') {
             alert('لا تملك صلاحية لتغيير حالة العمل.');
             return;
        }
        const newWorkStatus = !loggedInUser.isWorking;
        try {
            const userDocRef = doc(db, "users", loggedInUser.uid);
            await updateDoc(userDocRef, {
                isWorking: newWorkStatus,
                isOnline: newWorkStatus // افترض أن "مباشر" تعني "متصل ويعمل"
            });
            loggedInUser.isWorking = newWorkStatus;
            loggedInUser.isOnline = newWorkStatus;

            if (newWorkStatus) {
                toggleWorkStatusBtn.textContent = 'إنهاء العمل كشرطي';
                toggleWorkStatusBtn.classList.remove('primary-btn');
                toggleWorkStatusBtn.classList.add('danger-btn');
                alert('لقد بدأت العمل كشرطي!');
            } else {
                toggleWorkStatusBtn.textContent = 'بدء العمل كشرطي';
                toggleWorkStatusBtn.classList.add('primary-btn');
                toggleWorkStatusBtn.classList.remove('danger-btn');
                alert('لقد أنهيت العمل كشرطي.');
            }
            loadOperationsCenterData(); // تحديث قائمة العساكر المباشرين
        } catch (e) {
            console.error("خطأ في تحديث حالة العمل: ", e);
            alert("فشل في تحديث حالة العمل. يرجى المحاولة مرة أخرى.");
        }
    });


    // Admin Panel (لوحة الضباط)
    sendAnnouncementBtn.addEventListener('click', () => {
        if (loggedInUser.roleType !== 'ضابط' && loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية إرسال إعلانات.');
            return;
        }
        announcementOverlay.style.display = 'flex';
        announcementTextInput.value = '';
    });

    cancelAnnouncementBtn.addEventListener('click', () => {
        announcementOverlay.style.display = 'none';
    });

    sendAnnouncementBtnConfirm.addEventListener('click', async () => {
        const announcement = announcementTextInput.value.trim();
        if (!announcement) {
            alert('الرجاء كتابة نص الإعلان.');
            return;
        }
        try {
            // حفظ الإعلان في Firebase لجميع المستخدمين لجلبها
            await setDoc(doc(db, "settings", "latestAnnouncement"), {
                message: announcement,
                timestamp: new Date().toISOString()
            });
            showAnnouncement(announcement); // عرض الإعلان محلياً
            alert('تم إرسال الإعلان بنجاح!');
            announcementOverlay.style.display = 'none';
            // زيادة نقاط الضابط الذي أرسل الإعلان
            await updateUserPoints(loggedInUser.uid, 10);
        } catch (e) {
            console.error("خطأ في إرسال الإعلان: ", e);
            alert("فشل في إرسال الإعلان. يرجى المحاولة مرة أخرى.");
        }
    });

    adjustPointsBtn.addEventListener('click', async () => {
        if (loggedInUser.roleType !== 'ضابط' && loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية تعديل النقاط.');
            return;
        }
        await populateAdjustPointsOfficerSelect(); // ملء قائمة العساكر
        adjustPointsOverlay.style.display = 'flex';
        pointsAmountInput.value = '0';
    });

    cancelAdjustPointsBtn.addEventListener('click', () => {
        adjustPointsOverlay.style.display = 'none';
    });

    confirmAdjustPointsBtn.addEventListener('click', async () => {
        const selectedUid = adjustPointsOfficerSelect.value;
        const points = parseInt(pointsAmountInput.value);

        if (!selectedUid) {
            alert('الرجاء اختيار عسكري.');
            return;
        }
        if (isNaN(points)) {
            alert('الرجاء إدخال قيمة صحيحة للنقاط.');
            return;
        }

        // لا يمكن للضابط أو القائد تعديل نقاطه الخاصة من هذه اللوحة
        if (selectedUid === loggedInUser.uid) {
            alert('لا يمكنك تعديل نقاطك الخاصة من هنا.');
            return;
        }
        
        const success = await updateUserPoints(selectedUid, points);
        if (success) {
            alert('تم تعديل نقاط العسكري بنجاح!');
            adjustPointsOverlay.style.display = 'none';
            await updateUserPoints(loggedInUser.uid, 5); // نقاط للضابط/القائد على تعديل النقاط
        } else {
            alert('فشل في تعديل النقاط.');
        }
    });

    // بحث وتعديل سجل مواطن من لوحة الضباط
    performEditCitizenSearchBtn.addEventListener('click', async () => {
        if (loggedInUser.roleType !== 'ضابط' && loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية البحث وتعديل سجلات المواطنين.');
            return;
        }
        const queryText = editCitizenSearchInput.value.trim();
        if (!queryText) {
            alert('الرجاء إدخال رقم الهوية أو اسم المواطن للبحث.');
            editCitizenDetailsContainer.innerHTML = '';
            return;
        }
        const results = await searchCitizenInFirestore(queryText);
        if (results && results.length > 0) {
            const citizen = results[0];
            editCitizenDetailsContainer.innerHTML = `
                <div class="citizen-details" style="display: block; margin-top: 20px;">
                    <h3>ملف المواطن: ${citizen.fullName}</h3>
                    <p><strong>رقم الهوية:</strong> ${citizen.citizenId}</p>
                    <p><strong>النقاط الإجمالية:</strong> ${citizen.points || 0}</p>
                    <p><strong>ملاحظات:</strong> ${citizen.notes || 'لا توجد'}</p>
                    <button class="btn primary-btn" id="openEditCitizenRecordBtn" data-citizen-id="${citizen.id}" data-citizen-obj='${JSON.stringify(citizen)}'>تعديل سجلات المواطن</button>
                </div>
            `;
            document.getElementById('openEditCitizenRecordBtn').addEventListener('click', (e) => {
                const citizenObj = JSON.parse(e.target.dataset.citizenObj);
                // هذا الزر سيفتح نظام MDT لعرض ملف المواطن المحدد وإتاحة التعديل
                renderCitizenProfile(citizenObj);
                showSection('mdt-system');
                editCitizenDetailsContainer.innerHTML = ''; // مسح البحث بعد الفتح
                editCitizenSearchInput.value = '';
            });

        } else {
            editCitizenDetailsContainer.innerHTML = '<p class="info-message">لم يتم العثور على مواطن بهذا الرقم أو الاسم.</p>';
        }
    });


    // Leader Panel (لوحة القيادة)
    setOpsCenterBtn.addEventListener('click', async () => {
        if (loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية تعيين مركز العمليات.');
            return;
        }
        const currentOps = await getOperationsCenterInfo();
        opsCenterNameInput.value = currentOps.name === 'غير معين' ? '' : currentOps.name;
        waveNumberInput.value = currentOps.waveNumber === 'غير محدد' ? '' : currentOps.waveNumber;
        setOpsCenterOverlay.style.display = 'flex';
    });

    cancelSetOpsCenterBtn.addEventListener('click', () => {
        setOpsCenterOverlay.style.display = 'none';
    });

    confirmSetOpsCenterBtn.addEventListener('click', async () => {
        const name = opsCenterNameInput.value.trim();
        const wave = waveNumberInput.value.trim();
        if (!name || !wave) {
            alert('الرجاء إدخال اسم مركز العمليات ورقم الموجة.');
            return;
        }
        const success = await setOperationsCenterInfo(name, wave);
        if (success) {
            setOpsCenterOverlay.style.display = 'none';
            loadOperationsCenterData(); // تحديث العرض في قسم مركز العمليات
        }
    });

    promoteDemoteBtn.addEventListener('click', async () => {
        if (loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية ترقية أو فصل العساكر.');
            return;
        }
        await loadOfficersForManagement(); // تحميل قائمة العساكر
        promoteDemoteOverlay.style.display = 'flex';
        actionTypeSelect.value = 'promote';
        // إزالة خيارات الرتب الأقل من رتبة القائد الحالي
        const currentLeaderRankOrder = ranks[loggedInUser.rank].order;
        Array.from(newRankSelect.options).forEach(option => {
            const rankOrder = ranks[option.value]?.order;
            if (rankOrder && rankOrder > currentLeaderRankOrder) {
                option.style.display = 'none';
            } else {
                option.style.display = 'block';
            }
        });
    });

    cancelPromoteDemoteBtn.addEventListener('click', () => {
        promoteDemoteOverlay.style.display = 'none';
    });

    confirmPromoteDemoteBtn.addEventListener('click', async () => {
        const selectedUid = promoteDemoteOfficerSelect.value;
        const newRank = newRankSelect.value;
        const actionType = actionTypeSelect.value;

        if (!selectedUid) {
            alert('الرجاء اختيار عسكري.');
            return;
        }
        if (actionType === 'promote' && !newRank) {
            alert('الرجاء اختيار رتبة جديدة.');
            return;
        }

        const success = await updateOfficerRankOrStatus(selectedUid, newRank, actionType);
        if (success) {
            promoteDemoteOverlay.style.display = 'none';
            loadOfficersForManagement(); // إعادة تحميل قائمة العساكر
        }
    });

    // New Officer Creation by Leader
    createOfficerAccountBtn.addEventListener('click', () => {
        if (loggedInUser.roleType !== 'قائد') {
            alert('لا تملك صلاحية إنشاء حسابات عساكر.');
            return;
        }
        createOfficerOverlay.style.display = 'flex';
        newOfficerUsernameInput.value = '';
        newOfficerPasswordInput.value = '';
        // Populate rank select with all ranks except "مقدم طلب" and "جندي تحت التدريب"
        newOfficerRankSelect.innerHTML = '';
        orderedRanks.forEach(rankName => {
            if (rankName !== 'جندي تحت التدريب' && ranks[rankName].order <= ranks[loggedInUser.rank].order) { // لا يمكن إنشاء رتبة أعلى من رتبة القائد نفسه
                const option = document.createElement('option');
                option.value = rankName;
                option.textContent = rankName;
                newOfficerRankSelect.appendChild(option);
            }
        });
        newOfficerRankSelect.value = 'جندي'; // Default to lowest rank for new officers
    });

    cancelCreateOfficerBtn.addEventListener('click', () => {
        createOfficerOverlay.style.display = 'none';
    });

    confirmCreateOfficerBtn.addEventListener('click', async () => {
        const username = newOfficerUsernameInput.value.trim();
        const password = newOfficerPasswordInput.value.trim();
        const rank = newOfficerRankSelect.value;

        if (!username || !password || !rank) {
            alert('الرجاء ملء جميع الحقول لإنشاء حساب العسكري.');
            return;
        }
        if (password.length < 6) {
            alert('كلمة المرور ضعيفة جداً. يجب أن تكون 6 أحرف على الأقل.');
            return;
        }

        const success = await createOfficerAccountByLeader(username, password, rank);
        if (success) {
            createOfficerOverlay.style.display = 'none';
            loadOfficersForManagement(); // Refresh officer list
        }
    });


    // --- Initial Load ---
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocSnap = await getDoc(doc(db, "users", user.uid));
            if (userDocSnap.exists()) {
                loggedInUser = { id: user.uid, ...userDocSnap.data() };
                // تحديث roleType بناءً على الرتبة المخزنة في Firestore
                loggedInUser.roleType = ranks[loggedInUser.rank]?.type || 'عسكري'; 
                isLoggedIn = true;
                console.log("المستخدم مسجل دخوله:", loggedInUser.username, "الرتبة:", loggedInUser.rank, "النوع:", loggedInUser.roleType);

                // جلب آخر إعلان إذا كان موجوداً وعرضه
                const announcementSnap = await getDoc(doc(db, "settings", "latestAnnouncement"));
                if (announcementSnap.exists()) {
                    showAnnouncement(announcementSnap.data().message);
                }
            } else {
                console.warn("User document not found in Firestore for UID:", user.uid, "Signing out.");
                await signOut(auth);
                isLoggedIn = false;
                loggedInUser = null;
            }
        } else {
            isLoggedIn = false;
            loggedInUser = null;
            console.log("لا يوجد مستخدم مسجل دخوله.");
        }
        updateLoginUI(); // تحديث الواجهة بناءً على حالة تسجيل الدخول
    });
}); // نهاية DOMContentLoaded
