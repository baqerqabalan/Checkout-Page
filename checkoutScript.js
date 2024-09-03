document.addEventListener("DOMContentLoaded", () => {
  // Get references to various form elements
  const shippingRadio = document.getElementById("shipping");
  const pickupRadio = document.getElementById("pickup");
  const shippingForm = document.getElementById("shipping-form");
  const pickupInfo = document.getElementById("pickup-info");
  const billingOptions = document.getElementById("billingOptions");
  const billingAddressForm = document.getElementById("billingAddressForm");
  const differentBilling = document.getElementById("differentBilling");
  const sameAsShippingForm = document.getElementById("sameAsShipping");
  const shippingMethod = document.getElementById("shippingMethod");
  const submitButton = document.getElementById("submitButton");
  const shippingInfo = document.getElementById("shippingInfo");
  const orderedProductsList = document.getElementById("ordered-products");
  const totalElement = document.getElementById("total");
  const subtotalElement = document.getElementById("subtotal");
  let countryData = []; // Array to store country data
  let shippingCost = 10; // Static shipping cost

  // Function to set the shipping cost
  function setShippingCost(cost) {
    shippingCost = cost;
    updateCartDisplay();
  }

  
  //Footer
  let footer = document.getElementById("footer");
  footer.innerHTML = `
      <div class="footer-container">
        <div class="footer-section">
          <h4 class="footer-title">Contact Us</h4>
          <p class="footer-text">123 Fashion Street, Trendy City</p>
          <p class="footer-text">Email: contact@fashionstore.com</p>
          <p class="footer-text">Phone: +1 234 567 890</p>
        </div>
        <div class="footer-section">
                    <h4 class="footer-title">Follow Us</h4>
                    <p class="footer-text">INSTAGRAM: ECOM_ERCE</p>
                    <p class="footer-text">FACEBOOK: Ecommerce2024</p>
                </div>
        <div class="footer-section">
          <h4 class="footer-title">Quick Links</h4>
          <ul class="footer-links">
            <li><a href="../pages/index.html">Home</a></li>
            <li><a href="../pages/itemsPage.html">Products</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-text">© 2024 Fashion Store. All rights reserved.</p>
      </div>
  `;

  // Function to populate country options in select element
  async function populateCountries() {
    const selectElement = document.getElementById("country");
    const selectBillingElement = document.getElementById("billingCountry");

    try {
      const response = await fetch("../scripts/countryCodes.json"); // Fetch country codes from a JSON file
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      countryData = data[0].countryCodes;
      const countryOptions = countryData
        .map(
          (country) =>
            `<option value="${country.name}" data-code="${country.code}">${country.name}</option>`
        )
        .join("");

      // Update country select element with options
      selectElement.innerHTML = countryOptions;
      selectBillingElement.innerHTML = countryOptions;

      // Set the default phone code to the first country code
      updatePhoneCode();

      // Update phone code on country selection
      selectElement.addEventListener("change", updatePhoneCode);
      selectBillingElement.addEventListener("change", updatePhoneCode);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  // Call the function to populate countries when the DOM is loaded
  populateCountries();

  // Function to update phone code based on selected country
  function updatePhoneCode() {
    const countrySelect = document.getElementById("country");
    const billCountrySelect = document.getElementById("billingCountry");
    const selectedCountryCode =
      countrySelect.selectedOptions[0].getAttribute("data-code");
    const selectedBillingCountryCode =
      billCountrySelect.selectedOptions[0].getAttribute("data-code");
    const phoneCodeElement = document.getElementById("phoneCode");
    const billingPhoneCodeElement = document.getElementById("phoneCountryCode");

    if (phoneCodeElement)
      phoneCodeElement.textContent = selectedCountryCode
        ? `${selectedCountryCode}`
        : "";
    if (billingPhoneCodeElement)
      billingPhoneCodeElement.textContent = selectedBillingCountryCode
        ? `${selectedBillingCountryCode}`
        : "";
  }

  // Function to update the visibility of forms based on the selected shipping method
  function updateVisibility() {
    if (pickupRadio.checked) {
      // If pickup is selected, show pickup info and hide shipping form and billing options
      shippingForm.style.display = "none";
      pickupInfo.style.display = "block";
      billingOptions.style.display = "none";
      billingAddressForm.style.display = "block";
      shippingInfo.innerText = ""; // No shipping cost for pickup
      setShippingCost(0);
    } else if (shippingRadio.checked) {
      shippingForm.style.display = "block";
      pickupInfo.style.display = "none";
      billingOptions.style.display = "block";
      billingAddressForm.style.display = "none";
      shippingInfo.innerText = "Shipping costs $10";
      setShippingCost(10); // Update cart display with new shipping cost

      // Show or hide billing address form based on checkbox selection
      if (sameAsShippingForm.checked) {
        billingAddressForm.style.display = "none";
      } else if (differentBilling.checked) {
        billingAddressForm.style.display = "block";
      }
    } else {
      // Hide all sections if neither option is selected
      shippingForm.style.display = "none";
      pickupInfo.style.display = "none";
      billingOptions.style.display = "none";
      billingAddressForm.style.display = "none";
    }
  }

  // Function to get the phone pattern based on the selected country
  function getPhonePatternForCountry(countryName) {
    const country = countryData.find((c) => c.name === countryName);
    return country ? new RegExp(country.phonePattern) : null;
  }

  // Function to validate form fields
  function validateFields(formId, requiredFields) {
    let hasError = false;
    let invalidFields = [];
    const form = document.getElementById(formId);
    const countrySelect = form.querySelector('[id$="country"]');
    const selectedCountry = countrySelect ? countrySelect.value : "";
    const billingCountrySelect = form.querySelector('[id$="billingCountry"]');
    const selectedBillingCountry = billingCountrySelect
      ? billingCountrySelect.value
      : "";

    // Get the phone pattern for the selected country
    const phonePattern = getPhonePatternForCountry(selectedCountry);
    const phoneBillingPattern = getPhonePatternForCountry(
      selectedBillingCountry
    );

    requiredFields.forEach((field) => {
      const input = document.getElementById(field.id);
      const error = document.getElementById(`${field.id}-error`);

      if (!input || !error) {
        console.error(
          `Input or error element with ID ${field.id} does not exist.`
        );
        return;
      }

      // Use the phone pattern for phone number validation
      if (field.id.includes("phone") && phonePattern) {
        field.regex = phonePattern;
      }

      if (field.id.includes("billingPhone") && phoneBillingPattern) {
        field.regex = phoneBillingPattern;
      }

      if (!field.regex.test(input.value.trim())) {
        input.classList.add("error");
        error.textContent = field.message;
        error.style.display = "block";
        invalidFields.push(input);
        hasError = true;
      } else {
        input.classList.remove("error");
        error.style.display = "none";
      }
    });

    return { hasError, invalidFields };
  }

  async function fetchProductData() {
    const fileNames = [
      "components.json",
      "desktops.json",
      "headphones.json",
      "keyboards.json",
      "laptops.json",
      "mouse.json",
      "mousepads.json",
      "Offers.json",
      "screens.json",
      "speakers.json",
    ]; // Add all your JSON file names here
    const productPromises = fileNames.map((fileName) =>
      fetch(`../dataBase/${fileName}`).then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
    );

    try {
      const productsArray = await Promise.all(productPromises);
      // Flatten the array of arrays into a single array of products
      const products = productsArray.flat();
      return products;
    } catch (error) {
      console.error("Failed to fetch product data:", error);
    }
  }

  function formatCurrency(value) {
    return `$${value.toFixed(2)}`; // Example formatting, you can modify as needed
  }

  async function updateCartDisplay() {
    orderedProductsList.innerHTML = "";
    let subtotal = 0;

    const savedCartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    const products = await fetchProductData();

    savedCartItems.forEach((cartItem) => {
        const product = products.find((p) => p.id === cartItem.id);
        if (product) {
            const quantity = cartItem.quantity;
            subtotal += product.price * quantity;

            // Create and append list item for each product
            const li = document.createElement("li");
            li.classList.add("product");
            li.innerHTML = `
                <div class="product-info">
                    <div class="image-container" style="position: relative;">
                        <img src=${product.image} alt="prod" />
                        <span class="quantity">${quantity}</span>
                    </div>
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p>${formatCurrency(product.price)}</p>
                    </div>
                </div>
            `;
            orderedProductsList.appendChild(li);
        }
    });

    const total = subtotal + shippingCost;
    shippingMethod.textContent = formatCurrency(shippingCost);
    subtotalElement.textContent = formatCurrency(subtotal);
    totalElement.textContent = formatCurrency(total);

    // Store values for use in submission
    window.shippingCost = shippingCost;
    window.subtotal = subtotal;
    window.total = total;
}


  // Event listener for the submit button
  submitButton.addEventListener("click", (event) => {
    event.preventDefault();

    const shippingRequiredFields = [
      {
        id: "email",
        regex: /\S+@\S+\.\S+/,
        message: "Enter a valid email address",
      },
      { id: "fname", regex: /.+/, message: "Enter your first name" },
      { id: "lname", regex: /.+/, message: "Enter your last name" },
      { id: "address", regex: /.+/, message: "Enter your address" },
      { id: "phone", regex: /.+/, message: "Enter a valid phone number" },
    ];

    const billingRequiredFields = [
      { id: "billingFname", regex: /.+/, message: "Enter your first name" },
      { id: "billingLname", regex: /.+/, message: "Enter your last name" },
      { id: "billingAddress", regex: /.+/, message: "Enter your address" },
      {
        id: "billingPhone",
        regex: /.+/,
        message: "Enter a valid phone number",
      },
    ];

    // Function to validate payment method
    function validatePaymentMethod(validation) {
      const paymentMethod = localStorage.getItem("paymentMethod");
      const paymentError = document.getElementById("payment-error");
      if (!paymentMethod) {
        paymentError.style.display = "block"; // Show payment method error
        validation.invalidFields.push(paymentError); // Add error to invalid fields
        validation.hasError = true;
      } else {
        paymentError.style.display = "none"; // Hide payment method error
      }
    }

    let shippingValidation = { hasError: false, invalidFields: [] };
    let billingValidation = { hasError: false, invalidFields: [] };

    if (shippingRadio.checked) {
      // Validate shipping form fields
      shippingValidation = validateFields(
        "shipping-form",
        shippingRequiredFields
      );
      validatePaymentMethod(shippingValidation); // Validate payment method
      if (differentBilling.checked) {
        // Validate billing form fields if different billing address is selected
        billingValidation = validateFields(
          "billingAddressForm",
          billingRequiredFields
        );
        validatePaymentMethod(billingValidation);
      }
    } else if (pickupRadio.checked) {
      // Validate billing form fields if pickup is selected
      billingValidation = validateFields(
        "billingAddressForm",
        billingRequiredFields
      );
    }

    if (shippingValidation.hasError || billingValidation.hasError) {
      // If there are validation errors, highlight invalid fields and prevent form submission
      shippingValidation.invalidFields.forEach((field) => field.focus());
      billingValidation.invalidFields.forEach((field) => field.focus());
      return;
    }

    let customerDetails = null;
    // If no errors, create JSON data and simulate form submission
    const shippingData = {
      shippingMethod: shippingRadio.checked ? "Shipping" : "Pickup",
      customerDetails: shippingRadio.checked ? getCustomerDetails() : null,
      paymentMethod: localStorage.getItem("paymentMethod"),
      subtotal: window.subtotal,
      shipping: window.shippingCost,
      totalAmount: window.total,
      items: JSON.parse(localStorage.getItem("cartItems")),
    };

    let billingDetails = null;
    if (shippingRadio.checked && differentBilling.checked) {
      billingDetails = getBillingDetails();
      customerDetails = getCustomerDetails();
    } else if (pickupRadio.checked) {
      billingDetails = getBillingDetails();
      customerDetails = null;
    }

    const billingData = {
      billingAddress: differentBilling.checked ? "Different" : "Same",
      paymentMethod: localStorage.getItem("paymentMethod"),
      details: billingDetails,
    };

    // Create JSON File
    downloadJSON({ shippingData, billingData }, "order.json");

    // Simulate form submission
    alert("Order submitted successfully!");
    // Clear local storage and redirect the user to home page
    localStorage.clear();
    window.location.href = "../pages/index.html";
  });

  // Function to get billing details from the form
  function getBillingDetails() {
    return {
      email: document.getElementById("email").value,
      fname: document.getElementById("billingFname").value,
      lname: document.getElementById("billingLname").value,
      company: document.getElementById("billingCompany").value,
      country: document.getElementById("billingCountry").value,
      address: document.getElementById("billingAddress").value,
      phone: document.getElementById("billingPhone").value,
    };
  }
  // Function to get customer details from the form
  function getCustomerDetails() {
    return {
      email: document.getElementById("email").value,
      fname: document.getElementById("fname").value,
      lname: document.getElementById("lname").value,
      company: document.getElementById("company").value,
      country: document.getElementById("country").value,
      address: document.getElementById("address").value,
      phone: document.getElementById("phone").value,
    };
  }

  // Event listeners for shipping and pickup radio buttons
  shippingRadio.addEventListener("change", updateVisibility);
  pickupRadio.addEventListener("change", updateVisibility);

  // Event listener for same as shipping checkbox
  sameAsShippingForm.addEventListener("change", () => {
    billingAddressForm.style.display = sameAsShippingForm.checked
      ? "none"
      : "block";
  });

  // Event listener for different billing checkbox
  differentBilling.addEventListener("change", () => {
    billingAddressForm.style.display = differentBilling.checked
      ? "block"
      : "none";
  });

  // Function to download JSON file
  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Initial visibility update
  updateVisibility();
});

// Function to validate and select a payment method
function selectPaymentMethod(element, method) {
  // Remove 'selected' class from all payment options
  const options = document.querySelectorAll(".payment-option");
  options.forEach((option) => option.classList.remove("selected"));

  // Add 'selected' class to the clicked payment option
  element.classList.add("selected");

  // Save selected payment method to local storage
  localStorage.setItem("paymentMethod", method);
}
