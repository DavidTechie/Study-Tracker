document.addEventListener('DOMContentLoaded', () => {
    loadSubjectsFromLocalStorage();
    updateTotalStudyTime();
    setupDarkMode();
});

const form = document.getElementById('subject-form');
const subjectInput = document.getElementById('subject-input');
const goalInput = document.getElementById('goal-input');
const subjectList = document.getElementById('subject-list');
const errorMsg = document.getElementById('error-msg');
const totalStudyTimeElem = document.getElementById('total-study-time');
const sortBtn = document.getElementById('sort-btn');
const resetAllBtn = document.getElementById('reset-all-btn');
const toggleModeBtn = document.getElementById('toggle-mode-btn');

// Form Submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const subjectName = subjectInput.value.trim();
    const studyGoal = goalInput.value.trim();
    
    // Input validation
    if (!subjectName || !studyGoal || studyGoal <= 0) {
        showError("Please enter a valid subject and goal.");
        return;
    }

    addSubject(subjectName, studyGoal);
    saveSubjectToLocalStorage(subjectName, studyGoal);

    // Clear inputs
    subjectInput.value = '';
    goalInput.value = '';
    errorMsg.textContent = '';
    updateTotalStudyTime();
});

// Function to show error
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.add('error');
}

// Function to add subject
function addSubject(subject, goal, hoursStudied = 0) {
    const listItem = document.createElement('li');
    listItem.classList.add('subject-item');
    if (document.body.classList.contains('dark-mode')) {
        listItem.classList.add('dark-mode');
    }

    listItem.innerHTML = `
        <strong>${subject}</strong> (Goal: ${goal} hours)
        <br>
        <input type="number" class="hours-input" placeholder="Hours Studied" min="0">
        <button class="log-btn">Log Hours</button>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min((hoursStudied / goal) * 100, 100)}%"></div>
        </div>
        <span class="progress-text">${hoursStudied} / ${goal} hours</span>
        <span class="icon-wrapper">
            <span class="icon edit-btn">✏️</span>
            <span class="icon delete-btn">🗑️</span>
        </span>
    `;

    const logBtn = listItem.querySelector('.log-btn');
    const hoursInput = listItem.querySelector('.hours-input');
    const progressBar = listItem.querySelector('.progress-fill');
    const progressText = listItem.querySelector('.progress-text');
    const editBtn = listItem.querySelector('.edit-btn');
    const deleteBtn = listItem.querySelector('.delete-btn');

    let totalHours = hoursStudied;

    logBtn.addEventListener('click', function() {
        const hoursStudied = Number(hoursInput.value);
        totalHours += hoursStudied;
        
        const progress = Math.min((totalHours / goal) * 100, 100);
        progressBar.style.width = `${progress}%`;
        
        progressText.textContent = `${totalHours} / ${goal} hours`;
        hoursInput.value = '';

        // Update in local storage
        updateSubjectInLocalStorage(subject, goal, totalHours);
        updateTotalStudyTime();

        // Send notification when goal is achieved
        if (totalHours >= goal) {
            alert(`Congratulations! You have completed your study goal for ${subject}.`);
        }
    });

    editBtn.addEventListener('click', function() {
        const newGoal = prompt("Enter new study goal (hours):", goal);
        if (newGoal && newGoal > 0) {
            goal = newGoal;
            progressText.textContent = `${totalHours} / ${goal} hours`;
            updateSubjectInLocalStorage(subject, newGoal, totalHours);

            location.reload(); 
        }
    });

    deleteBtn.addEventListener('click', function() {
        subjectList.removeChild(listItem);
        removeSubjectFromLocalStorage(subject);
        updateTotalStudyTime();
    });

    subjectList.appendChild(listItem);
}

// Function to calculate total study time
function updateTotalStudyTime() {
    const subjects = getSubjectsFromLocalStorage();
    const totalStudyTime = subjects.reduce((acc, subject) => acc + subject.hoursStudied, 0);
    totalStudyTimeElem.textContent = `Total Study Time: ${totalStudyTime} hours`;
}

// Dark Mode Toggle
toggleModeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    document.querySelectorAll('.subject-item').forEach(item => {
        item.classList.toggle('dark-mode');
    });
    document.querySelectorAll('input').forEach(input => {
        input.classList.toggle('dark-mode');
    });
    localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

function setupDarkMode() {
    const darkMode = localStorage.getItem('dark-mode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

// Sort by Progress
sortBtn.addEventListener('click', function() {
    const subjects = getSubjectsFromLocalStorage();
    subjects.sort((a, b) => (b.hoursStudied / b.goal) - (a.hoursStudied / a.goal));
    localStorage.setItem('subjects', JSON.stringify(subjects));
    subjectList.innerHTML = '';
    subjects.forEach(subject => addSubject(subject.subject, subject.goal, subject.hoursStudied));
});

// Reset All Progress
resetAllBtn.addEventListener('click', function() {
    if (confirm("Are you sure you want to reset all progress?")) {
        const subjects = getSubjectsFromLocalStorage();
        subjects.forEach(subject => updateSubjectInLocalStorage(subject.subject, subject.goal, 0));
        subjectList.innerHTML = '';
        subjects.forEach(subject => addSubject(subject.subject, subject.goal, 0));
        updateTotalStudyTime();
    }
});

// Local storage functions (same as before)
function saveSubjectToLocalStorage(subject, goal, hoursStudied = 0) {
    const subjects = getSubjectsFromLocalStorage();
    subjects.push({ subject, goal, hoursStudied });
    localStorage.setItem('subjects', JSON.stringify(subjects));
}

function loadSubjectsFromLocalStorage() {
    const subjects = getSubjectsFromLocalStorage();
    subjects.forEach(({ subject, goal, hoursStudied }) => addSubject(subject, goal, hoursStudied));
}

function updateSubjectInLocalStorage(subject, goal, hoursStudied) {
    const subjects = getSubjectsFromLocalStorage();
    const updatedSubjects = subjects.map(item => 
        item.subject === subject ? { subject, goal, hoursStudied } : item
    );
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
}

function removeSubjectFromLocalStorage(subject) {
    const subjects = getSubjectsFromLocalStorage();
    const updatedSubjects = subjects.filter(item => item.subject !== subject);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
}

function getSubjectsFromLocalStorage() {
    return localStorage.getItem('subjects') ? JSON.parse(localStorage.getItem('subjects')) : [];
}
