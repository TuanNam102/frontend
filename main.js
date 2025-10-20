class Product {
    constructor(id, name, price, image, category, hot, description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.category = category;
        this.hot = hot;
        this.description = description;
    }
    render() {
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(this.price);
        return `
                        <div class="product">
                            <div class="product-image">
                                <img src="${this.image}" alt="${this.name}">
                                ${this.hot ? '<span class="product-badge">HOT</span>' : ''}
                            </div>
                            <div class="product-info">
                                <h3 class="product-name"><a href="detail.html?id=${this.id}">${this.name}</a></h3>
                                <p class="product-price">${formattedPrice} ₫</p>
                                <button class="buy-now-btn" id="addCartBtn" productId="${this.id}">Thêm vào giỏ hàng</button>
                            </div>
                        </div>
                `
    }
    renderDetail() {
        const formattedPrice = new Intl.NumberFormat('vi-VN').format(this.price);
        return `
                        <div class="product-detail">
                            <img src="${this.image}" alt="${this.name}">
                            <div class="product-info">
                                <h2>${this.name}</h2>
                                <p>${formattedPrice} ₫</p>
                                <p>Danh mục: ${this.category}</p>
                                <p>Mô tả: ${this.description}</p>
                                <div class="detail-qty-section">
                                    <label for="detail-qty">Số lượng:</label>
                                    <div class="detail-qty-controls">
                                        <button class="qty-btn detail-qty-minus" id="detailQtyMinus">-</button>
                                        <input type="number" min="1" value="1" id="detailQtyInput" class="qty-input">
                                        <button class="qty-btn detail-qty-plus" id="detailQtyPlus">+</button>
                                    </div>
                                </div>
                                <button id="addCartBtn" productId="${this.id}">Thêm vào giỏ hàng</button>
                            </div>
                        </div>
        `
    }
}
//show trang chủ
const productHot = document.getElementById('product-hot');
const productLaptop = document.getElementById('product-laptop');
const productDienThoai = document.getElementById('product-dienthoai');
if (productHot) {
    fetch(`https://my-json-server.typicode.com/tuannam102/backend/products`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const dataHot = data.filter(p => p.hot == true);
            const dataLaptop = data.filter(p => p.category === "laptop");
            const dataPhone = data.filter(p => p.category === "điện thoại");
            //Show sản phẩm nổi bật
            renderProduct(dataHot, productHot)
            //show sản phẩm laptop
            renderProduct(dataLaptop, productLaptop)
            //show sản phẩm điện thoại
            renderProduct(dataPhone, productDienThoai);
        });
}
//Show trang sản phẩm
const productAll = document.getElementById('all-product');
const searchInput = document.getElementById('search-input');
const sortPrice = document.getElementById('sort-price');
let allProductsData = [];
if (productAll) {
    fetch(`https://my-json-server.typicode.com/tuannam102/backend/products`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            renderProduct(data, productAll);
            allProductsData = data;
        });
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase();
            const filteredProducts = allProductsData.filter(
                p => p.name.toLowerCase().includes(keyword));
            renderProduct(filteredProducts, productAll);
        })
    }
    if (sortPrice) {
        sortPrice.addEventListener('change', (e) => {
            // alert(e.target.value);
            if (e.target.value === "asc") {
                allProductsData.sort((a, b) => a.price - b.price);
            } else if (e.target.value === 'desc') {
                allProductsData.sort((a, b) => b.price - a.price);
            }
            renderProduct(allProductsData, productAll);
        })
    }
}

const renderProduct = (array, theDiv) => {
    let html = "";
    array.forEach((item) => {
        const product = new Product(
            item.id,
            item.name,
            item.price,
            item.image,
            item.category,
            item.hot,
            item.description
        )
        html += product.render();
    })
    theDiv.innerHTML = html;
}

//Show chi tiết sản phẩm
const productDetailDiv = document.getElementById('product-detail');
if (productDetailDiv) {
    //lấy id từ url
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    console.log(id);
    fetch(`https://my-json-server.typicode.com/tuannam102/backend/products/${id}`)
        .then(response => response.json())
        .then(item => {
            console.log(item);
            const product = new Product(
                item.id,
                item.name,
                item.price,
                item.image,
                item.category,
                item.hot,
                item.description
            )
            productDetailDiv.innerHTML = product.renderDetail();
        });
}

//Class cart
class Cart {
    constructor() {
        // Lấy dữ liệu từ localStorage, nếu không có thì khởi tạo mảng rỗng
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Phương thức lưu giỏ hàng vào localStorage
    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Thêm sản phẩm vào giỏ hàng
    addItem(productToAdd) {
        // Đảm bảo ID là số nguyên
        const productId = Number(productToAdd.id);
        
        // Tìm xem sản phẩm đã tồn tại trong giỏ hàng chưa
        const existingItem = this.items.find(item => Number(item.id) === productId);

        if (existingItem) {
            // Nếu đã có, chỉ tăng số lượng lên 1
            existingItem.quantity += 1;
            console.log(`Tăng số lượng sản phẩm ID ${productId} lên ${existingItem.quantity}`);
        } else {
            // Nếu chưa có, thêm sản phẩm mới vào giỏ hàng với số lượng là 1
            this.items.push({
                ...productToAdd, // Sao chép tất cả thông tin của sản phẩm
                id: productId,    // Đảm bảo ID là số
                quantity: 1       // Thêm thuộc tính số lượng
            });
            console.log(`Thêm sản phẩm mới ID ${productId} vào giỏ hàng`);
        }
        // Lưu lại giỏ hàng sau khi thay đổi
        this.save();
        console.log('Giỏ hàng sau khi thêm:', this.items);
    }

    // Xóa sản phẩm khỏi giỏ
    removeItem(productId) {
        const id = Number(productId);
        this.items = this.items.filter(item => Number(item.id) !== id);
        this.save();
    }

    // Cập nhật số lượng sản phẩm
    updateQuantity(productId, newQuantity) {
        const id = Number(productId);
        const quantityNumber = Number(newQuantity);
        const found = this.items.find(item => Number(item.id) === id);
        if (!found) return;
        if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
            // Nếu nhập số lượng không hợp lệ hoặc <= 0 thì xóa
            this.removeItem(id);
        } else {
            found.quantity = Math.floor(quantityNumber);
            this.save();
        }
    }

    // Lấy tổng số lượng sản phẩm trong giỏ (để hiển thị trên icon)
    getTotalQuantity() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Render (vẽ) giao diện giỏ hàng ra HTML
    render() {
        // Nếu giỏ hàng trống, hiển thị thông báo
        if (this.items.length === 0) {
            return '<p>Giỏ hàng của bạn đang trống.</p>';
        }

        // Định dạng số cho đẹp (ví dụ: 20,000,000)
        const formatCurrency = (number) => new Intl.NumberFormat('vi-VN').format(number);

        // Bắt đầu tạo bảng HTML
        let html = `
            <div class="cart-container">
                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Thành tiền</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let totalAmount = 0; // Biến tính tổng tiền

        // Lặp qua từng sản phẩm trong giỏ hàng để tạo các dòng <tr>
        this.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;

            html += `
                <tr>
                    <td><img src="${item.image}" alt="${item.name}" width="56" height="56" style="object-fit:cover;border-radius:8px"></td>
                    <td>${item.name}</td>
                    <td>${formatCurrency(item.price)} ₫</td>
                    <td>
                        <div class="qty-controls" data-id="${item.id}">
                            <button class="qty-btn cart-qty-minus" data-id="${item.id}">-</button>
                            <input type="number" min="1" class="qty-input cart-qty-input" value="${item.quantity}" data-id="${item.id}">
                            <button class="qty-btn cart-qty-plus" data-id="${item.id}">+</button>
                        </div>
                    </td>
                    <td>${formatCurrency(itemTotal)} ₫</td>
                    <td class="cart-actions">
                        <button class="btn danger cart-remove" data-id="${item.id}">Xóa</button>
                    </td>
                </tr>
            `;
        });

        // Đóng bảng và thêm dòng tổng cộng
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4"><strong>Tổng cộng</strong></td>
                            <td colspan="2"><strong>${formatCurrency(totalAmount)} ₫</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;

        return html; // Trả về chuỗi HTML hoàn chỉnh
    }
}
//Tạo giỏ hàng
const cart = new Cart();
//Thêm sự kiện cho nút thêm vào giỏ hàng
document.addEventListener('click', function (e) {
    if (e.target && e.target.id === 'addCartBtn') {
        const productId = e.target.getAttribute('productId');
        const qtyInput = document.getElementById('detailQtyInput');
        const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        
        fetch(`https://my-json-server.typicode.com/tuannam102/backend/products/${productId}`)
            .then(response => response.json())
            .then(item => {
                const product = new Product(
                        item.id,
                        item.name,
                        item.price,
                        item.image,
                        item.category,
                        item.hot,
                        item.description
                );
                
                // Thêm số lượng nhiều lần nếu quantity > 1
                for (let i = 0; i < quantity; i++) {
                    cart.addItem(product);
                }
                
                alert(`Đã thêm ${quantity} ${item.name} vào giỏ hàng!`);
                updateCartCount(); // Gọi hàm cập nhật số lượng trên header
            });
    }
    
    // Xử lý nút +/- trong detail page
    if (e.target && (e.target.id === 'detailQtyMinus' || e.target.id === 'detailQtyPlus')) {
        const qtyInput = document.getElementById('detailQtyInput');
        if (!qtyInput) return;
        
        let currentQty = parseInt(qtyInput.value) || 1;
        
        if (e.target.id === 'detailQtyMinus' && currentQty > 1) {
            currentQty--;
        } else if (e.target.id === 'detailQtyPlus') {
            currentQty++;
        }
        
        qtyInput.value = currentQty;
    }
});
//Tự tạo ra render và header gắn vào tất cả các trang (trừ admin)
if (!document.body.classList.contains('admin-page')) {
    const header = document.createElement('header');
    header.innerHTML = `
     <div class="container header-inner">
                 <a class="logo" href="index.html">Nam<span> Shop Store</span></a>
                 <nav class="nav">
                    <a href="index.html">Trang chủ</a>
                     <a href="products.html">Tất cả sản phẩm</a>
                     <a href="#featured">Nổi bật</a>
                     <a href="#phones">Điện thoại</a>
                 </nav>
                 <div class="header-actions">
                     <div class="search-container">
                         <input class="search" id="searchInput" placeholder="Tìm sản phẩm…" type="search"/>
                         <div class="search-suggestions" id="searchSuggestions"></div>
                     </div>
                     <button class="btn small" id="searchButton" aria-label="Tìm kiếm">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                     </button>
                     <a aria-label="Giỏ hàng" class="cart" href="cart.html">
                         🛒 <span class="badge" id="cartCount">0</span>
                     </a>
                 </div>
            </div>
        </nav>
    `;
    document.body.prepend(header);
}
//Tạo footer (trừ admin)
if (!document.body.classList.contains('admin-page')) {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <p>&copy; 2025 Store điện tử. All rights reserved. By Nam đẹp zai :))</p>
    `;
    document.body.appendChild(footer);
}
//Hiển thị giỏ hàng
// Hàm cập nhật số lượng sản phẩm trên icon giỏ hàng ở header
function updateCartCount() {
    const cartCountBadge = document.getElementById('cartCount');
    if (cartCountBadge) {
        cartCountBadge.textContent = cart.getTotalQuantity();
    }
}

// Tính năng gợi ý tìm kiếm
let allProductsForSearch = [];
let searchTimeout;

// Lấy tất cả sản phẩm để tìm kiếm
async function loadProductsForSearch() {
    try {
        const response = await fetch('https://my-json-server.typicode.com/tuannam102/backend/products');
        allProductsForSearch = await response.json();
    } catch (error) {
        console.error('Lỗi khi tải sản phẩm cho tìm kiếm:', error);
    }
}

// Hàm tìm kiếm gợi ý
function searchSuggestions(query) {
    if (!query || query.length < 1) {
        hideSuggestions();
        return;
    }
    
    const suggestions = allProductsForSearch
        .filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5); // Chỉ hiển thị 5 gợi ý đầu tiên
    
    showSuggestions(suggestions);
}

// Hiển thị gợi ý
function showSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (!suggestionsContainer) return;
    
    if (suggestions.length === 0) {
        hideSuggestions();
        return;
    }
    
    const suggestionsHTML = suggestions.map(product => `
        <div class="suggestion-item" data-product-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" class="suggestion-image">
            <div class="suggestion-info">
                <div class="suggestion-name">${product.name}</div>
                <div class="suggestion-price">${new Intl.NumberFormat('vi-VN').format(product.price)} ₫</div>
            </div>
        </div>
    `).join('');
    
    suggestionsContainer.innerHTML = suggestionsHTML;
    suggestionsContainer.style.display = 'block';
    
    // Thêm sự kiện click cho các gợi ý
    suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            const productId = item.getAttribute('data-product-id');
            window.location.href = `detail.html?id=${productId}`;
        });
    });
}

// Ẩn gợi ý
function hideSuggestions() {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
}

// Khởi tạo tính năng tìm kiếm
function initSearchFeature() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchInput) return;
    
    // Load sản phẩm khi trang load
    loadProductsForSearch();
    
    // Xử lý input tìm kiếm
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        // Clear timeout cũ
        clearTimeout(searchTimeout);
        
        // Set timeout để tránh tìm kiếm quá nhiều
        searchTimeout = setTimeout(() => {
            searchSuggestions(query);
        }, 300);
    });
    
    // Xử lý nút tìm kiếm
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        });
    }
    
    // Xử lý Enter key
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            }
        }
    });
    
    // Ẩn gợi ý khi click ra ngoài
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            hideSuggestions();
        }
    });
    
    // Ẩn gợi ý khi focus ra khỏi input
    searchInput.addEventListener('blur', () => {
        setTimeout(hideSuggestions, 200); // Delay để có thể click vào gợi ý
    });
}
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Khởi tạo tính năng tìm kiếm
    initSearchFeature();
    
    // Banner CTA button functionality
    const bannerCta = document.querySelector('.banner-cta');
    if (bannerCta) {
        bannerCta.addEventListener('click', () => {
            // Scroll to featured products section
            const featuredSection = document.getElementById('featured');
            if (featuredSection) {
                featuredSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    const cartDisplayArea = document.getElementById('cart-display-area');
    if (cartDisplayArea) {
        // Sử dụng instance cart global thay vì tạo mới
        cartDisplayArea.innerHTML = cart.render();

        // Lắng nghe sự kiện cho các nút/ô nhập số lượng và nút xóa
        cartDisplayArea.addEventListener('click', (e) => {
            const minusBtn = e.target.closest('.cart-qty-minus');
            const plusBtn = e.target.closest('.cart-qty-plus');
            const removeBtn = e.target.closest('.cart-remove');

            if (minusBtn) {
                const id = Number(minusBtn.getAttribute('data-id'));
                const item = cart.items.find(p => p.id === id);
                if (item) cart.updateQuantity(id, item.quantity - 1);
                cartDisplayArea.innerHTML = cart.render();
                updateCartCount();
                return;
            }

            if (plusBtn) {
                const id = Number(plusBtn.getAttribute('data-id'));
                const item = cart.items.find(p => p.id === id);
                if (item) cart.updateQuantity(id, item.quantity + 1);
                cartDisplayArea.innerHTML = cart.render();
                updateCartCount();
                return;
            }

            if (removeBtn) {
                const id = Number(removeBtn.getAttribute('data-id'));
                cart.removeItem(id);
                cartDisplayArea.innerHTML = cart.render();
                updateCartCount();
                return;
            }
        });

        // Nhập trực tiếp số lượng
        cartDisplayArea.addEventListener('change', (e) => {
            const qtyInput = e.target.closest('.cart-qty-input');
            if (!qtyInput) return;
            const id = Number(qtyInput.getAttribute('data-id'));
            const value = Number(qtyInput.value);
            cart.updateQuantity(id, value);
            cartDisplayArea.innerHTML = cart.render();
            updateCartCount();
        });
    }
});