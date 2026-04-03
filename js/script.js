document.addEventListener('DOMContentLoaded', () => {
    // --- State & Data ---
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || ['Makanan', 'Transportasi', 'Hiburan'];
    let myChart = null;

    // --- DOM Elements ---
    const form = document.getElementById('expense-form');
    const transactionList = document.getElementById('transaction-list');
    const totalDisplay = document.getElementById('total-balance');
    const themeToggle = document.getElementById('theme-toggle');
    const categorySelect = document.getElementById('item-category');
    const addCategoryBtn = document.getElementById('add-category-btn');
    const sortSelect = document.getElementById('sort-options');

    // --- Core Functions ---

    function init() {
        checkTheme();
        updateCategoryUI();
        renderTransactions();
        updateChart();
    }

    // 1. Simpan & Segarkan Data
    function saveAndRefresh() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderTransactions();
        updateChart();
    }

    // 2. Render Daftar Transaksi
    function renderTransactions() {
        let sortedData = [...transactions];
        const sortBy = sortSelect.value;

        if (sortBy === 'amount-high') sortedData.sort((a, b) => b.amount - a.amount);
        else if (sortBy === 'category') sortedData.sort((a, b) => a.category.localeCompare(b.category));
        else sortedData.sort((a, b) => b.id - a.id); // Default: Terbaru

        transactionList.innerHTML = '';
        let total = 0;

        sortedData.forEach(t => {
            total += t.amount;
            const li = document.createElement('li');
            li.className = 'transaction-item';
            li.innerHTML = `
                <div class="item-info">
                    <p>${t.name}</p>
                    <span>${t.category}</span>
                </div>
                <div class="item-amount">
                    <span class="amount-text">Rp ${t.amount.toLocaleString('id-ID')}</span>
                    <button class="btn-del" data-id="${t.id}">Hapus</button>
                </div>
            `;
            transactionList.appendChild(li);
        });

        // Event delegation untuk tombol hapus
        transactionList.querySelectorAll('.btn-del').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.getAttribute('data-id'));
                transactions = transactions.filter(t => t.id !== id);
                saveAndRefresh();
            };
        });

        totalDisplay.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    }

    // 3. Tambah Transaksi Baru
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('item-name').value;
        const amount = parseFloat(document.getElementById('item-amount').value);
        const category = categorySelect.value;

        if (name && amount > 0) {
            transactions.push({ id: Date.now(), name, amount, category });
            saveAndRefresh();
            form.reset();
        }
    });

    // 4. Update Chart (Visualisasi)
    function updateChart() {
        const ctx = document.getElementById('expenseChart').getContext('2d');
        
        const categoryTotals = {};
        categories.forEach(cat => categoryTotals[cat] = 0);
        transactions.forEach(t => {
            if (categoryTotals[t.category] !== undefined) categoryTotals[t.category] += t.amount;
        });

        const dataValues = Object.values(categoryTotals);
        
        if (myChart) myChart.destroy();

        // Tampilkan chart hanya jika ada data
        if (transactions.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            return;
        }

        myChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: dataValues,
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } }
            }
        });
    }

    // --- Fitur Tambahan (Revisi Utama) ---

    // 5. Fitur Kategori Kustom (DIPERBAIKI)
    addCategoryBtn.addEventListener('click', () => {
        const newCat = prompt("Masukkan nama kategori baru:");
        if (newCat && newCat.trim() !== "" && !categories.includes(newCat)) {
            categories.push(newCat.trim());
            localStorage.setItem('categories', JSON.stringify(categories));
            updateCategoryUI();
            updateChart(); // Update chart agar kategori baru muncul
        }
    });

    function updateCategoryUI() {
        categorySelect.innerHTML = categories
            .map(c => `<option value="${c}">${c}</option>`)
            .join('');
    }

    // 6. Fitur Night Mode (DIPERBAIKI)
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.hasAttribute('data-theme');
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    function checkTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    // 7. Sortir
    sortSelect.addEventListener('change', renderTransactions);

    init();
});