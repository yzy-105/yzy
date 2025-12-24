// ========== 第一部分：定义变量（就像给东西起名字） ==========

// 记录用户是否登录（默认没登录）
let isLogin = false;

// 记录当前登录的用户名（默认没人登录）
let currentUser = null;

// 当前选中的商品分类（默认是"全部商品"）
let currentCategory = 'all';

// 下面这些变量先声明，后面再给它们赋值（就像先告诉你有哪些东西，但还没拿出来）
let loginBtn, logoutBtn, loginModal, registerModal, toast;
let searchInput, searchBtn, productList, products, categoryItems;

// ========== 第二部分：主要功能函数 ==========

// 初始化函数 - 程序启动时第一个执行
function init() {
    getDOMElements();   // 1. 找到网页上的所有元素
    loadUserStatus();   // 2. 读取之前保存的登录状态
    updateUserUI();     // 3. 更新登录按钮显示
    bindEvents();       // 4. 给按钮等元素绑定点击事件
}

// 获取网页元素 - 就像在房间里找东西
function getDOMElements() {
    loginBtn = document.querySelector('.login-btn');           // 找到登录按钮
    logoutBtn = document.querySelector('.logout-btn');         // 找到退出按钮
    loginModal = document.querySelector('.login-modal');       // 找到登录弹窗
    registerModal = document.querySelector('.register-modal'); // 找到注册弹窗
    toast = document.querySelector('.toast');                  // 找到提示消息框
    searchInput = document.querySelector('.search-input');     // 找到搜索输入框
    searchBtn = document.querySelector('.search-btn');         // 找到搜索按钮
    productList = document.querySelector('.product-list');     // 找到商品列表区域
    products = Array.from(productList.children);               // 把所有商品卡片变成数组
    categoryItems = document.querySelectorAll('.category-item'); // 找到所有分类按钮
}

// 绑定事件 - 给按钮加上"点击后做什么"的功能
function bindEvents() {
    // 点击登录按钮：显示登录弹窗
    loginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    
    // 点击退出按钮：执行退出登录函数
    logoutBtn.addEventListener('click', logout);
    
    // 点击登录弹窗的关闭按钮：隐藏登录弹窗
    document.querySelector('.login-close').addEventListener('click', () => loginModal.classList.remove('active'));
    
    // 点击注册弹窗的关闭按钮：隐藏注册弹窗
    document.querySelector('.register-close').addEventListener('click', () => registerModal.classList.remove('active'));
    
    // 点击"立即注册"链接：切换到注册弹窗
    document.querySelector('.switch-register').addEventListener('click', () => {
        loginModal.classList.remove('active');  // 隐藏登录弹窗
        registerModal.classList.add('active');  // 显示注册弹窗
    });
    
    // 点击"立即登录"链接：切换到登录弹窗
    document.querySelector('.switch-login').addEventListener('click', () => {
        registerModal.classList.remove('active'); // 隐藏注册弹窗
        loginModal.classList.add('active');      // 显示登录弹窗
    });
    
    // 点击登录弹窗的提交按钮：执行登录函数
    document.querySelector('.login-submit').addEventListener('click', login);
    
    // 点击注册弹窗的提交按钮：执行注册函数
    document.querySelector('.register-submit').addEventListener('click', register);

    // 点击搜索按钮：执行搜索函数
    searchBtn.addEventListener('click', handleSearch);
    
    // 在搜索框按回车键：也执行搜索函数
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();  // 如果按的是回车键，就搜索
    });
    
    // 点击网站标题：重置搜索和分类
    document.querySelector('.header-title').addEventListener('click', () => {
        searchInput.value = '';      // 清空搜索框
        currentCategory = 'all';     // 回到"全部商品"分类
        updateCategoryUI();          // 更新分类按钮显示
        handleSearch();              // 重新搜索（显示所有商品）
    });

    // 给每个分类按钮加上点击事件
    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            currentCategory = item.dataset.category;  // 记录点击的分类
            updateCategoryUI();                       // 更新分类按钮显示
            handleSearch();                           // 按新分类筛选商品
        });
    });
}

// 更新分类按钮的显示状态（哪个被选中了）
function updateCategoryUI() {
    categoryItems.forEach(item => {
        // 如果这个按钮的分类等于当前选中的分类
        if (item.dataset.category === currentCategory) {
            item.classList.add('active');     // 加上选中样式（变蓝）
        } else {
            item.classList.remove('active');  // 去掉选中样式
        }
    });
}

// 登录功能
function login() {
    // 获取输入框里的用户名和密码
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // 检查是否输入了用户名和密码
    if (!username || !password) {
        showToast('请输入用户名和密码', 'error');  // 显示错误提示
        return;  // 停止执行后面的代码
    }

    // 从本地存储获取所有注册过的用户（如果没有就返回空数组）
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 在用户列表里找匹配的用户名和密码
    const user = users.find(u => u.username === username && u.password === password);

    // 如果找到了匹配的用户
    if (user) {
        isLogin = true;           // 设置登录状态为"已登录"
        currentUser = username;   // 记录当前用户名
        saveUserStatus();         // 保存登录状态到本地存储
        updateUserUI();           // 更新按钮显示（显示退出按钮）
        loginModal.classList.remove('active');  // 隐藏登录弹窗
        showToast('登录成功');                  // 显示成功提示
        document.getElementById('username').value = '';  // 清空用户名输入框
        document.getElementById('password').value = '';  // 清空密码输入框
    } else {
        showToast('用户名或密码错误', 'error');  // 显示错误提示
    }
}

// 注册功能
function register() {
    // 获取注册框里的用户名和密码
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    // 检查是否输入了用户名和密码
    if (!username || !password) {
        showToast('请输入用户名和密码', 'error');
        return;
    }

    // 从本地存储获取所有用户
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 检查用户名是否已经存在
    const userExists = users.some(u => u.username === username);

    // 如果用户名已经存在
    if (userExists) {
        showToast('用户名已存在', 'error');
        return;
    }

    // 把新用户添加到用户列表
    users.push({ username, password });
    
    // 保存更新后的用户列表到本地存储
    localStorage.setItem('users', JSON.stringify(users));
    
    // 隐藏注册弹窗
    registerModal.classList.remove('active');
    
    // 显示成功提示
    showToast('注册成功，请登录');
    
    // 清空注册框
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
}

// 退出登录功能
function logout() {
    isLogin = false;      // 设置登录状态为"未登录"
    currentUser = null;   // 清空当前用户
    saveUserStatus();     // 保存登录状态
    updateUserUI();       // 更新按钮显示（显示登录按钮）
    showToast('已退出登录');  // 显示提示
}

// 搜索功能
function handleSearch() {
    // 先检查有没有之前显示的"没有结果"提示，有就删掉
    const existingNoResult = document.querySelector('.no-results');
    if (existingNoResult) {
        existingNoResult.remove();
    }
    
    // 获取搜索关键词（去掉前后空格，转成小写）
    const keyword = searchInput.value.trim().toLowerCase();
    
    // 记录是否有搜索结果
    let hasResults = false;
    
    // 遍历所有商品
    products.forEach(product => {
        // 获取商品名称（转小写）
        const productName = product.querySelector('.product-name').textContent.toLowerCase();
        
        // 获取商品分类
        const productCategory = product.dataset.category;
        
        // 检查分类是否匹配（如果是"全部商品"就都匹配）
        const isCategoryMatch = currentCategory === 'all' || productCategory === currentCategory;
        
        // 检查关键词是否匹配（如果没输入关键词就都匹配）
        const isKeywordMatch = !keyword || productName.includes(keyword);
        
        // 如果既符合分类又符合关键词
        if (isCategoryMatch && isKeywordMatch) {
            product.style.display = 'block';  // 显示这个商品
            hasResults = true;                // 标记有搜索结果
        } else {
            product.style.display = 'none';   // 隐藏这个商品
        }
    });
    
    // 如果没有搜索结果
    if (!hasResults) {
        // 创建一个"没有结果"的提示元素
        const noResultElement = document.createElement('div');
        noResultElement.className = 'no-results';
        
        // 根据不同情况显示不同的提示文字
        if (currentCategory === 'all' && keyword) {
            // 情况1：搜索全部商品，有关键词
            noResultElement.textContent = `未找到包含"${keyword}"的商品`;
        } else if (currentCategory !== 'all' && !keyword) {
            // 情况2：搜索特定分类，没有关键词
            const categoryText = document.querySelector(`.category-item[data-category="${currentCategory}"]`).textContent;
            noResultElement.textContent = `未找到${categoryText}类商品`;
        } else {
            // 情况3：搜索特定分类，有关键词
            const categoryText = document.querySelector(`.category-item[data-category="${currentCategory}"]`).textContent;
            noResultElement.textContent = `未找到${categoryText}类中包含"${keyword}"的商品`;
        }
        
        // 把提示添加到商品列表里
        productList.appendChild(noResultElement);
        
        // 显示错误提示
        showToast('未找到相关商品', 'error');
    }
}

// 更新用户界面（登录/退出按钮显示）
function updateUserUI() {
    if (isLogin) {
        // 如果已登录：隐藏登录按钮，显示退出按钮
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        // 如果未登录：显示登录按钮，隐藏退出按钮
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// 显示提示消息（比如"登录成功"）
function showToast(message, type = 'success') {
    // 设置提示文字
    toast.textContent = message;
    
    // 重置样式，加上类型和显示样式
    toast.className = 'toast';
    toast.classList.add(type, 'active');
    
    // 3秒后自动隐藏提示
    setTimeout(() => {
        toast.classList.remove('active', type);
    }, 3000);
}

// 保存登录状态到本地存储（关闭浏览器后还能记住）
function saveUserStatus() {
    localStorage.setItem('isLogin', isLogin);           // 保存是否登录
    localStorage.setItem('currentUser', currentUser);   // 保存用户名
}

// 从本地存储读取登录状态
function loadUserStatus() {
    // 读取是否登录（字符串'true'转成布尔值true）
    isLogin = localStorage.getItem('isLogin') === 'true';
    
    // 读取用户名
    currentUser = localStorage.getItem('currentUser');
}

// ========== 第三部分：启动程序 ==========

// 当网页完全加载好后，执行初始化函数
document.addEventListener('DOMContentLoaded', init);