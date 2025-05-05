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
  const banner = document.createElement("div");
  banner.className = "admin-banner";
  banner.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> Mode Édition`;
  document.body.prepend(banner);

  // Show edit buttons next to elements
  const editBtn = document.createElement("button");
  editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i> modifier`;
  editBtn.classList.add("edit-btn");

  const btnModifier = document.querySelector(".btn-modifier");
  btnModifier.appendChild(editBtn);

  // Hide login link, show logout
  document.querySelector("#login-link").style.display = "none";
  document.querySelector("#logout-link").style.display = "inline";

  //get rid of the filter buttons!

  sectionFiltres.classList.add("hidden");
  gallery.classList.add("edit-page-margins");

  // Logout link event listener!
  const logoutLink = document.querySelector("#logout-link");
  logoutLink.addEventListener("click", () => {
    localStorage.removeItem("token");
    location.reload(); // reload the page to return to normal mode
  });

  //ADDING THE MODAL WINDOW BABY
  const modal = document.getElementById("myModal");
  editBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  //closing the modal
  prepareModal();
  buildModalContents();
}

function prepareModal() {
  const modal = document.getElementById("myModal");
  const closeBtn = document.getElementById("closeModalBtn");

  closeBtn.onclick = () => (modal.style.display = "none");

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}

function buildModalContents() {
  modalTitle();
  displayWorksModal(works);
  addPhoto();
}

function modalTitle() {
  const modalTitleDiv = document.querySelector(".modal-title");
  const modalTitle = document.createElement("H3");
  modalTitle.innerText = "Galerie Photo";
  modalTitleDiv.appendChild(modalTitle);
}

function displayWorksModal(worksToDisplay) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = ""; // clear previous items
  worksToDisplay.forEach((work) => {
    const figure = createFigureModal(work);
    modalGallery.appendChild(figure);
  });
}

function createFigureModal(work) {
  //I could also just give it one paramenter WORK and then use work.imageUrl and work.title in the inner HTML
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
  const addPhotoBtn = document.createElement("button");
  addPhotoBtn.innerText = "Ajouter une photo";
  addPhotoBtn.classList.add("add-photo-btn");

  const addPhotoDiv = document.querySelector(".add-photo");
  addPhotoDiv.appendChild(addPhotoBtn);
  return addPhotoBtn;
}
