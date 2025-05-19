function init() {
  const loginForm = document.querySelector("#login-form");
  const isHomepage = document.querySelector(".gallery");

  if (loginForm) {
    initLogin();
    return;
  }

  if (isHomepage) {
    initHomepage();
  }
}

// 1. Create the factory
const createDataFetcher = () => {
  let worksCache = null;
  let categoriesCache = null;

  return {
    async getWorks() {
      if (!worksCache) {
        const response = await fetch("http://localhost:5678/api/works");
        worksCache = await response.json();
      }
      return worksCache;
    },
    async getCategories() {
      if (!categoriesCache) {
        const response = await fetch("http://localhost:5678/api/categories");
        categoriesCache = await response.json();
      }
      return categoriesCache;
    },
    clearWorksCache() {
      worksCache = null;
    },
  };
};

const dataFetcher = createDataFetcher();

async function initHomepage() {
  const token = JSON.parse(localStorage.getItem("token"));
  if (token) {
    activateEditorMode();
  }

  const works = await dataFetcher.getWorks();
  const categories = await dataFetcher.getCategories();
  const allCategory = { id: 0, name: "Tous" }; // Adds the "All" category manually first so it appears first!
  const allCategories = [allCategory, ...categories]; // Using spread syntax to combine both arrays

  displayWorks(works);
  appendButtons(allCategories);
}

// 3. Fonction CREATEFIGURE - handles the HTML for each figure

function createFigure({ imageUrl, title }) {
  //I could also just give it one paramenter WORK and then use work.imageUrl and work.title in the inner HTML
  const figure = document.createElement("figure");
  figure.innerHTML = `
      <img src="${imageUrl}" alt="${title}" /> 
      <figcaption>${title}</figcaption>
    `;
  return figure;
}

// 4. Fonction DISPLAY - adds the figures to the DOM

function displayWorks(worksToDisplay) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = ""; // clear previous items
  worksToDisplay.forEach((work) => {
    const figure = createFigure(work);
    gallery.appendChild(figure);
  });
}

//CREATING THE BUTTONS

function createButtons(btn) {
  const button = document.createElement("button");
  button.innerText = btn.name;
  button.id = `category-${btn.id}`;
  button.classList.add("filter-btn");

  // If it's the "All" button, set it active by default
  if (btn.id === 0) {
    button.classList.add("active");
  }

  // Add the event listener dynamically:
  button.addEventListener("click", async () => {
    const works = await dataFetcher.getWorks();

    // Remove active class from all buttons
    document.querySelectorAll("button.filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    button.classList.add("active");

    if (btn.id === 0) {
      // If it's the "All" button (id 0), display everything
      displayWorks(works);
    } else {
      // Otherwise, filter by category id
      const filteredWorks = works.filter((work) => work.category.id === btn.id); //we check if work.category.id === btn.id — matching work to category!
      displayWorks(filteredWorks);
    }
  });

  return button;
}

//APPENDING THE BUTTONS

function appendButtons(dynamicButtons) {
  //dynamicButtons is just a label here for the categories from the API
  const sectionFiltres = document.querySelector(".section-filtres");
  sectionFiltres.innerHTML = ""; // clear previous buttons
  dynamicButtons.forEach((btn) => {
    const button = createButtons(btn);
    sectionFiltres.appendChild(button);
  });
}

function initLogin() {
  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    setUpLoginForm(loginForm);
  }
}

function setUpLoginForm(form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // Stop form from reloading the page

    const email = document.getElementById("email").value.trim(); //makes sure the user sends a CLEAN STRING
    const password = document.getElementById("password").value.trim();
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = ""; //deletes the previous error message

    if (!email || !password) {
      //if the email or password are EMPTY
      errorElement.textContent = "Veuillez saisir votre e-mail et mot de passe"; // show this error message
      return; // and stop the code here. Don't run fetch() below
    }

    //sending the POST request

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), //This works only if the key names and variable names are the same.
      });

      const data = await response.json(); //turns raw JSON into a JS object (data).

      //login failure
      if (!response.ok) {
        //(login failed according to server)
        errorElement.textContent = data.message || "Erreur d'authentification."; //show an error
        return; //stop here
      }

      //login success
      localStorage.setItem("token", JSON.stringify(data.token)); // Saves ONLY the token data as a string in the browser storage under the name USER
      window.location.href = "../FrontEnd/index.html"; // 🎉 redirect
    } catch (err) {
      console.error("Erreur d'authentification:", err);
      errorElement.textContent =
        "Erreur d'authentification. Veuillez reessayer.";
    }
  });
}

function activateEditorMode() {
  // Show an admin banner
  showAdminBanner();

  // Show edit buttons next to elements
  showEditButton();

  // Hide login link, show logout
  loginHidden();

  //get rid of the filter buttons!
  deleteFilterBtn();

  // Logout link event listener!
  removeUserToken();
}

function loginHidden() {
  document.querySelector("#login-link").style.display = "none";
  document.querySelector("#logout-link").style.display = "inline";
}

function removeUserToken() {
  const logoutLink = document.querySelector("#logout-link");
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload(); // reload the page to return to normal mode
  });
}

function showEditButton() {
  const editBtn = document.createElement("button");
  editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;
  editBtn.classList.add("edit-btn");

  const btnModifier = document.querySelector(".btn-modifier");
  btnModifier.appendChild(editBtn);

  editBtn.addEventListener("click", async () => {
    const works = await dataFetcher.getWorks();
    appearModal(works);
  });
}

function deleteFilterBtn() {
  const gallery = document.querySelector(".gallery");
  const sectionFiltres = document.querySelector(".section-filtres");
  sectionFiltres.classList.add("hidden");
  gallery.classList.add("edit-page-margins");
}

function showAdminBanner() {
  const banner = document.createElement("div");
  banner.className = "admin-banner";
  banner.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Mode Édition`;
  document.body.prepend(banner);
}

let modalStage = "gallery";
let modalInitialized = false;

function appearModal(works) {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
  prepareModal();
  buildModalContents(works);
}

function prepareModal() {
  const modal = document.getElementById("myModal");
  const closeBtn = document.getElementById("closeModalBtn");

  closeBtn.onclick = closeModal;

  window.onclick = (event) => {
    if (event.target === modal) closeModal();
  };
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
  modalInitialized = false;

  resetModalState();
  clearElement(".file-upload-div");
  clearElement(".back-btn-span");
}

function resetModalState() {
  modalStage = "gallery";
}

async function buildModalContents() {
  if (!modalInitialized) {
    setModalTitle("Galerie Photo");
    modalInitialized = true;
  }

  const works = await dataFetcher.getWorks();
  displayWorksModal(works);
  createAddPhotoButton();
  removeOldUploadForm();
  clearElement(".back-btn-span");

  modalStage = "gallery";
}

function setModalTitle(text) {
  const titleDiv = document.querySelector(".modal-title");
  titleDiv.innerHTML = "";
  const title = document.createElement("h3");
  title.innerText = text;
  titleDiv.appendChild(title);
}

function removeOldUploadForm() {
  const form = document.querySelector(".file-upload-form");
  if (form) form.remove();
}

function displayWorksModal(worksToDisplay) {
  let gallery = document.querySelector(".modal-gallery");

  if (!gallery) {
    gallery = document.createElement("div");
    gallery.classList.add("modal-gallery");
    document.querySelector(".modal-body").appendChild(gallery);
  }

  gallery.innerHTML = "";
  worksToDisplay.forEach((work) => {
    gallery.appendChild(createFigureModal(work));
  });
}

function createFigureModal(work) {
  const figure = document.createElement("figure");
  figure.classList.add("modal-figure");

  figure.innerHTML = `
    <img src="${work.imageUrl}" alt="${work.title}" />
  `;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("trash-btn");
  deleteBtn.dataset.id = work.id; //i don't need the ${} here somehow?
  deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;

  // Add event listener directly to this specific button
  deleteBtn.addEventListener("click", handleDelete);

  figure.appendChild(deleteBtn);

  return figure;
}

async function handleDelete(event) {
  const button = event.currentTarget;
  const workId = button.dataset.id;
  const token = JSON.parse(localStorage.getItem("token"));

  if (!workId) return;

  try {
    const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete work");
    }

    console.log(`Work with ID ${workId} deleted successfully!`);

    //refreshing the works cache

    dataFetcher.clearWorksCache(); //
    const updatedWorks = await dataFetcher.getWorks(); //
    displayWorks(updatedWorks); //
  } catch (error) {
    console.error("Error deleting work:", error);
    alert("Failed to delete the image. Please try again.");
  }
}

function createAddPhotoButton() {
  let button = document.querySelector(".add-photo-btn");

  if (!button) {
    const addDiv = document.createElement("div");
    addDiv.classList.add("add-photo");

    const button = document.createElement("button");
    button.classList.add("add-photo-btn");
    button.innerText = "Ajouter une photo";
    button.addEventListener("click", async () => {
      const categories = await dataFetcher.getCategories();
      uploadFormView(categories); // 🟢 pass them into the upload form
    });

    addDiv.appendChild(button);
    document.querySelector(".modal-body").appendChild(addDiv);
  }
}

function clearElement(selector) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = "";
}

async function uploadFormView() {
  addBackArrowBtn();
  removeGallery();
  setModalTitle("Ajout photo");
  renderUploadForm();
  addUploadTitleInput();

  const categories = await dataFetcher.getCategories(); // <--- fetch them again here!
  addUploadCategorySelect(categories);

  addSubmitButton();
  modalStage = "upload";
}

//BACK ARROW FUNCTION
function addBackArrowBtn() {
  const backArrowSpan = document.querySelector(".back-btn-span");
  backArrowSpan.innerHTML = `<i class="fa-solid fa-arrow-left"></i>`;
  backArrowSpan.onclick = previousModalStage;
}

function removeGallery() {
  const gallery = document.querySelector(".modal-gallery");
  if (gallery) gallery.remove();
}

function renderUploadForm() {
  const addPhotoBtn = document.querySelector(".add-photo");
  if (addPhotoBtn) addPhotoBtn.remove();
  const oldDiv = document.querySelector(".file-upload-div");
  if (oldDiv) oldDiv.remove();

  const container = document.createElement("div");
  container.classList.add("file-upload-div");
  document.querySelector(".modal-body").appendChild(container);

  const form = document.createElement("form");
  form.id = "upload-form-file";
  form.classList.add("file-upload-form");
  form.setAttribute("enctype", "multipart/form-data");
  form.setAttribute("method", "POST");

  form.innerHTML = `
      <div class="image-upload-div">
       <div class="image-preview-div"></div>
        <div class="upload-input-icon"></div>
       <div class="upload-input-btn"></div>
        <div class="upload-input-text"></div>
      </div>
  `;

  form.addEventListener("submit", handleFormSubmit);
  container.appendChild(form);
  createFileInputElements();
}

function createFileInputElements() {
  const iconDiv = document.querySelector(".upload-input-icon");
  const btnDiv = document.querySelector(".upload-input-btn");
  const textDiv = document.querySelector(".upload-input-text");

  iconDiv.innerHTML = `<i class="fa-regular fa-image"></i>`;

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "fileUpload";
  fileInput.name = "image";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", handleImagePreview);

  const label = document.createElement("label");
  label.setAttribute("for", "fileUpload");
  label.classList.add("cute-upload-btn");
  label.innerText = "+ Ajouter photo";

  btnDiv.appendChild(fileInput);
  btnDiv.appendChild(label);

  const note = document.createElement("span");
  note.innerText = "jpg, png : 4mo max";
  textDiv.appendChild(note);
}

function handleImagePreview(event) {
  modalStage = "preview";
  const file = event.target.files[0];
  const previewContainer = document.querySelector(".image-preview-div");

  if (!file || !file.type.startsWith("image/")) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewContainer.innerHTML = `<img src="${e.target.result}" alt="Image preview" class="image-preview" />`;
    document.querySelector(".upload-input-icon").style.display = "none";
    document.querySelector(".upload-input-btn").style.display = "none";
    document.querySelector(".upload-input-text").style.display = "none";
  };
  reader.readAsDataURL(file);
}

function addUploadTitleInput() {
  const form = document.querySelector(".file-upload-form");

  const label = document.createElement("label");
  label.setAttribute("for", "uploadTextTitle");
  label.innerText = "Titre";
  form.appendChild(label);

  const input = document.createElement("input");
  input.type = "text";
  input.id = "uploadTextTitle";
  input.name = "title";
  input.classList.add("upload-text-input");
  form.appendChild(input);
}

function addUploadCategorySelect(categories) {
  const form = document.querySelector(".file-upload-form");
  const label = document.createElement("label");
  label.setAttribute("for", "uploadCategory"); // same as select tag ID
  label.innerText = "Catégorie";
  form.appendChild(label);

  const select = document.createElement("select");
  select.id = "uploadCategory"; //same as LABEL FOR attribute
  select.name = "category";
  select.classList.add("category-select");
  form.appendChild(select);

  populateCategorySelect(categories);
}

function populateCategorySelect(categories) {
  const uploadCategorySelect = document.querySelector(".category-select");

  // Clear it in case it already had options
  uploadCategorySelect.innerHTML = "";

  // creating the empty option
  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.innerText = "";
  uploadCategorySelect.appendChild(emptyOption);

  //fetching the real options
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.innerText = category.name;
    uploadCategorySelect.appendChild(option);
  });
}

function addSubmitButton() {
  const form = document.querySelector(".file-upload-form");

  const buttonDiv = document.createElement("div");
  buttonDiv.classList.add("submit-btn-div");
  const button = document.createElement("button");
  button.type = "submit";
  button.classList.add("submit-btn");
  button.innerText = "Valider";
  buttonDiv.appendChild(button);
  form.appendChild(buttonDiv);
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const token = JSON.parse(localStorage.getItem("token"));
  const file = document.querySelector("#fileUpload")?.files[0];
  const title = document.querySelector("#uploadTextTitle")?.value.trim();
  const category = document.querySelector("#uploadCategory")?.value.trim();

  if (!file || !title || !category) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  formData.append("title", title);
  formData.append("category", category);

  try {
    const response = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Échec de l'envoi.");

    const result = await response.json();
    console.log("Upload réussi :", result);

    // refresh works list cause there has been a change
    dataFetcher.clearWorksCache();
    const updatedWorks = await dataFetcher.getWorks();
    displayWorks(updatedWorks);

    resetModalState();
  } catch (error) {
    console.log("Form data:", file, title, category);
    console.error("Erreur d'upload :", error);
    alert("Erreur lors de l'envoi. Veuillez réessayer.");
  }
}

function previousModalStage() {
  if (modalStage === "preview") {
    //go back to upload stage
    uploadFormView();
  } else if (modalStage === "upload") {
    //go back to gallery stage
    buildModalContents();
  }
}

init();
