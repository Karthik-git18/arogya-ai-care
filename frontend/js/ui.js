const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!user.email && window.location.pathname.includes('dashboard')) {
    window.location.href = '/login';
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}

// Tab Switching
function switchTab(tabName, event) {
    if (event) event.preventDefault();
    
    // Hide all content
    document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    
    // Show selected tab
    const tabElement = document.getElementById(tabName + '-tab');
    if (tabElement) tabElement.classList.add('active');
    
    // Update nav links
    const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const bottomLinks = document.querySelectorAll('.bottom-nav a');
    const tabIndex = ['profile', 'symptom', 'chat', 'report', 'diet'].indexOf(tabName);
    
    sidebarLinks.forEach((el, i) => el.classList.toggle('active', i === tabIndex));
    bottomLinks.forEach((el, i) => el.classList.toggle('active', i === tabIndex));
}

// Toggle Edit Mode
function toggleEditMode() {
    const formCard = document.getElementById('edit-profile-section');
    if (formCard) {
        formCard.classList.toggle('show');
    }
}

// Profile Display Name and Email
function updateProfileHeader(profile) {
    const displayName = profile.name || user.name || 'User Profile';
    const displayEmail = user.email || 'user@health.app';
    const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';
    
    document.getElementById('profile-display-name').textContent = displayName;
    document.getElementById('profile-display-email').innerHTML = `<span>📧</span> ${displayEmail}`;
    document.getElementById('avatar-initial').textContent = initials;
}

// Profile
async function loadProfile() {
    try {
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email })
        });
        
        const data = await res.json();
        if (data.profile) {
            const profile = data.profile;
            document.getElementById('profile-name').value = profile.name || user.name || '';
            document.getElementById('profile-age').value = profile.age || '';
            document.getElementById('profile-height').value = profile.height || '';
            document.getElementById('profile-weight').value = profile.weight || '';
            document.getElementById('profile-blood').value = profile.blood_type || '';
            document.getElementById('profile-medical').value = profile.medical_history || '';
            document.getElementById('profile-allergies').value = profile.allergies || '';
            
            updateProfileHeader(profile);
            updateProfileDisplay(profile);
            
            // Show content, hide empty state
            document.getElementById('profile-full-content').style.display = 'block';
            document.getElementById('profile-empty-state').style.display = 'none';
        } else {
            const profile = { name: user.name || 'User' };
            updateProfileHeader(profile);
            
            // If basically empty, show empty state
            document.getElementById('profile-full-content').style.display = 'none';
            document.getElementById('profile-empty-state').style.display = 'block';
        }
    } catch(e) {
        console.error('Load profile error:', e);
    }
}

function updateProfileDisplay(profile) {
    let completed = 0;
    if (profile.name) completed++;
    if (profile.age) completed++;
    if (profile.height) completed++;
    if (profile.weight) completed++;
    if (profile.blood_type) completed++;
    if (profile.medical_history) completed++;
    if (profile.allergies) completed++;
    
    const completion = (completed / 7) * 100;
    const completionPercent = Math.round(completion);
    
    // Update completion bars
    const barHero = document.getElementById('completion-bar-hero');
    if (barHero) barHero.style.width = completionPercent + '%';
    
    const textHero = document.getElementById('completion-percentage-hero');
    if (textHero) textHero.textContent = completionPercent + '%';

    const ctaBtn = document.getElementById('completion-cta-btn');
    if (completionPercent === 100 && ctaBtn) {
        ctaBtn.textContent = '✓ Profile 100% complete';
        ctaBtn.style.color = '#10b981';
    }
    
    // Status Badge
    const statusBadge = document.getElementById('profile-status-badge');
    if (statusBadge) {
        if (completionPercent < 30) statusBadge.textContent = 'Beginner';
        else if (completionPercent < 70) statusBadge.textContent = 'Active';
        else statusBadge.textContent = 'Healthy';
    }

    // Update health score (Premium Ring)
    const healthScore = completionPercent;
    const scoreDisplay = document.getElementById('score-display-premium');
    if (scoreDisplay) scoreDisplay.textContent = healthScore;
    
    const scoreRing = document.getElementById('score-ring-premium');
    if (scoreRing) {
        const circumference = 2 * Math.PI * 45; // 282.7
        const strokeDashoffset = circumference - (healthScore / 100) * circumference;
        scoreRing.style.strokeDasharray = circumference;
        scoreRing.style.strokeDashoffset = strokeDashoffset;
        
        // Color based on score
        if (healthScore < 40) scoreRing.style.stroke = '#ef4444';
        else if (healthScore < 75) scoreRing.style.stroke = '#f59e0b';
        else scoreRing.style.stroke = '#10b981';
    }
    
    // Metrics
    document.getElementById('metric-age-premium').textContent = profile.age || '--';
    document.getElementById('metric-height-premium').textContent = profile.height ? profile.height + ' cm' : '--';
    document.getElementById('metric-weight-premium').textContent = profile.weight ? profile.weight + ' kg' : '--';
    
    const bmiVal = document.getElementById('metric-bmi-premium');
    const bmiStatus = document.getElementById('bmi-status-premium');
    const bmiInsightItem = document.getElementById('bmi-insight-item');
    const bmiInsightText = document.getElementById('bmi-insight-text');

    if (profile.height && profile.weight) {
        const height_m = profile.height / 100;
        const bmi = (profile.weight / (height_m * height_m)).toFixed(1);
        bmiVal.textContent = bmi;
        
        let status = 'Normal';
        let color = '#10b981';
        let bg = 'rgba(16, 185, 129, 0.2)';
        
        if (bmi < 18.5) { status = 'Underweight'; color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.2)'; }
        else if (bmi >= 25 && bmi < 30) { status = 'Overweight'; color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.2)'; }
        else if (bmi >= 30) { status = 'Obese'; color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.2)'; }
        
        bmiStatus.textContent = status;
        bmiStatus.style.color = color;
        bmiStatus.style.background = bg;
        bmiStatus.style.display = 'block';

        if (bmiInsightItem) {
            bmiInsightItem.style.display = 'flex';
            bmiInsightText.textContent = `Your BMI indicates you are ${status.toLowerCase()}`;
        }
    } else {
        bmiVal.textContent = '--';
        bmiStatus.style.display = 'none';
        if (bmiInsightItem) bmiInsightItem.style.display = 'none';
    }

    // Activity check
    if (window.currentReportData) {
        const reportActivity = document.getElementById('last-report-activity');
        if (reportActivity) reportActivity.style.display = 'flex';
    }
}

async function updateProfile(event) {
    event.preventDefault();
    
    const profile = {
        email: user.email,
        name: document.getElementById('profile-name').value,
        age: parseInt(document.getElementById('profile-age').value) || 0,
        height: parseInt(document.getElementById('profile-height').value) || 0,
        weight: parseInt(document.getElementById('profile-weight').value) || 0,
        blood_type: document.getElementById('profile-blood').value,
        medical_history: document.getElementById('profile-medical').value,
        allergies: document.getElementById('profile-allergies').value
    };

    try {
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profile)
        });
        
        const data = await res.json();
        if (data.success) {
            alert('✓ Profile saved successfully!');
            
            // Show content, hide empty state
            document.getElementById('profile-full-content').style.display = 'block';
            document.getElementById('profile-empty-state').style.display = 'none';

            updateProfileHeader(profile);
            updateProfileDisplay(profile);
            toggleEditMode();
        } else {
            alert('Error saving profile');
        }
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

// Load profile on page load
document.addEventListener('DOMContentLoaded', loadProfile);
