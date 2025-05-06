//declaring a boolean flag
let modalInitialized = false;

// selecting the DOM place for adding the WORKS
let gallery = document.querySelector(".gallery");

//selecting the DOM place for adding the filter buttons
let sectionFiltres = document.querySelector(".section-filtres");

// 1.declare WORKS as a global variable (replaced ulteriourly inside the FETCH function)
let works = [];

//1.1 declare CATEGORIES as a global variable (replaced ulteriourly inside the FETCH function)
let categories = [];

// 2. Fetching the WORKS from the API
const fetchWorks = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/works");
    works = await response.json(); //defining the values of the global WORKS variable
    displayWorks(works); //passing down the works array to the displayWorks function so it knows what to work with!
    displayWorksModal(works); //dislaying works within the modal!
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
};

// 2. Fetching the CATEGORIES from the API + adding an "all" category
const fetchCategories = async () => {
  try {
    const response = await fetch("http://localhost:5678/api/categories");
    categories = await response.json(); //this defines the values for the global CATEGORIES variable
    console.log(categories);
    const allCategory = { id: 0, name: "Tous" }; // Adds the "All" category manually first so it appears first!
    const allCategories = [allCategory, ...categories]; // Using spread syntax to combine both arrays
    appendButtons(allCategories); //passing down the allCategories array to the appendButtons function so it knows what to work with!
  } catch (error) {
    console.error("Erreur lors de la récupération des travaux :", error);
  }
};

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

  // Add the event listener dynamically:
  button.addEventListener("click", () => {
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
  sectionFiltres.innerHTML = ""; // clear previous buttons
  dynamicButtons.forEach((btn) => {
    const button = createButtons(btn);
    sectionFiltres.appendChild(button);
  });
}

fetchCategories();

fetchWorks();

//SETTING THE LOGIN PAGE
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  //THIS CODE ONLY RUNS IF THERE IS AN ELEMENT WITH ID LOGIN FORM
  document
    .getElementById("login-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault(); // Stop form from reloading the page

      const email = document.getElementById("email").value.trim(); //makes sure the user sends a CLEAN STRING
      const password = document.getElementById("password").value.trim();
      const errorElement = document.getElementById("error-message");
      errorElement.textContent = ""; //deletes the previous error message

      if (!email || !password) {
        //if the email or password are EMPTY
        errorElement.textContent =
          "Veuillez saisir votre e-mail et mot de passe"; // show this error message
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
          errorElement.textContent =
            data.message || "Erreur d'authentification."; //show an error
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

const token = JSON.parse(localStorage.getItem("token")); //turns the string I got with .setItem into an object

if (token) {
  activateEditorMode();
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

  editBtn.addEventListener("click", appearModal);
}

function deleteFilterBtn() {
  sectionFiltres.classList.add("hidden");
  gallery.classList.add("edit-page-margins");
}

function showAdminBanner() {
  const banner = document.createElement("div");
  banner.className = "admin-banner";
  banner.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Mode Édition`;
  document.body.prepend(banner);
}

function appearModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
  prepareModal();
  buildModalContents();
}

//closing the modal
function prepareModal() {
  const modal = document.getElementById("myModal");
  const closeBtn = document.getElementById("closeModalBtn");
  closeBtn.onclick = closeModal;
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal();
    }
  };
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
  modalInitialized = false;
  // clear only on close
  document.querySelector(".file-upload-div").innerHTML = "";
  document.querySelector(".back-btn-span").innerHTML = "";
}

function buildModalContents() {
  if (!modalInitialized) {
    modalTitle();
    addPhoto();
    modalInitialized = true; //sets to true and skips these steps afterwards
  }
  displayWorksModal(works);
}

function modalTitle() {
  const modalTitleDiv = document.querySelector(".modal-title");
  modalTitleDiv.innerHTML = ""; // clear previous items
  const modalTitle = document.createElement("H3");
  modalTitle.innerText = "Galerie Photo";
  modalTitleDiv.appendChild(modalTitle);
}

function displayWorksModal(worksToDisplay) {
  let modalGallery = document.querySelector(".modal-gallery");

  // If it doesn't exist anymore (e.g. first time opening), create it
  if (!modalGallery) {
    modalGallery = document.createElement("div");
    modalGallery.classList.add("modal-gallery");
    const modalBody = document.querySelector(".modal-body");
    modalBody.appendChild(modalGallery);
  }
  modalGallery.innerHTML = ""; // clear previous items
  worksToDisplay.forEach((work) => {
    const figure = createFigureModal(work);
    modalGallery.appendChild(figure);
  });
}

function createFigureModal(work) {
  const figureModal = document.createElement("figure");
  figureModal.classList.add("modal-figure");
  figureModal.innerHTML = `
      <img src="${work.imageUrl}" alt="${work.title}" /> 
       <button class="trash-btn" data-id="${work.id}">
      <i class="fa-solid fa-trash"></i>
    </button>
      `;
  return figureModal;
}

function addPhoto() {
  const addPhotoDiv = document.querySelector(".add-photo");
  addPhotoDiv.innerHTML = ""; // Clear existing button
  const addPhotoBtn = document.createElement("button");
  addPhotoBtn.innerText = "Ajouter une photo";
  addPhotoBtn.classList.add("add-photo-btn");
  addPhotoDiv.appendChild(addPhotoBtn);
  addPhotoBtn.addEventListener("click", uploadFormView);
}

function uploadFormView() {
  backBtn();
  uploadFormTitle();
  hidingGallery();
  fileUploadView();
}

function backBtn() {
  const backBtnSpan = document.querySelector(".back-btn-span");
  backBtnSpan.innerHTML = "";
  const backBtnArrow = document.createElement("button");
  backBtnArrow.innerText = "←";
  backBtnSpan.appendChild(backBtnArrow);
}

function hidingGallery() {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.remove();
}

function uploadFormTitle() {
  const modalTitleDiv = document.querySelector(".modal-title");
  modalTitleDiv.innerHTML = ""; // clear previous items
  const modalTitle = document.createElement("H3");
  modalTitle.innerText = "Ajout photo";
  modalTitleDiv.appendChild(modalTitle);
}

function fileUploadView() {
  fileUploadForm();
  uploadFormContents();
}

//handles the upload file button!

function uploadFormContents() {
  //upload form icon
  const uploadInputIcon = document.querySelector(".upload-input-icon");
  uploadInputIcon.innerHTML = `<i class="fa-regular fa-image"></i>`;

  //Upload form icon/file upload/text
  const fileUploadInput = document.querySelector(".upload-input-btn");

  const inputTypeFile = document.createElement("input");
  inputTypeFile.type = "file";

  inputTypeFile.id = "fileUpload"; // must match label's 'for'
  inputTypeFile.style.display = "none";

  const fileInputLabel = document.createElement("label");
  fileInputLabel.setAttribute("for", "fileUpload");
  fileInputLabel.classList.add("cute-upload-btn");
  fileInputLabel.innerText = "+ Ajouter photo";

  fileUploadInput.appendChild(inputTypeFile);
  fileUploadInput.appendChild(fileInputLabel);

  const inputTextDiv = document.querySelector(".upload-input-text");
  const fileInputText = document.createElement("span");
  fileInputText.innerText = "jpg, png : 4mo max";
  inputTextDiv.appendChild(fileInputText);
}

//creates full form div
function fileUploadForm() {
  const existingUploadDiv = document.querySelector(".file-upload-div");
  if (existingUploadDiv) {
    existingUploadDiv.remove(); // get rid of the old one before creating new
  }

  const fileUploadDiv = document.createElement("div");
  fileUploadDiv.classList.add("file-upload-div");
  const modalBody = document.querySelector(".modal-body");
  modalBody.appendChild(fileUploadDiv);
  fileUploadDiv.innerHTML = ""; // not really needed here since it's new

  const fileUploadForm = document.createElement("form");
  fileUploadForm.classList.add("file-upload-form");
  fileUploadForm.innerHTML = `
    <div class="file-upload-input">
      <div class="upload-input-icon"></div>
      <div class="upload-input-btn"></div>
      <div class="upload-input-text"></div>
    </div>
    <div class="file-title-input"></div>
    <div class="file-category-input"></div>
  `;
  fileUploadDiv.appendChild(fileUploadForm);
}
