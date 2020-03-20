const userTitle = document.getElementById("userTitle");
const settings = document.getElementById("settings");
const settingsButton = document.getElementById("settingsButton");
const status = document.getElementById("status");
const content = document.getElementById("content");
const signOutButton = document.getElementById("signOutButton");

const auth = firebase.auth();

signOutButton.addEventListener("click", e => {
  e.preventDefault();
  auth
    .signOut()
    .then(() => {
      window.location.assign("./");
    })
    .catch(error => {
      alert(error.message);
      console.error(error);
    });
});

auth.onAuthStateChanged(user => {
  if (user) {
    handleCRUD(user);
    if (user.displayName && user.photoURL) {
      userTitle.innerHTML = `<h1 class="user__name">Welcome ${user.displayName}!</h1>`;
      content.innerHTML = `<div class="user"><div class="user__thumbnail"><img src=${user.photoURL}></div>`;
    } else {
      userTitle.innerHTML = `<h1 class="user__name">Welcome to Humans!</h1>`;
      content.innerHTML = `<div class="user"><p>Please check your email to verify your account. Do not forget to add your name and profile picture in Edit section.</p>`;
    }
    if (user.emailVerified) {
      status.innerHTML = `<p class="status__text status__text--success">Your account has been verified.</p>`;
    } else {
      status.innerHTML = `<p class="status__text status__text--warning">Your account needs to be verified. Please check your inbox.</p></div>`;
    }
  } else {
    window.location.assign("./index.html");
    console.log("No user is signed in!");
  }
});

settingsButton.addEventListener("click", e => {
  e.preventDefault();
  settings.classList.toggle("hidden");
});

const handleCRUD = user => {
  let selectedId;
  const addButton = document.getElementById("add");
  const updateButton = document.getElementById("update");
  const deleteButton = document.getElementById("delete");
  const addForm = document.getElementById("addForm");
  const updateDropdown = document.getElementById("updateDropdown");
  const phone = document.getElementById("phone");
  const message = document.getElementById("message");
  const name = document.getElementById("name");
  const age = document.getElementById("age");
  const picture = document.getElementById("picture");
  const updatePhone = document.getElementById("updatePhone");
  const updateMessage = document.getElementById("updateMessage");
  const updateName = document.getElementById("updateName");
  const updateAge = document.getElementById("updateAge");
  const updatePicture = document.getElementById("updatePicture");
  const yourHumans = document.getElementById("yourHumans");
  const allHumans = document.getElementById("allHumans");
  const database = firebase.database();
  const dbRef = database.ref("/humans");
  const makeUpdateDropdown = () => {
    const updateDropdown = document.getElementById("updateDropdown");
    updateDropdown.innerHTML = `<option selected disabled>Select a Human</option>`;
    dbRef.orderByKey().on("value", snapshot => {
      snapshot.forEach(i => {
        if (i.val().hasOwnProperty("author")) {
          let option = document.createElement("option");
          option.textContent = `${i.key}: ${i.val().name}`;
          option.setAttribute("value", i.key);
          updateDropdown.appendChild(option);
        }
      });
      updateDropdown.addEventListener("change", e => {
        const id = e.target.value;
        selectedId = id;
        snapshot.forEach(i => {
          if (i.key === selectedId) {
            updateName.value = i.val().name;
            updateAge.value = i.val().age;
            updateMessage.value = i.val().message;
            updatePhone.value = i.val().phoneNumber;
            updatePicture.value = i.val().picture;
          }
        });
      });
    });
  };
  const handleToggle = () => {
    addForm.classList.add(`hidden`);
    updateForm.classList.add(`hidden`);
    addToggle.addEventListener("click", e => {
      addForm.classList.toggle("hidden");
      updateForm.classList.add("hidden");
    });
    updateToggle.addEventListener("click", e => {
      updateForm.classList.toggle("hidden");
      addForm.classList.add("hidden");
    });
  };
  const clearAddForm = () => {
    name.value = "";
    age.value = "";
    message.value = "";
    phone.value = "";
    picture.value = "";
  };
  const handleAddData = (name, age, phone, message) => {
    const autoId = dbRef.push().key;
    dbRef
      .child(autoId)
      .set({
        name: name.value.trim(),
        age: age.value.trim(),
        phoneNumber: phone.value.trim(),
        message: message.value.trim(),
        picture: picture.value.trim(),
        creationDate: new Date(),
        author: user.email
      })
      .then(() => {
        alert(`Human has been added!`);
        clearAddForm();
        window.location.reload();
      })
      .catch(err => {
        alert(error.message);
      });
  };
  const clearUpdateForm = () => {
    alert("Human has been changed.");
    updateDropdown.selectedIndex = 0;
    updateName.value = "";
    updateAge.value = "";
    updateMessage.value = "";
    updatePhone.value = "";
    updatePicture.value = "";
    makeUpdateDropdown();
  };
  const handleUpdateData = (name, age, phone, message, picture) => {
    const newData = {
      name: name.value.trim(),
      age: age.value.trim(),
      phoneNumber: phone.value.trim(),
      message: message.value.trim(),
      picture: picture.value.trim(),
      creationDate: new Date(),
      author: user.email
    };
    const updates = {};
    updates[`/humans/${selectedId}`] = newData;
    database
      .ref()
      .update(updates)
      .then(clearUpdateForm)
      .catch(error => alert(error.message));
  };
  const handleDeleteData = id => {
    dbRef
      .child(id)
      .remove()
      .then(clearUpdateForm)
      .catch(error => alert(error.message));
  };
  const makeYourHumans = () => {
    dbRef.orderByKey().on("value", snapshot => {
      console.log(snapshot.val());
      if (snapshot.val() == null) {
        yourHumans.innerHTML = `Please add some humans!`;
      } else {
        let html = ``;
        snapshot.forEach(human => {
          if (human.val().author === user.email) {
            html += `
                      <div class="human">
                        <div class="human__thumbnail"><img src="${
                          human.val().picture
                        }" alt="Image of ${human.val().name}"></div>
                        <div class="human__name"><span><i class="fa fa-user"></i></span> ${
                          human.val().name
                        }</div>
                        <div class="human__age"><span><i class="fa fa-heart"></i></span> ${
                          human.val().age
                        }</div>
                        <div class="human__phone"><span><i class="fa fa-phone"></i></span> ${
                          human.val().phoneNumber
                        }</div>
                        <div class="human__message"><span><i class="fa fa-comment"></i></span> ${
                          human.val().message
                        }</div>
                      </div>
                    `;
          }
        });
        if (html.trim() === "") {
          yourHumans.innerHTML = `You do not have any human listed under your account. Please add one!`;
        } else {
          yourHumans.innerHTML = html;
        }
      }
    });
  };
  const makeAllHumans = () => {
    dbRef.orderByKey().on("value", snapshot => {
      if (snapshot.val() == null) {
        allHumans.innerHTML = `Our world has no humans listed right now!`;
      } else {
        let html = ``;
        snapshot.forEach(human => {
          html += `
                    <div class="human">
                      <div class="human__thumbnail"><img src="${
                        human.val().picture
                      }" alt="Image of ${human.val().name}"></div>
                      <div class="human__name"><span><i class="fa fa-user"></i></span> ${
                        human.val().name
                      }</div>
                      <div class="human__age"><span><i class="fa fa-heart"></i></span> ${
                        human.val().age
                      }</div>
                      <div class="human__phone"><span><i class="fa fa-phone"></i></span> ${
                        human.val().phoneNumber
                      }</div>
                      <div class="human__message"><span><i class="fa fa-comment"></i></span> ${
                        human.val().message
                      }</div>
                    </div>
                  `;
        });
        allHumans.innerHTML = html;
      }
    });
  };
  addButton.addEventListener("click", e => {
    e.preventDefault();
    addForm.style.display = `block`;
    if (
      phone.value &&
      phone.value.trim() !== "" &&
      message.value &&
      message.value.trim() !== "" &&
      name.value &&
      name.value.trim() !== "" &&
      age.value &&
      age.value.trim() !== "" &&
      picture.value &&
      picture.value.trim() !== ""
    ) {
      handleAddData(name, age, phone, message, picture);
    } else {
      alert(
        "Please add Name, Age, Phone Number, Picture and a Message for your human."
      );
    }
  });
  updateButton.addEventListener("click", e => {
    e.preventDefault();
    if (
      updatePhone.value &&
      updatePhone.value.trim() !== "" &&
      updateMessage.value &&
      updateMessage.value.trim() !== "" &&
      updateName.value &&
      updateName.value.trim() !== "" &&
      updateAge.value &&
      updateAge.value.trim() !== "" &&
      updatePicture.value &&
      updatePicture.value.trim() !== ""
    ) {
      handleUpdateData(
        updateName,
        updateAge,
        updatePhone,
        updateMessage,
        updatePicture
      );
    } else {
      alert("Please select a Human.");
    }
  });
  deleteButton.addEventListener("click", e => {
    e.preventDefault();
    if (
      updatePhone.value &&
      updatePhone.value.trim() !== "" &&
      updateMessage.value &&
      updateMessage.value.trim() !== "" &&
      updateName.value &&
      updateName.value.trim() !== "" &&
      updateAge.value &&
      updateAge.value.trim() !== "" &&
      updatePicture.value &&
      updatePicture.value.trim() !== ""
    ) {
      handleDeleteData(selectedId);
    } else {
      alert("Please select a Human.");
    }
  });
  handleToggle();
  makeUpdateDropdown();
  makeYourHumans();
  makeAllHumans();
};
