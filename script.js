let expenses = [];
let budget = 0;
let currentUser = null;
let expenseChart;

function toggleAuthForms() {
    const signInForm = document.getElementById("sign-in-form");
    const signUpForm = document.getElementById("sign-up-form");

    signInForm.style.display = signInForm.style.display === "none" ? "block" : "none";
    signUpForm.style.display = signUpForm.style.display === "none" ? "block" : "none";
}

function signUp() {
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    if (localStorage.getItem(email)) {
        alert("Account already exists. Please sign in.");
        return;
    }

    const userData = { password, expenses: [], budget: 0 };
    localStorage.setItem(email, JSON.stringify(userData));
    alert("Sign up successful! You can now log in.");
    toggleAuthForms();
}

function signIn() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const userData = JSON.parse(localStorage.getItem(email));

    if (userData && userData.password === password) {
        currentUser = email;
        document.getElementById("auth-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
        loadUserData();
    } else {
        alert("Invalid credentials. Please try again.");
    }
}

function loadUserData() {
    const userData = JSON.parse(localStorage.getItem(currentUser));
    budget = userData.budget;
    expenses = userData.expenses || [];
    updateExpenseList();
    updateTotal();
    updateRemainingBudget();
    updateChart();
    calculateDailyBudget();
}

function logout() {
    currentUser = null;
    document.getElementById("auth-container").style.display = "block";
    document.getElementById("app-container").style.display = "none";
}

function setBudget() {
    const budgetInput = document.getElementById("budget-input").value;
    budget = parseFloat(budgetInput);

    if (isNaN(budget) || budget <= 0) {
        alert("Please enter a valid budget.");
        return;
    }

    const userData = JSON.parse(localStorage.getItem(currentUser));
    userData.budget = budget;
    localStorage.setItem(currentUser, JSON.stringify(userData));

    updateRemainingBudget();
    updateChart();
    calculateDailyBudget();
}

function updateRemainingBudget() {
    const remainingBudget = budget - getTotalExpenses();
    document.getElementById("remaining").innerText = `₹ ${remainingBudget.toFixed(2)}`;
}

function updateTotal() {
    const totalExpenses = getTotalExpenses();
    document.getElementById("total").innerText = `₹ ${totalExpenses.toFixed(2)}`;
}

function getTotalExpenses() {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

function calculateDailyBudget() {
    const remainingBudget = budget - getTotalExpenses();
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - today.getDate();
    const dailyAllowance = remainingBudget / daysRemaining;

    document.getElementById("daily-budget").innerText = dailyAllowance.toFixed(2);
}

function addExpense() {
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = new Date().toLocaleDateString(); // Automatically set the current date

    if (!description || isNaN(amount) || amount <= 0) {
        alert("Please fill out all fields.");
        return;
    }

    const expense = { description, amount, category, date };
    expenses.push(expense);
    const userData = JSON.parse(localStorage.getItem(currentUser));
    userData.expenses = expenses;
    localStorage.setItem(currentUser, JSON.stringify(userData));

    updateExpenseList();
    updateTotal();
    updateRemainingBudget();
    updateChart();
    calculateDailyBudget();
}

function updateExpenseList() {
    const expensesList = document.getElementById("expenses-list");
    expensesList.innerHTML = '';

    expenses.forEach((expense, index) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `${expense.description} - ₹ ${expense.amount.toFixed(2)} - ${expense.category} - ${expense.date} 
            <button onclick="editExpense(${index})">Edit</button>
            <button onclick="deleteExpense(${index})">Delete</button>`;
        expensesList.appendChild(listItem);
    });
}

function editExpense(index) {
    const expense = expenses[index];
    const newDescription = prompt("Edit description:", expense.description);
    const newAmount = prompt("Edit amount:", expense.amount);
    const newCategory = prompt("Edit category:", expense.category);

    if (newDescription && !isNaN(newAmount) && newAmount > 0 && newCategory) {
        expenses[index] = { description: newDescription, amount: parseFloat(newAmount), category: newCategory, date: expense.date };
        const userData = JSON.parse(localStorage.getItem(currentUser));
        userData.expenses = expenses;
        localStorage.setItem(currentUser, JSON.stringify(userData));

        updateExpenseList();
        updateTotal();
        updateRemainingBudget();
        updateChart();
        calculateDailyBudget();
    }
}

function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenses.splice(index, 1);
        const userData = JSON.parse(localStorage.getItem(currentUser));
        userData.expenses = expenses;
        localStorage.setItem(currentUser, JSON.stringify(userData));

        updateExpenseList();
        updateTotal();
        updateRemainingBudget();
        updateChart();
        calculateDailyBudget();
    }
}

function showPanel(panelId) {
    const panels = document.querySelectorAll(".panel");
    panels.forEach(panel => panel.style.display = "none");

    document.getElementById(panelId).style.display = "block";
}

function updateChart() {
    const categories = [...new Set(expenses.map(expense => expense.category))];
    const expenseByCategory = categories.map(category => {
        return expenses.filter(expense => expense.category === category)
                       .reduce((total, expense) => total + expense.amount, 0);
    });

    const ctx = document.getElementById('expenseChart').getContext('2d');
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'bar', // Bar chart for expense categories
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses by Category',
                data: expenseByCategory,
                backgroundColor: categories.map(() => getRandomColor()),
                borderColor: categories.map(() => '#fff'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return `${tooltipItem.label}: ₹ ${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
