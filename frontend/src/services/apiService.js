const API_BASE_URL =
  process.env.REACT_APP_API_URL;

class ApiService {
  // Helper method for making API calls
  static async makeRequest(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Network error" }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Product API methods
  static async getAllProducts(filters = {}) {
    const params = new URLSearchParams();

    // Add filtering parameters
    if (filters.category) params.append("category", filters.category);
    if (filters.categoryName)
      params.append("categoryName", filters.categoryName);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.page) params.append("page", filters.page);

    const queryString = params.toString();
    return this.makeRequest(`/products${queryString ? "?" + queryString : ""}`);
  }

  static async getProductsByCategory(categoryId, options = {}) {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);

    const queryString = params.toString();
    return this.makeRequest(
      `/categories/${categoryId}/products${
        queryString ? "?" + queryString : ""
      }`
    );
  }

  static async getProductById(productId) {
      console.log(productId);
    return this.makeRequest(`/products/${productId}`);
  
  }

  static async createProduct(productData) {
    return this.makeRequest("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  static async updateProduct(productId, productData) {
    return this.makeRequest(`/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  static async deleteProduct(productId) {
    return this.makeRequest(`/products/${productId}`, {
      method: "DELETE",
    });
  }

  // Category API methods
  static async getAllCategories(includeProductCount = false) {
    const params = includeProductCount ? "?includeProductCount=true" : "";
    return this.makeRequest(`/categories${params}`);
  }

  static async getCategoryById(categoryId) {
    return this.makeRequest(`/categories/${categoryId}`);
  }

  static async createCategory(categoryData) {
    return this.makeRequest("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  // Silver Price API methods
  static async getTodaysSilverPrice() {
    return this.makeRequest("/silver/today");
  }

  static async getSilverPriceHistory(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const queryString = queryParams.toString();
    return this.makeRequest(
      `/silver/history${queryString ? "?" + queryString : ""}`
    );
  }

  static async manualSilverPriceScrape() {
    return this.makeRequest("/silver/scrape", {
      method: "POST",
    });
  }
  // Gold Price API methods
  static async getTodaysGoldPrice() {
    return this.makeRequest("/gold/today");
  }

  static async getGoldPriceHistory(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.page) queryParams.append("page", params.page);

    const queryString = queryParams.toString();
    return this.makeRequest(
      `/gold/history${queryString ? "?" + queryString : ""}`
    );
  }

  static async manualGoldPriceScrape() {
    return this.makeRequest("/gold/scrape", {
      method: "POST",
    });
  }

  // Order API methods
  static async createOrder(orderData) {
    return this.makeRequest("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  static async getAllOrders() {
    return this.makeRequest("/orders");
  }

  static async getOrderById(orderId) {
    return this.makeRequest(`/orders/${orderId}`);
  }

  static async updateOrderStatus(orderId, status) {
    return this.makeRequest(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Admin API methods
  static async adminLogin(username, password) {
    return this.makeRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  static async initializeAdmin() {
    return this.makeRequest("/admin/init", {
      method: "POST",
    });
  }

  static async getAdminProfile(token) {
    return this.makeRequest("/admin/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Utility methods
  static async healthCheck() {
    return this.makeRequest("/health", {}, "http://localhost:8081");
  }

  // Helper method to calculate silver product price
  static calculateSilverProductPrice(product, currentSilverPrice) {
    if (!product.weightInTola || !product.makingCost) {
      return null;
    }

    const silverCost = currentSilverPrice * product.weightInTola;
    return silverCost + product.makingCost;
  }

  // Cart API methods
  static async getCart(sessionId) {
    return this.makeRequest(`/cart/${sessionId}`);
  }

  static async addToCart(
    sessionId,
    productId,
    quantity = 1,
    customization = null
  ) {
    return this.makeRequest(`/cart/${sessionId}/add`, {
      method: "POST",
      body: JSON.stringify({ productId, quantity, customization }),
    });
  }

  static async updateCartItem(
    sessionId,
    itemId,
    quantity,
    customization = null
  ) {
    return this.makeRequest(`/cart/${sessionId}/item/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity, customization }),
    });
  }

  static async removeFromCart(sessionId, itemId) {
    return this.makeRequest(`/cart/${sessionId}/item/${itemId}`, {
      method: "DELETE",
    });
  }

  static async clearCart(sessionId) {
    return this.makeRequest(`/cart/${sessionId}`, {
      method: "DELETE",
    });
  }

  static async updateCustomerInfo(sessionId, customerInfo) {
    return this.makeRequest(`/cart/${sessionId}/customer`, {
      method: "PUT",
      body: JSON.stringify(customerInfo),
    });
  }

  static async generateCheckoutUrl(sessionId) {
    return this.makeRequest(`/cart/${sessionId}/checkout`, {
      method: "POST",
    });
  }

  // Helper method to generate session ID
  static generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  // Helper method to get or create session ID
  static getSessionId() {
    let sessionId = localStorage.getItem("welcome_craft_session_id");
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem("welcome_craft_session_id", sessionId);
    }
    return sessionId;
  }

  // Helper method to generate WhatsApp order message
  static generateWhatsAppOrderMessage(product, customerDetails = {}) {
    const message = `Hi! I'd like to order:

📦 Product: ${product.title}
💰 Category: ${product.category?.name || "N/A"}
💵 Price: ${
      product.calculatedPrice
        ? `Rs. ${product.calculatedPrice}`
        : "Please quote"
    }

${customerDetails.name ? `👤 Name: ${customerDetails.name}` : ""}
${customerDetails.phone ? `📱 Phone: ${customerDetails.phone}` : ""}
${customerDetails.address ? `📍 Address: ${customerDetails.address}` : ""}

Please confirm availability and provide more details.

Thank you!`;

    return encodeURIComponent(message);
  }
}

export default ApiService;
